import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] flex items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-lg text-center">

        {/* Glowing 404 number */}
        <div className="relative mb-6 select-none">
          <p className="text-[120px] sm:text-[160px] font-black leading-none text-slate-100 dark:text-white/[0.04] tracking-tighter pointer-events-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[72px] sm:text-[96px] font-black leading-none bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 bg-clip-text text-transparent tracking-tighter drop-shadow-lg">
              404
            </span>
          </div>
        </div>

        {/* Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/[0.1] border border-indigo-100 dark:border-indigo-500/20">
          <Search size={28} className="text-indigo-500 dark:text-indigo-400" />
        </div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-[#94a3b8] leading-relaxed mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/50 transition-all active:scale-95"
          >
            <Home size={16} />
            Go to Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#161b22] hover:bg-slate-50 dark:hover:bg-[#1e2530] border border-slate-200 dark:border-white/[0.07] px-6 py-3 text-sm font-semibold text-slate-700 dark:text-[#cbd5e1] transition-all active:scale-95"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>

        {/* Decorative dots */}
        <div className="mt-12 flex items-center justify-center gap-2 opacity-30">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          <span className="h-1.5 w-8 rounded-full bg-indigo-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
        </div>

      </div>
    </div>
  );
}
