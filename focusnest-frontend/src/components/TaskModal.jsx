import { useState, useEffect, useRef } from "react";
import { ChevronDown, Calendar, BookOpen } from "lucide-react";

const PRIORITY_COLORS = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-rose-500",
};

const EFFORT_COLORS = {
  Low: "bg-sky-400",
  Medium: "bg-violet-500",
  High: "bg-purple-600",
};

const CATEGORY_ICONS = {
  Class: "📚",
  Exam: "📝",
  Assignment: "📋",
  Hobby: "🎨",
};

function RequiredStar() {
  return <span className="ml-1 text-rose-500">*</span>;
}

function Dropdown({ label, options, selected, onSelect, colorMap }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={ref}>
      <label className="text-xs font-semibold text-slate-700 dark:text-[#cbd5e1]">
        {label}
        <RequiredStar />
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mt-1 flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530]/80 px-3.5 py-2.5 text-sm text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
      >
        <span className="flex items-center gap-2 font-medium">
          {colorMap && (
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorMap[selected]}`} />
          )}
          {CATEGORY_ICONS[selected] && <span>{CATEGORY_ICONS[selected]}</span>}
          {selected}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1e2530] shadow-xl">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-indigo-50 dark:hover:bg-[#252d3a] ${
                selected === option ? "bg-indigo-50/80 dark:bg-[#252d3a]/80 font-semibold text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-[#e2e8f0]"
              }`}
            >
              {colorMap && (
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorMap[option]}`} />
              )}
              {CATEGORY_ICONS[option] && <span>{CATEGORY_ICONS[option]}</span>}
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const defaultState = {
  taskName: "",
  taskDescription: "",
  taskDueDate: "",
  subject: "",
  category: "Assignment",
  priority: "Medium",
  effort: "Medium",
};

export default function TaskModal({ isOpen, onClose, onSubmit, initialDueDate, taskToEdit }) {
  const [form, setForm] = useState(defaultState);
  const [showToast, setShowToast] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const isEditMode = Boolean(taskToEdit);

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        let dueDateFormatted = "";
        if (taskToEdit.date) {
          const d = new Date(taskToEdit.date);
          dueDateFormatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        } else if (taskToEdit.due_date) {
          const d = new Date(taskToEdit.due_date);
          dueDateFormatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        }
        setForm({
          taskName: taskToEdit.title || "",
          taskDescription: taskToEdit.description || "",
          taskDueDate: dueDateFormatted,
          subject: taskToEdit.subject || "",
          category: taskToEdit.category || "Assignment",
          priority: taskToEdit.priority || "Medium",
          effort: taskToEdit.effort || "Medium",
        });
      } else {
        setForm({
          ...defaultState,
          taskDueDate: initialDueDate || today,
        });
      }
    }
  }, [isOpen, initialDueDate, taskToEdit, today]);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSelect(field) {
    return (value) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (onSubmit) {
      let success;
      if (isEditMode) {
        success = await onSubmit(taskToEdit.id, form);
      } else {
        success = await onSubmit(form);
      }
      // Only show success toast if the operation actually succeeded
      if (success !== false) {
        setForm(defaultState);
        onClose();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  }

  function handleClose() {
    setForm(defaultState);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto dark:bg-black/70"
        onClick={handleClose}
      >
        <form
          onSubmit={handleSubmit}
          className="my-8 w-full max-w-xl overflow-hidden rounded-2xl bg-white dark:bg-[#1e2530] shadow-2xl dark:shadow-black/60 border border-slate-100 dark:border-white/[0.08] transition-all duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500" />

          <div className="p-6 sm:p-7">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {isEditMode ? "Edit Task" : "Create New Task"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#94a3b8] mt-0.5">
                  {isEditMode ? "Update your task details and parameters" : "Plan your work and stay ahead of deadlines"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e2530] hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Task Title */}
              <div>
                <label htmlFor="taskName" className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                  Task Title <RequiredStar />
                </label>
                <input
                  id="taskName"
                  type="text"
                  value={form.taskName}
                  onChange={handleChange("taskName")}
                  placeholder="e.g. Physics Chapter 4 Problem Set"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530]/80 px-3.5 py-2.5 text-sm text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#1e2530] transition-colors"
                  autoFocus
                  required
                />
              </div>

              {/* Subject & Due Date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                    Subject / Module <RequiredStar />
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      id="subject"
                      value={form.subject}
                      onChange={handleChange("subject")}
                      placeholder="e.g. Mathematics"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530]/80 py-2.5 pl-9 pr-3 text-sm text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#1e2530] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="taskDueDate" className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                    Due Date <RequiredStar />
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      id="taskDueDate"
                      value={form.taskDueDate}
                      onChange={handleChange("taskDueDate")}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530]/80 py-2.5 pl-9 pr-3 text-sm text-slate-800 dark:text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#1e2530] transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dropdowns Row: Category, Priority, Effort */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Dropdown
                  label="Category"
                  options={["Class", "Exam", "Assignment", "Hobby"]}
                  selected={form.category}
                  onSelect={handleSelect("category")}
                />
                <Dropdown
                  label="Priority"
                  options={["Low", "Medium", "High"]}
                  selected={form.priority}
                  onSelect={handleSelect("priority")}
                  colorMap={PRIORITY_COLORS}
                />
                <Dropdown
                  label="Effort"
                  options={["Low", "Medium", "High"]}
                  selected={form.effort}
                  onSelect={handleSelect("effort")}
                  colorMap={EFFORT_COLORS}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="taskDescription" className="block text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] mb-1">
                  Notes & Description
                </label>
                <textarea
                  id="taskDescription"
                  value={form.taskDescription}
                  onChange={handleChange("taskDescription")}
                  rows={3}
                  placeholder="Key instructions, references, or submission links..."
                  className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530]/80 px-3.5 py-2.5 text-sm text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#1e2530] transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.07]">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-[#cbd5e1] hover:bg-slate-100 dark:hover:bg-[#1e2530] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80/50 transition-all active:scale-95"
              >
                {isEditMode ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 rounded-2xl bg-slate-900 dark:bg-[#1e2530] text-white px-5 py-3 shadow-2xl border border-slate-700">
          <span className="text-emerald-400 text-lg">✓</span>
          <span className="text-sm font-medium">
            {isEditMode ? "Task updated successfully!" : "Task added successfully!"}
          </span>
        </div>
      )}
    </>
  );
}
