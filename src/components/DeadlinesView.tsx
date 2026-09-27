import React, { useState, useMemo } from "react";
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Award,
  Calendar,
  BarChart3,
  Check,
  ChevronRight,
  User,
  Zap,
  Trash2,
} from "lucide-react";
import { StaffDeadlineItem, StaffMember, SubjectDifficultyTier } from "../types";
import { exportDeadlinesXlsx } from "../utils/xlsxExport";

interface DeadlinesViewProps {
  deadlines: StaffDeadlineItem[];
  staffList: StaffMember[];
  onAddDeadline: (item: StaffDeadlineItem) => void;
  onUpdateStatus: (id: string, status: StaffDeadlineItem["preModStatus"]) => void;
  onSelectForModeration: (task: StaffDeadlineItem) => void;
  onClearDeadlines: () => void;
  onDeleteDeadline: (id: string) => void;
  currentTerm: number;
  onTermChange?: (term: number) => void;
}

export type DeadlineSortField = "urgency" | "teacher" | "difficulty" | "testDate" | "taskName" | "term";
export type SortDirection = "asc" | "desc";

// Helper to determine the difficulty tier for any deadline item
export const getTaskDifficultyTier = (item: StaffDeadlineItem): SubjectDifficultyTier => {
  if (item.difficultyCategory) return item.difficultyCategory;
  const s = (item.subject || "").toLowerCase();
  const g = (item.grade || "").toLowerCase();
  if (
    s.includes("advanced") ||
    s.includes("ap ") ||
    s.includes("specialist") ||
    (item.curriculum === "Cambridge" && (g.includes("as") || g.includes("a level") || g.includes("9709")))
  ) {
    return "Tier 1: Advanced / High Rigour";
  }
  if (g.includes("12") && !s.includes("lit")) {
    return "Tier 1: Advanced / High Rigour";
  }
  if (
    ((g.includes("11") || item.curriculum === "Cambridge") && !s.includes("lit")) ||
    s.includes("0580")
  ) {
    return "Tier 2: Senior Core Pure Maths";
  }
  if (s.includes("lit") || s.includes("literacy")) {
    return "Tier 4: Applied / Contextual";
  }
  return "Tier 3: Core FET Foundations";
};

const DIFFICULTY_RANK: Record<SubjectDifficultyTier, number> = {
  "Tier 1: Advanced / High Rigour": 1,
  "Tier 2: Senior Core Pure Maths": 2,
  "Tier 3: Core FET Foundations": 3,
  "Tier 4: Applied / Contextual": 4,
};

// Term metadata definitions
const TERM_METADATA = {
  1: {
    title: "Term 1",
    period: "Jan - Mar 2026",
    focus: "Baseline Assessments, Control Tests & Term Assignments",
    color: "blue",
  },
  2: {
    title: "Term 2",
    period: "Apr - Jun 2026",
    focus: "Mid-Year Examinations, Investigations & Practical Tasks",
    color: "teal",
  },
  3: {
    title: "Term 3",
    period: "Jul - Sep 2026",
    focus: "Grade 12 Prelim Exams, PATs & Control Test 2",
    color: "amber",
  },
  4: {
    title: "Term 4",
    period: "Oct - Dec 2026",
    focus: "November Final Exams & External IEB/Cambridge Audits",
    color: "purple",
  },
};

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({
  deadlines,
  staffList,
  onAddDeadline,
  onUpdateStatus,
  onSelectForModeration,
  currentTerm,
  onTermChange,
}) => {
  // Active Tab: "annual" for the Annual Master Supertab, or 1 | 2 | 3 | 4 for individual Term tabs
  const [selectedTermTab, setSelectedTermTab] = useState<"annual" | 1 | 2 | 3 | 4>(
    (currentTerm as 1 | 2 | 3 | 4) || 1
  );

  // Secondary Filters inside the active view
  const [filterTerm, setFilterTerm] = useState<string>("all");
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<DeadlineSortField>("urgency");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // New task form state
  const [newTeacher, setNewTeacher] = useState("Shingi");
  const [newSubject, setNewSubject] = useState("Mathematics");
  const [newCurriculum, setNewCurriculum] = useState<"IEB" | "CAPS" | "Cambridge">("IEB");
  const [newGrade, setNewGrade] = useState("10A & 10B");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTestDate, setNewTestDate] = useState("");
  const [newTotalMarks, setNewTotalMarks] = useState(50);
  const [newTermSelect, setNewTermSelect] = useState<number>(
    selectedTermTab === "annual" ? currentTerm : selectedTermTab
  );
  const [newDifficulty, setNewDifficulty] = useState<SubjectDifficultyTier>(
    "Tier 3: Core FET Foundations"
  );

  // Helper to calculate days remaining until a date
  const calculateDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper to calculate days remaining
  const calculateUrgency = (task: StaffDeadlineItem) => {
    const daysToPreMod = calculateDaysRemaining(task.preModDueDate);
    if (task.preModStatus === "Approved" || task.preModStatus === "Submitted") return { label: task.preModStatus, color: "bg-emerald-100 text-emerald-800" };
    if (daysToPreMod < 0) return { label: "Overdue", color: "bg-rose-100 text-rose-800" };
    if (daysToPreMod === 0) return { label: "Due Today", color: "bg-amber-100 text-amber-800" };
    if (daysToPreMod <= 3) return { label: `Due in ${daysToPreMod} days`, color: "bg-amber-50 text-amber-700" };
    return { label: "On Track", color: "bg-slate-100 text-slate-700" };
  };

  // Helper to compute pre-mod due date (5 days prior to test date per Policy 7.1)
  const computePreModDueDate = (testDateStr: string) => {
    const d = new Date(testDateStr);
    d.setDate(d.getDate() - 5);
    return d.toISOString().split("T")[0];
  };

  // Handle Quick Sort Pill Click
  const handleSortToggle = (field: DeadlineSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle Switching Term Tabs
  const handleTabSwitch = (tab: "annual" | 1 | 2 | 3 | 4) => {
    setSelectedTermTab(tab);
    if (tab !== "annual" && onTermChange) {
      onTermChange(tab);
    }
  };

  // Base list of deadlines for current active tab
  const tabDeadlines = useMemo(() => {
    if (selectedTermTab === "annual") {
      if (filterTerm !== "all") {
        return deadlines.filter((d) => (d.term || 1) === parseInt(filterTerm, 10));
      }
      return deadlines;
    }
    return deadlines.filter((d) => (d.term || 1) === selectedTermTab);
  }, [deadlines, selectedTermTab, filterTerm]);

  // Filtered and Sorted deadlines for display
  const sortedAndFilteredDeadlines = useMemo(() => {
    const filtered = tabDeadlines.filter((item) => {
      if (filterTeacher !== "all" && item.teacherName !== filterTeacher) return false;
      if (filterStatus !== "all" && item.preModStatus !== filterStatus) return false;
      if (filterDifficulty !== "all") {
        const tier = getTaskDifficultyTier(item);
        if (tier !== filterDifficulty) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const tier = getTaskDifficultyTier(item).toLowerCase();
        return (
          item.taskName.toLowerCase().includes(q) ||
          item.teacherName.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.grade.toLowerCase().includes(q) ||
          tier.includes(q)
        );
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortField === "term") {
        comparison = (a.term || 1) - (b.term || 1);
      } else if (sortField === "urgency") {
        const daysA = calculateDaysRemaining(a.preModDueDate);
        const daysB = calculateDaysRemaining(b.preModDueDate);
        
        const statusScore = (item: StaffDeadlineItem, days: number) => {
          if (item.preModStatus === "Overdue" || days < 0) return -10000 + days;
          if (item.preModStatus === "Pending") return days;
          if (item.preModStatus === "Changes Requested") return -5000 + days;
          if (item.preModStatus === "Submitted") return days + 100;
          return 5000 + days; // Approved
        };
        comparison = statusScore(a, daysA) - statusScore(b, daysB);
      } else if (sortField === "teacher") {
        comparison = a.teacherName.localeCompare(b.teacherName);
      } else if (sortField === "difficulty") {
        const tierA = getTaskDifficultyTier(a);
        const tierB = getTaskDifficultyTier(b);
        comparison = DIFFICULTY_RANK[tierA] - DIFFICULTY_RANK[tierB];
      } else if (sortField === "testDate") {
        comparison = new Date(a.testDate).getTime() - new Date(b.testDate).getTime();
      } else if (sortField === "taskName") {
        comparison = a.taskName.localeCompare(b.taskName);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [tabDeadlines, filterTeacher, filterStatus, filterDifficulty, searchQuery, sortField, sortDirection]);

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
      term: newTermSelect,
      difficultyCategory: newDifficulty,
    };

    onAddDeadline(newItem);
    setIsAddModalOpen(false);
    setNewTaskName("");
    setNewTestDate("");
  };

  // Metrics calculation
  const totalTasksCount = tabDeadlines.length;
  const pendingCount = tabDeadlines.filter((d) => d.preModStatus === "Pending").length;
  const approvedCount = tabDeadlines.filter((d) => d.preModStatus === "Approved").length;
  const overdueCount = tabDeadlines.filter((d) => d.preModStatus === "Overdue").length;
  const totalAnnualTasks = deadlines.length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Primary Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              Actions, Activities & Pre-Moderation Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Eagle House School Policy §7.1: Assessment tasks & activities pre-moderated by HOD 5 school days prior to scheduled release.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".xlsx,.docx,.pdf,.jpg,.jpeg,.png";
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async (re) => {
                    const base64 = re.target?.result as string;
                    const res = await fetch("/api/deadlines/upload-calendar", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ fileData: base64, mimeType: file.type, fileName: file.name }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      // Handle parsing/confirmation... (simplified for now to just log)
                      console.log("Parsed deadlines:", data.deadlines);
                      alert(`Parsed ${data.deadlines.length} deadlines. (Implementation for confirmation pending)`);
                    }
                  };
                  reader.readAsDataURL(file);
                };
                input.click();
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Upload Calendar</span>
            </button>
            </div>

            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear ALL deadlines? This action is irreversible.")) {
                  onClearDeadlines();
                }
              }}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Clear All</span>
            </button>

            <button
              onClick={() => exportDeadlinesXlsx(sortedAndFilteredDeadlines)}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Assessment Task</span>
            </button>
          </div>
        </div>

        {/* 2. TERMLY TABS & ANNUAL SUPERTAB NAVIGATION BAR */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 pl-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-serif">
                Schedule View Mode:
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
              {/* ANNUAL SUPERTAB BUTTON */}
              <button
                onClick={() => handleTabSwitch("annual")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  selectedTermTab === "annual"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow-md ring-2 ring-amber-400/60"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Annual Supertab</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-slate-950/80 text-amber-300 font-extrabold border border-amber-500/30">
                  {totalAnnualTasks} Tasks
                </span>
              </button>

              <div className="h-5 w-px bg-slate-700 mx-1 hidden sm:block" />

              {/* INDIVIDUAL TERM TABS */}
              {[1, 2, 3, 4].map((t) => {
                const termTasks = deadlines.filter((d) => (d.term || 1) === t);
                const isTabActive = selectedTermTab === t;
                const termOverdue = termTasks.filter(
                  (d) => d.preModStatus === "Overdue" || (d.preModStatus === "Pending" && calculateDaysRemaining(d.preModDueDate) < 0)
                ).length;

                return (
                  <button
                    key={t}
                    onClick={() => handleTabSwitch(t as 1 | 2 | 3 | 4)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                      isTabActive
                        ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-400"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    <span>Term {t}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isTabActive
                          ? "bg-blue-900 text-blue-100"
                          : "bg-slate-950 text-slate-300"
                      }`}
                    >
                      {termTasks.length}
                    </span>
                    {termOverdue > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title={`${termOverdue} overdue / pending`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. ANNUAL SUPERTAB CONTENT OVERVIEW (When "annual" is selected) */}
      {selectedTermTab === "annual" && (
        <div className="space-y-6">
          {/* Annual Executive Summary Header */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-xl border border-indigo-800 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 inline-block mb-1">
                  👑 ANNUAL SUPERTAB • 2026 ACADEMIC YEAR
                </span>
                <h2 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-300" />
                  Full Departmental Assessment & Activity Portfolio Matrix
                </h2>
                <p className="text-xs text-indigo-200">
                  Comprehensive 4-term oversight of all assessments, HOD pre-moderations, SBA weightings, and teacher task allocations.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-lg border border-indigo-700/50">
                <div className="text-center">
                  <span className="text-[10px] text-indigo-300 uppercase font-bold block">Annual Compliance</span>
                  <span className="text-xl font-black text-emerald-400">
                    {totalAnnualTasks > 0
                      ? `${Math.round((deadlines.filter((d) => d.preModStatus === "Approved" || d.preModStatus === "Submitted").length / totalAnnualTasks) * 100)}%`
                      : "100%"}
                  </span>
                </div>
                <div className="h-8 w-px bg-indigo-800" />
                <div className="text-center">
                  <span className="text-[10px] text-indigo-300 uppercase font-bold block">Total Marks</span>
                  <span className="text-xl font-black text-amber-300">
                    {deadlines.reduce((acc, curr) => acc + (curr.totalMarks || 0), 0)} pts
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-TERM STRATEGIC BREAKDOWN CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((termNum) => {
              const meta = TERM_METADATA[termNum as 1 | 2 | 3 | 4];
              const termTasks = deadlines.filter((d) => (d.term || 1) === termNum);
              const approved = termTasks.filter((d) => d.preModStatus === "Approved").length;
              const pending = termTasks.filter((d) => d.preModStatus === "Pending").length;
              const overdue = termTasks.filter((d) => d.preModStatus === "Overdue").length;
              const pct = termTasks.length > 0 ? Math.round((approved / termTasks.length) * 100) : 0;

              return (
                <div
                  key={termNum}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-400 dark:hover:border-blue-600 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {meta.period}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                        Term {termNum}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>{meta.title} Schedule</span>
                      <span className="text-xs font-normal text-slate-500">({termTasks.length} tasks)</span>
                    </h3>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                      {meta.focus}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        <span>Pre-Mod Readiness</span>
                        <span>{pct}% Approved</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">{approved} Approved</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">{pending} Pending</span>
                      {overdue > 0 && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-rose-600 dark:text-rose-400 font-bold">{overdue} Overdue</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleTabSwitch(termNum as 1 | 2 | 3 | 4)}
                    className="w-full py-1.5 px-3 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors mt-2"
                  >
                    <span>Focus Term {termNum} Schedule</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* ANNUAL RIGOUR & DIFFICULTY TIER MATRIX */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Annual Assessment Rigour & Difficulty Tier Distribution across Terms
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                "Tier 1: Advanced / High Rigour",
                "Tier 2: Senior Core Pure Maths",
                "Tier 3: Core FET Foundations",
                "Tier 4: Applied / Contextual",
              ].map((tierName) => {
                const count = deadlines.filter((d) => getTaskDifficultyTier(d) === tierName).length;
                return (
                  <div key={tierName} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block leading-tight">{tierName}</span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">{count} Tasks</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {totalAnnualTasks > 0 ? `${Math.round((count / totalAnnualTasks) * 100)}% of Year` : "0%"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. TERMLY TAB SPECIFIC HEADER (When Term 1, 2, 3, or 4 is selected) */}
      {selectedTermTab !== "annual" && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-blue-700 text-white shadow-xs">
                Active View: Term {selectedTermTab}
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {TERM_METADATA[selectedTermTab].title} ({TERM_METADATA[selectedTermTab].period})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {TERM_METADATA[selectedTermTab].focus}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Term Progress:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {totalTasksCount > 0 ? Math.round((approvedCount / totalTasksCount) * 100) : 100}% Pre-Moderated
              </span>
            </div>
          </div>

          {/* Metrics Row for active term */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Scheduled Assessments</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-slate-900 dark:text-white">{totalTasksCount}</span>
                <span className="text-[10px] text-blue-700 dark:text-blue-400 font-medium">Term {selectedTermTab}</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400 block">Pending Pre-Moderation</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Due &lt;5 days prior</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 block">HOD Approved</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{approvedCount}</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Ready for Duplication</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-medium text-rose-700 dark:text-rose-400 block">Overdue Submissions</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-rose-600 dark:text-rose-400">{overdueCount}</span>
                <span className="text-[10px] text-rose-700 dark:text-rose-400 font-medium">Policy 7.1 Breach</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MASTER FILTER & SORT CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Sorting Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Sort View By:
            </span>

            {/* Quick Sort Button: Term (Only shown in annual supertab) */}
            {selectedTermTab === "annual" && (
              <button
                onClick={() => handleSortToggle("term")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  sortField === "term"
                    ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent"
                }`}
              >
                <span>📅 Term</span>
                {sortField === "term" && (
                  sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                )}
              </button>
            )}

            {/* Quick Sort Button: Urgency */}
            <button
              onClick={() => handleSortToggle("urgency")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                sortField === "urgency"
                  ? "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent"
              }`}
            >
              <span>⚡ Urgency</span>
              {sortField === "urgency" && (
                sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
              )}
            </button>

            {/* Quick Sort Button: Teacher Name */}
            <button
              onClick={() => handleSortToggle("teacher")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                sortField === "teacher"
                  ? "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent"
              }`}
            >
              <span>👤 Teacher Name</span>
              {sortField === "teacher" && (
                sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
              )}
            </button>

            {/* Quick Sort Button: Difficulty */}
            <button
              onClick={() => handleSortToggle("difficulty")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                sortField === "difficulty"
                  ? "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent"
              }`}
            >
              <Award className="w-3 h-3" />
              <span>🎯 Difficulty</span>
              {sortField === "difficulty" && (
                sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
              )}
            </button>

            {/* Quick Sort Button: Test Date */}
            <button
              onClick={() => handleSortToggle("testDate")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                sortField === "testDate"
                  ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent"
              }`}
            >
              <span>📅 Scheduled Date</span>
              {sortField === "testDate" && (
                sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Sort Select Menu */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Order:</span>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [f, d] = e.target.value.split("-") as [DeadlineSortField, SortDirection];
                setSortField(f);
                setSortDirection(d);
              }}
              className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="urgency-asc">⚡ Most Urgent (Overdue First)</option>
              <option value="term-asc">📅 Academic Term (T1 → T4)</option>
              <option value="teacher-asc">👤 Teacher Name (A → Z)</option>
              <option value="difficulty-asc">🎯 Difficulty: Highest Rigour First</option>
              <option value="testDate-asc">📅 Test Date: Earliest Scheduled</option>
              <option value="taskName-asc">📝 Task Title (A → Z)</option>
            </select>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search task, teacher, grade, difficulty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-64 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />

              {/* Term Filter (When in Annual Supertab) */}
              {selectedTermTab === "annual" && (
                <select
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  <option value="all">All Terms (1-4)</option>
                  <option value="1">Term 1 Tasks</option>
                  <option value="2">Term 2 Tasks</option>
                  <option value="3">Term 3 Tasks</option>
                  <option value="4">Term 4 Tasks</option>
                </select>
              )}
              
              {/* Filter by Teacher */}
              <select
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
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

              {/* Filter by Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending Pre-Mod</option>
                <option value="Approved">Approved</option>
                <option value="Changes Requested">Changes Requested</option>
                <option value="Overdue">Overdue</option>
              </select>

              {/* Filter by Subject Difficulty Tier */}
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Difficulty Tiers</option>
                <option value="Tier 1: Advanced / High Rigour">Tier 1: Advanced / High Rigour (AP/Gr 12)</option>
                <option value="Tier 2: Senior Core Pure Maths">Tier 2: Senior Core Pure Maths (Gr 11/IGCSE)</option>
                <option value="Tier 3: Core FET Foundations">Tier 3: Core FET Foundations (Gr 10/8-9)</option>
                <option value="Tier 4: Applied / Contextual">Tier 4: Applied / Contextual (Math Lit)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>
              Showing {sortedAndFilteredDeadlines.length} of {tabDeadlines.length} tasks
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
              Sorted: {sortField.toUpperCase()} ({sortDirection.toUpperCase()})
            </span>
          </div>
        </div>
      </div>

      {/* 6. DEADLINES & ACTIONS MASTER TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold select-none">
              <tr>
                <th
                  onClick={() => handleSortToggle("term")}
                  className="p-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-16"
                >
                  <div className="flex items-center gap-1">
                    <span>Term</span>
                    {sortField === "term" && (
                      sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSortToggle("taskName")}
                  className="p-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Assessment Task / Activity</span>
                    {sortField === "taskName" && (
                      sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSortToggle("teacher")}
                  className="p-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Educator</span>
                    {sortField === "teacher" && (
                      sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSortToggle("difficulty")}
                  className="p-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Curriculum & Difficulty Tier</span>
                    {sortField === "difficulty" && (
                      sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-purple-600" /> : <ArrowDown className="w-3 h-3 text-purple-600" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSortToggle("testDate")}
                  className="p-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Scheduled Date</span>
                    {sortField === "testDate" && (
                      sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSortToggle("urgency")}
                  className="p-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Pre-Mod Deadline</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">(5 Days Prior)</span>
                    {sortField === "urgency" && (
                      sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-rose-600" /> : <ArrowDown className="w-3 h-3 text-rose-600" />
                    )}
                  </div>
                </th>

                <th className="p-3.5">Pre-Mod Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {sortedAndFilteredDeadlines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CalendarClock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-sm">No assessment tasks or activities found.</p>
                      <p className="text-xs text-slate-400">Try adjusting your filters or select a different academic term tab above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedAndFilteredDeadlines.map((task) => {
                  const daysToTest = calculateDaysRemaining(task.testDate);
                  const daysToPreMod = calculateDaysRemaining(task.preModDueDate);
                  const difficultyTier = getTaskDifficultyTier(task);

                  // Term Badge styling
                  const termBadgeStyle = {
                    1: "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700",
                    2: "bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700",
                    3: "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700",
                    4: "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700",
                  }[task.term || 1];

                  // Difficulty badge styles
                  const tierStyles = {
                    "Tier 1: Advanced / High Rigour":
                      "bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800",
                    "Tier 2: Senior Core Pure Maths":
                      "bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                    "Tier 3: Core FET Foundations":
                      "bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800",
                    "Tier 4: Applied / Contextual":
                      "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                  }[difficultyTier];

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Term Badge Column */}
                      <td className="p-3.5">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black border uppercase block text-center ${termBadgeStyle}`}>
                          T{task.term || 1}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 dark:text-white block">{task.taskName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{task.totalMarks} Marks</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">• {task.curriculum} ({task.grade})</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{task.teacherName}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{task.subject}</span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${tierStyles}`}>
                            {difficultyTier}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-medium text-slate-900 dark:text-white block">{task.testDate}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {daysToTest > 0
                            ? `in ${daysToTest} days`
                            : daysToTest === 0
                            ? "Today"
                            : `${Math.abs(daysToTest)} days ago`}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-900 dark:text-white block">{task.preModDueDate}</span>
                        <span
                          className={`text-[10px] font-bold ${
                            daysToPreMod < 0
                              ? "text-rose-600 dark:text-rose-400"
                              : daysToPreMod <= 3
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {daysToPreMod < 0
                            ? `${Math.abs(daysToPreMod)} days overdue!`
                            : daysToPreMod === 0
                            ? "Due Today!"
                            : `${daysToPreMod} days left`}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${calculateUrgency(task).color}`}>
                          {calculateUrgency(task).label}
                        </span>
                      </td>

                      <td className="p-3.5 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectForModeration(task)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Run Pre-Mod</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this assessment task?")) {
                              onDeleteDeadline(task.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-md cursor-pointer transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. SCHEDULE NEW ASSESSMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                Schedule New Assessment Task or Activity
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeadline} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Academic Term
                  </label>
                  <select
                    value={newTermSelect}
                    onChange={(e) => setNewTermSelect(parseInt(e.target.value, 10))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg font-semibold text-slate-900 dark:text-white"
                  >
                    <option value={1}>Term 1 (Jan - Mar)</option>
                    <option value={2}>Term 2 (Apr - Jun)</option>
                    <option value={3}>Term 3 (Jul - Sep)</option>
                    <option value={4}>Term 4 (Oct - Dec)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Educator Assigned
                  </label>
                  <select
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white font-medium"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.isMathsDept ? "Maths Dept" : "General Staff"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Assessment Title / Activity Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Control Test 2: Analytical Geometry"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Curriculum Framework
                  </label>
                  <select
                    value={newCurriculum}
                    onChange={(e) => setNewCurriculum(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="IEB">IEB (National Senior Certificate)</option>
                    <option value="CAPS">CAPS (National Curriculum)</option>
                    <option value="Cambridge">Cambridge International</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Grade & Section
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10A & 10B"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Scheduled Test Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTestDate}
                    onChange={(e) => setNewTestDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Total Marks Allocated
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={newTotalMarks}
                    onChange={(e) => setNewTotalMarks(parseInt(e.target.value, 10) || 50)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Subject Rigour & Difficulty Tier
                </label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as SubjectDifficultyTier)}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white font-medium"
                >
                  <option value="Tier 1: Advanced / High Rigour">Tier 1: Advanced / High Rigour (AP Maths / Grade 12)</option>
                  <option value="Tier 2: Senior Core Pure Maths">Tier 2: Senior Core Pure Maths (Grade 11 / Cambridge)</option>
                  <option value="Tier 3: Core FET Foundations">Tier 3: Core FET Foundations (Grade 10 / Grade 8-9)</option>
                  <option value="Tier 4: Applied / Contextual">Tier 4: Applied / Contextual (Maths Literacy / PAT)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
                <span className="font-bold block">Policy §7.1 Pre-Moderation Notice:</span>
                Pre-moderation deadline will be set automatically to 5 school days prior to the test date.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Confirm & Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
