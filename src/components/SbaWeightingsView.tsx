import React, { useState, useEffect, useMemo } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Download,
  Printer,
  Copy,
  Check,
  Info,
  Calendar,
  AlertCircle,
  Briefcase,
  Scale,
  FileSpreadsheet,
  Code,
  User,
  Plus,
} from "lucide-react";
import {
  OFFICIAL_SBA_REQUIREMENTS,
  OFFICIAL_ASSESSMENT_DOCUMENTS,
  HOD_GOVERNANCE_DOCUMENTS,
  SbaTaskRequirement,
  OfficialAssessmentDocument,
  HodGovernanceDocument,
} from "../data/sbaData";
import { exportPoaSummaryDocx } from "../utils/docxExport";
import { exportSbaMarksheetXlsx, exportPoaSummaryXlsx, SbaStudentRow, SbaSubjectTaskConfig } from "../utils/xlsxExport";

interface SbaWeightingsViewProps {
  currentTerm?: number;
}

// Initial mock student rosters per subject for the SBA Marksheet formula inspector
const INITIAL_STUDENT_ROSTERS: Record<string, SbaStudentRow[]> = {
  "Mathematics Grade 8": [
    { id: "1", studentId: "LRN-8001", studentName: "Bandile Zulu", taskMarks: { "sba-gr8-m-t1-1": 40, "sba-gr8-m-t1-2": 42, "sba-gr8-m-t2-3": 45, "sba-gr8-m-t2-4": 110 } },
    { id: "2", studentId: "LRN-8002", studentName: "Thandiwe Mokoena", taskMarks: { "sba-gr8-m-t1-1": 46, "sba-gr8-m-t1-2": 48, "sba-gr8-m-t2-3": 49, "sba-gr8-m-t2-4": 135 } },
    { id: "3", studentId: "LRN-8003", studentName: "Sipho Dlamini", taskMarks: { "sba-gr8-m-t1-1": 32, "sba-gr8-m-t1-2": 35, "sba-gr8-m-t2-3": 38, "sba-gr8-m-t2-4": 88 } },
  ],
  "Mathematics Grade 9": [
    { id: "1", studentId: "LRN-9001", studentName: "Lesedi Khumalo", taskMarks: { "sba-gr9-m-t1-1": 44, "sba-gr9-m-t1-2": 41, "sba-gr9-m-t2-3": 47, "sba-gr9-m-t2-4": 120 } },
    { id: "2", studentId: "LRN-9002", studentName: "Keanu Smith", taskMarks: { "sba-gr9-m-t1-1": 35, "sba-gr9-m-t1-2": 38, "sba-gr9-m-t2-3": 40, "sba-gr9-m-t2-4": 95 } },
    { id: "3", studentId: "LRN-9003", studentName: "Aarav Patel", taskMarks: { "sba-gr9-m-t1-1": 49, "sba-gr9-m-t1-2": 48, "sba-gr9-m-t2-3": 50, "sba-gr9-m-t2-4": 142 } },
  ],
  "Mathematics Grade 10": [
    { id: "1", studentId: "LRN-1001", studentName: "Ethan Ndlovu", taskMarks: { "sba-gr10-m-t1-1": 42, "sba-gr10-m-t1-2": 45, "sba-gr10-m-t2-1": 48, "sba-gr10-m-t2-2": 82 } },
    { id: "2", studentId: "LRN-1002", studentName: "Kgosi Khumalo", taskMarks: { "sba-gr10-m-t1-1": 38, "sba-gr10-m-t1-2": 40, "sba-gr10-m-t2-1": 42, "sba-gr10-m-t2-2": 70 } },
    { id: "3", studentId: "LRN-1003", studentName: "Amara Patel", taskMarks: { "sba-gr10-m-t1-1": 48, "sba-gr10-m-t1-2": 49, "sba-gr10-m-t2-1": 56, "sba-gr10-m-t2-2": 92 } },
    { id: "4", studentId: "LRN-1004", studentName: "Liam van der Merwe", taskMarks: { "sba-gr10-m-t1-1": 30, "sba-gr10-m-t1-2": 35, "sba-gr10-m-t2-1": 36, "sba-gr10-m-t2-2": 58 } },
    { id: "5", studentId: "LRN-1005", studentName: "Thabo Mokoena", taskMarks: { "sba-gr10-m-t1-1": 25, "sba-gr10-m-t1-2": 28, "sba-gr10-m-t2-1": 30, "sba-gr10-m-t2-2": 45 } },
    { id: "6", studentId: "LRN-1006", studentName: "Zola Dlamini", taskMarks: { "sba-gr10-m-t1-1": 45, "sba-gr10-m-t1-2": 46, "sba-gr10-m-t2-1": 52, "sba-gr10-m-t2-2": 88 } },
  ],
  "Mathematics Grade 12": [
    { id: "1", studentId: "LRN-1201", studentName: "Siyabonga Zulu", taskMarks: { "sba-gr12-m-t1-1": 85, "sba-gr12-m-t1-2": 44, "sba-gr12-m-t1-3": 125, "sba-gr12-m-t2-1": 88, "sba-gr12-m-t3-1": 132 } },
    { id: "2", studentId: "LRN-1202", studentName: "Chantal Naidoo", taskMarks: { "sba-gr12-m-t1-1": 72, "sba-gr12-m-t1-2": 38, "sba-gr12-m-t1-3": 108, "sba-gr12-m-t2-1": 75, "sba-gr12-m-t3-1": 115 } },
    { id: "3", studentId: "LRN-1203", studentName: "Kabelo Sithole", taskMarks: { "sba-gr12-m-t1-1": 92, "sba-gr12-m-t1-2": 48, "sba-gr12-m-t1-3": 140, "sba-gr12-m-t2-1": 95, "sba-gr12-m-t3-1": 142 } },
    { id: "4", studentId: "LRN-1204", studentName: "Jessica Botha", taskMarks: { "sba-gr12-m-t1-1": 55, "sba-gr12-m-t1-2": 28, "sba-gr12-m-t1-3": 82, "sba-gr12-m-t2-1": 60, "sba-gr12-m-t3-1": 90 } },
    { id: "5", studentId: "LRN-1205", studentName: "Bandile Moyo", taskMarks: { "sba-gr12-m-t1-1": 40, "sba-gr12-m-t1-2": 22, "sba-gr12-m-t1-3": 65, "sba-gr12-m-t2-1": 48, "sba-gr12-m-t3-1": 72 } },
  ],
  "Mathematical Literacy Grade 12": [
    { id: "1", studentId: "LRN-ML01", studentName: "Nomvula Khumalo", taskMarks: { "sba-gr12-ml-t1-1": 52, "sba-gr12-ml-t1-2": 48, "sba-gr12-ml-t1-3": 85, "sba-gr12-ml-t2-1": 88 } },
    { id: "2", studentId: "LRN-ML02", studentName: "Devan Pillay", taskMarks: { "sba-gr12-ml-t1-1": 45, "sba-gr12-ml-t1-2": 40, "sba-gr12-ml-t1-3": 72, "sba-gr12-ml-t2-1": 75 } },
    { id: "3", studentId: "LRN-ML03", studentName: "Tumi Maseko", taskMarks: { "sba-gr12-ml-t1-1": 58, "sba-gr12-ml-t1-2": 49, "sba-gr12-ml-t1-3": 92, "sba-gr12-ml-t2-1": 94 } },
  ],
  "Mathematical Literacy Grade 11": [
    { id: "1", studentId: "LRN-ML1101", studentName: "Kagiso Mokoena", taskMarks: { "sba-gr11-ml-t1-1": 42, "sba-gr11-ml-t1-2": 44, "sba-gr11-ml-t2-3": 47, "sba-gr11-ml-t2-4": 125 } },
    { id: "2", studentId: "LRN-ML1102", studentName: "Chloe van Zyl", taskMarks: { "sba-gr11-ml-t1-1": 38, "sba-gr11-ml-t1-2": 40, "sba-gr11-ml-t2-3": 42, "sba-gr11-ml-t2-4": 110 } },
  ],
  "Mathematical Literacy Grade 10": [
    { id: "1", studentId: "LRN-ML1001", studentName: "Sipho Mbele", taskMarks: { "sba-gr10-ml-t1-1": 40, "sba-gr10-ml-t1-2": 42, "sba-gr10-ml-t2-3": 45, "sba-gr10-ml-t2-4": 80 } },
    { id: "2", studentId: "LRN-ML1002", studentName: "Zola Khumalo", taskMarks: { "sba-gr10-ml-t1-1": 46, "sba-gr10-ml-t1-2": 48, "sba-gr10-ml-t2-3": 49, "sba-gr10-ml-t2-4": 92 } },
  ],
  "Mathematics Grade 11": [
    { id: "1", studentId: "LRN-1101", studentName: "Bongani Ndlovu", taskMarks: { "sba-gr11-m-t1-1": 42, "sba-gr11-m-t1-2": 52, "sba-gr11-m-t2-3": 45, "sba-gr11-m-t2-4": 160 } },
    { id: "2", studentId: "LRN-1102", studentName: "Anika Patel", taskMarks: { "sba-gr11-m-t1-1": 48, "sba-gr11-m-t1-2": 58, "sba-gr11-m-t2-3": 49, "sba-gr11-m-t2-4": 182 } },
  ]
};

export const SbaWeightingsView: React.FC<SbaWeightingsViewProps> = ({ currentTerm = 1 }) => {
  // Sub-tabs inside SBA portal
  const [subView, setSubView] = useState<
    "tasks" | "poa-summary" | "excel-marksheet" | "docs" | "hod-mandates" | "cognitive"
  >("tasks");

  // Selected subject for POA Summary and Excel Marksheet
  const [activeMarksheetSubject, setActiveMarksheetSubject] = useState<string>("Mathematics Grade 10");
  const [activeMarksheetGrade, setActiveMarksheetSubjectGrade] = useState<string>("Grade 10");

  // Toggle for showing live Excel formulas vs computed values in Marksheet inspector
  const [showFormulas, setShowFormulas] = useState<boolean>(false);

  // Student rosters state for Marksheet
  const [studentRosters, setStudentRosters] = useState(INITIAL_STUDENT_ROSTERS);

  // Filter states
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterTerm, setFilterTerm] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "outstanding">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Persistent completion state: map of taskId -> boolean
  const [completionMap, setCompletionMap] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem("eaglehouse_sba_completion_status");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    // Default initial mock state: Term 1 Task 1 & 2 marked completed, others outstanding
    return {
      "sba-gr12-m-t1-1": true,
      "sba-gr10-m-t1-1": true,
      "sba-gr12-ml-t1-1": true,
      "sba-camb-igcse-t1": true,
    };
  });

  // Copied link toast notification
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("eaglehouse_sba_completion_status", JSON.stringify(completionMap));
    } catch (e) {
      console.error(e);
    }
  }, [completionMap]);

  // Toggle completion
  const handleToggleCompletion = (id: string) => {
    setCompletionMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Copy citation or link
  const handleCopyCitation = (doc: OfficialAssessmentDocument | HodGovernanceDocument) => {
    const textToCopy = `${doc.title} (${doc.officialUrl})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedDocId(doc.id);
    setTimeout(() => setCopiedDocId(null), 2500);
  };

  // Filtered SBA Tasks
  const filteredTasks = useMemo(() => {
    return OFFICIAL_SBA_REQUIREMENTS.filter((task) => {
      if (filterSubject !== "all" && task.subject !== filterSubject) return false;
      if (filterGrade !== "all" && task.grade !== filterGrade) return false;
      if (filterTerm !== "all" && task.term.toString() !== filterTerm) return false;

      const isCompleted = !!completionMap[task.id];
      if (filterStatus === "completed" && !isCompleted) return false;
      if (filterStatus === "outstanding" && isCompleted) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          task.taskTitle.toLowerCase().includes(q) ||
          task.subject.toLowerCase().includes(q) ||
          task.grade.toLowerCase().includes(q) ||
          task.policyReference.toLowerCase().includes(q) ||
          task.curriculumFocusAreas.some((f) => f.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [filterSubject, filterGrade, filterTerm, filterStatus, searchQuery, completionMap]);

  // Metrics computation
  const totalTasks = OFFICIAL_SBA_REQUIREMENTS.length;
  const completedCount = OFFICIAL_SBA_REQUIREMENTS.filter((t) => completionMap[t.id]).length;
  const outstandingCount = totalTasks - completedCount;
  const percentComplete = Math.round((completedCount / totalTasks) * 100);

  // Grade 12 completion
  const gr12Tasks = OFFICIAL_SBA_REQUIREMENTS.filter((t) => t.grade === "Grade 12");
  const gr12Completed = gr12Tasks.filter((t) => completionMap[t.id]).length;
  const gr12Percent = Math.round((gr12Completed / gr12Tasks.length) * 100);

  // Print schedule
  const handlePrintSchedule = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 uppercase tracking-wider">
              Official SAGS & CAPS POA
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Verified Compliance
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <Award className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            Annual SBA Requirements & Official SAGS Weightings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Prescribed School-Based Assessment (SBA) portfolios, internal weightings, cognitive distributions, and governance documentation verified against DBE CAPS & IEB SAGS regulations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintSchedule}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Master Schedule</span>
          </button>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SBA Tasks */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Prescribed Tasks</span>
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalTasks}</span>
            <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold">Grades 10 - 12 + Cambridge</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "100%" }}></div>
          </div>
        </div>

        {/* Completed SBAs */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Completed SBA Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">{percentComplete}% of Year Target</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${percentComplete}%` }}></div>
          </div>
        </div>

        {/* Outstanding SBAs */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Outstanding / In Progress</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{outstandingCount}</span>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">{100 - percentComplete}% Remaining</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${100 - percentComplete}%` }}></div>
          </div>
        </div>

        {/* Grade 12 Matric Readiness */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-700 dark:text-purple-400">Grade 12 NSC Portfolio</span>
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{gr12Completed} / {gr12Tasks.length}</span>
            <span className="text-xs text-purple-700 dark:text-purple-400 font-semibold">{gr12Percent}% 25% NSC Quota</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-purple-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${gr12Percent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubView("tasks")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              subView === "tasks"
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Annual SBA Weightings & Status Tracker ({filteredTasks.length})</span>
          </button>

          <button
            onClick={() => setSubView("poa-summary")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              subView === "poa-summary"
                ? "bg-emerald-700 text-white shadow-xs font-extrabold"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>POA & Assessment Summary Format</span>
          </button>

          <button
            onClick={() => setSubView("excel-marksheet")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              subView === "excel-marksheet"
                ? "bg-purple-700 text-white shadow-xs font-extrabold"
                : "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
            <span>Print SBA Excel Marksheet (With Formulas)</span>
          </button>

          <button
            onClick={() => setSubView("docs")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              subView === "docs"
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official Assessment Documents ({OFFICIAL_ASSESSMENT_DOCUMENTS.length})</span>
          </button>

          <button
            onClick={() => setSubView("hod-mandates")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              subView === "hod-mandates"
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>HOD Governance Documents ({HOD_GOVERNANCE_DOCUMENTS.length})</span>
          </button>

          <button
            onClick={() => setSubView("cognitive")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              subView === "cognitive"
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Cognitive Demands (Bloom / IEB)</span>
          </button>
        </div>

        {subView === "tasks" && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Quick Completion:</span>
            <button
              onClick={() => {
                const updated: Record<string, boolean> = { ...completionMap };
                OFFICIAL_SBA_REQUIREMENTS.filter((t) => t.term === 1).forEach((t) => {
                  updated[t.id] = true;
                });
                setCompletionMap(updated);
              }}
              className="text-[11px] px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold cursor-pointer hover:bg-emerald-100"
            >
              Mark Term 1 Complete
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: ANNUAL SBA TASKS & STATUS TRACKER */}
      {subView === "tasks" && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search SBA task title, topic, or policy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-64 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />

                {/* Filter by Subject */}
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Subjects</option>
                  <option value="Mathematics">Mathematics (FET)</option>
                  <option value="Mathematical Literacy">Mathematical Literacy</option>
                  <option value="Cambridge Mathematics 0580">Cambridge Mathematics 0580</option>
                </select>

                {/* Filter by Grade */}
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Grades</option>
                  <option value="Grade 12">Grade 12 (Matric NSC)</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 10-11 (IGCSE)">Cambridge IGCSE</option>
                </select>

                {/* Filter by Term */}
                <select
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Terms (1 - 4)</option>
                  <option value="1">Term 1</option>
                  <option value="2">Term 2</option>
                  <option value="3">Term 3</option>
                  <option value="4">Term 4</option>
                </select>

                {/* Filter by Completion Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  <option value="all">All Statuses (Completed & Outstanding)</option>
                  <option value="completed">Completed Only</option>
                  <option value="outstanding">Outstanding Only</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Displaying {filteredTasks.length} official assessment items
            </div>
          </div>

          {/* Master Table of SBAs */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Task Description & Strand</th>
                    <th className="p-3.5">Subject & Grade</th>
                    <th className="p-3.5">Term</th>
                    <th className="p-3.5">Marks & Duration</th>
                    <th className="p-3.5">
                      <div className="flex flex-col">
                        <span>SBA Weight</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">Internal Portfolio</span>
                      </div>
                    </th>
                    <th className="p-3.5">
                      <div className="flex flex-col">
                        <span>Promotion Weight</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">Final Year Mark</span>
                      </div>
                    </th>
                    <th className="p-3.5">Cognitive Distribution</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredTasks.map((task) => {
                    const isDone = !!completionMap[task.id];

                    return (
                      <tr
                        key={task.id}
                        className={`transition-colors ${
                          isDone
                            ? "bg-emerald-50/20 dark:bg-emerald-950/10 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
                            : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        {/* Status Toggle Cell */}
                        <td className="p-3.5">
                          <button
                            onClick={() => handleToggleCompletion(task.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isDone
                                ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-xs"
                                : "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                            }`}
                          >
                            {isDone ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Completed</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span>Outstanding</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Task Title and Focus Areas */}
                        <td className="p-3.5 max-w-sm">
                          <span className="font-bold text-slate-900 dark:text-white block text-sm">
                            {task.taskTitle}
                          </span>
                          <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold block mt-0.5">
                            {task.policyReference}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {task.curriculumFocusAreas.map((topic, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Subject & Grade */}
                        <td className="p-3.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {task.subject}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {task.grade}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              {task.curriculum}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                            {task.difficultyCategory}
                          </span>
                        </td>

                        {/* Term */}
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            Term {task.term}
                          </span>
                        </td>

                        {/* Marks & Duration */}
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 dark:text-white block text-sm">
                            {task.totalMarks} Marks
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            {task.durationMinutes} Minutes
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {task.taskType}
                          </span>
                        </td>

                        {/* Internal SBA Weight */}
                        <td className="p-3.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-extrabold text-blue-700 dark:text-blue-400">
                              {task.internalSbaWeightPercent}%
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">of SBA</span>
                          </div>
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1 mt-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full"
                              style={{ width: `${Math.min(100, task.internalSbaWeightPercent * 2.5)}%` }}
                            ></div>
                          </div>
                        </td>

                        {/* Annual Promotion Weight */}
                        <td className="p-3.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                              {task.annualPromotionWeightPercent}%
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">final mark</span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                            {task.grade === "Grade 12" ? "NSC (25% SBA Pool)" : "Promotion Mark"}
                          </span>
                        </td>

                        {/* Cognitive Distribution Breakdown */}
                        <td className="p-3.5">
                          <div className="space-y-1 w-36">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-500 dark:text-slate-400">K / RP:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {task.cognitiveWeighting.knowledge}% / {task.cognitiveWeighting.routineProcedures}%
                              </span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-500 dark:text-slate-400">CP / PS:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {task.cognitiveWeighting.complexProcedures}% / {task.cognitiveWeighting.problemSolving}%
                              </span>
                            </div>
                            {/* Visual stacked bar */}
                            <div className="w-full flex h-1.5 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${task.cognitiveWeighting.knowledge}%` }}
                                className="bg-sky-400"
                                title={`Knowledge: ${task.cognitiveWeighting.knowledge}%`}
                              ></div>
                              <div
                                style={{ width: `${task.cognitiveWeighting.routineProcedures}%` }}
                                className="bg-blue-500"
                                title={`Routine Procedures: ${task.cognitiveWeighting.routineProcedures}%`}
                              ></div>
                              <div
                                style={{ width: `${task.cognitiveWeighting.complexProcedures}%` }}
                                className="bg-purple-500"
                                title={`Complex Procedures: ${task.cognitiveWeighting.complexProcedures}%`}
                              ></div>
                              <div
                                style={{ width: `${task.cognitiveWeighting.problemSolving}%` }}
                                className="bg-rose-500"
                                title={`Problem Solving: ${task.cognitiveWeighting.problemSolving}%`}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Quick Toggle Action */}
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleToggleCompletion(task.id)}
                            className="text-xs px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer transition-colors"
                          >
                            {isDone ? "Mark Pending" : "Mark Done"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: OFFICIAL ASSESSMENT & SAGS DOCUMENTS WITH VERIFIED LINKS */}
      {subView === "docs" && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Verified Regulatory Assessment Reference Library
            </h3>
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
              Every SBA portfolio task and weighting displayed in this portal is cross-verified against official published gazettes, SAGS documents, circulars, and Umalusi directives. All primary source documents are linked below for institutional auditing and moderation compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFICIAL_ASSESSMENT_DOCUMENTS.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      {doc.authority}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {doc.referenceNumber}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                    {doc.description}
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mb-4 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Key Prescribed Directives:
                    </span>
                    <ul className="space-y-1">
                      {doc.keyDirectives.map((dir, i) => (
                        <li key={i} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{dir}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Official Source
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCitation(doc)}
                      className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy citation and link"
                    >
                      {copiedDocId === doc.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Citation</span>
                        </>
                      )}
                    </button>

                    <a
                      href={doc.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                    >
                      <span>Open Document</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: HOD STATUTORY GOVERNANCE & MANDATES */}
      {subView === "hod-mandates" && (
        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
            <h3 className="text-sm font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Statutory Governance & Regulatory Directives per the Role of HOD
            </h3>
            <p className="text-xs text-purple-800 dark:text-purple-200 mt-1">
              Statutory frameworks governing the professional duties, curriculum delivery, moderation audits, quality management (QMS), and line management obligations of a Departmental Head (HOD) in South Africa.
            </p>
          </div>

          <div className="space-y-4">
            {HOD_GOVERNANCE_DOCUMENTS.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                      {doc.statutoryRole}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {doc.authority}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {doc.gazetteOrAct}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  {doc.hodMandateSummary}
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-2">
                    Statutory Clauses & HOD Operating Mandates:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {doc.statutoryClauses.map((clause, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>{clause}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Binding on Eagle House Department Heads & Educators</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCitation(doc)}
                      className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedDocId === doc.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Citation</span>
                        </>
                      )}
                    </button>

                    <a
                      href={doc.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                    >
                      <span>Access Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: PROGRAMME OF ASSESSMENT (POA) & ASSESSMENT SUMMARY OUTPUT FORMAT */}
      {subView === "poa-summary" && (() => {
        const isMathLit = activeMarksheetSubject.includes("Mathematical Literacy");
        const poaTasks = OFFICIAL_SBA_REQUIREMENTS.filter(
          (t) => t.grade === activeMarksheetGrade && (isMathLit ? t.subject === "Mathematical Literacy" : t.subject === "Mathematics")
        );

        const poaData = {
          subject: isMathLit ? "Mathematical Literacy" : "Mathematics",
          grade: activeMarksheetGrade,
          framework: activeMarksheetSubject.includes("IGCSE") ? "Cambridge" : "IEB / CAPS",
          examiner: activeMarksheetGrade.includes("12") ? "Reggie & Shingi" : "Shingi",
          moderator: "HOD Mpofu",
          annualSbaWeightPercent: activeMarksheetGrade.includes("12") ? 25 : 40,
          annualExamWeightPercent: activeMarksheetGrade.includes("12") ? 75 : 60,
          tasks: poaTasks.map((t) => ({
            term: t.term,
            taskTitle: t.taskTitle,
            taskType: t.taskType,
            durationMinutes: t.durationMinutes,
            totalMarks: t.totalMarks,
            internalSbaWeightPercent: t.internalSbaWeightPercent,
            annualPromotionWeightPercent: t.annualPromotionWeightPercent,
            cognitiveWeighting: t.cognitiveWeighting,
            policyReference: t.policyReference,
          })),
        };

        return (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <span>Official Programme of Assessment (POA) & Assessment Summary</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standardized output format verified against Eagle House School Assessment Policy & IEB/CAPS regulations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={activeMarksheetSubject}
                  onChange={(e) => {
                    const val = e.target.value;
                    setActiveMarksheetSubject(val);
                    if (val.includes("8")) setActiveMarksheetSubjectGrade("Grade 8");
                    else if (val.includes("9")) setActiveMarksheetSubjectGrade("Grade 9");
                    else if (val.includes("10")) setActiveMarksheetSubjectGrade("Grade 10");
                    else if (val.includes("11")) setActiveMarksheetSubjectGrade("Grade 11");
                    else setActiveMarksheetSubjectGrade("Grade 12");
                  }}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-3 font-semibold text-slate-800"
                >
                  <option value="Mathematics Grade 8">Grade 8 Mathematics</option>
                  <option value="Mathematics Grade 9">Grade 9 Mathematics</option>
                  <option value="Mathematics Grade 10">Grade 10 Mathematics</option>
                  <option value="Mathematical Literacy Grade 10">Grade 10 Mathematical Literacy</option>
                  <option value="Mathematics Grade 11">Grade 11 Mathematics</option>
                  <option value="Mathematical Literacy Grade 11">Grade 11 Mathematical Literacy</option>
                  <option value="Mathematics Grade 12">Grade 12 Core Mathematics NSC</option>
                  <option value="Mathematical Literacy Grade 12">Grade 12 Mathematical Literacy</option>
                </select>

                <button
                  onClick={() => exportPoaSummaryDocx(poaData)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Word (.docx)</span>
                </button>

                <button
                  onClick={() => exportPoaSummaryXlsx(poaData)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Official POA</span>
                </button>
              </div>
            </div>

            {/* Official Memo Format Container */}
            <div className="border-2 border-slate-800 p-8 rounded-sm bg-white space-y-6 text-xs text-slate-900 font-sans max-w-4xl mx-auto shadow-sm">
              {/* Header Letterhead */}
              <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-wider uppercase font-serif">
                  EAGLE HOUSE SCHOOL
                </h2>
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                  praxis borderless learning • department of mathematical sciences
                </p>
                <h3 className="text-sm font-black text-blue-950 uppercase tracking-wider underline mt-2">
                  PROGRAMME OF ASSESSMENT (POA) & SUBJECT ASSESSMENT SUMMARY — 2026
                </h3>
              </div>

              {/* Metadata Table */}
              <div className="border border-slate-400 rounded-xs overflow-hidden text-xs">
                <div className="grid grid-cols-2 divide-x divide-slate-400 border-b border-slate-400 bg-slate-100 font-bold p-2 text-slate-800">
                  <div>SUBJECT & STREAM: {poaData.subject} ({poaData.framework})</div>
                  <div>GRADE / CLASS: {poaData.grade}</div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-400 border-b border-slate-400 p-2 text-slate-800">
                  <div>SUBJECT EDUCATOR: {poaData.examiner}</div>
                  <div>HOD MODERATOR: {poaData.moderator}</div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-400 p-2 bg-slate-50 font-semibold text-slate-900">
                  <div className="text-emerald-800">ANNUAL SBA WEIGHTING: {poaData.annualSbaWeightPercent}% Final Mark</div>
                  <div className="text-amber-800">FINAL EXAMINATION WEIGHTING: {poaData.annualExamWeightPercent}% Final Mark</div>
                </div>
              </div>

              {/* POA Tasks Schedule Table */}
              <div className="border border-slate-400 rounded-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold">
                      <th className="p-2.5 w-12 text-center border-r border-slate-700">Term</th>
                      <th className="p-2.5 border-r border-slate-700">Formal Assessment Task</th>
                      <th className="p-2.5 border-r border-slate-700">Type & Marks</th>
                      <th className="p-2.5 text-center border-r border-slate-700">SBA Weight</th>
                      <th className="p-2.5 text-center border-r border-slate-700">Promotion %</th>
                      <th className="p-2.5 text-center">Cognitive Ratio (K/RP/CP/PS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {poaData.tasks.map((t, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="p-2.5 font-bold text-center border-r border-slate-300">Term {t.term}</td>
                        <td className="p-2.5 border-r border-slate-300">
                          <span className="font-bold text-slate-900 block">{t.taskTitle}</span>
                          <span className="text-[10px] text-blue-700 font-mono block">{t.policyReference}</span>
                        </td>
                        <td className="p-2.5 border-r border-slate-300">
                          <span className="font-semibold block">{t.taskType}</span>
                          <span className="text-[10px] text-slate-500">{t.totalMarks} Marks ({t.durationMinutes} mins)</span>
                        </td>
                        <td className="p-2.5 text-center font-bold text-emerald-700 border-r border-slate-300">
                          {t.internalSbaWeightPercent}%
                        </td>
                        <td className="p-2.5 text-center font-bold text-amber-700 border-r border-slate-300">
                          {t.annualPromotionWeightPercent}%
                        </td>
                        <td className="p-2.5 text-center font-mono text-[11px] text-slate-700">
                          {t.cognitiveWeighting.knowledge}% / {t.cognitiveWeighting.routineProcedures}% / {t.cognitiveWeighting.complexProcedures}% / {t.cognitiveWeighting.problemSolving}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Policy & Governance Notice */}
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xs text-[11px] space-y-1">
                <span className="font-bold text-slate-900 block uppercase">
                  Assessment Policy & Moderation Compliance Directives:
                </span>
                <p className="text-slate-700">
                  1. <strong>Pre-Assessment Moderation (§7.1):</strong> Submitted 5 school days prior with memo & cognitive demand distribution.<br />
                  2. <strong>Post-Assessment Moderation (§7.2):</strong> Minimum 10% stratified sample (Top, Average, Weak) audited in purple pen.<br />
                  3. All tasks aligned to DBE CAPS ATPs and IEB Subject Assessment Guidelines (SAGs).
                </p>
              </div>

              {/* Formal Sign-Off Table */}
              <div className="border border-slate-400 rounded-xs overflow-hidden pt-2">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="p-2 font-bold w-1/2">Subject Educator Signature</th>
                      <th className="p-2 font-bold w-1/2">HOD Departmental Moderator Sign-off</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 font-mono text-slate-700">
                        Signature: _______________________<br />
                        Name: {poaData.examiner}<br />
                        Date: {new Date().toISOString().split("T")[0]}
                      </td>
                      <td className="p-3 font-mono text-blue-900 font-bold">
                        Signature: [Approved: HOD Mpofu]<br />
                        Name: {poaData.moderator}<br />
                        Date: {new Date().toISOString().split("T")[0]}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* VIEW 6: PRINT SBA EXCEL MARKSHEET WITH FORMULAS AND WEIGHTINGS PER SUBJECT */}
      {subView === "excel-marksheet" && (() => {
        const isMathLit = activeMarksheetSubject.includes("Mathematical Literacy");
        const subjectTasks = OFFICIAL_SBA_REQUIREMENTS.filter(
          (t) => t.grade === activeMarksheetGrade && (isMathLit ? t.subject === "Mathematical Literacy" : t.subject === "Mathematics")
        );

        const currentRoster = studentRosters[activeMarksheetSubject] || studentRosters["Mathematics Grade 10"] || [];

        const taskConfigs: SbaSubjectTaskConfig[] = subjectTasks.map((t) => ({
          id: t.id,
          taskTitle: t.taskTitle,
          totalMarks: t.totalMarks,
          weightPercent: t.internalSbaWeightPercent,
        }));

        // Handle Inline Mark Editing
        const handleMarkChange = (studentId: string, taskId: string, val: number) => {
          setStudentRosters((prev) => {
            const currentList = prev[activeMarksheetSubject] || prev["Mathematics Grade 10"] || [];
            const updatedList = currentList.map((s) => {
              if (s.studentId === studentId) {
                return {
                  ...s,
                  taskMarks: {
                    ...s.taskMarks,
                    [taskId]: Math.max(0, val),
                  },
                };
              }
              return s;
            });
            return {
              ...prev,
              [activeMarksheetSubject]: updatedList,
            };
          });
        };

        // Handle Add New Student
        const handleAddStudent = () => {
          const newCode = `LRN-${Math.floor(1000 + Math.random() * 9000)}`;
          const name = prompt("Enter Student Full Name:", "New Learner");
          if (!name) return;

          const defaultMarks: Record<string, number> = {};
          taskConfigs.forEach((t) => {
            defaultMarks[t.id] = Math.floor(t.totalMarks * 0.7);
          });

          const newStudent: SbaStudentRow = {
            id: String(Date.now()),
            studentId: newCode,
            studentName: name,
            taskMarks: defaultMarks,
          };

          setStudentRosters((prev) => ({
            ...prev,
            [activeMarksheetSubject]: [...(prev[activeMarksheetSubject] || []), newStudent],
          }));
        };

        return (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            {/* Header & Formula View Switcher Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-purple-950 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-purple-700" />
                  <span>SBA Excel Marksheet & Live Formula Inspector</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  View, edit, print, and export subject SBA marksheets populated with true Excel formulas as per CAPS/IEB weightings.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Subject Selector */}
                <select
                  value={activeMarksheetSubject}
                  onChange={(e) => {
                    const val = e.target.value;
                    setActiveMarksheetSubject(val);
                    if (val.includes("8")) setActiveMarksheetSubjectGrade("Grade 8");
                    else if (val.includes("9")) setActiveMarksheetSubjectGrade("Grade 9");
                    else if (val.includes("10")) setActiveMarksheetSubjectGrade("Grade 10");
                    else if (val.includes("11")) setActiveMarksheetSubjectGrade("Grade 11");
                    else setActiveMarksheetSubjectGrade("Grade 12");
                  }}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-3 font-bold text-slate-900"
                >
                  <option value="Mathematics Grade 8">Grade 8 Mathematics</option>
                  <option value="Mathematics Grade 9">Grade 9 Mathematics</option>
                  <option value="Mathematics Grade 10">Grade 10 Mathematics</option>
                  <option value="Mathematical Literacy Grade 10">Grade 10 Mathematical Literacy</option>
                  <option value="Mathematics Grade 11">Grade 11 Mathematics</option>
                  <option value="Mathematical Literacy Grade 11">Grade 11 Mathematical Literacy</option>
                  <option value="Mathematics Grade 12">Grade 12 Core Mathematics NSC</option>
                  <option value="Mathematical Literacy Grade 12">Grade 12 Mathematical Literacy</option>
                </select>

                {/* Show Formulas Toggle Button */}
                <button
                  onClick={() => setShowFormulas(!showFormulas)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    showFormulas
                      ? "bg-purple-800 text-white shadow-xs ring-2 ring-purple-400"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                  }`}
                  title="Toggle between calculated values and Excel formula strings"
                >
                  <Code className="w-3.5 h-3.5 text-amber-300" />
                  <span>{showFormulas ? "fx Formulas Mode: ON" : "fx Show Excel Formulas"}</span>
                </button>

                <button
                  onClick={handleAddStudent}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 border border-slate-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Learner</span>
                </button>

                <button
                  onClick={() =>
                    exportSbaMarksheetXlsx(
                      activeMarksheetSubject,
                      activeMarksheetGrade,
                      "IEB / CAPS",
                      "Shingi & Reggie",
                      taskConfigs,
                      currentRoster
                    )
                  }
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
                  title="Export workbook with native Excel formulas"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Excel (.xlsx)</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Marksheet</span>
                </button>
              </div>
            </div>

            {/* Subject Weighting Formula Explanation Card */}
            <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-950 flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-700" />
                  Subject Weighting Scheme & Excel Formulas ({activeMarksheetSubject})
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-mono px-2 py-0.5 rounded font-bold">
                  SBA Contribution Pool: 100%
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-slate-700">
                {taskConfigs.map((t, idx) => (
                  <div key={idx} className="bg-white p-2 rounded border border-purple-100">
                    <span className="font-bold block text-purple-900">{t.taskTitle}</span>
                    <span className="text-slate-500">Max = {t.totalMarks} Marks | Weight = {t.weightPercent}%</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-mono text-purple-900 bg-white p-2 rounded border border-purple-200 mt-1">
                <strong>SBA Formula:</strong> =ROUND( {taskConfigs.map((t, i) => `(Col_${String.fromCharCode(67+i)} / ${t.totalMarks}) * ${t.weightPercent}`).join(" + ")}, 1 )
              </p>
            </div>

            {/* Interactive Student Marksheet Table */}
            <div className="border border-slate-300 rounded-xl overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                    <th className="p-3 w-28">Student ID</th>
                    <th className="p-3 w-48">Student Name</th>
                    {taskConfigs.map((t, idx) => (
                      <th key={t.id} className="p-3 text-center border-l border-slate-800 min-w-[120px]">
                        <div className="font-bold">{t.taskTitle}</div>
                        <div className="text-[10px] text-purple-300 font-mono">Max {t.totalMarks} | {t.weightPercent}%</div>
                      </th>
                    ))}
                    <th className="p-3 text-center border-l border-slate-800 bg-slate-800 text-amber-300 min-w-[110px]">
                      Total Raw Marks
                    </th>
                    <th className="p-3 text-center border-l border-slate-800 bg-emerald-950 text-emerald-300 min-w-[160px]">
                      SBA Weighted %
                    </th>
                    <th className="p-3 text-center border-l border-slate-800 bg-purple-950 text-purple-200 min-w-[180px]">
                      Achievement Level
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {currentRoster.map((student, sIdx) => {
                    const rowNum = 7 + sIdx; // Excel row reference
                    const firstTaskColLetter = "C";
                    const lastTaskColLetter = String.fromCharCode(67 + taskConfigs.length - 1);
                    const sbaWeightedColLetter = String.fromCharCode(67 + taskConfigs.length + 1);

                    // Calculations
                    let rawSum = 0;
                    let weightedTotal = 0;
                    taskConfigs.forEach((t) => {
                      const achieved = student.taskMarks[t.id] || 0;
                      rawSum += achieved;
                      weightedTotal += (achieved / t.totalMarks) * t.weightPercent;
                    });
                    const finalSbaPct = Math.round(weightedTotal * 10) / 10;

                    // Achievement Level Calculation
                    let levelStr = "Level 1 (Not Achieved)";
                    if (finalSbaPct >= 80) levelStr = "Level 7 (Outstanding)";
                    else if (finalSbaPct >= 70) levelStr = "Level 6 (Meritorious)";
                    else if (finalSbaPct >= 60) levelStr = "Level 5 (Substantial)";
                    else if (finalSbaPct >= 50) levelStr = "Level 4 (Moderate)";
                    else if (finalSbaPct >= 40) levelStr = "Level 3 (Adequate)";
                    else if (finalSbaPct >= 30) levelStr = "Level 2 (Elementary)";

                    // Formula Strings for fx mode
                    const excelSumFormula = `=SUM(${firstTaskColLetter}${rowNum}:${lastTaskColLetter}${rowNum})`;
                    const weightedFormulaParts = taskConfigs.map((t, i) => `(${String.fromCharCode(67 + i)}${rowNum}/${t.totalMarks})*${t.weightPercent}`);
                    const excelSbaFormula = `=ROUND(${weightedFormulaParts.join("+")}, 1)`;
                    const excelLevelFormula = `=IF(${sbaWeightedColLetter}${rowNum}>=80, "L7", IF(${sbaWeightedColLetter}${rowNum}>=70, "L6", IF(${sbaWeightedColLetter}${rowNum}>=60, "L5", IF(${sbaWeightedColLetter}${rowNum}>=50, "L4", "L1-3"))))`;

                    return (
                      <tr key={student.id} className="hover:bg-purple-50/20 transition-colors">
                        <td className="p-2.5 font-mono text-slate-600 font-bold bg-slate-50">{student.studentId}</td>
                        <td className="p-2.5 font-bold text-slate-900">{student.studentName}</td>

                        {/* Raw Task Score Inputs */}
                        {taskConfigs.map((t) => (
                          <td key={t.id} className="p-2 text-center border-l border-slate-200">
                            <input
                              type="number"
                              min={0}
                              max={t.totalMarks}
                              value={student.taskMarks[t.id] ?? 0}
                              onChange={(e) => handleMarkChange(student.studentId, t.id, Number(e.target.value))}
                              className="w-16 px-1.5 py-1 text-center font-bold text-xs rounded border border-slate-300 focus:ring-1 focus:ring-purple-600 bg-white"
                            />
                            <span className="text-[10px] text-slate-400 block mt-0.5">/ {t.totalMarks}</span>
                          </td>
                        ))}

                        {/* Raw Sum Cell */}
                        <td className="p-2.5 text-center font-bold border-l border-slate-200 bg-amber-50/50 text-slate-900">
                          {showFormulas ? (
                            <span className="font-mono text-[11px] text-amber-900 bg-amber-100 px-1 py-0.5 rounded">{excelSumFormula}</span>
                          ) : (
                            <span>{rawSum} Marks</span>
                          )}
                        </td>

                        {/* SBA Weighted % Cell */}
                        <td className="p-2.5 text-center font-extrabold border-l border-slate-200 bg-emerald-50/60 text-emerald-900">
                          {showFormulas ? (
                            <span className="font-mono text-[10px] text-emerald-950 bg-emerald-100 px-1 py-0.5 rounded break-all">{excelSbaFormula}</span>
                          ) : (
                            <span className="text-sm">{finalSbaPct}%</span>
                          )}
                        </td>

                        {/* Achievement Level Cell */}
                        <td className="p-2.5 text-center font-bold border-l border-slate-200 bg-purple-50/50 text-purple-900">
                          {showFormulas ? (
                            <span className="font-mono text-[10px] text-purple-950 bg-purple-100 px-1 py-0.5 rounded">{excelLevelFormula}</span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[11px] ${
                              finalSbaPct >= 70 ? "bg-emerald-100 text-emerald-800" : finalSbaPct >= 50 ? "bg-blue-100 text-blue-800" : "bg-rose-100 text-rose-800"
                            }`}>
                              {levelStr}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
      {subView === "cognitive" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              Official Cognitive Demand Weightings Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Required taxonomic balance for all internal SBA controlled tests, examinations, and assignments per IEB SAGS and DBE CAPS specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-sky-50 dark:bg-sky-950/40 p-4 rounded-xl border border-sky-200 dark:border-sky-800">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 uppercase">
                Cognitive Level 1
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">Knowledge (Recall)</h4>
              <span className="text-2xl font-extrabold text-sky-700 dark:text-sky-300 block my-1">
                20% <span className="text-xs font-normal text-slate-500">(±3%)</span>
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Straight recall of definitions, formulae, theorems, simple algebraic expansions, direct reading of values from graphs.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 uppercase">
                Cognitive Level 2
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">Routine Procedures</h4>
              <span className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 block my-1">
                30% - 35% <span className="text-xs font-normal text-slate-500">(±3%)</span>
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Well-practised algorithms, solving standard quadratic equations, factorising trinomials, sketching standard parabolas, basic trigonometric reductions.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 uppercase">
                Cognitive Level 3
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">Complex Procedures</h4>
              <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 block my-1">
                30% - 35% <span className="text-xs font-normal text-slate-500">(±3%)</span>
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Multi-step questions with no obvious single starting point, non-standard quadratic word problems, geometry proofs requiring auxiliary construction, calculus optimization.
              </p>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-xl border border-rose-200 dark:border-rose-800">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 uppercase">
                Cognitive Level 4
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">Problem Solving & Reasoning</h4>
              <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 block my-1">
                15% <span className="text-xs font-normal text-slate-500">(±3%)</span>
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Higher-order unseen problems, mathematical modelling, generalization of unfamiliar number patterns, justifying mathematical conjectures.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
