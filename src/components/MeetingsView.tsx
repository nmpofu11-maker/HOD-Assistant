import React, { useState } from "react";
import {
  ClipboardList,
  Calendar,
  Clock,
  Users,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  RotateCcw,
  ListOrdered,
  Send,
} from "lucide-react";
import { MeetingRecord, StaffMember } from "../types";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType } from "docx";

interface MeetingsViewProps {
  staffList: StaffMember[];
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({ staffList }) => {
  const [activeTab, setActiveTab] = useState<"scheduled" | "generate" | "actions">("scheduled");

  // Generator inputs
  const [meetingTitle, setMeetingTitle] = useState("Term 1 Cycle 2 Mathematics Department Meeting");
  const [meetingDate, setMeetingDate] = useState("2026-03-12");
  const [startTime, setStartTime] = useState("14:30");
  const [endTime, setEndTime] = useState("15:45");
  const [meetingType, setMeetingType] = useState<"Regular Departmental" | "Pre-Moderation Calibration" | "Post-Exam Review" | "Urgent / Escalation">("Regular Departmental");
  const [customFocus, setCustomFocus] = useState("Pre-moderation calibration for upcoming Grade 10-12 Term 1 Control Tests, ATP pacing check, and Appendix 10 intervention reviews.");
  const [isGenerating, setIsGenerating] = useState(false);

  // Active meeting records
  const [meetings, setMeetings] = useState<MeetingRecord[]>([
    {
      id: "MTG-2026-01",
      title: "Term 1 Launch & Curriculum Pacing Alignment",
      date: "2026-01-22",
      startTime: "14:30",
      endTime: "15:45",
      meetingType: "Regular Departmental",
      attendees: ["Mpofu (HOD)", "Shingi", "Reggie", "Luthando"],
      apologies: [],
      agendaPoints: [
        { pointNumber: 1, title: "Welcome and Apologies", notes: "Welcome to 2026 academic year. All members present." },
        { pointNumber: 2, title: "Matters Arising from Previous Minutes", notes: "Previous SBA marks successfully archived with IEB." },
        { pointNumber: 3, title: "Curriculum and Syllabus Coverage", notes: "Reviewed CAPS ATPs (Gr 8-9) and IEB SAGS (Gr 10-12). Pacing calibrated." },
        { pointNumber: 4, title: "Assessment and Moderation", notes: "Reinforced Eagle House 5-day pre-moderation rule (§7.1) and 10% purple pen sample (§7.2)." },
        { pointNumber: 5, title: "Learner Performance and Interventions", notes: "Baseline testing scheduled for Week 2 to identify at-risk learners early." },
        { pointNumber: 6, title: "Teaching and Learning Practice / Professional Development", notes: "Scheduled peer learning walks with focus on conceptual questioning." },
        { pointNumber: 7, title: "Department Administration and Deadlines", notes: "Shared 2026 assessment calendar. Teachers to submit draft task dates by Friday." },
        { pointNumber: 8, title: "Resources and Technology", notes: "Graphing software and scientific calculators inventory checked." },
        { pointNumber: 9, title: "Matters for Escalation to Senior Leadership", notes: "Classroom M3 whiteboards require maintenance." },
        { pointNumber: 10, title: "Any Other Business (AOB) & Date of Next Meeting", notes: "Next meeting scheduled for 12 March 2026." },
      ],
      actionItems: [
        { id: "ACT-1", description: "Submit Term 1 formal test draft 5 days prior to assessment date (§7.1)", responsible: "Shingi & Reggie", deadline: "2026-02-28", status: "In Progress" },
        { id: "ACT-2", description: "Collate Baseline test diagnostics for Grade 8-10 into Appendix 10 tracker", responsible: "Mpofu", deadline: "2026-02-05", status: "Completed" },
        { id: "ACT-3", description: "Update Cambridge Lower Secondary scheme of work for Checkpoint", responsible: "Reggie", deadline: "2026-02-15", status: "Completed" },
      ],
      minutesSummary: "Department aligned on assessment standards, verified 5-day submission deadline compliance, and set up the 2026 curriculum tracker.",
      status: "Completed",
    },
  ]);

  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecord>(meetings[0]);

  // Generate automated agenda using AI
  const handleGenerateAgenda = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/meetings/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingTitle,
          meetingDate,
          startTime,
          endTime,
          meetingType,
          specificFocus: customFocus,
          previousActionItems: selectedMeeting.actionItems,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      const newRecord: MeetingRecord = {
        id: `MTG-${Date.now()}`,
        title: data.meeting.title || meetingTitle,
        date: data.meeting.date || meetingDate,
        startTime,
        endTime,
        meetingType,
        attendees: data.meeting.attendees || ["Mpofu (HOD)", "Shingi", "Reggie", "Luthando"],
        apologies: [],
        agendaPoints: data.meeting.agendaPoints || [],
        actionItems: data.meeting.actionItems || [],
        minutesSummary: data.meeting.minutesSummary || "Automated professional draft prepared for department review.",
        status: "Draft",
      };

      setMeetings([newRecord, ...meetings]);
      setSelectedMeeting(newRecord);
      setActiveTab("scheduled");
    } catch (err: any) {
      alert("Failed to generate meeting agenda: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export Meeting to Word Document
  const exportMeetingDocx = async (record: MeetingRecord) => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "EAGLE HOUSE SCHOOL", bold: true, size: 30, color: "1A365D" }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "praxis BORDERLESS LEARNING", bold: true, size: 22, color: "4A5568" }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: `DEPARTMENT OF MATHEMATICS & MATHEMATICAL LITERACY\n${record.title.toUpperCase()}`,
                  bold: true,
                  size: 24,
                  underline: {},
                  color: "2B6CB0",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Date: ${record.date} | Time: ${record.startTime} - ${record.endTime} | Venue: Department Office`, bold: true, size: 20 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Attendees: ${record.attendees.join(", ")}`, size: 20 }),
              ],
            }),
            new Paragraph({ spacing: { before: 200, after: 100 }, text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "STANDARDIZED 10-POINT DEPARTMENT AGENDA & MINUTES:", bold: true, size: 24 }),
              ],
            }),
            ...record.agendaPoints.map(
              (pt: any) =>
                new Paragraph({
                  spacing: { before: 100 },
                  children: [
                    new TextRun({ text: `${pt.pointNumber}. ${pt.title}: `, bold: true, size: 20, color: "1A365D" }),
                    new TextRun({ text: pt.notes || "Discussed and recorded.", size: 20 }),
                  ],
                })
            ),
            new Paragraph({ spacing: { before: 200, after: 100 }, text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "ACTION ITEMS & ACCOUNTABILITY TRACKER:", bold: true, size: 22, color: "C53030" }),
              ],
            }),
            ...record.actionItems.map(
              (act: any) =>
                new Paragraph({
                  bullet: { level: 0 },
                  children: [
                    new TextRun({ text: `${act.description} `, size: 20 }),
                    new TextRun({ text: `[Responsible: ${act.responsible} | Deadline: ${act.deadline} | Status: ${act.status}]`, bold: true, size: 18, color: "4A5568" }),
                  ],
                })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Eagle_House_Maths_Meeting_${record.date}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle action status
  const toggleActionStatus = (actionId: string) => {
    const updated = {
      ...selectedMeeting,
      actionItems: selectedMeeting.actionItems.map((item: any) => {
        if (item.id === actionId) {
          const nextStatus =
            item.status === "Pending"
              ? "In Progress"
              : item.status === "In Progress"
              ? "Completed"
              : "Pending";
          return { ...item, status: nextStatus as any };
        }
        return item;
      }),
    };
    setSelectedMeeting(updated);
    setMeetings(meetings.map((m) => (m.id === updated.id ? updated : m)));
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-700" />
            Department Meetings, 10-Point Agendas & Minutes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated alignment with Eagle House School calendar, ATP pacing milestones, and 5-day assessment pre-moderation deadlines.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "scheduled"
                ? "bg-white text-blue-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Meeting Minutes & Agendas
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "generate"
                ? "bg-white text-blue-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            + Generate New Agenda
          </button>
          <button
            onClick={() => setActiveTab("actions")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "actions"
                ? "bg-white text-blue-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Action Tracker ({selectedMeeting.actionItems.length})
          </button>
        </div>
      </div>

      {activeTab === "scheduled" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Meetings List */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Department Meeting Records
            </span>
            {meetings.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMeeting(m)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedMeeting.id === m.id
                    ? "bg-blue-50/70 border-blue-300 shadow-xs"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{m.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.status === "Completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {m.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {m.startTime} - {m.endTime}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 line-clamp-2">{m.minutesSummary}</p>
              </div>
            ))}
          </div>

          {/* Right Column: Active Meeting Document */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedMeeting.title}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                  <span>
                    <strong>Date:</strong> {selectedMeeting.date} ({selectedMeeting.startTime} - {selectedMeeting.endTime})
                  </span>
                  <span>
                    <strong>Attendees:</strong> {selectedMeeting.attendees.join(", ")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportMeetingDocx(selectedMeeting)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Word (.docx)</span>
                </button>
              </div>
            </div>

            {/* Standard 10-point agenda layout */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-blue-600" />
                Standard 10-Point Department Agenda & Minutes
              </h3>

              <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 text-xs">
                {selectedMeeting.agendaPoints.map((pt: any) => (
                  <div key={pt.pointNumber} className="p-3.5 hover:bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">
                        {pt.pointNumber}. {pt.title}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed pl-4 border-l-2 border-blue-200">
                      {pt.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Action Items Agreed & Assigned:</span>
                <span className="text-[11px] text-slate-500 lowercase font-normal">
                  click checkbox to update completion
                </span>
              </h4>

              <div className="space-y-2">
                {selectedMeeting.actionItems.map((act: any) => (
                  <div
                    key={act.id}
                    onClick={() => toggleActionStatus(act.id)}
                    className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={act.status === "Completed"}
                        readOnly
                        className="rounded text-blue-600 pointer-events-none"
                      />
                      <span
                        className={`font-medium ${
                          act.status === "Completed" ? "line-through text-slate-400" : "text-slate-800"
                        }`}
                      >
                        {act.description}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="font-semibold text-slate-700">{act.responsible}</span>
                      <span className="text-slate-500 font-mono">{act.deadline}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          act.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : act.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generator Tab */}
      {activeTab === "generate" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Automated 10-Point Agenda & Minutes Generator
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Synthesizes upcoming assessment dates, ATP pacing milestones, and outstanding action items into an official Eagle House meeting agenda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Meeting Title</label>
              <input
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Meeting Date</label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Meeting Type</label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Regular Departmental">Regular Departmental</option>
                <option value="Pre-Moderation Calibration">Pre-Moderation Calibration</option>
                <option value="Post-Exam Review">Post-Exam Review</option>
                <option value="Urgent / Escalation">Urgent / Escalation</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Context, Pacing Focus & Specific Discussion Items
              </label>
              <textarea
                rows={3}
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 text-xs"
                placeholder="Mention upcoming assessment dates, ATP topics to review, or specific teacher concerns..."
              />
            </div>
          </div>

          <button
            onClick={handleGenerateAgenda}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Generating Comprehensive 10-Point Agenda & Discussion Prompts...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Agenda & Minutes Draft</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Action Tracker Tab */}
      {activeTab === "actions" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Department Action Tracker & Accountability Reminders
              </h2>
              <p className="text-xs text-slate-500">
                Action points agreed in department meetings are tracked through completion.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-3">Action Description</th>
                  <th className="p-3">Person Responsible</th>
                  <th className="p-3">Deadline</th>
                  <th className="p-3">Meeting Source</th>
                  <th className="p-3">Completion Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {meetings.flatMap((m: MeetingRecord) =>
                  m.actionItems.map((act: any) => (
                    <tr key={act.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-medium text-slate-900">{act.description}</td>
                      <td className="p-3 font-semibold text-slate-700">{act.responsible}</td>
                      <td className="p-3 font-mono text-slate-600">{act.deadline}</td>
                      <td className="p-3 text-[11px] text-slate-500">{m.title}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            act.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : act.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
