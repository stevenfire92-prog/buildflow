-- Apply after schema.sql. No public table/RPC access is granted.
begin;
create table if not exists public.qs_approvals(token_hash text primary key,quote_id uuid not null references public.qs_quotes(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,snapshot jsonb not null,expires_at timestamptz not null,revoked boolean not null default false,accepted_at timestamptz,accepted_name text);
alter table public.qs_approvals enable row level security;
revoke all on public.qs_approvals from public,anon,authenticated;
grant all on public.qs_approvals to service_role;
create index if not exists qs_approvals_quote on public.qs_approvals(quote_id,user_id);
create or replace function public.qs_create_approval(p_token_hash text,p_quote uuid,p_user uuid,p_expected jsonb,p_snapshot jsonb,p_expires timestamptz) returns boolean language plpgsql security invoker set search_path=public as $$
declare q qs_quotes%rowtype;
begin
 select * into q from qs_quotes where id=p_quote and user_id=p_user for update;
 if not found or q.document<>p_expected then return false;end if;
 update qs_approvals set revoked=true where quote_id=p_quote and user_id=p_user;
 insert into qs_approvals(token_hash,quote_id,user_id,snapshot,expires_at) values(p_token_hash,p_quote,p_user,p_snapshot,p_expires);
 return true;
end;$$;
revoke all on function public.qs_create_approval(text,uuid,uuid,jsonb,jsonb,timestamptz) from public,anon,authenticated;
grant execute on function public.qs_create_approval(text,uuid,uuid,jsonb,jsonb,timestamptz) to service_role;
-- Lock the quote and invalidate all approval links atomically when editing.
create or replace function public.qs_save_quote(p_user uuid,p_id uuid,p_document jsonb) returns void language plpgsql security invoker set search_path=public as $$
begin
 insert into qs_quotes(id,user_id,document) values(p_id,p_user,p_document) on conflict(id) do update set document=excluded.document,updated_at=now() where qs_quotes.user_id=p_user;
 if not found then raise exception 'Estimate belongs to another account';end if;
 update qs_approvals set revoked=true where quote_id=p_id and user_id=p_user;
end;$$;
create or replace function public.qs_accept_quote(p_token_hash text,p_name text) returns jsonb language plpgsql security invoker set search_path=public as $$
declare a qs_approvals%rowtype;q qs_quotes%rowtype;
begin
 -- Same lock order as quote edits (quote then approval) avoids deadlocks.
 select * into a from qs_approvals where token_hash=p_token_hash;
 if not found then return null;end if;
 select * into q from qs_quotes where id=a.quote_id and user_id=a.user_id for update;
 if not found then return null;end if;
 select * into a from qs_approvals where token_hash=p_token_hash for update;
 if a.revoked or a.expires_at<=now() then return null;end if;
 if a.accepted_at is null then
  update qs_approvals set accepted_at=now(),accepted_name=left(trim(p_name),100) where token_hash=p_token_hash returning * into a;
  update qs_quotes set document=jsonb_set(document,'{status}','"accepted"'::jsonb),updated_at=now() where id=a.quote_id and user_id=a.user_id;
 end if;
 return jsonb_build_object('accepted_at',a.accepted_at,'accepted_name',a.accepted_name);
end;$$;
revoke all on function public.qs_accept_quote(text,text) from public,anon,authenticated;
grant execute on function public.qs_accept_quote(text,text) to service_role;
commit;
