import React, { useState } from "react";
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Filter,
  Download,
  Search,
  ArrowUpRight,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";
import { StaffDeadlineItem, StaffMember } from "../types";
import { exportDeadlinesXlsx } from "../utils/xlsxExport";

interface DeadlinesViewProps {
  deadlines: StaffDeadlineItem[];
  staffList: StaffMember[];
  onAddDeadline: (item: StaffDeadlineItem) => void;
  onUpdateStatus: (id: string, status: StaffDeadlineItem["preModStatus"]) => void;
  onSelectForModeration: (task: StaffDeadlineItem) => void;
  currentTerm: number;
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({
  deadlines,
  staffList,
  onAddDeadline,
  onUpdateStatus,
  onSelectForModeration,
  currentTerm,
}) => {
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [newTeacher, setNewTeacher] = useState("Shingi");
  const [newSubject, setNewSubject] = useState("Mathematics");
  const [newCurriculum, setNewCurriculum] = useState<"IEB" | "CAPS" | "Cambridge">("IEB");
  const [newGrade, setNewGrade] = useState("10A & 10B");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTestDate, setNewTestDate] = useState("");
  const [newTotalMarks, setNewTotalMarks] = useState(50);

  // Helper to calculate days remaining
  const calculateDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate).getTime();
    const today = new Date().getTime();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Helper to compute pre-mod due date (5 days prior to test date per Policy 7.1)
  const computePreModDueDate = (testDateStr: string) => {
    const d = new Date(testDateStr);
    d.setDate(d.getDate() - 5);
    return d.toISOString().split("T")[0];
  };

  // Filtered deadlines
  const filteredDeadlines = deadlines.filter((item) => {
    if (filterTeacher !== "all" && item.teacherName !== filterTeacher) return false;
    if (filterStatus !== "all" && item.preModStatus !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.taskName.toLowerCase().includes(q) ||
        item.teacherName.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.grade.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName || !newTestDate) return;

    const preDueDate = computePreModDueDate(newTestDate);

    const newItem: StaffDeadlineItem = {
      id: `DL-${Date.now()}`,
      teacherName: newTeacher,
      subject: newSubject,
      curriculum: newCurriculum,
      grade: newGrade,
      taskName: newTaskName,
      testDate: newTestDate,
      preModDueDate: preDueDate,
      preModStatus: "Pending",
      postModStatus: "Not Due Yet",
      totalMarks: newTotalMarks,
      hasDocument: true,
      term: currentTerm,
    };

    onAddDeadline(newItem);
    setIsAddModalOpen(false);
    setNewTaskName("");
    setNewTestDate("");
  };

  const pendingCount = deadlines.filter((d) => d.preModStatus === "Pending").length;
  const approvedCount = deadlines.filter((d) => d.preModStatus === "Approved").length;
  const overdueCount = deadlines.filter((d) => d.preModStatus === "Overdue").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-700" />
            Staff Deadlines & Pre-Moderation Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict adherence to Eagle House School Policy §7.1: Assessment tasks must be submitted to HOD at least 5 school days prior to scheduled test.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportDeadlinesXlsx(deadlines)}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Assessment Task</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Total Scheduled Assessments</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{deadlines.length}</span>
            <span className="text-xs text-blue-700 font-medium">Eagle House Calendar</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-amber-700 block">Pending Pre-Moderation</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
            <span className="text-xs text-amber-700 font-medium">Due &lt;5 days prior</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-emerald-700 block">HOD Approved</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-600">{approvedCount}</span>
            <span className="text-xs text-emerald-700 font-medium">Ready for Duplication</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-rose-700 block">Overdue Submissions</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-rose-600">{overdueCount}</span>
            <span className="text-xs text-rose-700 font-medium">Policy 7.1 Breach</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by task, teacher, grade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 w-56 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">All Educators</option>
              {staffList
                .filter((s) => s.isMathsDept)
                .map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} (Maths Dept)
                  </option>
                ))}
              {staffList
                .filter((s) => !s.isMathsDept)
                .map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending Pre-Mod</option>
              <option value="Approved">Approved</option>
              <option value="Changes Requested">Changes Requested</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredDeadlines.length} of {deadlines.length} tasks
        </span>
      </div>

      {/* Deadlines Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="p-3.5">Assessment Task</th>
                <th className="p-3.5">Educator</th>
                <th className="p-3.5">Curriculum & Grade</th>
                <th className="p-3.5">Scheduled Test Date</th>
                <th className="p-3.5">
                  <div className="flex items-center gap-1">
                    <span>Pre-Mod Deadline</span>
                    <span className="text-[10px] text-blue-600 font-normal">(5 Days Prior)</span>
                  </div>
                </th>
                <th className="p-3.5">Pre-Mod Status</th>
                <th className="p-3.5">Post-Mod (10%)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDeadlines.map((task) => {
                const daysToTest = calculateDaysRemaining(task.testDate);
                const daysToPreMod = calculateDaysRemaining(task.preModDueDate);

                return (
                  <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{task.taskName}</span>
                      <span className="text-[11px] text-slate-500">{task.totalMarks} Marks</span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-medium text-slate-800 block">{task.teacherName}</span>
                      <span className="text-[10px] text-slate-500">{task.subject}</span>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 mr-1.5">
                        {task.curriculum}
                      </span>
                      <span className="text-slate-800 font-medium">{task.grade}</span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-medium text-slate-900 block">{task.testDate}</span>
                      <span className="text-[10px] text-slate-500">
                        {daysToTest > 0
                          ? `in ${daysToTest} days`
                          : daysToTest === 0
                          ? "Today"
                          : `${Math.abs(daysToTest)} days ago`}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-medium text-slate-900 block">{task.preModDueDate}</span>
                      <span
                        className={`text-[10px] font-bold ${
                          daysToPreMod < 0
                            ? "text-rose-600"
                            : daysToPreMod <= 3
                            ? "text-amber-600"
                            : "text-slate-500"
                        }`}
                      >
                        {daysToPreMod < 0
                          ? `${Math.abs(daysToPreMod)}d Overdue`
                          : `${daysToPreMod} days left`}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <select
                        value={task.preModStatus}
                        onChange={(e) => onUpdateStatus(task.id, e.target.value as any)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-md border cursor-pointer ${
                          task.preModStatus === "Approved"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : task.preModStatus === "Pending"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : task.preModStatus === "Changes Requested"
                            ? "bg-purple-50 text-purple-800 border-purple-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        <option value="Pending">Pending Pre-Mod</option>
                        <option value="Approved">Approved</option>
                        <option value="Changes Requested">Changes Requested</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          task.postModStatus === "Completed"
                            ? "bg-purple-100 text-purple-800"
                            : task.postModStatus === "Sample Due"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {task.postModStatus}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onSelectForModeration(task)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Moderate</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Assessment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Schedule New Assessment Task</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeadline} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 1 Control Test: Functions & Geometry"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Educator / Examiner</label>
                  <select
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} {s.isMathsDept ? "(Maths Dept)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Mathematical Literacy">Mathematical Literacy</option>
                    <option value="Technical Mathematics">Technical Mathematics</option>
                    <option value="IGCSE Mathematics">IGCSE Mathematics</option>
                    <option value="AS Mathematics">AS Mathematics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Curriculum</label>
                  <select
                    value={newCurriculum}
                    onChange={(e) => setNewCurriculum(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white font-semibold"
                  >
                    <option value="IEB">IEB SAGS</option>
                    <option value="CAPS">CAPS ATP</option>
                    <option value="Cambridge">Cambridge</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Grade</label>
                  <input
                    type="text"
                    required
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300"
                    placeholder="10A & 10B"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={newTotalMarks}
                    onChange={(e) => setNewTotalMarks(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Scheduled Test Date</label>
                <input
                  type="date"
                  required
                  value={newTestDate}
                  onChange={(e) => setNewTestDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300"
                />
                <p className="text-[11px] text-blue-700 mt-1">
                  * Pre-moderation deadline will be set automatically to 5 days prior per Policy 7.1.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Save to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
