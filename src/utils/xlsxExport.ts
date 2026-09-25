import * as XLSX from "xlsx";
import { PreModerationReport, StaffDeadlineItem, ResultsAnalysisData, StaffMember } from "../types";

export function exportPreModerationXlsx(report: PreModerationReport) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Pre-Moderation Summary & Checklist
  const summaryData = [
    ["EAGLE HOUSE SCHOOL / PRAXIS BORDERLESS LEARNING"],
    ["INTERNAL PRE-MODERATION REPORT"],
    [],
    ["Subject", report.subject, "Code", report.code],
    ["Teacher", report.teacher, "Grade", report.grade],
    ["Moderator", report.moderator, "Level", report.level],
    ["Test Date", report.testDate, "Paper", report.paper],
    ["Test Type", report.testType, "Duration", report.duration],
    ["Total Marks", report.totalMarks, "Overall Outcome", report.overallOutcome],
    [],
    ["MODERATOR GENERAL COMMENTS:"],
    [report.moderatorComments],
    [],
    ["COGNITIVE LEVEL DISTRIBUTION:"],
    ["Lower Order %", report.cognitiveDemandBreakdown.lowerOrderPercent],
    ["Middle Order %", report.cognitiveDemandBreakdown.middleOrderPercent],
    ["Higher Order %", report.cognitiveDemandBreakdown.higherOrderPercent],
    ["Notes", report.cognitiveDemandBreakdown.analysisNotes],
    [],
    ["CHECKLIST EVALUATION (EAGLE HOUSE 12-POINT CRITERIA):"],
    ["#", "Criteria", "Status", "Moderator Comments"],
    ...report.checklist.map((c, idx) => [idx + 1, c.item, c.status, c.comment]),
    [],
    ["OTHER COMMENTS & REMEDIATION:"],
    [report.otherComments],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Pre-Moderation Report");

  XLSX.writeFile(
    wb,
    `Eagle_House_Pre_Mod_${report.subject.replace(/\s+/g, "_")}_Gr${report.grade.replace(/\s+/g, "_")}.xlsx`
  );
}

export function exportDeadlinesXlsx(deadlines: StaffDeadlineItem[]) {
  const wb = XLSX.utils.book_new();

  const data = [
    ["EAGLE HOUSE SCHOOL - MATHEMATICS & MATH LIT DEPARTMENT"],
    ["STAFF ASSESSMENT DEADLINE & MODERATION TRACKER"],
    ["Policy Requirement: Formal assessments submitted 5 school days prior (§7.1)"],
    [],
    [
      "Teacher",
      "Subject",
      "Curriculum",
      "Grade",
      "Task Name",
      "Scheduled Test Date",
      "Pre-Mod Due Date (5 Days Prior)",
      "Pre-Mod Status",
      "Post-Mod Status (10% Sample)",
      "Total Marks",
    ],
    ...deadlines.map((d) => [
      d.teacherName,
      d.subject,
      d.curriculum,
      d.grade,
      d.taskName,
      d.testDate,
      d.preModDueDate,
      d.preModStatus,
      d.postModStatus,
      d.totalMarks,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Staff Deadlines");
  XLSX.writeFile(wb, "Eagle_House_Staff_Assessment_Deadlines.xlsx");
}

export function exportResultsAnalysisXlsx(analysis: ResultsAnalysisData) {
  const wb = XLSX.utils.book_new();

  const overviewData = [
    ["EAGLE HOUSE SCHOOL - ACADEMIC RESULTS ANALYSIS & INTERVENTION REPORT"],
    [`Subject: ${analysis.subject}`, `Grade: ${analysis.grade}`, `Term: ${analysis.term}`],
    [`Assessment: ${analysis.taskName}`, `Cohort: ${analysis.cohortSize} Learners`],
    [`Overall Average: ${analysis.averagePercentage}%`, `Pass Rate: ${analysis.passRatePercentage}%`, `Distinctions: ${analysis.distinctionsCount}`],
    [`Department Status: ${analysis.overallHealth}`],
    [],
    ["EXECUTIVE SUMMARY:"],
    [analysis.executiveSummary],
    [],
    ["STRAND / TOPICAL PERFORMANCE BREAKDOWN:"],
    ["Strand / Topic", "Mastery %"],
    ...Object.entries(analysis.strandPerformance).map(([strand, pct]) => [strand, `${pct}%`]),
    [],
    ["MARKS DISTRIBUTION (LEVELS 1 - 7):"],
    ["Mark Band", "Number of Learners"],
    ...Object.entries(analysis.marksDistribution).map(([band, count]) => [band, count]),
  ];

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, "Results Summary");

  // Sheet 2: Learner Interventions (Appendix 10)
  const interventionData = [
    ["LEARNER INTERVENTION TRACKER (EAGLE HOUSE APPENDIX 10)"],
    ["Learner Name", "Concern", "Evidence", "Targeted Intervention", "Person Responsible", "Review Date", "Outcome Metric"],
    ...analysis.learnerInterventions.map((item) => [
      item.learnerName,
      item.concern,
      item.evidence,
      item.intervention,
      item.responsible,
      item.reviewDate,
      item.outcomeMetric,
    ]),
  ];

  const wsIntervention = XLSX.utils.aoa_to_sheet(interventionData);
  XLSX.utils.book_append_sheet(wb, wsIntervention, "Interventions (Appx 10)");

  XLSX.writeFile(
    wb,
    `Eagle_House_Results_Analysis_${analysis.subject}_Gr${analysis.grade}_${analysis.term.replace(/\s+/g, "_")}.xlsx`
  );
}

export function exportStaffDirectoryXlsx(staffList: StaffMember[]) {
  const wb = XLSX.utils.book_new();

  const rows: any[] = [
    ["EAGLE HOUSE SCHOOL - STAFF ALLOCATION DIRECTORY"],
    ["Teacher Name", "Department", "Curriculum", "Grade", "Subject"],
  ];

  staffList.forEach((staff) => {
    staff.allocations.forEach((alloc) => {
      rows.push([
        staff.name,
        staff.isMathsDept ? "Mathematics & Math Lit" : "General Staff",
        alloc.curriculum,
        alloc.grade,
        alloc.subject,
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Staff Allocations");
  XLSX.writeFile(wb, "Eagle_House_Staff_Allocations.xlsx");
}

export interface SbaStudentRow {
  id: string;
  studentId: string;
  studentName: string;
  taskMarks: Record<string, number>; // taskId -> raw mark achieved
}

export interface SbaSubjectTaskConfig {
  id: string;
  taskTitle: string;
  totalMarks: number;
  weightPercent: number; // e.g. 10% or 25%
}

export function exportSbaMarksheetXlsx(
  subjectName: string,
  gradeName: string,
  curriculum: string,
  teacherName: string,
  tasks: SbaSubjectTaskConfig[],
  students: SbaStudentRow[]
) {
  const wb = XLSX.utils.book_new();

  const isGrade12 = gradeName.includes("12");
  const sbaPct = isGrade12 ? 25 : 40;
  const examPct = isGrade12 ? 75 : 60;
  const weightingDesc = `SBA Weighting: ${sbaPct}% Promotion Pool / ${examPct}% Examination`;

  // Header information
  const header = [
    ["EAGLE HOUSE SCHOOL - SECONDARY DEPARTMENT"],
    ["OFFICIAL SCHOOL-BASED ASSESSMENT (SBA) MARKSHEET"],
    [`Subject: ${subjectName}`, `Grade: ${gradeName}`, `Curriculum: ${curriculum}`, `Teacher: ${teacherName}`],
    [`Date Generated: ${new Date().toLocaleDateString("en-ZA")}`, weightingDesc],
    [],
  ];

  // Column Headers
  // Col A: Student ID, Col B: Student Name, Col C.. : Tasks, Col N: Raw Total, Col N+1: SBA Weighted Total, Col N+2: Level Code
  const taskTitles = tasks.map((t) => `${t.taskTitle} (Max ${t.totalMarks} | Wt ${t.weightPercent}%)`);
  const tableHeaders = ["Student ID", "Student Name", ...taskTitles, "Total Raw Marks", "SBA Weighted %", "Achievement Level Code"];

  const rows: any[] = [...header, tableHeaders];

  // Starting row index in Excel (1-based index)
  // header is 5 rows + 1 row tableHeaders = 6th row is header, data starts at row 7
  const startRow = 7;

  students.forEach((s, idx) => {
    const rowNum = startRow + idx;

    // Build raw task cells
    const taskValues = tasks.map((t) => s.taskMarks[t.id] ?? 0);

    // Calculate column letters
    // Col A = Student ID (1)
    // Col B = Student Name (2)
    // Col C = First Task (3) ...
    const firstTaskColLetter = "C";
    const lastTaskColLetter = String.fromCharCode(67 + tasks.length - 1);
    const rawTotalColLetter = String.fromCharCode(67 + tasks.length);
    const sbaWeightedColLetter = String.fromCharCode(67 + tasks.length + 1);

    // Formulate Excel formula for Raw Sum
    const sumFormula = `SUM(${firstTaskColLetter}${rowNum}:${lastTaskColLetter}${rowNum})`;

    // Formulate Excel formula for SBA Weighted Score
    // Weight calculation: SUM( (Mark_i / Max_i) * Weight_i )
    const weightedParts = tasks.map((t, tIdx) => {
      const colLet = String.fromCharCode(67 + tIdx);
      return `(${colLet}${rowNum}/${t.totalMarks})*${t.weightPercent}`;
    });
    const sbaFormula = `ROUND(${weightedParts.join("+")}, 1)`;

    // Formulate Excel IF formula for CAPS/IEB Achievement Levels (Levels 1-7)
    const levelFormula = `IF(${sbaWeightedColLetter}${rowNum}>=80,"Level 7 (Outstanding)",IF(${sbaWeightedColLetter}${rowNum}>=70,"Level 6 (Meritorious)",IF(${sbaWeightedColLetter}${rowNum}>=60,"Level 5 (Substantial)",IF(${sbaWeightedColLetter}${rowNum}>=50,"Level 4 (Moderate)",IF(${sbaWeightedColLetter}${rowNum}>=40,"Level 3 (Adequate)",IF(${sbaWeightedColLetter}${rowNum}>=30,"Level 2 (Elementary)","Level 1 (Not Achieved)"))))))`;

    // Row array with cell formula objects
    const rowCells: any[] = [
      s.studentId,
      s.studentName,
      ...taskValues,
      { f: sumFormula },
      { f: sbaFormula },
      { f: levelFormula },
    ];

    rows.push(rowCells);
  });

  // Add formula legend below the table
  rows.push([]);
  rows.push(["SBA FORMULA & SUBJECT WEIGHTING SPECIFICATION:"]);
  tasks.forEach((t) => {
    rows.push([`• ${t.taskTitle}: Max Marks = ${t.totalMarks}, Internal Weight = ${t.weightPercent}%`]);
  });
  rows.push(["• SBA Weighted % Formula = SUM( (Task_Mark / Max_Mark) * Task_Weight )"]);
  rows.push(["• Level 7 (80-100%), Level 6 (70-79%), Level 5 (60-69%), Level 4 (50-59%), Level 3 (40-49%), Level 2 (30-39%), Level 1 (0-29%)"]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "SBA Marksheet");

  XLSX.writeFile(
    wb,
    `Eagle_House_SBA_Marksheet_${subjectName.replace(/\s+/g, "_")}_Gr${gradeName.replace(/\s+/g, "_")}.xlsx`
  );
}

export function exportPoaSummaryXlsx(poaData: {
  subject: string;
  grade: string;
  framework: string;
  examiner: string;
  moderator: string;
  annualSbaWeightPercent: number;
  annualExamWeightPercent: number;
  tasks: Array<{
    term: number;
    taskTitle: string;
    taskType: string;
    durationMinutes: number;
    totalMarks: number;
    internalSbaWeightPercent: number;
    annualPromotionWeightPercent: number;
    cognitiveWeighting: { knowledge: number; routineProcedures: number; complexProcedures: number; problemSolving: number };
    policyReference: string;
  }>;
}) {
  const wb = XLSX.utils.book_new();

  const data = [
    ["EAGLE HOUSE SCHOOL / PRAXIS BORDERLESS LEARNING"],
    ["PROGRAMME OF ASSESSMENT (POA) & SUBJECT ASSESSMENT SUMMARY"],
    [],
    ["Subject & Stream", `${poaData.subject} (${poaData.framework})`, "Grade", poaData.grade],
    ["Educator", poaData.examiner, "HOD Moderator", poaData.moderator],
    ["Annual SBA Contribution %", `${poaData.annualSbaWeightPercent}%`, "Final Exam Contribution %", `${poaData.annualExamWeightPercent}%`],
    [],
    [
      "Term",
      "Formal Assessment Task",
      "Task Type",
      "Duration (Mins)",
      "Total Raw Marks",
      "SBA Internal Weight %",
      "Annual Promotion Weight %",
      "Lower Order % (Knowledge)",
      "Routine Procedures %",
      "Complex Procedures %",
      "Problem Solving %",
      "Policy Directives Reference",
    ],
    ...poaData.tasks.map((t) => [
      `Term ${t.term}`,
      t.taskTitle,
      t.taskType,
      t.durationMinutes,
      t.totalMarks,
      `${t.internalSbaWeightPercent}%`,
      `${t.annualPromotionWeightPercent}%`,
      `${t.cognitiveWeighting.knowledge}%`,
      `${t.cognitiveWeighting.routineProcedures}%`,
      `${t.cognitiveWeighting.complexProcedures}%`,
      `${t.cognitiveWeighting.problemSolving}%`,
      t.policyReference,
    ]),
    [],
    ["ASSESSMENT GOVERNANCE & MODERATION POLICIES:"],
    ["• §7.1 Pre-Assessment Moderation: Submitted to HOD 5 school days prior with memo and cognitive grid."],
    ["• §7.2 Post-Assessment Moderation: 10% stratified purple pen sample (Top, Average, Weak) audited within 5 days."],
    ["• Aligned with DBE CAPS ATPs and IEB Subject Assessment Guidelines (SAGs)."],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Programme of Assessment");

  XLSX.writeFile(
    wb,
    `Eagle_House_POA_Summary_${poaData.subject.replace(/\s+/g, "_")}_Gr${poaData.grade.replace(/\s+/g, "_")}.xlsx`
  );
}
