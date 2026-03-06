import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const PRIORITY_COLORS = {
  Low: "bg-green-500",
  Medium: "bg-yellow-500",
  High: "bg-red-500",
};

const EFFORT_COLORS = {
  Low: "bg-blue-400",
  Medium: "bg-orange-400",
  High: "bg-purple-500",
};

const CATEGORY_ICONS = {
  Class: "📚",
  Exam: "📝",
  Assignment: "📋",
  Hobby: "🎨",
};

function RequiredStar() {
  return <span className="ml-1 text-red-500">*</span>;
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
    <div className="relative" ref={ref}>
      <label className="text-sm text-gray-700">
        {label}
        <RequiredStar />
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mt-1 flex items-center justify-between w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="flex items-center gap-2">
          {colorMap && (
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorMap[selected]}`} />
          )}
          {CATEGORY_ICONS[selected] && <span>{CATEGORY_ICONS[selected]}</span>}
          {selected}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-blue-500 hover:text-white ${
                selected === option ? "bg-blue-500 text-white" : ""
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

export default function TaskModal({ isOpen, onClose }) {
  const [form, setForm] = useState(defaultState);

  const today = new Date().toISOString().split("T")[0];

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSelect(field) {
    return (value) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log(form);
    setForm(defaultState);
    onClose();
  }

  function handleClose() {
    setForm(defaultState);
    onClose();
  }

  // No longer needs its own "Open Task" button — just renders the modal
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 top-16 z-20 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleClose}
        >
          <form
            onSubmit={handleSubmit}
            className="mx-4 my-5 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl sm:max-w-lg md:max-w-xl lg:max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-base font-semibold text-gray-800 sm:text-lg md:text-xl">
                  Create New Task
                </h2>
                <p className="text-base text-gray-500">Add a new task to your schedule</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-2xl font-bold leading-none text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <p className="mb-4 text-xs text-gray-400">
              Fields marked with <span className="text-red-500">*</span> are required.
            </p>

            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="taskName">Task Name <RequiredStar /></label>
                <input
                  id="taskName"
                  type="text"
                  value={form.taskName}
                  onChange={handleChange("taskName")}
                  placeholder="Task name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="taskDescription">Description <RequiredStar /></label>
                <textarea
                  id="taskDescription"
                  value={form.taskDescription}
                  onChange={handleChange("taskDescription")}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="taskDueDate">Due Date <RequiredStar /></label>
                <input
                  type="date"
                  id="taskDueDate"
                  value={form.taskDueDate}
                  onChange={handleChange("taskDueDate")}
                  min={today}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="subject">Subject <RequiredStar /></label>
                <input
                  type="text"
                  id="subject"
                  value={form.subject}
                  onChange={handleChange("subject")}
                  placeholder="Enter subject"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

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

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm text-gray-600 transition-colors hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}