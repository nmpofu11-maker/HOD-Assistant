import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock3,
  CalendarDays,
  User,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Plus,
  Trash2,
} from "lucide-react";
import { DepartmentCalendarTask, StaffDeadlineItem, StaffMember } from "../types";

interface WeeklyOverviewProps {
  deadlines: StaffDeadlineItem[];
  staffList: StaffMember[];
  persona: string;
  currentTerm: number;
  calendarTasks: DepartmentCalendarTask[];
  onSaveCalendarTasks: (tasks: DepartmentCalendarTask[]) => Promise<void>;
}

interface CustomTask {
  id: string;
  title: string;
  date: string;
  type: "meeting" | "deadline" | "task";
  teacher: string;
  grade?: string;
  time?: string;
  status?: string;
}

export const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({
  deadlines,
  staffList,
  persona,
  currentTerm,
  calendarTasks,
  onSaveCalendarTasks,
}) => {
  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [customTasks, setCustomTasks] = useState<CustomTask[]>(calendarTasks.map((task) => ({ ...task, type: task.type as "meeting" | "task" })));  const getWeekDates = (startDate: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeekStart);

  const formatDateISO = (d: Date) => d.toISOString().split("T")[0];

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskType, setNewTaskType] = useState<"meeting" | "task">("task");
  const [newTaskTeacher, setNewTaskTeacher] = useState("");
  React.useEffect(() => {
    setCustomTasks(calendarTasks.map((task) => ({ ...task, type: task.type as "meeting" | "task" })));
  }, [calendarTasks]);

  React.useEffect(() => {
    if (!newTaskTeacher && staffList.length) {
      setNewTaskTeacher(staffList.find((s) => s.isMathsDept && s.status === "active")?.name || "");
    }
  }, [staffList, newTaskTeacher]);



  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskDate) return;

    const newTask: CustomTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      date: newTaskDate,
      type: newTaskType,
      teacher: newTaskTeacher,
      time: newTaskTime || undefined,
      status: "Pending",
    };

    const updatedTasks = [...customTasks, newTask];
    setCustomTasks(updatedTasks);
    void onSaveCalendarTasks(updatedTasks.filter((task) => task.type !== "deadline").map((task) => ({ ...task, type: task.type as "meeting" | "task" }))).catch((error) => alert(error.message || "Could not save the calendar event."));
    setNewTaskTitle("");
    setNewTaskTime("");
    alert("Task successfully scheduled in the HOD departmental calendar!");
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = customTasks.filter((t) => t.id !== id);
    setCustomTasks(updatedTasks);
    void onSaveCalendarTasks(updatedTasks.filter((task) => task.type !== "deadline").map((task) => ({ ...task, type: task.type as "meeting" | "task" }))).catch((error) => alert(error.message || "Could not delete the calendar event."));
  };

  // Aggregate and format all calendar items: Deadlines (Pre-mod dues, post-mod, test dates) + CustomTasks (Meetings, general tasks)
  const getAggregatedItemsForDate = (dateStr: string) => {
    const items: any[] = [];

    // 1. Add formal scheduled test dates
    deadlines.forEach((dl) => {
      if (dl.testDate === dateStr) {
        items.push({
          id: `${dl.id}-test`,
          title: `Assessment Test: ${dl.taskName}`,
          type: "deadline",
          grade: dl.grade,
          teacher: dl.teacherName,
          status: dl.postModStatus,
          original: dl,
        });
      }
      // 2. Add pre-moderation due dates (5 days before)
      if (dl.preModDueDate === dateStr) {
        items.push({
          id: `${dl.id}-premod`,
          title: `Pre-Mod Due: ${dl.taskName}`,
          type: "premod",
          grade: dl.grade,
          teacher: dl.teacherName,
          status: dl.preModStatus,
          original: dl,
        });
      }
    });

    // 3. Add user-created tasks / meetings
    customTasks.forEach((ct) => {
      if (ct.date === dateStr) {
        items.push(ct);
      }
    });

    return items.filter((item) => {
      if (persona === "hod") return true;
      const educator = staffList.find((s) => s.id === persona);
      if (!educator) return true;
      return item.teacher === educator.name;
    });
  };

  const getPersonaDisplayName = () => {
    if (persona === "hod") return "HOD / All Department";
    return staffList.find((s) => s.id === persona)?.name || "Selected Educator";
  };

  // Fetch items for the currently active day selected card
  const selectedDayDate = weekDates[selectedDayOffset];
  const selectedDayDateStr = formatDateISO(selectedDayDate);
  const activeDayItems = getAggregatedItemsForDate(selectedDayDateStr);

  return (
    <div className="space-y-6">
      {/* Header card with persona specific badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-teal-800" />
            Aggregated Weekly Department Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized 7-day schedule compiling pre-moderation targets, test write times, meetings, and teacher actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>Viewing as: {getPersonaDisplayName()}</span>
          </span>
        </div>
      </div>

      {/* Week Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 text-xs">
          <span className="font-semibold text-slate-700">Academic Week:</span>
          <span className="py-1.5 px-3 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-900">
            {weekDates[0].toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })} – {weekDates[6].toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedWeekStart((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7))} className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
          <button onClick={() => setSelectedWeekStart(getMonday(new Date()))} className="px-2.5 py-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 text-[11px] font-semibold cursor-pointer">Current Week</button>
          <button onClick={() => setSelectedWeekStart((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))} className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
        </div>
      </div>

      {/* 7-Day Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDates.map((date, index) => {
          const dateStr = formatDateISO(date);
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
          const dayNum = date.getDate();
          const items = getAggregatedItemsForDate(dateStr);
          const isSelected = selectedDayOffset === index;

          return (
            <button
              key={index}
              onClick={() => setSelectedDayOffset(index)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
                isSelected
                  ? "bg-teal-50/60 border-teal-800 ring-2 ring-teal-800/10 shadow-md"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              <div className="space-y-1 w-full">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  {dayName}
                </span>
                <span
                  className={`text-2xl font-black block leading-none ${
                    isSelected ? "text-teal-950 font-serif" : "text-slate-800 font-serif"
                  }`}
                >
                  {dayNum}
                </span>
              </div>

              {/* Day Events Stack preview */}
              <div className="mt-3 space-y-1 w-full">
                {items.length === 0 ? (
                  <span className="text-[10px] text-slate-400 italic block">No Tasks</span>
                ) : (
                  items.slice(0, 3).map((item, itemIdx) => {
                    let badgeColor = "bg-slate-100 text-slate-800";
                    if (item.type === "deadline") badgeColor = "bg-rose-50 text-rose-700 border-rose-100";
                    if (item.type === "premod") badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
                    if (item.type === "meeting") badgeColor = "bg-blue-50 text-blue-700 border-blue-100";
                    if (item.type === "task") badgeColor = "bg-purple-50 text-purple-700 border-purple-100";

                    return (
                      <div
                        key={itemIdx}
                        className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold truncate leading-tight ${badgeColor}`}
                        title={`${item.title} (${item.teacher})`}
                      >
                        {item.title}
                      </div>
                    );
                  })
                )}
                {items.length > 3 && (
                  <span className="text-[9px] text-teal-800 font-bold block">
                    +{items.length - 3} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Two-Column Detail View and Task Scheduler */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Agenda & Policy Checklist for selected day */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Clock3 className="w-5 h-5 text-teal-800" />
              Daily Agenda & Tasks for{" "}
              <span className="text-teal-950 font-serif font-black underline decoration-teal-600">
                {selectedDayDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {activeDayItems.length} {activeDayItems.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          {activeDayItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs italic">
              No departmental events scheduled for this day. Feel free to schedule a new task using the form.
            </div>
          ) : (
            <div className="space-y-3">
              {activeDayItems.map((item) => {
                let colorClass = "border-slate-200 bg-slate-50";
                if (item.type === "deadline") colorClass = "border-rose-200 bg-rose-50/20";
                if (item.type === "premod") colorClass = "border-amber-200 bg-amber-50/20";
                if (item.type === "meeting") colorClass = "border-blue-200 bg-blue-50/20";
                if (item.type === "task") colorClass = "border-purple-200 bg-purple-50/20";

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border ${colorClass} flex flex-wrap items-center justify-between gap-4`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                          {item.type}
                        </span>
                        {item.grade && (
                          <span className="text-[9px] bg-slate-200 text-slate-800 px-2 py-0.2 rounded-full font-bold">
                            {item.grade}
                          </span>
                        )}
                        {item.time && (
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> {item.time}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Responsible: {item.teacher}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-white/80 border px-2.5 py-1 rounded-md shadow-xs">
                        {item.status || "Pending"}
                      </span>
                      {item.id.toString().startsWith("task-") && (
                        <button
                          onClick={() => handleDeleteTask(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Delete scheduled task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Department Policy Card Sync */}
          <div className="bg-teal-900 text-white rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Eagle House Departmental Policy Quick Reference
            </h4>
            <div className="text-xs space-y-2 text-teal-100">
              <p>
                <strong>Policy §7.1 Pre-Moderation:</strong> Formal tasks must be submitted to the HOD at least 5 school days prior to scheduled assessment date.
              </p>
              <p>
                <strong>Policy §7.2 Post-Moderation:</strong> 10% scripts sample (top, middle, weak) must be moderated by the HOD using purple pen within 5 school days of the assessment.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule a Department Task / Meeting */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Plus className="w-5 h-5 text-teal-800" />
            Quick Calendar Scheduler
          </h3>

          <form onSubmit={handleAddTask} className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title / Agenda</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. IEB Syllabus Alignment Workshop"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-700 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time (Optional)</label>
                <input
                  type="time"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
                <select
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg focus:ring-1 focus:ring-teal-700 focus:outline-none"
                >
                  <option value="task">Staff Task</option>
                  <option value="meeting">Department Meeting</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Educator</label>
                <select
                  value={newTaskTeacher}
                  onChange={(e) => setNewTaskTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg focus:ring-1 focus:ring-teal-700 focus:outline-none"
                >
                  {staffList.filter((s) => s.isMathsDept && s.status === "active").map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              Add Event to Calendar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
