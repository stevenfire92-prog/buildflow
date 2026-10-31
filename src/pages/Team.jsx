import React, { useState, useEffect } from "react";
import { Users, UserPlus, Mail, ShieldCheck, Clock } from "lucide-react";
import { client } from "@/api/localClient";
import AppHeader from "@/components/AppHeader";
import { useToast } from "@/components/ui/use-toast";

const ROLE_LABELS = {
  admin: "Admin",
  user: "Member",
};

export default function Team() {
  const { toast } = useToast();
  const [me, setMe] = useState(undefined);
  const [members, setMembers] = useState(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const loadMembers = () =>
    client.entities.User
      .list("-created_date", 100)
      .then(setMembers)
      .catch(() => setMembers([]));

  useEffect(() => {
    client.auth.me().then(setMe).catch(() => setMe(null));
    loadMembers();
  }, []);

  const isAdmin = me?.role === "admin";

  const handleInvite = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      toast({ title: "Enter a valid email address" });
      return;
    }
    setSending(true);
    try {
      await client.users.inviteUser(trimmed, "user");
      toast({
        title: "Invite sent",
        description: `${trimmed} now has access to your projects.`,
      });
      setEmail("");
      loadMembers();
    } catch {
      toast({
        title: "Could not send invite",
        description: "Please check the address and try again.",
      });
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl px-5 sm:px-8 py-6">
        <AppHeader />

        <div className="mt-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Your team
          </h1>
          <p className="mt-2 text-white/50">
            Invite teammates by email so they can view and collaborate on your projects.
          </p>
        </div>

        {isAdmin && (
          <form
            onSubmit={handleInvite}
            className="mt-8 rounded-2xl bg-white/[0.03] border border-white/10 p-6"
          >
            <div className="flex items-center gap-2 text-white/70 mb-4">
              <UserPlus className="w-4 h-4" />
              <h3 className="font-medium">Invite a teammate</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2.5 text-sm font-medium text-black bg-white rounded-xl hover:bg-white/90 transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {sending ? "Sending..." : "Send invite"}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-white/30">
              They will receive an email with a link to join as a member.
            </p>
          </form>
        )}

        <div className="mt-6 rounded-2xl bg-white/[0.03] border border-white/10 p-6">
          <div className="flex items-center gap-2 text-white/70 mb-5">
            <Users className="w-4 h-4" />
            <h3 className="font-medium">Members</h3>
          </div>

          {members === null ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-white/10 border-t-white rounded-full animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/40">
              No members to show yet.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {members.map((m) => (
                <li key={m.id} className="py-3.5 flex items-center gap-3.5 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 text-xs font-semibold">
                    {(m.full_name || m.email || "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {m.full_name?.trim() || m.email}
                    </p>
                    {m.full_name?.trim() && (
                      <p className="text-xs text-white/40 truncate">{m.email}</p>
                    )}
                  </div>
                  {m.id === me?.id && (
                    <span className="text-[11px] text-white/40 border border-white/10 rounded-full px-2 py-0.5">
                      You
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-white/50">
                    {m.role === "admin" ? (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {ROLE_LABELS[m.role] || m.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}