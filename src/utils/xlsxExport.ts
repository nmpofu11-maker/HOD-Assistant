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
