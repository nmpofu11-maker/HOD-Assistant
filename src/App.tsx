import React, { useState, useEffect } from "react";
import { ModerationView } from "./components/ModerationView";
import { DeadlinesView } from "./components/DeadlinesView";
import { ResultsAnalysisView } from "./components/ResultsAnalysisView";
import { MeetingsView } from "./components/MeetingsView";
import { CurriculumView } from "./components/CurriculumView";
import { DepartmentSetupView } from "./components/DepartmentSetupView";
import { DataManagementView } from "./components/DataManagementView";
import { INITIAL_DEPARTMENT_CONFIG } from "./data/initialDepartmentConfig";
import { DEMO_DEADLINES, DEMO_MEETINGS, DEMO_RESULTS_DATASET, DEMO_PRE_MODERATION_REPORT, DEMO_POST_MODERATION_REPORT } from "./data/demonstrationDataset";
import { HodHandbookIndexView } from "./components/HodHandbookIndexView";
import { WeeklyOverview } from "./components/WeeklyOverview";
import { AiAdvisorModal } from "./components/AiAdvisorModal";
import { StaffDeadlineItem, StaffMember, DepartmentConfigState, MeetingRecord, ResultsAnalysisData, PreModerationReport, PostModerationReport, PeerModerationScheduleEntry } from "./types";
import { safeGet, safePut } from "./utils/apiClient";
import {
  ShieldCheck,
  Sparkles,
  Menu,
  X,
  FileCheck2,
  CalendarClock,
  CalendarDays,
  BarChart3,
  ClipboardList,
  BookOpen,
  Users2,
  GraduationCap,
  ChevronRight,
  User,
  Sun,
  Moon,
  Award,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("moderation");
  const [departmentConfig, setDepartmentConfig] = useState<DepartmentConfigState>(INITIAL_DEPARTMENT_CONFIG);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [deadlines, setDeadlines] = useState<StaffDeadlineItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [resultsData, setResultsData] = useState<ResultsAnalysisData | null>(null);
  const [savedPreReports, setSavedPreReports] = useState<PreModerationReport[]>([]);
  const [savedPostReports, setSavedPostReports] = useState<PostModerationReport[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [peerModerationSchedule, setPeerModerationSchedule] = useState<PeerModerationScheduleEntry[]>([]);

  useEffect(() => {
    Promise.all([
      safeGet<DepartmentConfigState | null>("/api/data/department_config.json"),
      safeGet<StaffDeadlineItem[]>("/api/data/deadlines.json"),
      safeGet<MeetingRecord[]>("/api/data/meetings.json"),
      safeGet<ResultsAnalysisData | ResultsAnalysisData[]>("/api/data/results.json"),
      safeGet<Array<PreModerationReport | PostModerationReport>>("/api/data/moderations.json"),
      safeGet<PeerModerationScheduleEntry[]>("/api/data/peer_moderation_schedule.json"),
    ]).then(([config, d, m, r, mod, peerSchedule]) => {
      if (config.success && config.data) setDepartmentConfig(config.data);
      if (d.success && Array.isArray(d.data)) setDeadlines(d.data);
      if (m.success && Array.isArray(m.data)) setMeetings(m.data);
      if (r.success) setResultsData(Array.isArray(r.data) ? (r.data[0] || null) : (r.data || null));
      if (peerSchedule.success && Array.isArray(peerSchedule.data)) setPeerModerationSchedule(peerSchedule.data);
      if (mod.success && Array.isArray(mod.data)) {
        setSavedPreReports(mod.data.filter((x): x is PreModerationReport => "checklist" in x));
        setSavedPostReports(mod.data.filter((x): x is PostModerationReport => "scriptFindings" in x));
      }
      if ((r.success && (Array.isArray(r.data) ? r.data[0]?.id : r.data?.id)?.includes("DEMO")) || (m.success && m.data?.some?.((x: any) => String(x.id || "").includes("DEMO")))) setIsDemoMode(true);
    }).catch((err) => console.error("Failed to load departmental data:", err));
  }, []);

  useEffect(() => {
    const year = departmentConfig.years.find((y) => y.year === departmentConfig.currentAcademicYear) || departmentConfig.years[0];
    setStaffList((year?.educators || []).map((e): StaffMember => ({
      id: e.id, name: e.name, role: e.role, email: e.email, status: e.status, notes: e.notes,
      isMathsDept: e.isMathsDept,
      allocations: e.allocations.map((a) => ({ id: a.id, curriculum: a.curriculum, grade: a.grade, subject: a.subject }))
    })));
  }, [departmentConfig]);

  const handleSaveDepartmentConfig = async (newConfig: DepartmentConfigState) => {
    const result = await safePut("/api/data/department_config.json", newConfig);
    if (!result.success) throw new Error(result.error || "Failed to save department configuration.");
    setDepartmentConfig(newConfig);
  };

  const handleSavePeerModerationSchedule = async (schedule: PeerModerationScheduleEntry[]) => {
    const result = await safePut("/api/data/peer_moderation_schedule.json", schedule);
    if (!result.success) throw new Error(result.error || "Failed to save peer moderation schedule.");
    setPeerModerationSchedule(schedule);
  };

  const loadDemoData = async () => {
    const current = {
      deadlines, meetings, resultsData, savedPreReports, savedPostReports,
    };
    const backup = await safePut("/api/data/demo_backup.json", current);
    if (!backup.success) throw new Error(backup.error || "Could not preserve current departmental data before entering demonstration mode.");
    const results = await Promise.all([
      safePut("/api/data/deadlines.json", DEMO_DEADLINES),
      safePut("/api/data/meetings.json", DEMO_MEETINGS),
      safePut("/api/data/results.json", DEMO_RESULTS_DATASET),
      safePut("/api/data/moderations.json", [DEMO_PRE_MODERATION_REPORT, DEMO_POST_MODERATION_REPORT]),
    ]);
    if (results.some((r) => !r.success)) throw new Error("One or more demonstration datasets could not be loaded.");
    setDeadlines(DEMO_DEADLINES); setMeetings(DEMO_MEETINGS); setResultsData(DEMO_RESULTS_DATASET);
    setSavedPreReports([DEMO_PRE_MODERATION_REPORT]); setSavedPostReports([DEMO_POST_MODERATION_REPORT]); setIsDemoMode(true);
  };

  const clearDemoData = async () => {
    if (!isDemoMode) return;
    const backup = await safeGet<any>("/api/data/demo_backup.json");
    if (!backup.success || !backup.data) throw new Error("No preserved departmental data was found; demonstration data was not cleared.");
    const original = backup.data;
    const results = await Promise.all([
      safePut("/api/data/deadlines.json", original.deadlines || []),
      safePut("/api/data/meetings.json", original.meetings || []),
      safePut("/api/data/results.json", original.resultsData || []),
      safePut("/api/data/moderations.json", [...(original.savedPreReports || []), ...(original.savedPostReports || [])]),
      safePut("/api/data/demo_backup.json", {}),
    ]);
    if (results.some((r) => !r.success)) throw new Error("Could not restore the preserved departmental data.");
    setDeadlines(original.deadlines || []); setMeetings(original.meetings || []); setResultsData(original.resultsData || null);
    setSavedPreReports(original.savedPreReports || []); setSavedPostReports(original.savedPostReports || []); setIsDemoMode(false);
  };

  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [persona, setPersona] = useState<"hod" | "shingi" | "reggie" | "luthando">("hod");
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("eaglehouse_dark_mode");
      return stored ? stored === "true" : true; // Default to true (their beautiful premium dark blue theme!)
    } catch {
      return true;
    }
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("eaglehouse_dark_mode", String(next));
      return next;
    });
  };
  
  const [currentTerm, setCurrentTerm] = useState<number>(() => {
    const getTermFromDate = (date = new Date()) => {
      const month = date.getMonth() + 1;
      if (month <= 3) return 1;
      if (month <= 6) return 2;
      if (month <= 9) return 3;
      return 4;
    };
    try {
      const stored = localStorage.getItem("eaglehouse_current_term");
      const parsed = stored ? parseInt(stored, 10) : getTermFromDate();
      return Number.isFinite(parsed) && parsed >= 1 && parsed <= 4 ? parsed : getTermFromDate();
    } catch {
      return getTermFromDate();
    }
  });

  const handleTermChange = (term: number) => {
    setCurrentTerm(term);
    localStorage.setItem("eaglehouse_current_term", term.toString());
  };

  // Filter deadlines dynamically based on the selected Active Persona Role
  const getPersonaDeadlines = () => {
    let list = deadlines;
    if (persona === "shingi") {
      list = list.filter((d) => d.teacherName === "Shingi");
    } else if (persona === "reggie") {
      list = list.filter((d) => d.teacherName === "Reggie");
    } else if (persona === "luthando") {
      list = list.filter((d) => d.teacherName === "Luthando");
    }
    return list;
  };

  const personaDeadlines = getPersonaDeadlines();
  const filteredDeadlines = personaDeadlines.filter(
    (d) => (d.term || 1) === currentTerm
  );

  const getFilteredStaffList = () => {
    if (persona === "shingi") {
      return staffList.filter((s) => s.name === "Shingi");
    }
    if (persona === "reggie") {
      return staffList.filter((s) => s.name === "Reggie");
    }
    if (persona === "luthando") {
      return staffList.filter((s) => s.name === "Luthando");
    }
    return staffList;
  };

  const filteredStaffList = getFilteredStaffList();

  // Pending deadlines for badge
  const pendingCount = filteredDeadlines.filter(
    (d) => d.preModStatus === "Pending" || d.preModStatus === "Overdue"
  ).length;

  const handleAddDeadline = async (newDeadline: StaffDeadlineItem) => {
    const updated = [newDeadline, ...deadlines];
    setDeadlines(updated);
    try {
      const result = await safePut("/api/data/deadlines.json", updated);
      if (!result.success) throw new Error(result.error || "Save failed.");
    } catch (err) {
      console.error("Failed to save new deadline on server:", err);
    }
  };

  const handleUpdateDeadlineStatus = async (
    id: string,
    status: StaffDeadlineItem["preModStatus"]
  ) => {
    const updated = deadlines.map((item) =>
      item.id === id ? { ...item, preModStatus: status } : item
    );
    setDeadlines(updated);
    try {
      const result = await safePut("/api/data/deadlines.json", updated);
      if (!result.success) throw new Error(result.error || "Save failed.");
    } catch (err) {
      console.error("Failed to update deadline status on server:", err);
    }
  };

  const handleSelectForModeration = (task: StaffDeadlineItem) => {
    setActiveTab("moderation");
  };

  const handleClearDeadlines = async () => {
    setDeadlines([]);
    try {
      const result = await safePut("/api/data/deadlines.json", []);
      if (!result.success) throw new Error(result.error || "Save failed.");
    } catch (err) {
      console.error("Failed to clear deadlines on server:", err);
    }
  };

  const handleDeleteDeadline = async (id: string) => {
    const updatedDeadlines = deadlines.filter((d) => d.id !== id);
    setDeadlines(updatedDeadlines);
    try {
      await fetch("/api/data/deadlines.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDeadlines),
      });
    } catch (err) {
      console.error("Failed to delete deadline on server:", err);
    }
  };

  const handleSelectTeacherForDeadlines = (teacherName: string) => {
    setActiveTab("deadlines");
  };

  const navItems = [
    { id: "moderation", label: "Pre & Post Moderation", icon: FileCheck2 },
    { id: "sba-tracker", label: "Annual SBAs & SAGS", icon: Award },
    {
      id: "deadlines",
      label: "Deadlines Dashboard",
      icon: CalendarClock,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { id: "weekly", label: "Weekly Overview", icon: CalendarDays },
    { id: "results", label: "Results & Interventions", icon: BarChart3 },
    { id: "meetings", label: "Meetings & Agendas", icon: ClipboardList },
    { id: "curriculum", label: "Curriculum & ATPs", icon: BookOpen },
    { id: "staff", label: "Department Setup", icon: Users2 },
    { id: "data-management", label: "Data Management", icon: ShieldCheck },
    { id: "hod-index", label: "HOD Duties Index", icon: GraduationCap },
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-250">
        {/* 1. Unified Branding Header Bar (from-blue-950 to-slate-900) */}
        <header className="w-full bg-gradient-to-r from-blue-950 to-slate-900 border-b border-slate-800 text-white px-4 py-3 sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-white transition-all cursor-pointer flex items-center gap-1.5"
                aria-label="Toggle Sidebar Menu"
              >
                <Menu className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Menu</span>
              </button>
              <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                <img
                  src="/assets/eagle_house_logo.jpg"
                  alt="Eagle House School Logo"
                  className="w-8 h-8 rounded-full border border-slate-700 object-cover bg-white"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="font-serif font-black tracking-wide text-sm block">EAGLE HOUSE SCHOOL</span>
                  <span className="text-[10px] text-blue-300 block font-sans tracking-widest uppercase">
                    SECONDARY HOD DEPARTMENT SUITE
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Global Term Filter */}
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 shadow-inner">
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider hidden sm:inline">Current Term:</span>
                <select
                  value={currentTerm}
                  onChange={(e) => handleTermChange(parseInt(e.target.value, 10))}
                  className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-1"
                  title="Select Academic Term"
                >
                  <option value={1} className="text-slate-900 bg-white">Term 1 (Jan - Mar)</option>
                  <option value={2} className="text-slate-900 bg-white">Term 2 (Apr - Jun)</option>
                  <option value={3} className="text-slate-900 bg-white">Term 3 (Jul - Sep)</option>
                  <option value={4} className="text-slate-900 bg-white">Term 4 (Oct - Dec)</option>
                </select>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-white transition-all cursor-pointer flex items-center justify-center"
                aria-label="Toggle Theme Mode"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-200" />
                )}
              </button>

              <button
                onClick={() => setIsAdvisorModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all cursor-pointer text-xs shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>Ask AI HOD Advisor</span>
              </button>
            </div>
          </div>
        </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* 2. Responsive Navigation Sidebar (bg-white border-r border-neutral-100) */}
        <aside
          className={`bg-white border-r border-neutral-100 flex flex-col justify-between transition-all duration-300 z-30 ${
            isSidebarOpen ? "w-full md:w-64" : "w-0 md:w-0 overflow-hidden"
          } ${isSidebarOpen ? "block" : "hidden md:block"}`}
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Navigation
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1 text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 768) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={`w-full text-left inline-flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? "bg-teal-50 border-r-4 border-teal-800 text-teal-950 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-teal-800" : "text-neutral-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 3. Active Persona Filter dropdown at the bottom of the sidebar */}
          <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 space-y-2">
            <div className="flex items-center gap-2 text-neutral-400">
              <User className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Active Persona Role
              </span>
            </div>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as any)}
              className="w-full text-xs bg-white border border-neutral-200 rounded-md py-1.5 px-2 font-semibold text-teal-950 focus:ring-1 focus:ring-teal-800 focus:outline-none"
            >
              <option value="hod">HOD Mpofu (All Subjects)</option>
              <option value="shingi">Shingi (Grade 10 Maths)</option>
              <option value="reggie">Reggie (Grade 11-12 Maths)</option>
              <option value="luthando">Luthando (Cambridge Maths)</option>
            </select>
            <div className="text-[10px] text-neutral-400 leading-tight">
              {persona === "hod"
                ? "Full administrative control of department workflows."
                : `Filtered view for ${
                    persona === "shingi"
                      ? "Mathematics Grade 10"
                      : persona === "reggie"
                      ? "Mathematical Literacy & Calculus"
                      : "Cambridge Assessment"
                  }.`}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          <div className="font-serif">
            {activeTab === "moderation" && (
              <ModerationView staffList={filteredStaffList} currentTerm={currentTerm} />
            )}

            {activeTab === "sba-tracker" && (
              <ModerationView
                staffList={filteredStaffList}
                currentTerm={currentTerm}
                initialTab="sba"
              />
            )}

            {activeTab === "deadlines" && (
              <DeadlinesView
                deadlines={personaDeadlines}
                staffList={filteredStaffList}
                onAddDeadline={handleAddDeadline}
                onUpdateStatus={handleUpdateDeadlineStatus}
                onSelectForModeration={handleSelectForModeration}
                onClearDeadlines={handleClearDeadlines}
                onDeleteDeadline={handleDeleteDeadline}
                currentTerm={currentTerm}
                onTermChange={handleTermChange}
              />
            )}

            {activeTab === "weekly" && (
              <WeeklyOverview
                deadlines={deadlines}
                staffList={staffList}
                persona={persona}
                currentTerm={currentTerm}
              />
            )}

            {activeTab === "results" && (
              <ResultsAnalysisView staffList={staffList} deadlines={deadlines} />
            )}

            {activeTab === "meetings" && <MeetingsView staffList={filteredStaffList} />}
            {activeTab === "data-management" && (
              <DataManagementView
                isDemoMode={isDemoMode}
                onLoadDemoData={loadDemoData}
                onClearDemoData={clearDemoData}
                deadlines={deadlines}
                meetings={meetings}
                resultsData={resultsData}
                savedPreReports={savedPreReports}
                savedPostReports={savedPostReports}
                departmentConfig={departmentConfig}
                currentTerm={currentTerm}
                peerModerationSchedule={peerModerationSchedule}
                onImportFullBackup={async (backup) => {
                  if (backup.departmentConfig) await handleSaveDepartmentConfig(backup.departmentConfig);
                  if (Array.isArray(backup.deadlines)) { await safePut("/api/data/deadlines.json", backup.deadlines); setDeadlines(backup.deadlines); }
                  if (Array.isArray(backup.meetings)) { await safePut("/api/data/meetings.json", backup.meetings); setMeetings(backup.meetings); }
                  if (backup.resultsData) { await safePut("/api/data/results.json", backup.resultsData); setResultsData(backup.resultsData); }
                  const mods = [...(backup.savedPreReports || []), ...(backup.savedPostReports || [])];
                  await safePut("/api/data/moderations.json", mods); setSavedPreReports(backup.savedPreReports || []); setSavedPostReports(backup.savedPostReports || []);
                  if (Array.isArray(backup.peerModerationSchedule)) { await handleSavePeerModerationSchedule(backup.peerModerationSchedule); }
                  setIsDemoMode(false);
                }}
              />
            )}

            {activeTab === "curriculum" && <CurriculumView />}

            {activeTab === "staff" && (
              <DepartmentSetupView config={departmentConfig} onSaveConfig={handleSaveDepartmentConfig} onSelectTeacherForDeadlines={handleSelectTeacherForDeadlines} peerModerationSchedule={peerModerationSchedule} onSavePeerModerationSchedule={handleSavePeerModerationSchedule} currentTerm={currentTerm} />
            )}

            {activeTab === "hod-index" && <HodHandbookIndexView setActiveTab={setActiveTab} />}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-brand-line py-6 px-4 sm:px-6 mt-12 text-xs text-brand-mute">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-brand-dark">Eagle House School (praxis BORDERLESS LEARNING)</span>
            <span>·</span>
            <span>Secondary Department Portfolio Suite</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>Assessment Policy §7.1 (5-Day Pre-Mod)</span>
            <span>·</span>
            <span>Assessment Policy §7.2 (10% Purple Pen Audit)</span>
            <span>·</span>
            <span>IEB SAGS & CAPS ATP Aligned</span>
          </div>
        </div>
      </footer>

      {/* Floating AI HOD Advisor Modal */}
      <AiAdvisorModal
        isOpen={isAdvisorModalOpen}
        onClose={() => setIsAdvisorModalOpen(false)}
      />
      </div>
    </div>
  );
}
