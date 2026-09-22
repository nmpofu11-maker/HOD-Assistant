import React, { useState } from "react";
import {
  Users2,
  Search,
  Filter,
  Download,
  Plus,
  BookOpen,
  GraduationCap,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { StaffMember } from "../types";
import { exportStaffDirectoryXlsx } from "../utils/xlsxExport";

interface StaffDirectoryViewProps {
  staffList: StaffMember[];
  onSelectTeacherForDeadlines: (teacherName: string) => void;
}

export const StaffDirectoryView: React.FC<StaffDirectoryViewProps> = ({
  staffList,
  onSelectTeacherForDeadlines,
}) => {
  const [filterDepartment, setFilterDepartment] = useState<"maths" | "all">("maths");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>("all");

  const filteredStaff = staffList.filter((s) => {
    if (filterDepartment === "maths" && !s.isMathsDept) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchSub = s.allocations.some(
        (a) => a.subject.toLowerCase().includes(q) || a.grade.toLowerCase().includes(q)
      );
      if (!matchName && !matchSub) return false;
    }
    if (selectedCurriculum !== "all") {
      const matchCurr = s.allocations.some((a) => a.curriculum === selectedCurriculum);
      if (!matchCurr) return false;
    }
    return true;
  });

  const mathsStaffCount = staffList.filter((s) => s.isMathsDept).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users2 className="w-5 h-5 text-blue-700" />
            Educator Directory & Subject Allocations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full institutional teaching staff database for Eagle House School with assigned grades, subjects, and curriculum streams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportStaffDirectoryXlsx(staffList)}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Allocations (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Filter & Scope Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Department toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterDepartment("maths")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filterDepartment === "maths"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Maths & Math Lit Dept ({mathsStaffCount})
            </button>
            <button
              onClick={() => setFilterDepartment("all")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filterDepartment === "all"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All School Educators ({staffList.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by teacher name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 w-60 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Curriculum filter */}
          <select
            value={selectedCurriculum}
            onChange={(e) => setSelectedCurriculum(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <option value="all">All Curricula</option>
            <option value="IEB">IEB</option>
            <option value="Cambridge">Cambridge</option>
            <option value="CAPS">CAPS</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredStaff.length} educators
        </span>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-blue-300 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {staff.name}
                    {staff.isMathsDept && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                        Maths Dept
                      </span>
                    )}
                  </h3>
                  <span className="text-[11px] text-slate-500">{staff.name.toLowerCase().replace(/\s+/g, "")}@eaglehouseschool.co.za</span>
                </div>
              </div>

              {/* Allocations Pills */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Classes & Subjects ({staff.allocations.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {staff.allocations.map((alloc, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-center gap-1.5"
                    >
                      <span className="font-bold text-slate-900">{alloc.grade}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-800">{alloc.subject}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 text-slate-600 font-semibold">
                        {alloc.curriculum}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onSelectTeacherForDeadlines(staff.name)}
                className="text-xs text-blue-700 hover:text-blue-800 font-semibold cursor-pointer"
              >
                View Assessment Deadlines →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
