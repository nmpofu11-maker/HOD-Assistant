import React, { useState } from "react";
import {
  Database,
  Download,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  RotateCcw,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Copy,
  Calendar,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  DepartmentConfigState,
  StaffDeadlineItem,
  MeetingRecord,
  ResultsAnalysisData,
  PreModerationReport,
  PostModerationReport,
  PeerModerationScheduleEntry,
  DepartmentCalendarTask,
} from "../types";
import { exportDeadlinesXlsx, exportStaffDirectoryXlsx } from "../utils/xlsxExport";

interface DataManagementViewProps {
  isDemoMode: boolean;
  onLoadDemoData: () => void;
  onClearDemoData: () => void;
  deadlines: StaffDeadlineItem[];
  meetings: MeetingRecord[];
  resultsData: ResultsAnalysisData | null;
  savedPreReports: PreModerationReport[];
  savedPostReports: PostModerationReport[];
  departmentConfig: DepartmentConfigState;
  onImportFullBackup?: (backupData: any) => Promise<void>;
  onResetDepartmentConfig?: () => Promise<void>;
  currentTerm: number;
  peerModerationSchedule: PeerModerationScheduleEntry[];
  calendarTasks: DepartmentCalendarTask[];
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  isDemoMode,
  onLoadDemoData,
  onClearDemoData,
  deadlines,
  meetings,
  resultsData,
  savedPreReports,
  savedPostReports,
  departmentConfig,
  onImportFullBackup,
  onResetDepartmentConfig,
  currentTerm,
  peerModerationSchedule,
  calendarTasks,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const activeYearConfig =
    departmentConfig.years.find((y) => y.year === departmentConfig.currentAcademicYear) ||
    departmentConfig.years[0];

  const handleExportJsonBackup = () => {
    const backup = {
      exportTimestamp: new Date().toISOString(),
      academicYear: departmentConfig.currentAcademicYear,
      currentTerm,
      departmentConfig,
      deadlines,
      meetings,
      resultsData,
      savedPreReports,
      savedPostReports,
      peerModerationSchedule,
      calendarTasks,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Eagle_House_Maths_Department_Backup_${departmentConfig.currentAcademicYear}_T${currentTerm}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== "object") {
          throw new Error("Invalid JSON structure.");
        }

        if (onImportFullBackup) {
          await onImportFullBackup(parsed);
          setImportStatus(`Successfully restored backup from ${file.name}!`);
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus("Import functionality is ready.");
        }
      } catch (err: any) {
        setImportError(err.message || "Failed to parse backup file.");
        setTimeout(() => setImportError(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Department Data Management & Archiving
                {isDemoMode ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    🟠 DEMONSTRATION MODE ACTIVE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    🟢 REAL DEPARTMENT DATA
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Central hub for data backup, XLSX exports, demonstration mode toggling, and institutional record protection.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJsonBackup}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Backup (.json)</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{importStatus}</span>
        </div>
      )}

      {importError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{importError}</span>
        </div>
      )}

      {/* Grid of Data Management Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Demonstration Mode Control */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Demonstration Data Control
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between clean production mode and demonstration sample records.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Current Mode:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  isDemoMode
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {isDemoMode ? "Demonstration Data Active" : "Clean Production Mode"}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              {isDemoMode
                ? "Demonstration assessments, meeting minutes, and results are currently loaded for demonstration purposes. This sample data is never mixed with real records."
                : "The application starts blank by default with intelligent defaults. Real records you create will be safely persisted to disk."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {!isDemoMode ? (
              <button
                onClick={onLoadDemoData}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Demonstration Data</span>
              </button>
            ) : (
              <button
                onClick={onClearDemoData}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Exit Demonstration Mode</span>
              </button>
            )}

            <button
              disabled={!isDemoMode}
              onClick={() => {
                if (isDemoMode && confirm("Exit demonstration mode and restore the departmental data that was preserved before the demo was loaded?")) {
                  onClearDemoData();
                }
              }}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Demo Data</span>
            </button>
          </div>
        </div>

        {/* Module 2: Department Inventory & Current Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Department Record Inventory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active dataset summary for {departmentConfig.currentAcademicYear} (Term {currentTerm}).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Assessments</span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {deadlines.length}
              </div>
              <span className="text-[10px] text-slate-500">formal assessment tasks</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Moderations</span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {savedPreReports.length + savedPostReports.length}
              </div>
              <span className="text-[10px] text-slate-500">pre & post reports saved</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Meetings</span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {meetings.length}
              </div>
              <span className="text-[10px] text-slate-500">official meeting records</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Results</span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {resultsData ? "1 Dataset" : "None"}
              </div>
              <span className="text-[10px] text-slate-500">active cohort analysis</span>
            </div>
          </div>
        </div>

        {/* Module 3: Export Spreadsheets */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Export Department Spreadsheets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate formatted Excel sheets for assessment deadlines and staff allocations.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => exportDeadlinesXlsx(deadlines)}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/70 dark:hover:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-800 text-left flex items-center justify-between group cursor-pointer transition-colors"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Export Assessment & Moderation Deadlines (.xlsx)
                </span>
                <span className="text-[11px] text-slate-500">
                  Includes 5-day pre-moderation dates, difficulty tiers, and sign-offs
                </span>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </button>

            <button
              onClick={() => exportStaffDirectoryXlsx(activeYearConfig.educators)}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/70 dark:hover:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-800 text-left flex items-center justify-between group cursor-pointer transition-colors"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Export Faculty Allocations Matrix (.xlsx)
                </span>
                <span className="text-[11px] text-slate-500">
                  Full roster of {activeYearConfig.educators.length} educators and class allocations
                </span>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </button>
          </div>
        </div>

        {/* Module 4: Backup & Restore */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Backup & Restore System State
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Safely backup or restore complete department configuration and records.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="w-full p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-950/40">
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click to select JSON backup file
              </span>
              <span className="text-[10px] text-slate-400">
                Restores configuration, assessments, meetings, and moderation reports
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImportJson}
                className="hidden"
              />
            </label>

            {onResetDepartmentConfig && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to reset the Department Configuration to the default 2026 Eagle House template? Any customized educator allocations will be reset."
                      )
                    ) {
                      onResetDepartmentConfig();
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-rose-600 font-semibold cursor-pointer"
                >
                  Reset Department Allocations to Default Template
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
