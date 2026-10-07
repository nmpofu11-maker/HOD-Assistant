import React, { useState } from "react";
import {
  Users2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Calendar,
  Layers,
  Save,
  Download,
  Printer,
  CalendarCheck2,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Mail,
  UserCheck,
  UserX,
  GraduationCap,
  Archive,
} from "lucide-react";
import {
  DepartmentConfigState,
  DepartmentEducator,
  EducatorAllocation,
  AcademicYearConfig,
  CurriculumType,
  PeerModerationScheduleEntry,
} from "../types";
import { exportStaffDirectoryXlsx } from "../utils/xlsxExport";
import { printTeacherAllocation } from "../utils/printExports";
import { PeerModerationScheduleView } from "./PeerModerationScheduleView";

interface DepartmentSetupViewProps {
  config: DepartmentConfigState;
  onSaveConfig: (newConfig: DepartmentConfigState) => Promise<void>;
  onSelectTeacherForDeadlines?: (teacherName: string) => void;
  peerModerationSchedule: PeerModerationScheduleEntry[];
  onSavePeerModerationSchedule: (schedule: PeerModerationScheduleEntry[]) => Promise<void>;
  currentTerm: number;
}

export const DepartmentSetupView: React.FC<DepartmentSetupViewProps> = ({
  config,
  onSaveConfig,
  onSelectTeacherForDeadlines,
  peerModerationSchedule,
  onSavePeerModerationSchedule,
  currentTerm,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(config.currentAcademicYear);
  const [filterDepartment, setFilterDepartment] = useState<"maths" | "all">("maths");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Modal states
  const [setupSection, setSetupSection] = useState<"allocations" | "peer-moderation">("allocations");

  const [isEducatorModalOpen, setIsEducatorModalOpen] = useState(false);
  const [editingEducator, setEditingEducator] = useState<DepartmentEducator | null>(null);
  const [educatorForm, setEducatorForm] = useState<{
    name: string;
    role: string;
    email: string;
    isMathsDept: boolean;
    status: "active" | "inactive";
    notes: string;
  }>({
    name: "",
    role: "Mathematics Educator",
    email: "",
    isMathsDept: true,
    status: "active",
    notes: "",
  });

  // Allocation modal
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [targetEducatorId, setTargetEducatorId] = useState<string | null>(null);
  const [editingAllocationIndex, setEditingAllocationIndex] = useState<number | null>(null);
  const [allocationForm, setAllocationForm] = useState<EducatorAllocation>({
    id: "",
    curriculum: "IEB",
    grade: "Grade 10A & 10B",
    subject: "Mathematics",
  });

  // Year transition / Rollover modal
  const [isYearTransitionModalOpen, setIsYearTransitionModalOpen] = useState(false);
  const [newYearNumber, setNewYearNumber] = useState<number>(config.currentAcademicYear + 1);
  const [newYearLabel, setNewYearLabel] = useState<string>(
    `${config.currentAcademicYear + 1} Academic Year (Draft Planning)`
  );
  const [copyAllocationsFromYear, setCopyAllocationsFromYear] = useState<number>(
    config.currentAcademicYear
  );

  // Active year object
  const currentYearObj =
    config.years.find((y) => y.year === selectedYear) || config.years[0] || {
      year: 2026,
      label: "2026 Academic Year",
      isActive: true,
      educators: [],
    };

  const educatorsList = currentYearObj.educators || [];

  // Filter educators
  const filteredEducators = educatorsList.filter((edu) => {
    if (filterDepartment === "maths" && !edu.isMathsDept) return false;
    if (filterStatus !== "all" && edu.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = edu.name.toLowerCase().includes(q);
      const matchRole = edu.role.toLowerCase().includes(q);
      const matchAlloc = edu.allocations.some(
        (a) =>
          a.subject.toLowerCase().includes(q) ||
          a.grade.toLowerCase().includes(q) ||
          a.curriculum.toLowerCase().includes(q)
      );
      if (!matchName && !matchRole && !matchAlloc) return false;
    }
    return true;
  });

  const mathsEducatorCount = educatorsList.filter((e) => e.isMathsDept && e.status === "active").length;
  const totalActiveEducators = educatorsList.filter((e) => e.status === "active").length;
  const totalAllocationsCount = educatorsList.reduce(
    (acc, e) => (e.status === "active" ? acc + e.allocations.length : acc),
    0
  );

  const handleTriggerSave = async (updatedConfig: DepartmentConfigState) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSaveConfig(updatedConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  // 1. Educator CRUD
  const handleOpenAddEducator = () => {
    setEditingEducator(null);
    setEducatorForm({
      name: "",
      role: "Mathematics Educator",
      email: "",
      isMathsDept: true,
      status: "active",
      notes: "",
    });
    setIsEducatorModalOpen(true);
  };

  const handleOpenEditEducator = (edu: DepartmentEducator) => {
    setEditingEducator(edu);
    setEducatorForm({
      name: edu.name,
      role: edu.role,
      email: edu.email || `${edu.name.toLowerCase().replace(/\s+/g, "")}@eaglehouseschool.co.za`,
      isMathsDept: edu.isMathsDept,
      status: edu.status,
      notes: edu.notes || "",
    });
    setIsEducatorModalOpen(true);
  };

  const handleSaveEducatorForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!educatorForm.name.trim()) return;

    let updatedEducators: DepartmentEducator[];
    if (editingEducator) {
      updatedEducators = educatorsList.map((edu) =>
        edu.id === editingEducator.id
          ? {
              ...edu,
              name: educatorForm.name.trim(),
              role: educatorForm.role.trim(),
              email: educatorForm.email.trim(),
              isMathsDept: educatorForm.isMathsDept,
              status: educatorForm.status,
              notes: educatorForm.notes.trim(),
            }
          : edu
      );
    } else {
      const newEdu: DepartmentEducator = {
        id: `edu-${Date.now()}`,
        name: educatorForm.name.trim(),
        role: educatorForm.role.trim() || "Mathematics Educator",
        email:
          educatorForm.email.trim() ||
          `${educatorForm.name.toLowerCase().replace(/\s+/g, "")}@eaglehouseschool.co.za`,
        isMathsDept: educatorForm.isMathsDept,
        status: educatorForm.status,
        notes: educatorForm.notes.trim(),
        allocations: [],
      };
      updatedEducators = [...educatorsList, newEdu];
    }

    const updatedYears = config.years.map((y) =>
      y.year === selectedYear ? { ...y, educators: updatedEducators } : y
    );

    const newConfig: DepartmentConfigState = {
      ...config,
      years: updatedYears,
    };

    setIsEducatorModalOpen(false);
    await handleTriggerSave(newConfig);
  };

  const handleToggleEducatorStatus = async (eduId: string) => {
    const updatedEducators = educatorsList.map((edu) => {
      if (edu.id === eduId) {
        const nextStatus = edu.status === "active" ? "inactive" : "active";
        return { ...edu, status: nextStatus as "active" | "inactive" };
      }
      return edu;
    });

    const updatedYears = config.years.map((y) =>
      y.year === selectedYear ? { ...y, educators: updatedEducators } : y
    );

    const newConfig: DepartmentConfigState = {
      ...config,
      years: updatedYears,
    };

    await handleTriggerSave(newConfig);
  };

  const handleDeleteEducator = async (edu: DepartmentEducator) => {
    if (
      !confirm(
        `Are you sure you want to remove educator "${edu.name}" from ${selectedYear}? This will remove their ${selectedYear} allocations without altering historical records.`
      )
    ) {
      return;
    }

    const updatedEducators = educatorsList.filter((e) => e.id !== edu.id);
    const updatedYears = config.years.map((y) =>
      y.year === selectedYear ? { ...y, educators: updatedEducators } : y
    );

    const newConfig: DepartmentConfigState = {
      ...config,
      years: updatedYears,
    };

    await handleTriggerSave(newConfig);
  };

  // 2. Allocation CRUD
  const handleOpenAddAllocation = (eduId: string) => {
    setTargetEducatorId(eduId);
    setEditingAllocationIndex(null);
    setAllocationForm({
      id: `alloc-${Date.now()}`,
      curriculum: "IEB",
      grade: "Grade 10A & 10B",
      subject: "Mathematics",
    });
    setIsAllocationModalOpen(true);
  };

  const handleOpenEditAllocation = (eduId: string, allocIdx: number) => {
    setTargetEducatorId(eduId);
    setEditingAllocationIndex(allocIdx);
    const edu = educatorsList.find((e) => e.id === eduId);
    if (edu && edu.allocations[allocIdx]) {
      setAllocationForm({ ...edu.allocations[allocIdx] });
    }
    setIsAllocationModalOpen(true);
  };

  const handleSaveAllocationForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEducatorId) return;

    const updatedEducators = educatorsList.map((edu) => {
      if (edu.id !== targetEducatorId) return edu;
      const allocs = [...edu.allocations];
      if (editingAllocationIndex !== null && editingAllocationIndex >= 0) {
        allocs[editingAllocationIndex] = { ...allocationForm };
      } else {
        allocs.push({
          ...allocationForm,
          id: allocationForm.id || `alloc-${Date.now()}`,
        });
      }
      return { ...edu, allocations: allocs };
    });

    const updatedYears = config.years.map((y) =>
      y.year === selectedYear ? { ...y, educators: updatedEducators } : y
    );

    const newConfig: DepartmentConfigState = {
      ...config,
      years: updatedYears,
    };

    setIsAllocationModalOpen(false);
    await handleTriggerSave(newConfig);
  };

  const handleRemoveAllocation = async (eduId: string, allocIdx: number) => {
    const updatedEducators = educatorsList.map((edu) => {
      if (edu.id !== eduId) return edu;
      const allocs = edu.allocations.filter((_, i) => i !== allocIdx);
      return { ...edu, allocations: allocs };
    });

    const updatedYears = config.years.map((y) =>
      y.year === selectedYear ? { ...y, educators: updatedEducators } : y
    );

    const newConfig: DepartmentConfigState = {
      ...config,
      years: updatedYears,
    };

    await handleTriggerSave(newConfig);
  };

  const handleMoveAllocation = async (eduId: string, allocIdx: number, direction: "up" | "down") => {
    const updatedEducators = educatorsList.map((edu) => {
      if (edu.id !== eduId) return edu;
      const allocs = [...edu.allocations];
      const targetIdx = direction === "up" ? allocIdx - 1 : allocIdx + 1;
      if (targetIdx < 0 || targetIdx >= allocs.length) return edu;
      const temp = allocs[allocIdx];
      allocs[allocIdx] = allocs[targetIdx];
      allocs[targetIdx] = temp;
      return { ...edu, allocations: allocs };
    });

    const updatedYears = config.years.map((y) =>
      y.year === selectedYear ? { ...y, educators: updatedEducators } : y
    );

    const newConfig: DepartmentConfigState = {
      ...config,
      years: updatedYears,
    };

    await handleTriggerSave(newConfig);
  };

  // 3. Year Transition & Rollover
  const handleExecuteYearRollover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearNumber || config.years.some((y) => y.year === newYearNumber)) {
      alert(`Academic year ${newYearNumber} already exists in the department configuration.`);
      return;
    }

    const sourceYear = config.years.find((y) => y.year === copyAllocationsFromYear);
    const sourceEducators: DepartmentEducator[] = sourceYear
      ? sourceYear.educators.map((edu) => ({
          ...edu,
          allocations: edu.allocations.map((a) => ({ ...a, id: `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` })),
        }))
      : [];

    const newYearConfig: AcademicYearConfig = {
      year: newYearNumber,
      label: newYearLabel.trim() || `${newYearNumber} Academic Year`,
      isActive: false,
      isArchived: false,
      notes: `Cloned from ${copyAllocationsFromYear} allocations on ${new Date().toISOString().split("T")[0]}.`,
      educators: sourceEducators,
    };

    const newConfig: DepartmentConfigState = {
      ...config,
      years: [...config.years, newYearConfig],
    };

    setSelectedYear(newYearNumber);
    setIsYearTransitionModalOpen(false);
    await handleTriggerSave(newConfig);
  };

  const handleSetActiveYear = async (yearNum: number) => {
    const updatedYears = config.years.map((y) => ({
      ...y,
      isActive: y.year === yearNum,
    }));

    const newConfig: DepartmentConfigState = {
      ...config,
      currentAcademicYear: yearNum,
      years: updatedYears,
    };

    await handleTriggerSave(newConfig);
  };

  if (setupSection === "peer-moderation") {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Department Setup</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage educator allocations and peer moderation assignments from one authoritative configuration.</p>
          </div>
          <button onClick={() => setSetupSection("allocations")} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold">← Teacher Allocations</button>
        </div>
        <PeerModerationScheduleView
          yearConfig={currentYearObj}
          schedule={peerModerationSchedule}
          currentTerm={currentTerm}
          onSave={onSavePeerModerationSchedule}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Department Setup & Educator Allocations
                {currentYearObj.isActive && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Year: {selectedYear}
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official institutional faculty allocation matrix. Editable configuration for the Mathematics Department with annual rollover support.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {saveSuccess && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Configuration Saved & Persisted</span>
            </div>
          )}

          {saveError && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{saveError}</span>
            </div>
          )}

          <button
            onClick={() => printTeacherAllocation(currentYearObj)}
            className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Allocation</span>
          </button>

          <button
            onClick={() => setSetupSection("peer-moderation")}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>Peer Moderation Schedule</span>
          </button>

          <button
            onClick={() => exportStaffDirectoryXlsx(educatorsList)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Matrix (.xlsx)</span>
          </button>

          <button
            onClick={() => setIsYearTransitionModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Prepare Next Year</span>
          </button>

          <button
            onClick={handleOpenAddEducator}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Educator</span>
          </button>
        </div>
      </div>

      {/* Year Selector & Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Year Selector card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Academic Year Configuration
          </span>
          <div className="mt-2 flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
            >
              {config.years.map((y) => (
                <option key={y.year} value={y.year}>
                  {y.year} ({y.isActive ? "Active Year" : "Planning"})
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {!currentYearObj.isActive ? (
              <button
                onClick={() => handleSetActiveYear(selectedYear)}
                className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Set as Active Academic Year →
              </button>
            ) : (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Currently Active System Year
              </span>
            )}
          </div>
        </div>

        {/* Maths Faculty Metric */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Mathematics & Math Lit Core
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-700 dark:text-blue-400">
              {mathsEducatorCount}
            </span>
            <span className="text-xs text-slate-500">active educators</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {educatorsList.filter((e) => e.isMathsDept && e.status === "active").map((e) => e.name).join(", ") || "No active Mathematics educators configured"}
          </p>
        </div>

        {/* Total Class Allocations */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Subject & Grade Allocations
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalAllocationsCount}
            </span>
            <span className="text-xs text-slate-500">teaching slots in {selectedYear}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            IEB, CAPS & Cambridge curricula
          </p>
        </div>

        {/* Total Faculty in Database */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Institutional Staff
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalActiveEducators}
            </span>
            <span className="text-xs text-slate-500">active school educators</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Full Eagle House School roster
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Department toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterDepartment("maths")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filterDepartment === "maths"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Maths Dept ({mathsEducatorCount})
            </button>
            <button
              onClick={() => setFilterDepartment("all")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filterDepartment === "all"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              All School Faculty ({educatorsList.length})
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive / On Leave</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search educator, subject, grade, curriculum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 w-64 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing {filteredEducators.length} educators for {selectedYear}
        </span>
      </div>

      {/* Educators Cards List */}
      <div className="space-y-4">
        {filteredEducators.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              No educators found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              No educators match your search criteria. You can add a new educator or adjust filters.
            </p>
            <button
              onClick={handleOpenAddEducator}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Educator</span>
            </button>
          </div>
        ) : (
          filteredEducators.map((edu) => (
            <div
              key={edu.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-5 shadow-xs ${
                edu.status === "inactive"
                  ? "border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-950/40"
                  : edu.isMathsDept
                  ? "border-blue-200 dark:border-blue-900/60 hover:border-blue-300"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              {/* Educator Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {edu.name}
                      {edu.isMathsDept && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Maths Dept
                        </span>
                      )}
                      {edu.status === "inactive" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Inactive
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {edu.role}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {edu.email}
                    </span>
                    {edu.notes && (
                      <>
                        <span>•</span>
                        <span className="italic text-slate-400">{edu.notes}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleEducatorStatus(edu.id)}
                    title={edu.status === "active" ? "Deactivate Educator" : "Reactivate Educator"}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border cursor-pointer transition-colors ${
                      edu.status === "active"
                        ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    {edu.status === "active" ? (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        <span>Deactivate</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Reactivate</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEditEducator(edu)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    title="Edit Educator"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteEducator(edu)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 cursor-pointer"
                    title="Remove Educator from Academic Year"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenAddAllocation(edu.id)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Allocation</span>
                  </button>
                </div>
              </div>

              {/* Allocations Table */}
              <div className="pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Assigned Classes & Subjects ({edu.allocations.length}):
                  </span>
                  {onSelectTeacherForDeadlines && (
                    <button
                      onClick={() => onSelectTeacherForDeadlines(edu.name)}
                      className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      View Assessments for {edu.name} →
                    </button>
                  )}
                </div>

                {edu.allocations.length === 0 ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    No classes or subjects allocated for {selectedYear}. Click "+ Add Allocation" to assign.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {edu.allocations.map((alloc, aIdx) => (
                      <div
                        key={alloc.id || aIdx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 group hover:border-blue-300 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {alloc.curriculum}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {alloc.grade}
                            </span>
                          </div>
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium block">
                            {alloc.subject}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {aIdx > 0 && (
                            <button
                              onClick={() => handleMoveAllocation(edu.id, aIdx, "up")}
                              title="Move Up"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                          )}
                          {aIdx < edu.allocations.length - 1 && (
                            <button
                              onClick={() => handleMoveAllocation(edu.id, aIdx, "down")}
                              title="Move Down"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditAllocation(edu.id, aIdx)}
                            title="Edit Allocation"
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveAllocation(edu.id, aIdx)}
                            title="Delete Allocation"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add / Edit Educator */}
      {isEducatorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingEducator ? `Edit Educator: ${editingEducator.name}` : "Add New Department Educator"}
            </h3>

            <form onSubmit={handleSaveEducatorForm} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Educator Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shingi or Mr. N. Mpofu"
                  value={educatorForm.name}
                  onChange={(e) => setEducatorForm({ ...educatorForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics Educator or Subject Head"
                  value={educatorForm.role}
                  onChange={(e) => setEducatorForm({ ...educatorForm, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@eaglehouseschool.co.za"
                  value={educatorForm.email}
                  onChange={(e) => setEducatorForm({ ...educatorForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={educatorForm.isMathsDept}
                    onChange={(e) => setEducatorForm({ ...educatorForm, isMathsDept: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Maths / Math Lit Dept
                  </span>
                </label>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={educatorForm.status}
                    onChange={(e) => setEducatorForm({ ...educatorForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive / On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pre-moderation lead for FET pure mathematics"
                  value={educatorForm.notes}
                  onChange={(e) => setEducatorForm({ ...educatorForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEducatorModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {isSaving ? "Saving..." : editingEducator ? "Save Changes" : "Create Educator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Allocation */}
      {isAllocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingAllocationIndex !== null ? "Edit Subject Allocation" : "Assign New Class Allocation"}
            </h3>

            <form onSubmit={handleSaveAllocationForm} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Curriculum Framework *
                </label>
                <select
                  value={allocationForm.curriculum}
                  onChange={(e) =>
                    setAllocationForm({ ...allocationForm, curriculum: e.target.value as CurriculumType })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="IEB">IEB (Independent Examinations Board)</option>
                  <option value="CAPS">CAPS (Department of Basic Education)</option>
                  <option value="Cambridge">Cambridge International (LS, IGCSE, AS/A Level)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Grade / Class Group *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 10A & 10B, Grade 8A, AS, IG1"
                  value={allocationForm.grade}
                  onChange={(e) => setAllocationForm({ ...allocationForm, grade: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, Mathematical Literacy, Stats, AP Maths"
                  value={allocationForm.subject}
                  onChange={(e) => setAllocationForm({ ...allocationForm, subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAllocationModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {isSaving ? "Saving..." : "Save Allocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Year Transition / Rollover */}
      {isYearTransitionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Copy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Prepare Next Academic Year Allocations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Clone current faculty allocations to plan the upcoming academic year without altering historical records.
                </p>
              </div>
            </div>

            <form onSubmit={handleExecuteYearRollover} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Academic Year Number *
                </label>
                <input
                  type="number"
                  required
                  min={2026}
                  max={2035}
                  value={newYearNumber}
                  onChange={(e) => {
                    const y = Number(e.target.value);
                    setNewYearNumber(y);
                    setNewYearLabel(`${y} Academic Year (Draft Planning)`);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Label / Description
                </label>
                <input
                  type="text"
                  value={newYearLabel}
                  onChange={(e) => setNewYearLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Copy Base Allocations From:
                </label>
                <select
                  value={copyAllocationsFromYear}
                  onChange={(e) => setCopyAllocationsFromYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  {config.years.map((y) => (
                    <option key={y.year} value={y.year}>
                      {y.label} ({y.educators.length} educators)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Historical Audit Protection:
                </span>
                <p>
                  Creating {newYearNumber} preserves all {selectedYear} assessments, moderations, results, and meetings intact. You can safely modify {newYearNumber} allocations.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsYearTransitionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {isSaving ? "Creating..." : `Create ${newYearNumber} Configuration`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
