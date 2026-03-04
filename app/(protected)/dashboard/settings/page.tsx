// app/(protected)/dashboard/settings/page.tsx
"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Settings, User, Lock, Camera, Loader2,
  Eye, EyeOff, Save, ShieldCheck,
} from "lucide-react";

const inputCls = "w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors";

function Section({ title, icon: Icon, iconColor, children }: {
  title: string; icon: React.ElementType; iconColor: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-[#111113] border border-[#27272a] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e1e21] flex items-center gap-2">
        <Icon size={15} style={{ color: iconColor }} />
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  // Profile state — from auth/check ya hardcode
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [picFile, setPicFile]   = useState<File | null>(null);
  const [picPreview, setPicPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Password state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass]         = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);

  // Loading states
  const [profileLoading, setProfileLoading] = useState(false);
  const [picLoading, setPicLoading]         = useState(false);
  const [passLoading, setPassLoading]       = useState(false);

  // Fetch current user on mount
  useState(() => {
    api.get("/auth/check").then((res) => {
      const u = res.data.user ?? res.data;
      setUsername(u.username ?? "");
      setEmail(u.email ?? "");
      setProfilePic(u.profilePic ?? "");
    }).catch(() => {});
  });

  // ─── Profile pic change ───────────────────────────────
  function handlePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicFile(file);
    setPicPreview(URL.createObjectURL(file));
  }

  async function handlePicUpload() {
    if (!picFile) return;
    setPicLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", picFile);
      const res = await api.put("/auth/update-pic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfilePic(res.data.profilePic);
      setPicFile(null);
      setPicPreview("");
      toast.success("Profile picture update ho gayi!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Upload fail ho gaya");
    } finally {
      setPicLoading(false);
    }
  }

  // ─── Profile update ───────────────────────────────────
  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.put("/auth/update-profile", { username, email });
      toast.success("Profile update ho gaya!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Update fail ho gaya");
    } finally {
      setProfileLoading(false);
    }
  }

  // ─── Password change ──────────────────────────────────
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPass !== confirmPass) {
      toast.error("New password aur confirm password match nahi karte");
      return;
    }
    if (newPass.length < 6) {
      toast.error("Password kam az kam 6 characters ka hona chahiye");
      return;
    }
    setPassLoading(true);
    try {
      await api.put("/auth/change-password", { currentPassword: currentPass, newPassword: newPass });
      toast.success("Password change ho gaya!");
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Password change fail ho gaya");
    } finally {
      setPassLoading(false);
    }
  }

  const displayPic = picPreview || profilePic;
  const initials   = (username || email || "A")[0].toUpperCase();

  return (
    <div className="p-8 max-w-[680px] mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings size={22} className="text-indigo-400" />
          Settings
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Profile aur security settings manage karo</p>
      </div>

      <div className="space-y-5">

        {/* Profile Picture */}
        <Section title="Profile Picture" icon={Camera} iconColor="#6366f1">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {displayPic ? (
                <img src={displayPic} className="w-20 h-20 rounded-2xl object-cover border-2 border-[#27272a]" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-400">{initials}</span>
                </div>
              )}
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center transition-colors border-2 border-[#111113]">
                <Camera size={12} className="text-white" />
              </button>
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">{username || "Admin"}</p>
              <p className="text-xs text-zinc-500 mb-3">{email}</p>
              {picFile ? (
                <div className="flex gap-2">
                  <button onClick={handlePicUpload} disabled={picLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white transition-colors disabled:opacity-50">
                    {picLoading ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                    {picLoading ? "Uploading..." : "Save Picture"}
                  </button>
                  <button onClick={() => { setPicFile(null); setPicPreview(""); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#27272a] text-zinc-400 hover:text-white transition-all">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-all">
                  <Camera size={11} /> Change Picture
                </button>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePicChange} className="hidden" />
        </Section>

        {/* Profile Info */}
        <Section title="Profile Information" icon={User} iconColor="#22c55e">
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Username" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email" className={inputCls} />
            </div>
            <button type="submit" disabled={profileLoading || (!username && !email)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-50">
              {profileLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {profileLoading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </Section>

        {/* Change Password */}
        <Section title="Change Password" icon={Lock} iconColor="#f97316">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Current Password</label>
              <div className="relative">
                <input type={showCurrent ? "text" : "password"}
                  value={currentPass} onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Current password" className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">New Password</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"}
                  value={newPass} onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Min 6 characters" className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {newPass && (
                <div className="mt-2 space-y-1">
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: newPass.length >= 10 ? "100%" : newPass.length >= 6 ? "60%" : "30%",
                        background: newPass.length >= 10 ? "#22c55e" : newPass.length >= 6 ? "#f97316" : "#ef4444",
                      }} />
                  </div>
                  <p className="text-[10px]" style={{
                    color: newPass.length >= 10 ? "#22c55e" : newPass.length >= 6 ? "#f97316" : "#ef4444"
                  }}>
                    {newPass.length >= 10 ? "Strong" : newPass.length >= 6 ? "Medium" : "Weak"}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Confirm New Password</label>
              <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repeat new password"
                className={`${inputCls} ${confirmPass && newPass !== confirmPass ? "border-red-500/50" : confirmPass && newPass === confirmPass ? "border-green-500/50" : ""}`} />
              {confirmPass && newPass !== confirmPass && (
                <p className="text-[11px] text-red-400 mt-1">Passwords match nahi karte</p>
              )}
              {confirmPass && newPass === confirmPass && (
                <p className="text-[11px] text-green-400 mt-1 flex items-center gap-1">
                  <ShieldCheck size={11} /> Passwords match karte hain
                </p>
              )}
            </div>

            <button type="submit"
              disabled={passLoading || !currentPass || !newPass || !confirmPass || newPass !== confirmPass}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-all disabled:opacity-50">
              {passLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              {passLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </Section>

        {/* Admin Badge */}
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Admin Account</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Tumhara account admin privileges ke sath registered hai. Ye status sirf super admin change kar sakta hai.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}