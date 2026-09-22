import React from "react";
import {
  FileCheck2,
  CalendarClock,
  BarChart3,
  Users2,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingDeadlinesCount: number;
  openAdvisorModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingDeadlinesCount,
  openAdvisorModal,
}) => {
  const navItems = [
    { id: "moderation", label: "Pre & Post Moderation", icon: FileCheck2 },
    {
      id: "deadlines",
      label: "Deadlines Dashboard",
      icon: CalendarClock,
      badge: pendingDeadlinesCount > 0 ? pendingDeadlinesCount : null,
    },
    { id: "results", label: "Results & Interventions", icon: BarChart3 },
    { id: "meetings", label: "Meetings & Agendas", icon: ClipboardList },
    { id: "curriculum", label: "Curriculum & ATPs", icon: BookOpen },
    { id: "staff", label: "Staff Allocations", icon: Users2 },
    { id: "hod-index", label: "HOD Duties Index", icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-brand-line/80 shadow-xs">
      {/* Top institution bar */}
      <div className="bg-brand-primary text-slate-100 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold tracking-wider text-brand-secondary">
              <ShieldCheck className="w-4 h-4" />
              <span>EAGLE HOUSE SCHOOL</span>
            </div>
            <span className="text-slate-500">|</span>
            <span className="font-medium text-slate-300 font-serif italic">praxis BORDERLESS LEARNING</span>
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-black/25 text-slate-300 text-[11px] border border-white/10">
              Dept: Mathematics & Mathematical Literacy
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">
                Logged in: <strong className="text-white">Mpofu (HOD & Teacher)</strong>
              </span>
            </div>
            <button
              onClick={openAdvisorModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-secondary hover:opacity-90 text-white font-semibold transition-all cursor-pointer text-xs shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-white/95" />
              <span>Ask AI HOD Advisor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between overflow-x-auto py-2 scrollbar-none">
          <nav className="flex items-center gap-1 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-xs font-bold"
                      : "text-brand-mute hover:text-brand-dark hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-primary" : "text-brand-mute"}`} />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-brand-warn text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
