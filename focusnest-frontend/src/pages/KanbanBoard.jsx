import { useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { MultiBackend } from "react-dnd-multi-backend";
import { GripVertical, Plus, Trash2, Edit2 } from "lucide-react";
import { useTasks } from "../components/TaskContext";
import TaskModal from "../components/TaskModal";
import ConfirmDialog from "../components/ConfirmDialog";

const ItemType = "TASK";

const COLUMNS = [
  { status: "Todo", title: "To Do", color: "#6366f1" },
  { status: "Upcoming", title: "Upcoming", color: "#0ea5e9" },
  { status: "Pending", title: "Pending", color: "#f59e0b" },
  { status: "In Progress", title: "In Progress", color: "#8b5cf6" },
  { status: "Done", title: "Done", color: "#10b981" },
];

const CATEGORY_STYLES = {
  Exam: { bg: "bg-rose-50 dark:bg-rose-500/[0.1]", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
  Assignment: { bg: "bg-amber-50 dark:bg-amber-500/[0.1]", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  Class: { bg: "bg-emerald-50 dark:bg-emerald-500/[0.1]", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  Hobby: { bg: "bg-pink-50 dark:bg-pink-500/[0.1]", text: "text-pink-600 dark:text-pink-400", dot: "bg-pink-500" },
};

const PRIORITY_STYLES = {
  Low: { bg: "bg-slate-100 dark:bg-[#1e2530]", text: "text-slate-500 dark:text-[#94a3b8]" },
  Medium: { bg: "bg-amber-50 dark:bg-amber-500/[0.1]", text: "text-amber-600 dark:text-amber-400" },
  High: { bg: "bg-rose-50 dark:bg-rose-500/[0.1]", text: "text-rose-600 dark:text-rose-400" },
};

const EFFORT_STYLES = {
  Low: { bg: "bg-sky-50 dark:bg-sky-500/[0.1]", text: "text-sky-600 dark:text-sky-400" },
  Medium: { bg: "bg-violet-50 dark:bg-violet-500/[0.1]", text: "text-violet-600 dark:text-violet-400" },
  High: { bg: "bg-fuchsia-50 dark:bg-fuchsia-500/[0.1]", text: "text-fuchsia-600 dark:text-fuchsia-400" },
};

// ---------- Task Card ----------
function DraggableTaskCard({ task, columnColor, onEdit, onDeleteRequest }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: task.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const cat = CATEGORY_STYLES[task.category] ?? {
    bg: "bg-slate-50 dark:bg-[#1e2530]",
    text: "text-slate-500",
    dot: "bg-slate-400",
  };
  const pri = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Medium;
  const eff = EFFORT_STYLES[task.effort] ?? EFFORT_STYLES.Medium;

  return (
    <div
      ref={drag}
      className={`group relative mb-2.5 cursor-grab transition-all duration-150 active:cursor-grabbing ${
        isDragging ? "rotate-1 scale-95 opacity-30" : "opacity-100"
      }`}
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#1e2530] shadow-sm transition-all duration-150 hover:border-slate-300 dark:hover:border-white/[0.14] hover:shadow-md dark:shadow-black/20">
        {/* Accent Bar */}
        <div className="h-1 w-full" style={{ backgroundColor: columnColor }} />

        <div className="p-3.5">
          {/* Top row */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <GripVertical className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-300 dark:text-[#475569]" />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold leading-snug text-slate-800 dark:text-white">
                  {task.title}
                </h4>
                {task.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-[#94a3b8]">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e2530] hover:text-indigo-600 transition-colors"
                title="Edit task"
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRequest(task.id);
                }}
                className="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/[0.15] hover:text-rose-500 transition-colors"
                title="Delete task"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Subject tag */}
          {task.subject && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-indigo-100 dark:border-indigo-500/20/60 bg-indigo-50 dark:bg-indigo-500/[0.12] px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {task.subject}
              </span>
            </div>
          )}

          {/* Footer badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${cat.bg} ${cat.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
              {task.category}
            </span>
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${pri.bg} ${pri.text}`}
            >
              {task.priority}
            </span>
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${eff.bg} ${eff.text}`}
            >
              {task.effort}
            </span>
            {task.date && (
              <span className="ml-auto text-[10px] font-semibold text-slate-400 dark:text-[#64748b]">
                {new Date(task.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Column ----------
function Column({ status, title, color, tasks, onDrop, onEdit, onDeleteRequest }) {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    drop: (item) => onDrop(item.id, status),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <div
      ref={drop}
      className={`flex flex-shrink-0 flex-col rounded-2xl border transition-all duration-150 ${
        isOver
          ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/[0.07] shadow-lg shadow-indigo-100 dark:shadow-indigo-950/80"
          : "border-slate-200 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#161b22] shadow-xs"
      } `}
      style={{ width: "272px", minHeight: "580px", height: "100%" }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.07] px-4 py-3 bg-white dark:bg-[#1e2530] rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h3>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-extrabold text-white"
          style={{ backgroundColor: color }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {tasks.length === 0 ? (
          <div
            className="rounded-xl border-2 border-dashed p-8 text-center transition-colors dark:border-white/[0.1]"
            style={{ borderColor: isOver ? color : undefined }}
          >
            <p className="text-xs font-medium text-slate-400 dark:text-[#64748b]">Drop tasks here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              columnColor={color}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function KanbanPage() {
  const { tasks, addTask, editTask, updateTaskStatus, deleteTask } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // task id to delete

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "Done").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] p-4 sm:p-6 md:p-8 transition-colors">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-6">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                  Kanban Board
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-[#94a3b8]">
                  {totalTasks} tasks total · {doneTasks} completed
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/80/50 transition-all active:scale-95 self-start sm:self-auto"
              >
                <Plus size={16} />
                <span>New Task</span>
              </button>
            </div>

            {/* Progress bar */}
            {totalTasks > 0 && (
              <div className="mb-4 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-[#1e2530]">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-[#94a3b8]">{progress}%</span>
              </div>
            )}
          </div>

          {/* DESKTOP columns */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 items-start" style={{ minWidth: "max-content", height: "calc(100vh - 240px)" }}>
              {COLUMNS.map((col) => (
                <Column
                  key={col.status}
                  status={col.status}
                  title={col.title}
                  color={col.color}
                  tasks={tasks.filter((t) => t.status === col.status)}
                  onDrop={(id, status) => updateTaskStatus(id, status)}
                  onEdit={handleEdit}
                  onDeleteRequest={(id) => setConfirmDelete(id)}
                />
              ))}
            </div>
          </div>

          <TaskModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setEditingTask(null);
            }}
            onSubmit={editingTask ? editTask : addTask}
            taskToEdit={editingTask}
          />

          <ConfirmDialog
            isOpen={!!confirmDelete}
            message="This task will be permanently deleted from your board."
            onConfirm={() => { deleteTask(confirmDelete); setConfirmDelete(null); }}
            onCancel={() => setConfirmDelete(null)}
          />
        </div>
      </div>
    </DndProvider>
  );
}
