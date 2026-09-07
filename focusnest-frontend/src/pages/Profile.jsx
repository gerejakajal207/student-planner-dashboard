import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Target, CheckCircle, Flame, Save, ChevronDown, Award, LogOut, Edit2, X } from "lucide-react";
import { useTasks } from "../components/TaskContext";
import { useAuth } from "../components/AuthContext";
import { api } from "../api";
import { calculateStreak } from "../utils/streak";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PASSWORD_HINT = "Min. 8 chars · uppercase · lowercase · number · special char (@$!%*?&)";

function StatCard({ icon: Icon, value, label, colorClass, bgClass }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white dark:bg-[#161b22] px-5 py-4 shadow-sm border border-slate-100 dark:border-white/[0.07] hover:shadow-md transition-all">
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${bgClass}`}>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{value}</p>
        <p className="text-xs text-slate-500 dark:text-[#94a3b8] mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { tasks } = useTasks();
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [focused, setFocused]                         = useState("");
  const [isEditing, setIsEditing]                     = useState(false);
  const [showCurrentPw, setShowCurrentPw]             = useState(false);
  const [showNewPw, setShowNewPw]                     = useState(false);
  const [showConfirmPw, setShowConfirmPw]             = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [saved, setSaved]                             = useState(false);
  const [saveError, setSaveError]                     = useState(null);
  const [pwStatus, setPwStatus]                       = useState(null); 
  const [pwLoading, setPwLoading]                     = useState(false);

  const [profile, setProfile] = useState({
    name:            user?.name  ?? "Student",
    email:           user?.email ?? "",
    bio:             user?.bio   ?? "Staying focused, one task at a time.",
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });

  // Draft holds in-progress edits; only committed to profile on Save
  const [draft, setDraft] = useState({ name: profile.name, bio: profile.bio });

  const startEditing = () => {
    setDraft({ name: profile.name, bio: profile.bio });
    setSaveError(null);
    setSaved(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft({ name: profile.name, bio: profile.bio });
    setSaveError(null);
    setIsEditing(false);
  };

  // ── Live stats ──
  const totalTasks     = tasks.length;
  const doneTasks      = tasks.filter((t) => t.status === "Done").length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  
  // Real dynamic streak calculation
  const calculatedStreak = calculateStreak(tasks, user?.id);

  // ── Save profile ──
  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError(null);
    const success = await updateProfile(draft.name, draft.bio);
    if (success) {
      // Commit draft into display state
      setProfile((p) => ({ ...p, name: draft.name, bio: draft.bio }));
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError("Failed to save. Please try again.");
    }
  };

  // ── Change password ──
  const handlePasswordChange = async () => {
    if (!profile.currentPassword || !profile.newPassword || !profile.confirmPassword) return;
    if (!PASSWORD_REGEX.test(profile.newPassword)) {
      setPwStatus("weak");
      return;
    }
    if (profile.newPassword !== profile.confirmPassword) {
      setPwStatus("mismatch");
      return;
    }
    setPwLoading(true);
    setPwStatus(null);
    try {
      await api.changePassword(profile.currentPassword, profile.newPassword);
      setPwStatus("success");
      setProfile((p) => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
      setTimeout(() => {
        setPwStatus(null);
        setShowPasswordSection(false);
      }, 2000);
    } catch (err) {
      setPwStatus("error");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const inputClass = (name) =>
    `w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530]/80 py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-[#1e2530] transition-all duration-200 ${
      focused === name ? "border-indigo-500 ring-2 ring-indigo-500/20" : ""
    }`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] p-4 sm:p-6 md:p-8 transition-colors">
      <div className="mx-auto max-w-4xl">

        {/* ── HEADER CARD ── */}
        <div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 shadow-xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white opacity-5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-violet-500 opacity-10 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-inner">
                <span className="text-4xl">👤</span>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{profile.name}</h1>
              <p className="text-indigo-200 text-sm mt-0.5">{profile.email}</p>
              <p className="text-indigo-200/90 text-xs mt-1.5 italic font-medium">"{profile.bio}"</p>
            </div>

            <div className="sm:ml-auto flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2">
                <Flame className="h-4 w-4 text-amber-300" />
                <span className="text-sm font-bold text-white">{calculatedStreak} day streak</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* ── YOUR STATISTICS ── */}
        <div
          className="mt-6 rounded-3xl bg-white dark:bg-[#161b22] border border-slate-100 dark:border-white/[0.07] shadow-sm p-6 sm:p-7 transition-all"
        >
          <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">Productivity Statistics</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={Target} value={totalTasks} label="Total Tasks" colorClass="text-blue-500" bgClass="bg-blue-50 dark:bg-blue-500/[0.1]" />
            <StatCard icon={Award} value={doneTasks} label="Completed" colorClass="text-emerald-500" bgClass="bg-emerald-50 dark:bg-emerald-500/[0.1]" />
            <StatCard icon={CheckCircle} value={`${completionRate}%`} label="Completion Rate" colorClass="text-violet-500" bgClass="bg-violet-50 dark:bg-violet-500/[0.1]" />
          </div>
        </div>

        {/* ── ACCOUNT SETTINGS ── */}
        <div className="mt-6 rounded-3xl bg-white dark:bg-[#161b22] border border-slate-100 dark:border-white/[0.07] shadow-sm p-6 sm:p-8 transition-all">

          {/* Section header with Edit button */}
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Account Profile</h2>
              <p className="text-xs text-slate-400 dark:text-[#64748b] mt-0.5">
                {isEditing ? "Make your changes then click Save." : "Your student credentials and preferences."}
              </p>
            </div>
            {!isEditing ? (
              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1e2530] hover:bg-slate-50 dark:hover:bg-[#252d3a] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] transition-all shadow-sm"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={cancelEditing}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1e2530] hover:bg-slate-50 dark:hover:bg-[#252d3a] px-4 py-2 text-xs font-semibold text-slate-500 dark:text-[#94a3b8] transition-all shadow-sm"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            )}
          </div>

          <div className="mt-5">
            {/* ── VIEW MODE ── */}
            {!isEditing && (
              <div className="space-y-4">
                {/* Name display */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-white/[0.07] bg-slate-50 dark:bg-[#1e2530]/40 px-4 py-3">
                  <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">Full Name</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-[#e2e8f0] mt-0.5">{profile.name}</p>
                  </div>
                </div>
                {/* Email display */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-white/[0.07] bg-slate-50 dark:bg-[#1e2530]/40 px-4 py-3">
                  <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-[#e2e8f0] mt-0.5">{profile.email}</p>
                  </div>
                </div>
                {/* Bio display */}
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-white/[0.07] bg-slate-50 dark:bg-[#1e2530]/40 px-4 py-3">
                  <span className="text-slate-400 text-base mt-0.5 flex-shrink-0">✏️</span>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">Bio</p>
                    <p className="text-sm text-slate-600 dark:text-[#cbd5e1] mt-0.5 leading-relaxed italic">
                      {profile.bio || <span className="not-italic text-slate-400">No bio set.</span>}
                    </p>
                  </div>
                </div>
                {/* Success flash after save */}
                {saved && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.1] border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-4 py-2.5 text-sm font-semibold">
                    <CheckCircle className="h-4 w-4" /> Profile saved successfully!
                  </div>
                )}
              </div>
            )}

            {/* ── EDIT MODE ── */}
            {isEditing && (
              <form onSubmit={handleSave} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1]">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      onFocus={() => setFocused("name")}
                      onBlur={() => setFocused("")}
                      className={inputClass("name")}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Email — always read-only */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1]">
                    Email Address
                    <span className="ml-2 text-xs text-slate-400 font-normal">(cannot be changed)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-[#475569]" />
                    <input
                      type="email"
                      value={profile.email}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.07] bg-slate-100 dark:bg-[#1e2530]/40 py-3 pl-10 pr-4 text-sm text-slate-500 dark:text-[#94a3b8] cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1]">Bio</label>
                  <textarea
                    value={draft.bio}
                    onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                    onFocus={() => setFocused("bio")}
                    onBlur={() => setFocused("")}
                    rows={2}
                    placeholder="Tell us a little about your academic goals..."
                    className={`w-full resize-none rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530]/80 px-4 py-3 text-sm text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-[#1e2530] transition-all duration-200 ${
                      focused === "bio" ? "border-indigo-500 ring-2 ring-indigo-500/20" : ""
                    }`}
                  />
                </div>

                {saveError && (
                  <div className="rounded-xl bg-rose-50 dark:bg-rose-500/[0.1] border border-rose-200 text-rose-600 dark:text-rose-400 px-4 py-3 text-sm">
                    {saveError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-white/[0.1] py-3 text-sm font-medium text-slate-600 dark:text-[#cbd5e1] hover:bg-slate-50 dark:hover:bg-[#1e2530] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/50 transition-all active:scale-[0.98]"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── CHANGE PASSWORD ── */}
          <div className="mt-6 rounded-2xl border border-slate-200 dark:border-white/[0.07] overflow-hidden">
            <button
              type="button"
              onClick={() => { setShowPasswordSection((p) => !p); setPwStatus(null); }}
              className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-slate-700 dark:text-[#e2e8f0] hover:bg-slate-50 dark:hover:bg-[#1e2530] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1e2530]">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <span>Change Password</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${showPasswordSection ? "rotate-180" : ""}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showPasswordSection ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="space-y-4 border-t border-slate-100 dark:border-white/[0.07] p-5 bg-slate-50/60 dark:bg-[#1e2530]/40">

                {/* Current Password */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1]">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={profile.currentPassword}
                      onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1e2530] py-2.5 pl-10 pr-10 text-sm text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button type="button" onClick={() => setShowCurrentPw((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1]">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={profile.newPassword}
                      onChange={(e) => { setProfile({ ...profile, newPassword: e.target.value }); if (pwStatus === "weak") setPwStatus(null); }}
                      placeholder="Min. 8 chars, upper, lower, number, special"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1e2530] py-2.5 pl-10 pr-10 text-sm text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button type="button" onClick={() => setShowNewPw((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {profile.newPassword && !PASSWORD_REGEX.test(profile.newPassword) && (
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{PASSWORD_HINT}</p>
                  )}
                  {profile.newPassword && PASSWORD_REGEX.test(profile.newPassword) && (
                    <p className="mt-1 text-xs text-emerald-500 font-medium">✓ Password meets requirements</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1]">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={profile.confirmPassword}
                      onChange={(e) => { setProfile({ ...profile, confirmPassword: e.target.value }); if (pwStatus === "mismatch") setPwStatus(null); }}
                      placeholder="Re-enter new password"
                      className={`w-full rounded-xl border bg-white dark:bg-[#1e2530] py-2.5 pl-10 pr-10 text-sm text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                        pwStatus === "mismatch"
                          ? "border-rose-400 focus:ring-rose-500/20"
                          : profile.confirmPassword && profile.confirmPassword === profile.newPassword
                          ? "border-emerald-400 focus:ring-emerald-500/20 dark:border-emerald-500/40"
                          : "border-slate-200 dark:border-white/[0.1] focus:ring-indigo-500"
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirmPw((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Inline match indicator */}
                  {profile.confirmPassword && profile.newPassword && (
                    <p className={`mt-1 text-xs font-medium ${profile.confirmPassword === profile.newPassword ? "text-emerald-500" : "text-rose-500"}`}>
                      {profile.confirmPassword === profile.newPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>

                {/* Status messages */}
                {pwStatus === "success" && (
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.1] border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-4 py-2.5 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Password updated successfully!
                  </div>
                )}
                {pwStatus === "weak" && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-500/[0.1] border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 px-4 py-2.5 text-xs font-semibold">
                    Password too weak — {PASSWORD_HINT}
                  </div>
                )}
                {pwStatus === "mismatch" && (
                  <div className="rounded-xl bg-rose-50 dark:bg-rose-500/[0.1] border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-2.5 text-xs font-semibold">
                    New passwords don't match. Please check and try again.
                  </div>
                )}
                {pwStatus === "error" && (
                  <div className="rounded-xl bg-rose-50 dark:bg-rose-500/[0.1] border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-2.5 text-xs font-semibold">
                    Current password is incorrect. Please try again.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={pwLoading || !profile.currentPassword || !profile.newPassword || !profile.confirmPassword}
                  className="w-full rounded-xl bg-slate-800 dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-700 py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}