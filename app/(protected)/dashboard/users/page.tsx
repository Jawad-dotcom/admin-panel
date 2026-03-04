"use client";
import { useState } from "react";
import { useUsers, useToggleAdmin, useDeleteUser, type AppUser } from "@/app/hooks/useUsers";
import { Users, Search, RefreshCw, Shield, ShieldOff, Trash2, UserCircle2, Crown } from "lucide-react";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800/50 rounded-lg ${className}`} />;
}

function Avatar({ user }: { user: AppUser }) {
  const initials = (user.username ?? user.email ?? "?")[0].toUpperCase();
  return user.profilePic ? (
    <img src={user.profilePic} alt={user.username} className="w-9 h-9 rounded-full object-cover border border-[#27272a]" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
      <span className="text-sm font-bold text-indigo-400">{initials}</span>
    </div>
  );
}

function ConfirmDialog({ name, onConfirm, onCancel, loading }: { name: string; onConfirm: () => void; onCancel: () => void; loading: boolean; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-6 w-full max-w-sm mx-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 size={18} className="text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">User delete karein?</h3>
        <p className="text-sm text-zinc-400 mb-5"><span className="text-white font-medium">"{name}"</span> permanently delete ho jayega.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2 rounded-xl text-sm border border-[#27272a] text-zinc-400 hover:text-white transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2 rounded-xl text-sm bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50">{loading ? "Deleting..." : "Delete"}</button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { data: users, isLoading, isError, refetch, isFetching } = useUsers();
  const toggleAdmin = useToggleAdmin();
  const deleteUser  = useDeleteUser();
  const [search, setSearch]           = useState("");
  const [filterRole, setFilterRole]   = useState<"all" | "admin" | "user">("all");
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [togglingId, setTogglingId]   = useState<string | null>(null);

  const filtered = (users ?? []).filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = (u.username ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = filterRole === "all" ? true : filterRole === "admin" ? u.isAdmin : !u.isAdmin;
    return matchSearch && matchRole;
  });

  const adminCount = (users ?? []).filter(u => u.isAdmin).length;

  function handleToggle(user: AppUser) {
    setTogglingId(user._id);
    toggleAdmin.mutate(user._id, { onSettled: () => setTogglingId(null) });
  }

  return (
    <div className="p-8 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={22} className="text-indigo-400" /> Users
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{isLoading ? "..." : `${users?.length ?? 0} total · ${adminCount} admins`}</p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching} className="p-2 rounded-xl border border-[#27272a] text-zinc-500 hover:text-white transition-all disabled:opacity-40">
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Search by username or email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111113] border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors" />
        </div>
        <div className="flex items-center gap-1 bg-[#111113] border border-[#27272a] rounded-xl px-2 py-1">
          {(["all", "admin", "user"] as const).map((role) => (
            <button key={role} onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterRole === role ? role === "admin" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : role === "user" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
              {role === "admin" ? "Admins" : role === "user" ? "Users" : "All"}
            </button>
          ))}
        </div>
      </div>

      {isError && <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-sm text-red-400">⚠ Users load nahi ho sake.</div>}

      <div className="bg-[#111113] border border-[#27272a] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e21]">
              {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array(5).fill(0).map((_, i) => (
              <tr key={i} className="border-b border-[#1a1a1d]">
                {Array(5).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>)}
              </tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16 text-sm text-zinc-600">Koi user nahi mila</td></tr>
            ) : filtered.map((user) => (
              <tr key={user._id} className="border-b border-[#1a1a1d] hover:bg-zinc-900/40 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar user={user} />
                    <div>
                      <p className="text-sm font-semibold text-white">{user.username ?? user.name ?? "—"}</p>
                      <p className="text-[11px] font-mono text-zinc-600">#{user._id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5"><span className="text-xs text-zinc-400">{user.email}</span></td>
                <td className="px-5 py-3.5">
                  {user.isAdmin ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><Crown size={10} /> Admin</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700"><UserCircle2 size={10} /> User</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[11px] font-mono text-zinc-600">
                    {new Date(user.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggle(user)} disabled={togglingId === user._id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 ${user.isAdmin ? "border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10" : "border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10"}`}>
                      {togglingId === user._id ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : user.isAdmin ? <><ShieldOff size={11} /> Remove Admin</> : <><Shield size={11} /> Make Admin</>}
                    </button>
                    <button onClick={() => setDeleteTarget(user)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#1e1e21] flex justify-between">
            <p className="text-[11px] text-zinc-600 font-mono">{filtered.length} of {users?.length} users</p>
            <div className="flex gap-3 text-[11px] font-mono">
              <span className="text-yellow-400">{adminCount} admins</span>
              <span className="text-zinc-700">·</span>
              <span className="text-indigo-400">{(users?.length ?? 0) - adminCount} users</span>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog name={deleteTarget.username ?? deleteTarget.email}
          loading={deleteUser.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteUser.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) })} />
      )}
    </div>
  );
}