import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Camera, Target, CheckCircle, Flame, Save, ChevronDown, Award, LogOut } from "lucide-react";
import { useTasks } from "../components/TaskContext";
import { useAuth } from "../components/AuthContext";
import { api } from "../api";

function StatCard({ icon: Icon, value, label, colorClass, bgClass }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${bgClass}`}>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { tasks } = useTasks();
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [focused, setFocused]                     = useState("");
  const [showCurrentPw, setShowCurrentPw]         = useState(false);
  const [showNewPw, setShowNewPw]                 = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [saved, setSaved]                         = useState(false);
  const [saveError, setSaveError]                 = useState(null);
  const [pwStatus, setPwStatus]                   = useState(null); // "success" | "error" | null
  const [pwLoading, setPwLoading]                 = useState(false);

  const [profile, setProfile] = useState({
    name:            user?.name  ?? "Student",
    email:           user?.email ?? "",
    bio:             user?.bio   ?? "Staying focused, one task at a time.",
    currentPassword: "",
    newPassword:     "",
  });

  // ── Live stats ──
  const totalTasks     = tasks.length;
  const doneTasks      = tasks.filter((t) => t.status === "Done").length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // ── Save profile ──
  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError(null);
    const success = await updateProfile(profile.name, profile.bio);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError("Failed to save. Please try again.");
    }
  };

  // ── Change password ──
  const handlePasswordChange = async () => {
    if (!profile.currentPassword || !profile.newPassword) return;
    setPwLoading(true);
    setPwStatus(null);
    try {
      await api.changePassword(profile.currentPassword, profile.newPassword);
      setPwStatus("success");
      setProfile((p) => ({ ...p, currentPassword: "", newPassword: "" }));
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
    `w-full rounded-xl border-2 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 ${
      focused === name ? "border-indigo-500 shadow-sm shadow-indigo-100" : "border-slate-200"
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── HEADER CARD ── */}
        <div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 shadow-lg"
          style={{ animation: "fadeSlideUp 0.4s ease both" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white opacity-5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-violet-500 opacity-10 translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
              <button className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md hover:bg-slate-100 transition-colors">
                <Camera className="h-3.5 w-3.5 text-indigo-600" />
              </button>
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <p className="text-indigo-200 text-sm mt-0.5">{profile.email}</p>
              <p className="text-indigo-300 text-xs mt-1 italic">"{profile.bio}"</p>
            </div>

            <div className="sm:ml-auto flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2">
                <Flame className="h-4 w-4 text-amber-300" />
                <span className="text-sm font-bold text-white">5 day streak</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-xs font-medium text-white/80 hover:bg-white/20 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* ── YOUR STATISTICS ── */}
        <div
          className="mt-5 rounded-2xl bg-white border border-slate-100 shadow-sm p-5 sm:p-6"
          style={{ animation: "fadeSlideUp 0.5s ease both" }}
        >
          <h2 className="text-base font-bold text-slate-800 mb-4">Your Statistics</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={Target} value={totalTasks}            label="Total Tasks"      colorClass="text-blue-500"    bgClass="bg-blue-50"    />
            <StatCard icon={Award}  value={doneTasks}             label="Completed"        colorClass="text-emerald-500" bgClass="bg-emerald-50" />
            <StatCard icon={Award}  value={`${completionRate}%`}  label="Completion Rate"  colorClass="text-violet-500"  bgClass="bg-violet-50"  />
          </div>
        </div>

        {/* ── ACCOUNT SETTINGS ── */}
        <div
          className="mt-5 rounded-2xl bg-white border border-slate-100 shadow-sm p-6 sm:p-8"
          style={{ animation: "fadeSlideUp 0.6s ease both" }}
        >
          <h2 className="text-lg font-bold text-slate-800 mb-1">Account Settings</h2>
          <p className="text-xs text-slate-400 mb-6">Update your personal information</p>

          <form onSubmit={handleSave} className="space-y-5">

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused("")}
                  className={inputClass("name")}
                />
              </div>
            </div>

            {/* Email — read only, email changes need backend verification */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email Address
                <span className="ml-2 text-xs text-slate-400 font-normal">(cannot be changed)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-400 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                onFocus={() => setFocused("bio")}
                onBlur={() => setFocused("")}
                rows={2}
                placeholder="Tell us a little about yourself..."
                className={`w-full resize-none rounded-xl border-2 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 ${
                  focused === "bio" ? "border-indigo-500 shadow-sm shadow-indigo-100" : "border-slate-200"
                }`}
              />
            </div>

            {/* Save error */}
            {saveError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {saveError}
              </div>
            )}

            {/* Save */}
            <button
              type="submit"
              className={`group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-md transition-all active:scale-[0.98] ${
                saved ? "bg-emerald-500 shadow-emerald-200" : "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700"
              }`}
            >
              {saved
                ? <><CheckCircle className="h-4 w-4" /> Saved!</>
                : <><Save className="h-4 w-4" /> Save Changes</>
              }
            </button>
          </form>

          {/* ── CHANGE PASSWORD ── separate from the main form */}
          <div className="mt-5 rounded-xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => { setShowPasswordSection((p) => !p); setPwStatus(null); }}
              className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <span>Change Password</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${showPasswordSection ? "rotate-180" : ""}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showPasswordSection ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="space-y-4 border-t border-slate-100 px-4 py-4 bg-slate-50">

                {/* Current Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={profile.currentPassword}
                      onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                      onFocus={() => setFocused("current")}
                      onBlur={() => setFocused("")}
                      placeholder="Enter current password"
                      className={`w-full rounded-xl border-2 bg-white py-3 pl-10 pr-10 text-sm placeholder-slate-400 focus:outline-none transition-all duration-200 ${focused === "current" ? "border-indigo-500 shadow-sm shadow-indigo-100" : "border-slate-200"}`}
                    />
                    <button type="button" onClick={() => setShowCurrentPw((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={profile.newPassword}
                      onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                      onFocus={() => setFocused("new")}
                      onBlur={() => setFocused("")}
                      placeholder="Enter new password"
                      className={`w-full rounded-xl border-2 bg-white py-3 pl-10 pr-10 text-sm placeholder-slate-400 focus:outline-none transition-all duration-200 ${focused === "new" ? "border-indigo-500 shadow-sm shadow-indigo-100" : "border-slate-200"}`}
                    />
                    <button type="button" onClick={() => setShowNewPw((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Password status messages */}
                {pwStatus === "success" && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Password updated successfully!
                  </div>
                )}
                {pwStatus === "error" && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    Current password is incorrect. Please try again.
                  </div>
                )}

                {/* Update password button */}
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={pwLoading || !profile.currentPassword || !profile.newPassword}
                  className="w-full rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}