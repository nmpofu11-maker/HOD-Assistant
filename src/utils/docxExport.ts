import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun,
} from "docx";
import { PreModerationReport, PostModerationReport, ResultsAnalysisData } from "../types";

// Official Eagle House color-palette hex values
const FOREST_GREEN = "1F4D3D";
const TERRACOTTA = "C2703A";
const DARK_CHARCOAL = "16181C";
const SLATE_MUTED = "5F6670";
const ALABASTER_BG = "F6F5F2";
const BORDER_GREY = "DFDCD5";

// Helper: Custom Table Cell with precise padding, borders, alignment and shading
function createCell(
  text: string,
  bold = false,
  widthPercent = 25,
  bgHex?: string,
  align: any = AlignmentType.LEFT,
  textColor = "000000",
  fontSize = 18 // 9pt
): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: bgHex ? { fill: bgHex } : undefined,
    margins: { top: 120, bottom: 120, left: 150, right: 150 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GREY },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GREY },
      left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GREY },
      right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GREY },
    },
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text,
            bold,
            size: fontSize,
            font: "Calibri",
            color: textColor,
          }),
        ],
      }),
    ],
  });
}

// Fetch school logo as ArrayBuffer dynamically in the browser for word document embedding
async function fetchLogoArrayBuffer(): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch("/assets/eagle_house_logo.jpg");
    if (!response.ok) {
      const fallback = await fetch("/public/assets/eagle_house_logo.jpg");
      if (!fallback.ok) return null;
      return await fallback.arrayBuffer();
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.error("Failed to fetch eagle_house_logo.jpg for word generation:", error);
    return null;
  }
}

// Helper: Borderless Header Table matching the Eagle House letterhead & exact logo alignment
function createEagleHouseHeader(title: string, logoBuffer?: ArrayBuffer | null): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: FOREST_GREEN },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            margins: { bottom: 150 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "EAGLE HOUSE SCHOOL",
                    bold: true,
                    size: 30, // 15pt
                    font: "Georgia",
                    color: FOREST_GREEN,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Exaltus Futuri",
                    italics: true,
                    size: 16, // 8pt
                    font: "Georgia",
                    color: SLATE_MUTED,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            margins: { bottom: 150 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  ...(logoBuffer ? [
                    new ImageRun({
                      data: logoBuffer,
                      transformation: {
                        width: 50,
                        height: 50,
                      },
                      type: "jpg",
                    }),
                    new TextRun({ text: "\n", size: 10 }),
                  ] : []),
                  new TextRun({
                    text: "Admissions Office: admissions@eaglehouse.co.za\n" +
                          "Address: 73 Lawrence Road, Poortview, 2040\n" +
                          "P.O. Box: 2980, Krugersdorp, 1740\n" +
                          "General Enquiries: 010 590 0680",
                    size: 14, // 7pt
                    font: "Calibri",
                    color: SLATE_MUTED,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      // Row to house document title below the border line
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnSpan: 2,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 150 },
                children: [
                  new TextRun({
                    text: title.toUpperCase(),
                    bold: true,
                    size: 24, // 12pt
                    font: "Georgia",
                    color: DARK_CHARCOAL,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// Helper: Standard corporate governance footer matching OCR
function createEagleHouseFooter(): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 100 },
    children: [
      new TextRun({
        text: "Eagle House School (PTY) LTD | Registration number: 2008/015678/07 | GDE Registration Number: 400287 |\n" +
          "UMALUSI Accreditation number: 19 SCHO1. 00697 | Directors: MEESKE Ronald; MOIR James J; BOTES Lynn",
        size: 12, // 6pt
        font: "Calibri",
        color: SLATE_MUTED,
      }),
    ],
  });
}

/**
 * 1. HIGH-FIDELITY PRE-ASSESSMENT MODERATION REPORT EXPORT
 * Populates exact Sections 1 to 4 and cognitive demand metrics matching uploaded formats.
 */
export async function exportPreModerationDocx(report: PreModerationReport) {
  const isCambridge = report.level === "Cambridge" || report.subject.toLowerCase().includes("cambridge");
  const logoBuffer = await fetchLogoArrayBuffer();

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Letterhead & Document Title
          createEagleHouseHeader("Internal Pre-Assessment Moderation Report", logoBuffer),

          new Paragraph({ spacing: { before: 100 } }),

          // Exact Metadata Grid
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Name of School:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell("Eagle House School and Praxis", false, 75, "", AlignmentType.LEFT, DARK_CHARCOAL),
                ],
              }),
              new TableRow({
                children: [
                  createCell("District / Affiliation:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell("District 12 | " + (isCambridge ? "Cambridge International" : "IEB"), false, 25),
                  createCell("Subject & Paper:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(report.subject + " - " + report.paper, false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Grade / Class:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(report.grade, false, 25),
                  createCell("Assessment Type:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(report.testType, false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Examiner / Teacher:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(report.teacher, false, 25),
                  createCell("Moderator Name:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(report.moderator, false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Date of Moderation:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(report.testDate || new Date().toISOString().split("T")[0], false, 25),
                  createCell("Total Marks & Time:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(`${report.totalMarks} Marks (${report.duration})`, false, 25),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Evaluation Criteria Table (Technical, Content, Guidelines, Inclusivity)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("CRITERION / INTERNAL STANDARDS CHECKLIST", true, 60, FOREST_GREEN, AlignmentType.LEFT, "FFFFFF", 20),
                  createCell("COMPLIANCE", true, 15, FOREST_GREEN, AlignmentType.CENTER, "FFFFFF", 20),
                  createCell("COMMENTS & SPECIFIC RECOMMENDATIONS", true, 25, FOREST_GREEN, AlignmentType.LEFT, "FFFFFF", 20),
                ],
              }),
              ...report.checklist.map((c) => {
                const statusSymbol = c.status === "Yes" ? "☒ Yes  ☐ No" : c.status === "No" ? "☐ Yes  ☒ No" : "☐ Yes  ☐ No (Partial)";
                return new TableRow({
                  children: [
                    createCell(c.item, false, 60),
                    createCell(statusSymbol, false, 15, "", AlignmentType.CENTER, DARK_CHARCOAL, 16),
                    createCell(c.comment || "Meets standard requirements.", false, 25, "", AlignmentType.LEFT, SLATE_MUTED),
                  ],
                });
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Cognitive Demands Analysis Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("COGNITIVE LEVEL DISTRIBUTION ANALYSIS", true, 100, "EDF2F7", AlignmentType.LEFT, FOREST_GREEN, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell(
                    `Lower-Order Cognitive Skills: ${report.cognitiveDemandBreakdown.lowerOrderPercent}%  |  ` +
                    `Middle-Order Application: ${report.cognitiveDemandBreakdown.middleOrderPercent}%  |  ` +
                    `Higher-Order / Problem Solving: ${report.cognitiveDemandBreakdown.higherOrderPercent}%\n\n` +
                    `Specific Moderator Notes: ${report.cognitiveDemandBreakdown.analysisNotes}`,
                    false,
                    100,
                    "",
                    AlignmentType.LEFT,
                    DARK_CHARCOAL,
                    18
                  ),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Overall Moderation Outcome Panel
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("OVERALL MODERATION OUTCOME STATUS", true, 100, "FEEBC8", AlignmentType.LEFT, TERRACOTTA, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell(
                    `Verdict: ${report.overallOutcome}\n` +
                    `Feedback: ${report.moderatorComments}\n\n` +
                    (report.requiredCorrections.length > 0
                      ? `Required Amendments:\n` + report.requiredCorrections.map((corr, idx) => `  ${idx + 1}. ${corr}`).join("\n")
                      : `Status: Approved. Ready for duplication and distribution.`),
                    false,
                    100,
                    "",
                    AlignmentType.LEFT,
                    DARK_CHARCOAL,
                    18
                  ),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 250 } }),

          // Sign-off Grid
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("SIGN-OFF REPRESENTATION", true, 30, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell("DATE", true, 20, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell("TEACHER SIGNATURE", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell("MODERATOR SIGNATURE", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Moderation First Draft", false, 30),
                  createCell(report.firstDraftSignOff.date, false, 20),
                  createCell(report.firstDraftSignOff.teacherSignature, false, 25),
                  createCell(report.firstDraftSignOff.moderatorSignature, false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Moderation Final Sign-Off", false, 30),
                  createCell(report.finalSignOff.date, false, 20),
                  createCell(report.finalSignOff.teacherSignature, false, 25),
                  createCell(report.finalSignOff.moderatorSignature, false, 25),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 300 } }),
          createEagleHouseFooter(),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Pre_Assessment_Moderation_${report.subject.replace(/\s+/g, "_")}_Gr${report.grade.replace(/\s+/g, "_")}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 2. HIGH-FIDELITY POST-ASSESSMENT MODERATION REPORT EXPORT
 * Outputs exact 10% sampling grid, sampling checkboxes, and adjustments summary matching uploaded PDF layout.
 */
export async function exportPostModerationDocx(report: PostModerationReport) {
  const logoBuffer = await fetchLogoArrayBuffer();
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Letterhead & Title
          createEagleHouseHeader("Internal Post-Assessment Moderation Report", logoBuffer),

          new Paragraph({ spacing: { before: 100 } }),

          // Exact Metadata Grid
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Name of School:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell("Eagle House School and Praxis", false, 75, "", AlignmentType.LEFT, DARK_CHARCOAL),
                ],
              }),
              new TableRow({
                children: [
                  createCell("District:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell("12", false, 25),
                  createCell("Subject:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(report.subject, false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Grade:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(report.grade, false, 25),
                  createCell("Term:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell("Term 1 / Term 3 Progress", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Task Number:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(report.id.substring(0, 10), false, 25),
                  createCell("Task Description:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(report.taskTitle, false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Name of Teacher:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(report.teacher, false, 25),
                  createCell("Name of Moderator:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(report.moderator, false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Date of Moderation:", true, 25, ALABASTER_BG, AlignmentType.LEFT, FOREST_GREEN),
                  createCell(report.createdAt.split("T")[0], false, 75),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 150 } }),

          // Moderation Sampling Details (Checkboxes per scanned document)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Moderation Sampling Details (Eagle House Policy 7.2)", true, 100, "EDF2F7", AlignmentType.LEFT, FOREST_GREEN, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell(
                    `Number of scripts moderated: ${report.sampleCompliance.sampleCount} out of ${report.sampleCompliance.totalScripts} total candidates (${report.sampleCompliance.percentageSampled}%)\n\n` +
                    `Sampling method utilized:\n` +
                    `  ☒ Stratified sample (high / middle / low marks)\n` +
                    `  ☐ Random sample\n` +
                    `  ☐ All scripts where mark was borderline / uncertain\n` +
                    `  ☐ Full set moderated (if small cohort)\n` +
                    `  ☐ Other: _________________________________`,
                    false,
                    100,
                    "",
                    AlignmentType.LEFT,
                    DARK_CHARCOAL,
                    18
                  ),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Moderation Comparison Table (Columns matching OCR)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("CANDIDATE NAME AND SURNAME", true, 25, FOREST_GREEN, AlignmentType.LEFT, "FFFFFF", 18),
                  createCell("ORIGINAL MARK", true, 12, FOREST_GREEN, AlignmentType.CENTER, "FFFFFF", 18),
                  createCell("MODERATED MARK", true, 15, FOREST_GREEN, AlignmentType.CENTER, "FFFFFF", 18),
                  createCell("DIFF", true, 10, FOREST_GREEN, AlignmentType.CENTER, "FFFFFF", 18),
                  createCell("REASON FOR DIFFERENCE", true, 25, FOREST_GREEN, AlignmentType.LEFT, "FFFFFF", 18),
                  createCell("ADJUSTMENT (Y/N)", true, 13, FOREST_GREEN, AlignmentType.CENTER, "FFFFFF", 18),
                ],
              }),
              ...report.scriptFindings.map((s) => {
                const diff = s.moderatedMark - s.originalMark;
                const adjustment = diff !== 0 ? "Yes" : "No";
                return new TableRow({
                  children: [
                    createCell(s.learnerCode, false, 25),
                    createCell(String(s.originalMark), false, 12, "", AlignmentType.CENTER),
                    createCell(String(s.moderatedMark), false, 15, "", AlignmentType.CENTER),
                    createCell(diff > 0 ? `+${diff}` : String(diff), false, 10, "", AlignmentType.CENTER),
                    createCell(s.auditNotes || "Consistent markings.", false, 25),
                    createCell(adjustment, false, 13, "", AlignmentType.CENTER),
                  ],
                });
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Overall Moderation Outcome
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("OVERALL MODERATION OUTCOME", true, 100, "EDF2F7", AlignmentType.LEFT, FOREST_GREEN, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell(
                    `Select Outcome:\n` +
                    `  ${report.markingQualityVerdict === "Marks Upheld" ? "☒" : "☐"} Marking was consistent and accurate – no adjustments required.\n` +
                    `  ${report.markingQualityVerdict === "Minor Adjustments Applied" ? "☒" : "☐"} Minor inconsistencies found – adjustments applied to affected candidates / questions (details below).\n` +
                    `  ${report.markingQualityVerdict === "Remark Required Across Cohort" ? "☒" : "☐"} Significant inconsistencies found – full re-mark of selected question(s) completed.\n` +
                    `  ☐ Marking standard requires major review – task to be re-moderated or discussed at departmental level.`,
                    false,
                    100,
                    "",
                    AlignmentType.LEFT,
                    DARK_CHARCOAL,
                    18
                  ),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Adjustments Summary (if any)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("ADJUSTMENTS SUMMARY (IF ANY)", true, 100, "FEEBC8", AlignmentType.LEFT, TERRACOTTA, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell(
                    `• Question(s) / section(s) affected: ${report.commonErrorTrends.slice(0, 2).join(", ") || "None"}\n` +
                    `• Nature of adjustment: ${report.markingAccuracySummary}\n` +
                    `• Total candidates affected: ${report.markingQualityVerdict !== "Marks Upheld" ? report.sampleCompliance.sampleCount : "0"}\n` +
                    `• Evidence of adjustment applied to mark list / SASM / mark book: Yes\n\n` +
                    `Remediation Action Plan: ${report.actionPlanForTeacher}`,
                    false,
                    100,
                    "",
                    AlignmentType.LEFT,
                    DARK_CHARCOAL,
                    18
                  ),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 250 } }),

          // Sign-offs at the bottom matching Page 2
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Moderator Signature: _______________________", true, 50, "", AlignmentType.LEFT, DARK_CHARCOAL, 18),
                  createCell("Educator Signature: _______________________", true, 50, "", AlignmentType.LEFT, DARK_CHARCOAL, 18),
                ],
              }),
              new TableRow({
                children: [
                  createCell(`Date: ${report.createdAt.split("T")[0]}`, false, 100, "", AlignmentType.LEFT, SLATE_MUTED, 16),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),
          createEagleHouseFooter(),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Post_Assessment_Moderation_${report.subject.replace(/\s+/g, "_")}_Gr${report.grade.replace(/\s+/g, "_")}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 3. HIGH-FIDELITY RESULTS DIAGNOSTIC ANALYSIS REPORT EXPORT (POST-TEST DIAGNOSTIC ANALYSIS)
 * Implements sections 1, 2, 3 and 4 of the Post-Test Diagnostic Analysis form perfectly.
 */
export async function exportResultsAnalysisDocx(analysis: ResultsAnalysisData) {
  const logoBuffer = await fetchLogoArrayBuffer();
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Letterhead & Title
          createEagleHouseHeader("Post-Test Diagnostic Analysis", logoBuffer),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "This tool is designed for educators to analyse learner performance after a test and plan targeted interventions.",
                italics: true,
                size: 16,
                color: SLATE_MUTED,
              }),
            ],
          }),

          // Section 1: Test Information
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("1. TEST INFORMATION", true, 100, FOREST_GREEN, AlignmentType.LEFT, "FFFFFF", 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Date", true, 25, ALABASTER_BG),
                  createCell(new Date().toLocaleDateString("en-ZA"), false, 75),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Test Name", true, 25, ALABASTER_BG),
                  createCell(analysis.taskName, false, 75),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Grade", true, 25, ALABASTER_BG),
                  createCell(analysis.grade, false, 75),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Educator", true, 25, ALABASTER_BG),
                  createCell("HOD Mpofu / Subject Team", false, 75),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Subject", true, 25, ALABASTER_BG),
                  createCell(analysis.subject, false, 75),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Section 2: Class Performance Summary
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("2. CLASS PERFORMANCE SUMMARY", true, 100, FOREST_GREEN, AlignmentType.LEFT, "FFFFFF", 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Total Learners", true, 35, ALABASTER_BG),
                  createCell(String(analysis.cohortSize), false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Average (%)", true, 35, ALABASTER_BG),
                  createCell(`${analysis.averagePercentage}%`, false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Pass Rate (%)", true, 35, ALABASTER_BG),
                  createCell(`${analysis.passRatePercentage}%`, false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Distinctions Count (Level 7)", true, 35, ALABASTER_BG),
                  createCell(String(analysis.distinctionsCount), false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Overall Health Verdict", true, 35, ALABASTER_BG),
                  createCell(analysis.overallHealth, true, 65, "", AlignmentType.LEFT, TERRACOTTA),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Section 3: Performance Breakdown
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("3. PERFORMANCE BREAKDOWN (Key Topics & Observed Gaps)", true, 100, FOREST_GREEN, AlignmentType.LEFT, "FFFFFF", 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Question / Skill / Strand", true, 40, "EDF2F7", AlignmentType.LEFT, FOREST_GREEN),
                  createCell("Common Errors & Pedagogical Fixes", true, 60, "EDF2F7", AlignmentType.LEFT, FOREST_GREEN),
                ],
              }),
              ...analysis.criticalGaps.map((gap) => (
                new TableRow({
                  children: [
                    createCell(gap.strand, true, 40),
                    createCell(
                      `Weakness: ${gap.observedWeakness}\n` +
                      `Root Cause: ${gap.rootCause}\n` +
                      `Action Fix: ${gap.pedagogicalFix}`,
                      false,
                      60
                    ),
                  ],
                })
              )),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Section 4: Learner Support / Intervention Plan
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("4. LEARNER SUPPORT / INTERVENTION PLAN (Appendix 10)", true, 100, FOREST_GREEN, AlignmentType.LEFT, "FFFFFF", 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Learner Name", true, 20, "EDF2F7", AlignmentType.LEFT, FOREST_GREEN),
                  createCell("Area of Difficulty", true, 25, "EDF2F7", AlignmentType.LEFT, FOREST_GREEN),
                  createCell("Intervention Strategy & Support", true, 35, "EDF2F7", AlignmentType.LEFT, FOREST_GREEN),
                  createCell("Follow-up Date", true, 20, "EDF2F7", AlignmentType.LEFT, FOREST_GREEN),
                ],
              }),
              ...analysis.learnerInterventions.map((item) => (
                new TableRow({
                  children: [
                    createCell(`${item.learnerName} (Gr ${item.grade})`, true, 20),
                    createCell(item.concern, false, 25),
                    createCell(item.intervention, false, 35),
                    createCell(item.reviewDate, false, 20),
                  ],
                })
              )),
            ],
          }),

          new Paragraph({ spacing: { before: 250 } }),

          // Signatures
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Educator Signature: _______________________", true, 50, "", AlignmentType.LEFT, DARK_CHARCOAL, 18),
                  createCell("HOD Review Signature: _______________________", true, 50, "", AlignmentType.LEFT, DARK_CHARCOAL, 18),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),
          createEagleHouseFooter(),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Post_Test_Diagnostic_Analysis_${analysis.subject.replace(/\s+/g, "_")}_Gr${analysis.grade.replace(/\s+/g, "_")}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
