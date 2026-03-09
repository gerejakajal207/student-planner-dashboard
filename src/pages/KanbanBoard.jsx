import { useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { MultiBackend } from "react-dnd-multi-backend";
import { GripVertical, Plus, TriangleAlert, Trash2, ChevronDown } from "lucide-react";
import { useTasks } from "../components/TaskContext";
import TaskModal from "../components/TaskModal";

const ItemType = "TASK";

const COLUMNS = [
  { status: "Todo", title: "To Do", color: "#6366f1" },
  { status: "Upcoming", title: "Upcoming", color: "#0ea5e9" },
  { status: "Pending", title: "Pending", color: "#f59e0b" },
  { status: "In Progress", title: "In Progress", color: "#8b5cf6" },
  { status: "Done", title: "Done", color: "#10b981" },
];

const CATEGORY_STYLES = {
  Exam: { bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-400" },
  Assignment: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
  Class: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  Hobby: { bg: "bg-pink-50", text: "text-pink-600", dot: "bg-pink-400" },
};

const PRIORITY_STYLES = {
  Low: { bg: "bg-slate-100", text: "text-slate-500" },
  Medium: { bg: "bg-amber-50", text: "text-amber-600" },
  High: { bg: "bg-red-50", text: "text-red-600" },
};

const EFFORT_STYLES = {
  Low: { bg: "bg-sky-50", text: "text-sky-600" },
  Medium: { bg: "bg-violet-50", text: "text-violet-600" },
  High: { bg: "bg-fuchsia-50", text: "text-fuchsia-600" },
};

// ---------- Task Card ----------
function DraggableTaskCard({ task, isDeprioritized, columnColor }) {
  const { deleteTask } = useTasks();
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: task.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const cat = CATEGORY_STYLES[task.category] ?? {
    bg: "bg-gray-50",
    text: "text-gray-500",
    dot: "bg-gray-400",
  };
  const pri = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Medium;
  const eff = EFFORT_STYLES[task.effort] ?? EFFORT_STYLES.Medium;

  return (
    <div
      ref={drag}
      className={`group relative mb-2 cursor-grab transition-all duration-150 active:cursor-grabbing ${isDragging ? "rotate-1 scale-95 opacity-30" : "opacity-100"} ${isDeprioritized ? "opacity-35" : ""} `}
    >
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-150 hover:border-slate-300 hover:shadow-md">
        {/* Color accent bar */}
        <div className="h-0.5 w-full" style={{ backgroundColor: columnColor }} />

        <div className="p-3">
          {/* Top row */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <GripVertical className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-300" />
              <div className="min-w-0 flex-1">
                <h4
                  className={`text-sm font-medium leading-snug text-slate-800 ${isDeprioritized ? "text-slate-400 line-through" : ""}`}
                >
                  {task.title}
                </h4>
                {task.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}
              className="flex-shrink-0 rounded p-1 text-slate-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-400 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Subject tag */}
          {task.subject && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                {task.subject}
              </span>
            </div>
          )}

          {/* Footer badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-md border border-transparent px-1.5 py-0.5 text-[11px] font-medium ${cat.bg} ${cat.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
              {task.category}
            </span>
            <span
              className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${pri.bg} ${pri.text}`}
            >
              {task.priority}
            </span>
            <span
              className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${eff.bg} ${eff.text}`}
            >
              {task.effort} effort
            </span>
            {task.date && (
              <span className="ml-auto text-[11px] font-medium text-slate-400">
                {task.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Deprioritized tooltip */}
      {isDeprioritized && (
        <div className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-xl">
            Low priority — heavy day active
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900" />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Column ----------
function Column({ status, title, color, tasks, onDrop, isHeavyDay }) {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    drop: (item) => onDrop(item.id, status),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <div
      ref={drop}
      className={`flex flex-shrink-0 flex-col rounded-xl border transition-all duration-150 ${isOver ? "border-indigo-300 bg-indigo-50/50 shadow-lg shadow-indigo-100" : "border-slate-200 bg-white shadow-sm"} `}
      style={{ width: "272px", minHeight: "580px" }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto p-3" style={{ maxHeight: "calc(80vh - 120px)" }}>
        {tasks.length === 0 ? (
          <div
            className="rounded-lg border-2 border-dashed p-8 text-center transition-colors"
            style={{ borderColor: isOver ? color : "#e2e8f0" }}
          >
            <p className="text-xs text-slate-400">Drop tasks here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              columnColor={color}
              isDeprioritized={isHeavyDay && task.priority === "Low"}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---------- Mobile Column ----------
function MobileColumn({ status, title, color, tasks, isHeavyDay }) {
  const { deleteTask } = useTasks();
  const [isExpanded, setIsExpanded] = useState(true);

  if (tasks.length === 0) return null;

  const cat = (category) =>
    CATEGORY_STYLES[category] ?? { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded((p) => !p)}
        className="flex w-full items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold text-slate-700">{title}</span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {tasks.length}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Cards */}
      {isExpanded && (
        <div className="space-y-2 p-3">
          {tasks.map((task) => {
            const c = cat(task.category);
            const p = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Medium;
            return (
              <div
                key={task.id}
                className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${isHeavyDay && task.priority === "Low" ? "opacity-40" : ""}`}
              >
                <div className="h-0.5" style={{ backgroundColor: color }} />
                <div className="p-3">
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium leading-snug text-slate-800">
                      {task.title}
                    </h4>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 rounded p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {task.description && (
                    <p className="mb-2 line-clamp-2 text-xs text-slate-400">{task.description}</p>
                  )}
                  {task.subject && (
                    <span className="mb-2 inline-block rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                      {task.subject}
                    </span>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${c.bg} ${c.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                      {task.category}
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${p.bg} ${p.text}`}
                    >
                      {task.priority}
                    </span>
                    {task.date && (
                      <span className="ml-auto text-[11px] font-medium text-slate-400">
                        {task.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Main Page ----------
export default function KanbanPage() {
  const { tasks, addTask, updateTaskStatus } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);

  const highEffortCount = tasks.filter((t) => t.status === "Todo" && t.effort === "High").length;
  const isHeavyDay = highEffortCount > 3;

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "Done").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div className="min-h-screen bg-slate-100 p-4 sm:p-6 md:p-8">
        {/* HEADER */}
        <div className="mb-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                Kanban Board
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {totalTasks} tasks · {doneTasks} completed
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Task</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>

          {/* Progress bar */}
          {totalTasks > 0 && (
            <div className="mb-4 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500">{progress}%</span>
            </div>
          )}

          {/* Heavy day banner */}
          {isHeavyDay && (
            <div className="flex w-fit items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
              <TriangleAlert className="h-4 w-4 flex-shrink-0" />
              <span>Heavy day detected — low priority tasks are deprioritized</span>
            </div>
          )}
        </div>

        {/* DESKTOP columns */}
        <div className="hidden overflow-x-auto pb-4 md:block">
          <div className="flex gap-3" style={{ minWidth: "max-content" }}>
            {COLUMNS.map((col) => (
              <Column
                key={col.status}
                status={col.status}
                title={col.title}
                color={col.color}
                tasks={tasks.filter((t) => t.status === col.status)}
                onDrop={(id, status) => updateTaskStatus(id, status)}
                isHeavyDay={isHeavyDay}
              />
            ))}
          </div>
        </div>

        {/* MOBILE columns */}
        <div className="space-y-3 md:hidden">
          {COLUMNS.map((col) => (
            <MobileColumn
              key={col.status}
              status={col.status}
              title={col.title}
              color={col.color}
              tasks={tasks.filter((t) => t.status === col.status)}
              isHeavyDay={isHeavyDay}
            />
          ))}
        </div>

        <TaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={addTask} />
      </div>
    </DndProvider>
  );
}
