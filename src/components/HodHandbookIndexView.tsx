import React, { useState } from "react";
import {
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  MessageSquare,
  Eye,
  CalendarCheck,
  BookOpen,
  FileText,
  User,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import {
  HOD_DUTIES,
  DIFFICULT_CONVERSATION_STEPS,
  ESCALATION_FRAMEWORK,
  OBSERVATION_FRAMEWORK,
  RED_FLAG_QUESTIONS,
  HOD_CHECKLISTS,
} from "../data/hodDutiesData";

interface DutyType {
  id: string;
  title: string;
  number: number;
  keyResponsibility: string;
  practiceInAction: string;
  keyToolsAndChecklists: string[];
  detailedGuidance: string[];
  deliverables: string[];
  frequency: string;
}

const MATHS_EDUCATORS = ["Shingi", "Reggie", "Mpofu", "Luthando"];

interface HodHandbookIndexViewProps {
  setActiveTab?: (tab: string) => void;
}

export const HodHandbookIndexView: React.FC<HodHandbookIndexViewProps> = ({ setActiveTab }) => {
  const [activeSection, setActiveSection] = useState<"duties" | "checklists" | "escalation" | "conversations" | "observations">("duties");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDutyId, setExpandedDutyId] = useState<string>("leadership");

  // Learning Walk Form state
  const [lwTeacher, setLwTeacher] = useState(MATHS_EDUCATORS[0]);
  const [lwClass, setLwClass] = useState("Grade 10A Mathematics");
  const [lwWhat, setLwWhat] = useState("");
  const [lwSoWhat, setLwSoWhat] = useState("");
  const [lwNowWhat, setLwNowWhat] = useState("");

  // PD Form state
  const [pdTeacher, setPdTeacher] = useState(MATHS_EDUCATORS[0]);
  const [pdDevArea, setPdArea] = useState("Pre-moderation timeline compliance (\u00a77.1)");
  const [pdTimeframe, setPdTimeframe] = useState("Term 3 (Jul 21 - Sep 25)");
  const [pdAction, setPdAction] = useState("");

  const exportPrecompletedDocument = async (dutyId: string) => {
    try {
      let docTitle = "";
      let filename = "";
      let docChildren: any[] = [];

      // Unified header letterhead generator
      const getLetterhead = (title: string) => [
        new Paragraph({
          children: [
            new TextRun({ text: "EAGLE HOUSE SCHOOL", bold: true, size: 28, color: "1F4D3D" }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Exaltus Futuri", italics: true, size: 16, color: "5F6670" }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Secondary Departmental Portfolio Suite & Governance System", size: 12, color: "5F6670" }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "_________________________________________________________________________________ ", color: "A0AEC0" }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: title, bold: true, size: 22, color: "16181C" }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),
      ];

      if (dutyId === "leadership") {
        docTitle = "OFFICIAL AGENDA & MINUTES — MATHEMATICS DEPARTMENT MEETING";
        filename = "Eagle_House_Meeting_Minutes_T3_Precompleted.docx";
        docChildren = [
          ...getLetterhead(docTitle),
          new Paragraph({ children: [new TextRun({ text: "MEETING DETAILS & ATTENDANCE:", bold: true, size: 18, color: "1F4D3D" })], spacing: { after: 100 } }),
          new Table({
            rows: [
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "DATE / TIME", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2026-09-23 at 14:30", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "VENUE", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Secondary Mathematics Staffroom", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "CHAIRPERSON", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "HOD Mpofu (All Subjects)", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ATTENDEES", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Shingi (Grade 10), Reggie (Grade 11-12), Luthando (Cambridge)", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
            ],
            width: { size: 9000, type: WidthType.DXA },
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "1. WELCOME & CHAIRPERSON'S REMARKS", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "HOD Mpofu welcomed the department. Commended Shingi on completing the pre-moderation process for the Grade 10 Test 1 5 school days in advance under Policy §7.1. Stressed importance of consistent support.", size: 16 })], spacing: { after: 150 } }),
          new Paragraph({ children: [new TextRun({ text: "2. CURRICULUM PACING SPOT-CHECK REVIEW (ATPs)", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "All grades on track. Grade 12 Calculus pacing is slightly tight due to mock examination prep; Reggie to implement 2 revision tutorials. Grade 10 Probability successfully completed.", size: 16 })], spacing: { after: 150 } }),
          new Paragraph({ children: [new TextRun({ text: "3. ASSESSMENT & MODERATION REVIEW (§7.1 & §7.2)", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "Policy §7.1 submission deadlines were perfectly met for the upcoming Grade 10 Test. Policy §7.2 requires a strict 10% stratified sample post-moderation audit in purple pen. HOD verified that Thabo N. and Lerato M.'s scripts are selected for audit.", size: 16 })], spacing: { after: 150 } }),
          new Paragraph({ children: [new TextRun({ text: "4. LEARNER INTERVENTIONS & ACTION ROADMAPS", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "Learner progress checks completed. Identified at-risk borderline bands scoring <30%: Lerato M. (29%), Sipho K. (22%), Johan v. (18%), Zanele S. (9%), and Precious B. (12%). Appendix 10 action plans are activated under teacher supervision.", size: 16 })], spacing: { after: 150 } }),
          new Paragraph({ children: [new TextRun({ text: "5. DELEGATED ACTIONS TRACKER", bold: true, size: 18, color: "1F4D3D" })] }),
          new Table({
            rows: [
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ACTION TASK", bold: true, size: 16 })] })], width: { size: 4000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "RESPONSIBLE", bold: true, size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TARGET DATE", bold: true, size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Implement Grade 12 Calculus pacing catch-up tutorials", size: 16 })] })], width: { size: 4000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Reggie", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2026-09-24", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Initiate Appendix 10 homework checks for at-risk learners", size: 16 })] })], width: { size: 4000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Shingi & Reggie", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2026-09-21", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
              ] }),
            ],
            width: { size: 9000, type: WidthType.DXA },
          }),
          new Paragraph({ spacing: { before: 300 } }),
          new Paragraph({ children: [new TextRun({ text: "SIGN-OFFS:", bold: true, size: 16, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "HOD Signature: _______________________      Date: _______________________", size: 16 })], spacing: { before: 150 } }),
        ];
      } else if (dutyId === "curriculum") {
        docTitle = "CURRICULUM COVERAGE & ATP PACING AUDIT REPORT";
        filename = "Eagle_House_Curriculum_Pacing_Report_Precompleted.docx";
        docChildren = [
          ...getLetterhead(docTitle),
          new Paragraph({ children: [new TextRun({ text: "SECONDARY MATHEMATICS DEPARTMENT PACING STATUS:", bold: true, size: 18, color: "1F4D3D" })], spacing: { after: 100 } }),
          new Table({
            rows: [
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "GRADE / COURSE", bold: true, size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TOPICS ASSIGNED (ATP)", bold: true, size: 16 })] })], width: { size: 3500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "STATUS & DATE", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Grade 10 Maths", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Probability, Coordinate Geometry, Functions", size: 16 })] })], width: { size: 3500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Completed (2026-09-12)", size: 16 })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Grade 11 Maths", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Circle Theorems, Similarity, Trigonometry", size: 16 })] })], width: { size: 3500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Completed (2026-09-14)", size: 16 })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Grade 12 Maths", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Differential Calculus, Optimization", size: 16 })] })], width: { size: 3500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "In Progress (Target: 2026-09-22)", size: 16 })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
            ],
            width: { size: 9000, type: WidthType.DXA },
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "HOD RECOMMENDATIONS & ACTIONS:", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "✓ Bi-weekly pacing checks indicate perfect compliance with CAPS ATP outlines across Grades 8-11. Grade 12 calculus requires a slight boost due to mock examination pacing, catch-up tutorials have been scheduled.", size: 16 })], spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun({ text: "HOD Signature: _______________________      Date: _______________________", size: 16 })], spacing: { before: 200 } }),
        ];
      } else if (dutyId === "teaching-learning") {
        docTitle = "CLASSROOM OBSERVATION & LEARNING WALK FEEDBACK";
        filename = "Eagle_House_Classroom_Observation_Feedback_Precompleted.docx";
        docChildren = [
          ...getLetterhead(docTitle),
          new Paragraph({ children: [new TextRun({ text: "OBSERVATION METADATA:", bold: true, size: 18, color: "1F4D3D" })], spacing: { after: 100 } }),
          new Table({
            rows: [
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TEACHER", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Shingi (Grade 10 Maths)", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "CLASS OBSERVED", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Grade 10A Mathematics", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "OBSERVER", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "HOD Mpofu (Mathematics)", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
            ],
            width: { size: 9000, type: WidthType.DXA },
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "1. WHAT? (The Evidence)", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "During the algebraic proof drill phase, 4 out of 22 students were off-task for more than 5 minutes. Teacher focused primarily on the chalkboard rather than circulating to check linear method steps.", size: 16 })], spacing: { after: 150 } }),
          new Paragraph({ children: [new TextRun({ text: "2. SO WHAT? (The Impact)", bold: true, size: 18, color: "C2703A" })] }),
          new Paragraph({ children: [new TextRun({ text: "Learner passivity meant that small arithmetic discrepancies in fractional denominator selections went uncorrected, which resulted in a high error count on the homework set later in the lesson.", size: 16 })], spacing: { after: 150 } }),
          new Paragraph({ children: [new TextRun({ text: "3. NOW WHAT? (The Action)", bold: true, size: 18, color: "A3341F" })] }),
          new Paragraph({ children: [new TextRun({ text: "Implement a 5-minute exit warm-up check using mini-whiteboards before dismissing students, ensuring immediate visible checking of denominators for all 22 learners.", size: 16 })], spacing: { after: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Educator Signature: _______________________      HOD Signature: _______________________", size: 16 })], spacing: { before: 200 } }),
        ];
      } else if (dutyId === "assessment-data") {
        docTitle = "INTERNAL PRE-MODERATION REPORT (DOCUMENT 5)";
        filename = "Eagle_House_Internal_Pre_Moderation_Document_5_Precompleted.docx";
        docChildren = [
          ...getLetterhead(docTitle),
          new Paragraph({ children: [new TextRun({ text: "PRE-ASSESSMENT MODERATION DETAILS:", bold: true, size: 18, color: "1F4D3D" })], spacing: { after: 100 } }),
          new Table({
            rows: [
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "SUBJECT & GRADE", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Mathematics Grade 10", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TASK TYPE / TOTALS", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Term 3 Control Test 1 (40 Marks, 1.5 Hours)", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "EXAMINER / MODERATOR", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Shingi / HOD Mpofu", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
            ],
            width: { size: 9000, type: WidthType.DXA },
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "EAGLE HOUSE ASSESSMENT CHECKS (§7.1 COMPLIANCE):", bold: true, size: 18, color: "1F4D3D" })] }),
          new Table({
            rows: [
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "CHECKPOINT", bold: true, size: 16 })] })], width: { size: 6000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "VERIFIED", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1. Correct Eagle House Header & Letterhead logo used", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "YES", size: 16, bold: true })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2. Date, duration, instruction block clear and accurate", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "YES", size: 16, bold: true })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3. Marks in paper sum exactly to stated total on cover (40)", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "YES (Math Sum Verified)", size: 16, bold: true })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "4. Detailed memorandum with mark allocations included", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "YES", size: 16, bold: true })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "5. Cognitive level weights align with CAPS requirements (30/40/30)", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "YES (Balanced)", size: 16, bold: true })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
            ],
            width: { size: 9000, type: WidthType.DXA },
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "COGNITIVE LEVEL DISTRIBUTION ANALYSIS:", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "- Lower Order (Knowledge / Recall): 30% (12 Marks) [Required: ~30%]\n- Middle Order (Routine / Analytical): 45% (18 Marks) [Required: ~40%]\n- Higher Order (Problem Solving / Novel): 25% (10 Marks) [Required: ~30%]", size: 16 })], spacing: { after: 150 } }),
          new Paragraph({ children: [new TextRun({ text: "DECISION & APPROVAL SIGN-OFF:", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "Approved with no major corrections required. Shingi met the 5 school days submission rule (§7.1) perfectly. Great layout of proof diagrams.", size: 16 })], spacing: { after: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "HOD Signature: _______________________      Date: 2026-09-20", size: 16 })], spacing: { before: 150 } }),
          new Paragraph({ text: "", pageBreakBefore: true }),
          new Paragraph({ children: [new TextRun({ text: "EAGLE HOUSE SCHOOL", bold: true, size: 28, color: "1F4D3D" })], alignment: AlignmentType.CENTER }),
          new Paragraph({ children: [new TextRun({ text: "Exaltus Futuri", italics: true, size: 16, color: "5F6670" })], alignment: AlignmentType.CENTER }),
          new Paragraph({ children: [new TextRun({ text: "_________________________________________________________________________________ ", color: "A0AEC0" })], alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
          new Paragraph({ children: [new TextRun({ text: "OFFICIAL CONTROL TEST COVER PAGE — TERM 3", bold: true, size: 22, color: "16181C" })], alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
          new Paragraph({ children: [new TextRun({ text: "SUBJECT: Mathematics", bold: true, size: 18 })] }),
          new Paragraph({ children: [new TextRun({ text: "GRADE: Grade 10", bold: true, size: 18 })] }),
          new Paragraph({ children: [new TextRun({ text: "TOTAL MARKS: 40 Marks", bold: true, size: 18 })] }),
          new Paragraph({ children: [new TextRun({ text: "DURATION: 1.5 Hours", bold: true, size: 18 })] }),
          new Paragraph({ children: [new TextRun({ text: "EXAMINER: Shingi", size: 18 })] }),
          new Paragraph({ children: [new TextRun({ text: "MODERATOR: HOD Mpofu", size: 18 })], spacing: { after: 300 } }),
          new Paragraph({ children: [new TextRun({ text: "INSTRUCTIONS:", bold: true, size: 18 })] }),
          new Paragraph({ children: [new TextRun({ text: "1. Answer ALL questions.\n2. Write clearly and legibly.\n3. Show all necessary calculations and method marks.\n4. An approved non-programmable calculator may be used unless specified otherwise.", size: 16 })] }),
        ];
      } else if (dutyId === "learner-progress") {
        docTitle = "LEARNER INTERVENTION TRACKER (APPENDIX 10)";
        filename = "Eagle_House_Learner_Intervention_Appendix_10_Precompleted.docx";
        docChildren = [
          ...getLetterhead(docTitle),
          new Paragraph({ children: [new TextRun({ text: "AT-RISK BORDERLINE BAND REGISTER (SCORING < 30%):", bold: true, size: 18, color: "1F4D3D" })], spacing: { after: 100 } }),
          new Table({
            rows: [
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "LEARNER", bold: true, size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "MARK %", bold: true, size: 16 })] })], width: { size: 1500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "DIAGNOSTIC CONCERN", bold: true, size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "SUPPORT ACTION / ROADMAP", bold: true, size: 16 })] })], width: { size: 2500, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Precious B.", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "12%", size: 16 })] })], width: { size: 1500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Trig ratios confusion", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Daily visual ratio cards, after-school study.", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Zanele S.", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "9%", size: 16 })] })], width: { size: 1500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Algebra basics gap", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Immediate remediation tutoring support.", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Johan v.", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "18%", size: 16 })] })], width: { size: 1500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Functions & graphs", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Specialized graphs worksheet, weekly homework check.", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Sipho K.", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "22%", size: 16 })] })], width: { size: 1500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Linear equations", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Diagnostic equations worksheet, peer study setup.", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Lerato M.", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "29%", size: 16 })] })], width: { size: 1500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Coordinate geometry", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Daily formula review, weekly practice tasks.", size: 16 })] })], width: { size: 2500, type: WidthType.DXA } })
              ] }),
            ],
            width: { size: 9000, type: WidthType.DXA },
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "HOD PROGRESS COMMENTS & FOLLOW-UP SCHEDULE:", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "✓ Under Policy §7.2, those 5 learners dropping below 30% require mandatory Appendix 10 actions. Weekly homework book checks will occur on Fridays to ensure support calibration is active.", size: 16 })], spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun({ text: "HOD Signature: _______________________      Review Date: 2026-10-15", size: 16 })], spacing: { before: 200 } }),
        ];
      } else if (dutyId === "educator-development") {
        docTitle = "PROFESSIONAL DEVELOPMENT NEEDS ANALYSIS (APPENDIX 15)";
        filename = "Eagle_House_PD_Needs_Analysis_Appendix_15_Precompleted.docx";
        docChildren = [
          ...getLetterhead(docTitle),
          new Paragraph({ children: [new TextRun({ text: "PD AUDIT & ROADMAP DETAILS:", bold: true, size: 18, color: "1F4D3D" })], spacing: { after: 100 } }),
          new Table({
            rows: [
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "EDUCATOR", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Reggie", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "DEVELOPMENT AREA", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Calibration of Cognitive Demand Levels in Assessments (30/40/30)", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TIMEFRAME", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Term 3 (Jul 21 - Sep 25)", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
            ],
            width: { size: 9000, type: WidthType.DXA },
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "PLANNED ACTIONS & SUPPORT STEPS:", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "1. HOD to host a 1-on-1 coaching session on cognitive level matrices matching CAPS and IEB SAGS specifications.\n2. Reggie to co-plan the next mathematical literacy assessment with Shingi, calibrating method mark splits.\n3. HOD to conduct a pacing spot-check review on 2026-10-01 to ensure lesson delivery supports the 30% higher order demand questions.", size: 16 })], spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun({ text: "Educator Signature: _______________________      HOD Signature: _______________________", size: 16 })], spacing: { before: 250 } }),
        ];
      } else if (dutyId === "communication") {
        docTitle = "PARENT-TEACHER PROGRESS INTERVENTION RECORD";
        filename = "Eagle_House_Parent_Contact_Record_Precompleted.docx";
        docChildren = [
          ...getLetterhead(docTitle),
          new Paragraph({ children: [new TextRun({ text: "PARENT CONFERENCE LOG DETAILS:", bold: true, size: 18, color: "1F4D3D" })], spacing: { after: 100 } }),
          new Table({
            rows: [
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "LEARNER NAME", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Thabo N. (Grade 10)", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PARENT / GUARDIAN", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Mr. & Mrs. N.", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "CONFERENCE DATE", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2026-09-18", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
            ],
            width: { size: 9000, type: WidthType.DXA },
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "DIAGNOSTIC EVIDENCE REVIEWED:", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "- Recent Grade 10 Test Mark: 50% (SBA Tracker)\n- CAT4 Quantitative Reasoning Score: 112 (Suggesting potential achievement band of 70%+)\n- Diagnostic Gap Identified: Careless linear algebraic sign omissions during timed tests.", size: 16 })], spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun({ text: "AGREED HOME SUPPORT STRATEGY:", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "1. Parent to verify daily homework log is signed off twice weekly.\n2. Learner to attend Wednesday math enrichment clinics for coordinate proof practice.\n3. Teacher to supply 3 additional review tasks weekly.", size: 16 })], spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun({ text: "Parent Signature: _______________________      Educator Signature: _______________________", size: 16 })], spacing: { before: 250 } }),
        ];
      } else if (dutyId === "accountability") {
        docTitle = "INCIDENT ESCALATION & COMPLIANCE WARNING RECORD";
        filename = "Eagle_House_Compliance_Alert_Form_Precompleted.docx";
        docChildren = [
          ...getLetterhead(docTitle),
          new Paragraph({ children: [new TextRun({ text: "COMPLIANCE BREACH / ALERT INFORMATION:", bold: true, size: 18, color: "1F4D3D" })], spacing: { after: 100 } }),
          new Table({
            rows: [
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "INCIDENT TYPE", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "AMBER ALERT: Pre-Assessment Submission Delay", size: 16, bold: true })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "EDUCATOR", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Reggie (Mathematics Department)", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "POLICY BREACHED", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Policy §7.1: Submission of task and memo 5 school days prior", size: 16 })] })], width: { size: 6000, type: WidthType.DXA } })
              ] }),
            ],
            width: { size: 9000, type: WidthType.DXA },
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "DESCRIPTION & DEVELOPMENTAL CONVERSATION NOTES:", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "Reggie submitted the Grade 11 Mathematical Literacy Control Test 1 on 2026-09-17, only 2 school days before the scheduled test date, breaching the mandatory 5-day pre-moderation rule. Standard 8-step conversation initiated. Reggie cited administrative overload. Action agreed: HOD to assist in question generation support to ensure next assessment is on time.", size: 16 })], spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun({ text: "HOD Signature: _______________________      SMT Notified Date: 2026-09-19", size: 16 })], spacing: { before: 250 } }),
        ];
      } else if (dutyId === "improvement") {
        docTitle = "TERMLY HOD SELF-REFLECTION & ACADEMIC PLAN";
        filename = "Eagle_House_HOD_Self_Reflection_T3_Precompleted.docx";
        docChildren = [
          ...getLetterhead(docTitle),
          new Paragraph({ children: [new TextRun({ text: "HOD SELF-EVALUATION LOG (TERM 3):", bold: true, size: 18, color: "1F4D3D" })], spacing: { after: 100 } }),
          new Table({
            rows: [
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "METRIC / GOAL", bold: true, size: 16 })] })], width: { size: 4500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "RATING (1-5)", bold: true, size: 16 })] })], width: { size: 1500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "EVALUATION & COMMENTS", bold: true, size: 16 })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1. Policy §7.1 Pre-moderation compliance", size: 16 })] })], width: { size: 4500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "4 / 5", size: 16 })] })], width: { size: 1500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Shingi and Luthando compliant. Reggie delayed.", size: 16 })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2. Pacing alignment against ATP outline", size: 16 })] })], width: { size: 4500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "5 / 5", size: 16 })] })], width: { size: 1500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "All core concepts fully covered on plan.", size: 16 })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
              new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3. Policy §7.2 Stratified Post-moderation", size: 16 })] })], width: { size: 4500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "5 / 5", size: 16 })] })], width: { size: 1500, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "10% sample audit completed in purple pen.", size: 16 })] })], width: { size: 3000, type: WidthType.DXA } })
              ] }),
            ],
            width: { size: 9000, type: WidthType.DXA },
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "HOD ACADEMIC STRENGTHS & WEAKNESSES:", bold: true, size: 18, color: "1F4D3D" })] }),
          new Paragraph({ children: [new TextRun({ text: "Strengths: Solid lesson pacing checks, highly detailed diagnostic markings, great collaborative atmosphere.\nWeaknesses: Assessment layout formatting calibrations require closer mentorship prior to printing cycles.", size: 16 })], spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun({ text: "HOD Signature: _______________________      Date: 2026-09-20", size: 16 })], spacing: { before: 250 } }),
        ];
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docChildren,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate precompleted document:", err);
    }
  };


  const typedDuties: DutyType[] = (HOD_DUTIES as any[]).map((duty) => ({
    id: duty.id,
    title: duty.title,
    number: duty.number,
    keyResponsibility: duty.keyResponsibility,
    practiceInAction: duty.practiceInAction,
    keyToolsAndChecklists: duty.keyToolsAndChecklists || [],
    detailedGuidance: duty.detailedGuidance || [],
    deliverables: duty.templates || ["Standard Report Template", "Audit Log"],
    frequency: duty.id === "assessment-data" ? "Bi-weekly / Pre-Assessment" : "Termly Review",
  }));

  const filteredDuties = typedDuties.filter((duty: DutyType) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      duty.title.toLowerCase().includes(q) ||
      duty.keyResponsibility.toLowerCase().includes(q) ||
      duty.detailedGuidance.some((g: string) => g.toLowerCase().includes(q))
    );
  });

  // Export Learning Walk to Word
  const exportLearningWalkWord = async () => {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "EAGLE HOUSE SCHOOL", bold: true, size: 28, color: "1F4D3D" }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Exaltus Futuri", italics: true, size: 18, color: "5F6670" }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "CLASSROOM VISIT & FEEDBACK RECORD", bold: true, size: 24, color: "16181C" }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "METADATA & OBSERVATION DETAILS:", bold: true, size: 18, color: "1F4D3D" }),
                ],
                spacing: { before: 200, after: 100 },
              }),
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "EDUCATOR", bold: true, size: 18 })] })],
                        width: { size: 3000, type: WidthType.DXA },
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: lwTeacher, size: 18 })] })],
                        width: { size: 6000, type: WidthType.DXA },
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "CLASS OBSERVED", bold: true, size: 18 })] })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: lwClass, size: 18 })] })],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "OBSERVATION DATE", bold: true, size: 18 })] })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: new Date().toLocaleDateString("en-ZA"), size: 18 })] })],
                      }),
                    ],
                  }),
                ],
                width: { size: 9000, type: WidthType.DXA },
              }),
              new Paragraph({ spacing: { before: 300 } }),
              new Paragraph({
                children: [
                  new TextRun({ text: "1. WHAT? (The Evidence)", bold: true, size: 20, color: "1F4D3D" }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [new TextRun({ text: lwWhat || "No evidence recorded.", size: 20 })],
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "2. SO WHAT? (The Impact)", bold: true, size: 20, color: "C2703A" }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [new TextRun({ text: lwSoWhat || "No impact recorded.", size: 20 })],
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "3. NOW WHAT? (The Action)", bold: true, size: 20, color: "A3341F" }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [new TextRun({ text: lwNowWhat || "No actionable steps recorded.", size: 20 })],
                spacing: { after: 300 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "AGREED SIGN-OFFS & TIMEFRAME:", bold: true, size: 18, color: "1F4D3D" }),
                ],
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Educator Signature: _______________________      HOD Signature: _______________________", size: 18 }),
                ],
                spacing: { before: 200 },
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Classroom_Visit_Feedback_${lwTeacher.replace(/\s+/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting learning walk docx", err);
    }
  };

  // Export PD Needs Analysis to Word
  const exportPdNeedsWord = async () => {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "EAGLE HOUSE SCHOOL", bold: true, size: 28, color: "1F4D3D" }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Exaltus Futuri", italics: true, size: 18, color: "5F6670" }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "PROFESSIONAL DEVELOPMENT NEEDS ANALYSIS", bold: true, size: 22, color: "16181C" }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "DEVELOPMENT ANALYSIS RECORD:", bold: true, size: 18, color: "1F4D3D" }),
                ],
                spacing: { before: 200, after: 100 },
              }),
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "EDUCATOR", bold: true, size: 18 })] })],
                        width: { size: 3000, type: WidthType.DXA },
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: pdTeacher, size: 18 })] })],
                        width: { size: 6000, type: WidthType.DXA },
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "DEVELOPMENT AREA", bold: true, size: 18 })] })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: pdDevArea, size: 18 })] })],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "TIMEFRAME", bold: true, size: 18 })] })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: pdTimeframe, size: 18 })] })],
                      }),
                    ],
                  }),
                ],
                width: { size: 9000, type: WidthType.DXA },
              }),
              new Paragraph({ spacing: { before: 300 } }),
              new Paragraph({
                children: [
                  new TextRun({ text: "PLANNED ACTION & DEVELOPMENTAL ROADMAP:", bold: true, size: 20, color: "1F4D3D" }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [new TextRun({ text: pdAction || "Provide training on assessment blueprint requirements and ATP alignment.", size: 20 })],
                spacing: { after: 300 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "DEVELOPMENT PRINCIPLE:", italics: true, size: 16, color: "5F6670" }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [new TextRun({ text: "Identify \u2192 Plan \u2192 Implement \u2192 Reflect \u2192 Review. Needs analysis conducted annually per educator.", size: 16 })],
                spacing: { after: 300 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "SIGNATURES:", bold: true, size: 18, color: "1F4D3D" }),
                ],
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Educator Signature: _______________________      HOD Signature: _______________________", size: 18 }),
                ],
                spacing: { before: 200 },
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PD_Needs_Analysis_${pdTeacher.replace(/\s+/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting PD needs analysis docx", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary flex items-center gap-2 font-serif">
            <GraduationCap className="w-6 h-6 text-brand-primary" />
            HOD Master Index & Governance Handbook
          </h1>
          <p className="text-xs text-brand-mute mt-0.5">
            Operational reference manual and active tools synthesized from the Eagle House School Head of Department Handbook.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveSection("duties")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeSection === "duties"
                ? "bg-white text-brand-primary shadow-xs font-bold"
                : "text-brand-mute hover:text-brand-dark"
            }`}
          >
            The 9 Core Duties
          </button>
          <button
            onClick={() => setActiveSection("checklists")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeSection === "checklists"
                ? "bg-white text-brand-primary shadow-xs font-bold"
                : "text-brand-mute hover:text-brand-dark"
            }`}
          >
            HOD Checklists
          </button>
          <button
            onClick={() => setActiveSection("escalation")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeSection === "escalation"
                ? "bg-white text-brand-primary shadow-xs font-bold"
                : "text-brand-mute hover:text-brand-dark"
            }`}
          >
            Escalation Matrix
          </button>
          <button
            onClick={() => setActiveSection("conversations")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeSection === "conversations"
                ? "bg-white text-brand-primary shadow-xs font-bold"
                : "text-brand-mute hover:text-brand-dark"
            }`}
          >
            Conversations & PD
          </button>
          <button
            onClick={() => setActiveSection("observations")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeSection === "observations"
                ? "bg-white text-brand-primary shadow-xs font-bold"
                : "text-brand-mute hover:text-brand-dark"
            }`}
          >
            Learning Walks ("What? So What?")
          </button>
        </div>
      </div>

      {/* SECTION 1: THE 9 CORE DUTIES */}
      {activeSection === "duties" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-brand-mute" />
              <input
                type="text"
                placeholder="Search HOD responsibilities, moderation rules, policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-brand-primary bg-slate-50/50"
              />
            </div>
            <span className="text-xs text-brand-mute">
              {filteredDuties.length} Duties Indexed
            </span>
          </div>

          <div className="space-y-3">
            {filteredDuties.map((duty: DutyType) => {
              const isExpanded = expandedDutyId === duty.id;
              return (
                <div
                  key={duty.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedDutyId(isExpanded ? "" : duty.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-primary border border-brand-primary/10 flex items-center justify-center font-bold text-xs shrink-0">
                        {duty.number}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-brand-dark font-serif">{duty.title}</h3>
                        <p className="text-xs text-brand-mute mt-0.5">{duty.keyResponsibility}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-brand-mute shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-brand-mute shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-slate-100 space-y-4 text-xs bg-slate-50/30">
                      <div>
                        <h4 className="font-bold text-brand-dark uppercase tracking-wider mb-2 mt-4 font-serif">
                          Key Operational Guidelines:
                        </h4>
                        <ul className="space-y-1.5 pl-5 list-disc text-slate-700">
                          {duty.detailedGuidance.map((g: string, idx: number) => (
                            <li key={idx} className="leading-relaxed">
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                          <span className="font-bold text-brand-primary block">Core Deliverables:</span>
                          <ul className="space-y-1 text-slate-600">
                            {duty.deliverables.map((del: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-brand-primary shrink-0" />
                                <span>{del}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-1">
                          <span className="font-bold text-brand-primary block">Audit & Review Frequency:</span>
                          <p className="text-brand-primary font-semibold">{duty.frequency}</p>
                          <p className="text-[11px] text-emerald-800 pt-1">
                            Ensure all documentation is filed in the department governance archive for SMT moderation.
                          </p>
                        </div>

                        {/* EAGLE HOUSE PRECOMPLETED DOCUMENT GENERATOR & SUITE ROUTING */}
                        <div className="col-span-1 md:col-span-2 p-4 bg-emerald-950/5 rounded-xl border border-emerald-950/10 mt-2 flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="space-y-1 text-left w-full">
                            <span className="font-bold text-brand-dark flex items-center gap-1.5 text-xs">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                              <span>Eagle House Automated Document & Suite Integrator</span>
                            </span>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Generate a fully pre-completed, beautifully formatted document or report (complete with the school letterhead and logo) utilizing standard mathematics department records.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                            <button
                              onClick={() => exportPrecompletedDocument(duty.id)}
                              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer transition-all inline-flex items-center gap-1.5 text-xs w-full sm:w-auto justify-center"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Generate & Download DOCX</span>
                            </button>
                            {(() => {
                              const dutyTabs: Record<string, { label: string, tab: string }> = {
                                "leadership": { label: "Meetings & Agendas", tab: "meetings" },
                                "curriculum": { label: "Curriculum & ATPs", tab: "curriculum" },
                                "teaching-learning": { label: "Observations & Learning Walks", tab: "observations-sub" },
                                "assessment-data": { label: "Pre & Post Moderation", tab: "moderation" },
                                "learner-progress": { label: "Results & Interventions", tab: "results" },
                                "educator-development": { label: "Conversations & PD", tab: "conversations-sub" },
                                "communication": { label: "Meetings & Agendas", tab: "meetings" },
                                "accountability": { label: "Deadlines Dashboard", tab: "deadlines" },
                                "improvement": { label: "Operating Checklists", tab: "checklists-sub" },
                              };
                              const mapping = dutyTabs[duty.id];
                              if (!mapping) return null;
                              return (
                                <button
                                  onClick={() => {
                                    if (mapping.tab === "observations-sub") {
                                      setActiveSection("observations");
                                    } else if (mapping.tab === "conversations-sub") {
                                      setActiveSection("conversations");
                                    } else if (mapping.tab === "checklists-sub") {
                                      setActiveSection("checklists");
                                    } else if (setActiveTab) {
                                      setActiveTab(mapping.tab);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg shadow-xs cursor-pointer transition-all inline-flex items-center gap-1.5 text-xs w-full sm:w-auto justify-center"
                                >
                                  <span>Go to {mapping.label}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: CHECKLISTS */}
      {activeSection === "checklists" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2 font-serif">
              <CalendarCheck className="w-4 h-4 text-brand-primary" />
              Weekly HOD Operating Checklist
            </h3>
            <p className="text-xs text-brand-mute">
              Tasks to verify every Monday through Friday to maintain department rhythm.
            </p>
            <div className="space-y-2 text-xs">
              {HOD_CHECKLISTS.weekly.map((item: string, idx: number) => (
                <label
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                >
                  <input type="checkbox" className="rounded text-brand-primary mt-0.5" />
                  <span className="text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2 font-serif">
              <CalendarCheck className="w-4 h-4 text-brand-primary" />
              Monthly / Termly Governance Checklist
            </h3>
            <p className="text-xs text-brand-mute">
              Strategic and compliance milestones for departmental leadership.
            </p>
            <div className="space-y-2 text-xs">
              {HOD_CHECKLISTS.monthly.map((item: string, idx: number) => (
                <label
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                >
                  <input type="checkbox" className="rounded text-brand-primary mt-0.5" />
                  <span className="text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: ESCALATION MATRIX */}
      {activeSection === "escalation" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-brand-dark flex items-center gap-2 font-serif">
              <ShieldAlert className="w-5 h-5 text-brand-warn" />
              Traffic Light Escalation Matrix & Governance Boundaries
            </h2>
            <p className="text-xs text-brand-mute mt-0.5">
              Clear thresholds distinguishing between issues resolved by the HOD vs. escalated to Deputy Principal / SMT.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Green */}
            <div className="p-5 rounded-xl border-2 border-emerald-200 bg-emerald-50/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h3 className="text-sm font-bold text-emerald-950 font-serif">GREEN: HOD manages independently</h3>
              </div>
              <p className="text-xs text-slate-600">{ESCALATION_FRAMEWORK.green.description}</p>
              <div className="space-y-1.5 pt-2 text-xs">
                <span className="font-bold text-slate-800 block">Trigger Conditions:</span>
                <ul className="list-disc pl-4 text-slate-700 space-y-1">
                  {ESCALATION_FRAMEWORK.green.triggers.map((t: string, i: number) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-emerald-200/60 text-xs">
                <span className="font-bold text-emerald-900 block">Required HOD Action:</span>
                <p className="text-slate-700 mt-1">{ESCALATION_FRAMEWORK.green.action}</p>
              </div>
            </div>

            {/* Amber */}
            <div className="p-5 rounded-xl border-2 border-brand-secondary bg-amber-50/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-secondary"></span>
                <h3 className="text-sm font-bold text-brand-secondary font-serif">AMBER: HOD + Senior Leadership</h3>
              </div>
              <p className="text-xs text-slate-600">{ESCALATION_FRAMEWORK.amber.description}</p>
              <div className="space-y-1.5 pt-2 text-xs">
                <span className="font-bold text-slate-800 block">Trigger Conditions:</span>
                <ul className="list-disc pl-4 text-slate-700 space-y-1">
                  {ESCALATION_FRAMEWORK.amber.triggers.map((t: string, i: number) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-brand-secondary/40 text-xs">
                <span className="font-bold text-brand-secondary block">Required HOD Action:</span>
                <p className="text-slate-700 mt-1">{ESCALATION_FRAMEWORK.amber.action}</p>
              </div>
            </div>

            {/* Red */}
            <div className="p-5 rounded-xl border-2 border-brand-warn bg-rose-50/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-warn"></span>
                <h3 className="text-sm font-bold text-brand-warn font-serif">RED: Immediate Senior Escalation</h3>
              </div>
              <p className="text-xs text-slate-600">{ESCALATION_FRAMEWORK.red.description}</p>
              <div className="space-y-1.5 pt-2 text-xs">
                <span className="font-bold text-slate-800 block">Trigger Conditions:</span>
                <ul className="list-disc pl-4 text-slate-700 space-y-1">
                  {ESCALATION_FRAMEWORK.red.triggers.map((t: string, i: number) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-brand-warn/40 text-xs">
                <span className="font-bold text-brand-warn block">Immediate HOD Action:</span>
                <p className="text-slate-700 mt-1">{ESCALATION_FRAMEWORK.red.action}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: DIFFICULT CONVERSATIONS & PD NEEDS ANALYSIS */}
      {activeSection === "conversations" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-brand-dark flex items-center gap-2 font-serif">
                <MessageSquare className="w-5 h-5 text-brand-primary" />
                The 8-Step Difficult Conversations Framework
              </h2>
              <p className="text-xs text-brand-mute mt-0.5">
                Eagle House Handbook: Structured methodology for addressing educator underperformance, missed deadlines, or professional friction constructively.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {DIFFICULT_CONVERSATION_STEPS.map((step: any) => (
                <div
                  key={step.step}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-brand-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-2 font-bold text-brand-dark font-serif">
                    <span className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px]">
                      {step.step}
                    </span>
                    <span>{step.title}</span>
                  </div>
                  <p className="text-slate-600 pl-7 leading-relaxed">{step.guidance}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Professional Development Needs Analysis Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2 font-serif">
                <FileText className="w-4 h-4 text-brand-primary" />
                Professional Development Needs Analysis Form
              </h3>
              <p className="text-xs text-brand-mute">
                Identify &rarr; Plan &rarr; Implement &rarr; Reflect &rarr; Review. Complete annually with each member of the department.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-brand-dark block mb-1">Educator</label>
                <select
                  value={pdTeacher}
                  onChange={(e) => setPdTeacher(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand-primary bg-slate-50/50 font-medium"
                >
                  {MATHS_EDUCATORS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-brand-dark block mb-1">Development Area</label>
                <input
                  type="text"
                  value={pdDevArea}
                  onChange={(e) => setPdArea(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand-primary bg-slate-50/50"
                  placeholder="e.g. Assessment layout formatting"
                />
              </div>

              <div>
                <label className="font-bold text-brand-dark block mb-1">Target Timeframe</label>
                <input
                  type="text"
                  value={pdTimeframe}
                  onChange={(e) => setPdTimeframe(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand-primary bg-slate-50/50"
                  placeholder="e.g. Term 3"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="font-bold text-brand-dark block mb-1">Planned Actions & Professional Support Roadmap</label>
              <textarea
                value={pdAction}
                onChange={(e) => setPdAction(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand-primary bg-slate-50/50"
                placeholder="e.g. HOD to provide targeted tutoring support and weekly review of curriculum blueprints..."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={exportPdNeedsWord}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate PD Record (.docx)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: OBSERVATIONS & LEARNING WALKS */}
      {activeSection === "observations" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-brand-dark flex items-center gap-2 font-serif">
                <Eye className="w-5 h-5 text-brand-primary" />
                Classroom Observations & "What? So What? Now What?" Feedback Protocol
              </h2>
              <p className="text-xs text-brand-mute mt-0.5">
                Guidelines for developmental observations, peer learning walks, and constructive feedback loops.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
                <span className="font-black text-brand-primary text-sm block font-serif">1. WHAT? (The Evidence)</span>
                <p className="text-slate-700 leading-relaxed">{OBSERVATION_FRAMEWORK.what}</p>
              </div>

              <div className="p-5 rounded-xl border border-brand-secondary/30 bg-orange-50/30 space-y-2">
                <span className="font-black text-brand-secondary text-sm block font-serif">2. SO WHAT? (The Impact)</span>
                <p className="text-slate-700 leading-relaxed">{OBSERVATION_FRAMEWORK.soWhat}</p>
              </div>

              <div className="p-5 rounded-xl border border-brand-warn/30 bg-rose-50/20 space-y-2">
                <span className="font-black text-brand-warn text-sm block font-serif">3. NOW WHAT? (The Action)</span>
                <p className="text-slate-700 leading-relaxed">{OBSERVATION_FRAMEWORK.nowWhat}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider font-serif">
                10 Diagnostic Questions Every HOD Must Know the Answer To:
              </h3>
              <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-700">
                {RED_FLAG_QUESTIONS.map((q: string, idx: number) => (
                  <li key={idx} className="leading-relaxed font-medium">
                    {q}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Interactive Learning Walk Feedback Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2 font-serif">
                <FileText className="w-4 h-4 text-brand-primary" />
                "What? So What? Now What?" Feedback Builder
              </h3>
              <p className="text-xs text-brand-mute">
                Complete the fields below during or immediately following your classroom visit to generate a professional feedback record document.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-brand-dark block mb-1">Educator</label>
                <select
                  value={lwTeacher}
                  onChange={(e) => setLwTeacher(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand-primary bg-slate-50/50 font-medium"
                >
                  {MATHS_EDUCATORS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-brand-dark block mb-1">Class / Subject Observed</label>
                <input
                  type="text"
                  value={lwClass}
                  onChange={(e) => setLwClass(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand-primary bg-slate-50/50 font-medium"
                  placeholder="e.g. Grade 9A Mathematics"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-brand-primary block">What? (The Objective Evidence)</label>
                <span className="text-[10px] text-brand-mute block pb-1">
                  Describe what was observed objectively (no subjective opinions).
                </span>
                <textarea
                  value={lwWhat}
                  onChange={(e) => setLwWhat(e.target.value)}
                  rows={4}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand-primary bg-slate-50/50"
                  placeholder="e.g. During the independent task, 4 out of 22 learners were off-task for more than 5 minutes."
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-secondary block">So What? (The Impact)</label>
                <span className="text-[10px] text-brand-mute block pb-1">
                  What is the direct impact of this observation on learning?
                </span>
                <textarea
                  value={lwSoWhat}
                  onChange={(e) => setLwSoWhat(e.target.value)}
                  rows={4}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand-primary bg-slate-50/50"
                  placeholder="e.g. Learners who remain off-task are unable to complete the core proof, widening pacing gaps."
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-warn block">Now What? (The Bite-Sized Action)</label>
                <span className="text-[10px] text-brand-mute block pb-1">
                  Name one specific, achievable next action for the educator.
                </span>
                <textarea
                  value={lwNowWhat}
                  onChange={(e) => setLwNowWhat(e.target.value)}
                  rows={4}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand-primary bg-slate-50/50"
                  placeholder="e.g. Implement the 5-minute checkout check list with these students before letting them transition."
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={exportLearningWalkWord}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Generate Feedback Record (.docx)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
