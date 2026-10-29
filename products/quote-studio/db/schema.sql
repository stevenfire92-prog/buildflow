-- Apply to a dedicated Supabase project before enabling billing.
begin;
create table if not exists public.qs_quotes(id uuid primary key,user_id uuid not null references auth.users(id) on delete cascade,document jsonb not null,updated_at timestamptz not null default now());
create table if not exists public.qs_customers(user_id uuid primary key references auth.users(id) on delete cascade,stripe_customer_id text unique not null);
create table if not exists public.qs_subscriptions(subscription_id text primary key,user_id uuid not null references auth.users(id) on delete cascade,status text not null,paid_through timestamptz not null,event_created bigint not null default 0);
create table if not exists public.qs_events(event_id text primary key,processed_at timestamptz not null default now());
create table if not exists public.qs_risk_flags(user_id uuid primary key references auth.users(id) on delete cascade,reason text not null,created_at timestamptz not null default now());
alter table public.qs_quotes enable row level security;
alter table public.qs_customers enable row level security;
alter table public.qs_subscriptions enable row level security;
alter table public.qs_events enable row level security;
alter table public.qs_risk_flags enable row level security;
-- There are deliberately no client-table policies. Authenticated server APIs
-- verify membership and ownership before issuing any service-role request.
revoke all on public.qs_quotes,public.qs_customers,public.qs_subscriptions,public.qs_events,public.qs_risk_flags from anon,authenticated;
grant all on public.qs_quotes,public.qs_customers,public.qs_subscriptions,public.qs_events,public.qs_risk_flags to service_role;
create or replace function public.qs_save_quote(p_user uuid,p_id uuid,p_document jsonb) returns void language plpgsql security invoker set search_path=public as $$
begin
 insert into qs_quotes(id,user_id,document) values(p_id,p_user,p_document) on conflict(id) do update set document=excluded.document,updated_at=now() where qs_quotes.user_id=p_user;
 if not found then raise exception 'Estimate belongs to another account';end if;
end;$$;
create or replace function public.qs_record_subscription(p_event text,p_created bigint,p_user uuid,p_subscription text,p_status text,p_paid_through timestamptz) returns void language plpgsql security invoker set search_path=public as $$
begin
 insert into qs_events(event_id) values(p_event) on conflict do nothing;if not found then return;end if;
 insert into qs_subscriptions(subscription_id,user_id,status,paid_through,event_created) values(p_subscription,p_user,p_status,p_paid_through,p_created)
 on conflict(subscription_id) do update set status=excluded.status,paid_through=excluded.paid_through,event_created=excluded.event_created where qs_subscriptions.user_id=p_user and qs_subscriptions.event_created<=p_created;
end;$$;
create or replace function public.qs_record_risk(p_event text,p_user uuid,p_reason text) returns void language plpgsql security invoker set search_path=public as $$
begin
 insert into qs_events(event_id) values(p_event) on conflict do nothing;if not found then return;end if;
 insert into qs_risk_flags(user_id,reason) values(p_user,p_reason) on conflict(user_id) do update set reason=excluded.reason,created_at=now();
end;$$;
revoke all on function public.qs_save_quote(uuid,uuid,jsonb),public.qs_record_subscription(text,bigint,uuid,text,text,timestamptz),public.qs_record_risk(text,uuid,text) from public,anon,authenticated;
grant execute on function public.qs_save_quote(uuid,uuid,jsonb),public.qs_record_subscription(text,bigint,uuid,text,text,timestamptz),public.qs_record_risk(text,uuid,text) to service_role;
commit;
