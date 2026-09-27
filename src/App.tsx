import React, { useState, useEffect } from "react";
import { ModerationView } from "./components/ModerationView";
import { DeadlinesView } from "./components/DeadlinesView";
import { ResultsAnalysisView } from "./components/ResultsAnalysisView";
import { MeetingsView } from "./components/MeetingsView";
import { CurriculumView } from "./components/CurriculumView";
import { StaffDirectoryView } from "./components/StaffDirectoryView";
import { HodHandbookIndexView } from "./components/HodHandbookIndexView";
import { WeeklyOverview } from "./components/WeeklyOverview";
import { AiAdvisorModal } from "./components/AiAdvisorModal";
import { INITIAL_STAFF_MEMBERS } from "./data/staffData";
import { INITIAL_DEADLINES } from "./data/curriculumData";
import { StaffDeadlineItem } from "./types";
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
  const [staffList, setStaffList] = useState(INITIAL_STAFF_MEMBERS);
  const [deadlines, setDeadlines] = useState<StaffDeadlineItem[]>(INITIAL_DEADLINES);

  useEffect(() => {
    fetch("/api/data/deadlines.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDeadlines(data);
        }
      })
      .catch((err) => console.error("Failed to load deadlines:", err));
  }, []);

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
    try {
      const stored = localStorage.getItem("eaglehouse_current_term");
      const parsed = stored ? parseInt(stored, 10) : 1;
      return isNaN(parsed) || parsed < 1 || parsed > 4 ? 1 : parsed;
    } catch {
      return 1;
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
      await fetch("/api/data/deadlines.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("Failed to save new deadline on server:", err);
    }
  };

  const handleUpdateDeadlineStatus = (
    id: string,
    status: StaffDeadlineItem["preModStatus"]
  ) => {
    setDeadlines((prev) =>
      prev.map((item) => (item.id === id ? { ...item, preModStatus: status } : item))
    );
  };

  const handleSelectForModeration = (task: StaffDeadlineItem) => {
    setActiveTab("moderation");
  };

  const handleClearDeadlines = async () => {
    setDeadlines([]);
    try {
      await fetch("/api/data/deadlines.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([]),
      });
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
    { id: "staff", label: "Staff Allocations", icon: Users2 },
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

            {activeTab === "curriculum" && <CurriculumView />}

            {activeTab === "staff" && (
              <StaffDirectoryView
                staffList={filteredStaffList}
                onSelectTeacherForDeadlines={handleSelectTeacherForDeadlines}
              />
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
