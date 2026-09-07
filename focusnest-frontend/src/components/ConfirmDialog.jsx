import { Trash2 } from "lucide-react";

/**
 * Lightweight confirmation dialog for destructive actions.
 *
 * Props:
 *   isOpen    – boolean
 *   title     – string (default "Delete task?")
 *   message   – string
 *   onConfirm – () => void
 *   onCancel  – () => void
 */
export default function ConfirmDialog({ isOpen, title = "Delete task?", message = "This action cannot be undone.", onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1e2530] border border-slate-100 dark:border-white/[0.08] shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/[0.1] text-rose-500">
            <Trash2 size={18} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{title}</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-[#94a3b8] mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 dark:border-white/[0.1] py-2.5 text-sm font-medium text-slate-600 dark:text-[#cbd5e1] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm shadow-rose-200 dark:shadow-rose-950/50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
