import React, { useMemo, useState } from "react";
import { CalendarCheck2, Plus, Printer, Save, Trash2, AlertTriangle } from "lucide-react";
import { AcademicYearConfig, PeerModerationScheduleEntry } from "../types";

interface PeerModerationScheduleViewProps {
  yearConfig: AcademicYearConfig;
  schedule: PeerModerationScheduleEntry[];
  currentTerm: number;
  onSave: (schedule: PeerModerationScheduleEntry[]) => Promise<void>;
}

const emptyEntry = (year: number, term: number): PeerModerationScheduleEntry => ({
  id: `pmod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  academicYear: year,
  term: term as 1 | 2 | 3 | 4,
  taskCycle: "Task 1",
  taskName: "",
  subject: "Mathematics",
  curriculum: "IEB",
  className: "",
  teacherId: "",
  moderatorId: "",
  moderationDate: "",
  status: "Scheduled",
  notes: "",
});

export const PeerModerationScheduleView: React.FC<PeerModerationScheduleViewProps> = ({
  yearConfig,
  schedule,
  currentTerm,
  onSave,
}) => {
  const mathsEducators = useMemo(
    () => yearConfig.educators.filter((e) => e.isMathsDept && e.status === "active"),
    [yearConfig.educators]
  );
  const [selectedTerm, setSelectedTerm] = useState<1 | 2 | 3 | 4>(currentTerm as 1 | 2 | 3 | 4);
  const [rows, setRows] = useState<PeerModerationScheduleEntry[]>(schedule.filter((r) => r.academicYear === yearConfig.year));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setRows(schedule.filter((r) => r.academicYear === yearConfig.year));
  }, [schedule, yearConfig.year]);

  const visibleRows = rows.filter((r) => r.term === selectedTerm);

  const updateRow = (id: string, patch: Partial<PeerModerationScheduleEntry>) =>
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addRow = () => setRows((prev) => [...prev, emptyEntry(yearConfig.year, selectedTerm)]);

  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const invalidPeer = rows.find((r) => r.teacherId && r.moderatorId && r.teacherId === r.moderatorId);
      if (invalidPeer) {
        throw new Error("A peer moderator must be a different educator from the teacher being moderated.");
      }
      const cleaned = rows.filter((r) => r.teacherId || r.moderatorId || r.className || r.taskName);
      const otherYears = schedule.filter((r) => r.academicYear !== yearConfig.year);
      await onSave([...otherYears, ...cleaned]);
    } catch (e: any) {
      setError(e?.message || "The peer moderation schedule could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const educatorName = (id: string) => mathsEducators.find((e) => e.id === id)?.name || "—";

  const printSchedule = () => {
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return;
    const sorted = rows.slice().sort((a, b) => a.term - b.term || a.taskCycle.localeCompare(b.taskCycle) || a.className.localeCompare(b.className));
    const body = sorted.map((r) => `
      <tr>
        <td>Term ${r.term}</td><td>${escapeHtml(r.taskCycle)}</td><td>${escapeHtml(r.taskName || "—")}</td>
        <td>${escapeHtml(r.className || "—")}</td><td>${escapeHtml(educatorName(r.teacherId))}</td>
        <td>${escapeHtml(educatorName(r.moderatorId))}</td><td>${escapeHtml(r.moderationDate || "—")}</td><td>${escapeHtml(r.status)}</td>
      </tr>`).join("");
    win.document.write(`<!doctype html><html><head><title>Eagle House Peer Moderation Schedule</title>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        body { font-family: Arial, sans-serif; color:#172033; margin:0; }
        header { border-bottom:3px solid #123b68; padding-bottom:10px; margin-bottom:14px; }
        h1 { margin:0 0 4px; font-size:20px; } h2 { margin:0; font-size:12px; color:#526174; font-weight:normal; }
        .meta { margin:10px 0 14px; font-size:11px; } table { width:100%; border-collapse:collapse; font-size:9.5px; }
        th { background:#e9eff6; color:#172033; text-align:left; } th,td { border:1px solid #b9c3cf; padding:6px; vertical-align:top; }
        footer { margin-top:18px; font-size:9px; color:#667085; display:flex; justify-content:space-between; }
      </style></head><body>
      <header><h1>EAGLE HOUSE SCHOOL — MATHEMATICS DEPARTMENT</h1><h2>Peer Moderation Schedule — ${yearConfig.year}</h2></header>
      <div class="meta">Academic year: <b>${yearConfig.year}</b> &nbsp; | &nbsp; Prepared from the live departmental configuration</div>
      <table><thead><tr><th>Term</th><th>Task Cycle</th><th>Assessment / Task</th><th>Class</th><th>Teacher</th><th>Peer Moderator</th><th>Moderation Date</th><th>Status</th></tr></thead><tbody>${body || '<tr><td colspan="8">No peer moderation assignments have been scheduled.</td></tr>'}</tbody></table>
      <footer><span>Mathematics Department — Peer Moderation Record</span><span>Printed ${new Date().toLocaleDateString("en-ZA")}</span></footer>
      <script>window.onload=function(){window.print();}</script></body></html>`);
    win.document.close();
  };

  return <div className="space-y-5">
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center"><CalendarCheck2 className="w-5 h-5" /></div>
        <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Peer Moderation Schedule</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Assign a Mathematics educator to moderate another educator's class for each term and task cycle.</p></div>
      </div>
      <div className="flex gap-2">
        <button onClick={printSchedule} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"><Printer className="w-4 h-4" /> Print Schedule</button>
        <button onClick={save} disabled={saving} className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Schedule"}</button>
      </div>
    </div>

    <div className="flex items-center justify-between gap-3">
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        {[1,2,3,4].map((term) => <button key={term} onClick={() => setSelectedTerm(term as 1|2|3|4)} className={`px-4 py-2 rounded-lg text-xs font-bold ${selectedTerm===term ? "bg-white dark:bg-slate-700 shadow-sm text-blue-700 dark:text-blue-300" : "text-slate-500"}`}>Term {term}</button>)}
      </div>
      <button onClick={addRow} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Moderation Assignment</button>
    </div>

    {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}

    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
      <table className="w-full min-w-[1180px] text-xs">
        <thead><tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-left">
          <th className="p-3">Task cycle</th><th className="p-3">Task / assessment</th><th className="p-3">Class</th><th className="p-3">Educator</th><th className="p-3">Peer moderator</th><th className="p-3">Curriculum</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Notes</th><th className="p-3"></th>
        </tr></thead>
        <tbody>
          {visibleRows.map((row) => <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800 align-top">
            <td className="p-2"><select value={row.taskCycle} onChange={e=>updateRow(row.id,{taskCycle:e.target.value})} className="w-28 border rounded-lg p-1.5 bg-white dark:bg-slate-950"><option>Task 1</option><option>Task 2</option><option>Task 3</option><option>Task 4</option><option>Task 5</option><option>Task 6</option></select></td>
            <td className="p-2"><input value={row.taskName} onChange={e=>updateRow(row.id,{taskName:e.target.value})} placeholder="e.g. Term 1 Test" className="w-40 border rounded-lg p-1.5 bg-white dark:bg-slate-950" /></td>
            <td className="p-2"><input value={row.className} onChange={e=>updateRow(row.id,{className:e.target.value})} placeholder="e.g. Grade 10A" className="w-32 border rounded-lg p-1.5 bg-white dark:bg-slate-950" /></td>
            <td className="p-2"><select value={row.teacherId} onChange={e=>updateRow(row.id,{teacherId:e.target.value})} className="w-36 border rounded-lg p-1.5 bg-white dark:bg-slate-950"><option value="">Select educator</option>{mathsEducators.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></td>
            <td className="p-2"><select value={row.moderatorId} onChange={e=>updateRow(row.id,{moderatorId:e.target.value})} className="w-36 border rounded-lg p-1.5 bg-white dark:bg-slate-950"><option value="">Select moderator</option>{mathsEducators.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></td>
            <td className="p-2"><select value={row.curriculum} onChange={e=>updateRow(row.id,{curriculum:e.target.value as any})} className="w-28 border rounded-lg p-1.5 bg-white dark:bg-slate-950"><option>IEB</option><option>CAPS</option><option>Cambridge</option></select></td>
            <td className="p-2"><input type="date" value={row.moderationDate} onChange={e=>updateRow(row.id,{moderationDate:e.target.value})} className="w-32 border rounded-lg p-1.5 bg-white dark:bg-slate-950" /></td>
            <td className="p-2"><select value={row.status} onChange={e=>updateRow(row.id,{status:e.target.value as any})} className="w-28 border rounded-lg p-1.5 bg-white dark:bg-slate-950"><option>Scheduled</option><option>Completed</option><option>Cancelled</option></select></td>
            <td className="p-2"><input value={row.notes} onChange={e=>updateRow(row.id,{notes:e.target.value})} placeholder="Optional" className="w-36 border rounded-lg p-1.5 bg-white dark:bg-slate-950" /></td>
            <td className="p-2"><button onClick={()=>removeRow(row.id)} title="Remove assignment" className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
          </tr>)}
          {visibleRows.length===0 && <tr><td colSpan={10} className="p-10 text-center text-slate-400">No peer moderation assignments for Term {selectedTerm}.</td></tr>}
        </tbody>
      </table>
    </div>
    <p className="text-[11px] text-slate-500">Use the same live educator configuration as Department Setup. Changes to educator names or active status are reflected here automatically.</p>
  </div>;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char] || char));
}
