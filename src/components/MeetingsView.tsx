import React, { useState, useEffect } from "react";
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
  MapPin,
  Check,
  UserCheck,
  BookOpen,
  ShieldCheck,
  Building,
  Upload,
  Layers,
} from "lucide-react";
import { MeetingRecord, StaffMember, MeetingTemplateType } from "../types";
export type { MeetingTemplateType };
import { MeetingUploadIntake } from "./MeetingUploadIntake";
import { safePost } from "../utils/apiClient";
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
} from "docx";

interface MeetingsViewProps {
  staffList: StaffMember[];
}

export interface AgendaPointTemplateItem {
  pointNumber: number;
  title: string;
  guidelineDescription: string;
  defaultNotes: string;
  timeAllocated: string;
  lead: string;
}

// 1. STANDARD STAFF MEETING (Eagle House HOD Handbook §1)
export const STANDARD_STAFF_MEETING_ITEMS: AgendaPointTemplateItem[] = [
  {
    pointNumber: 1,
    title: "Welcome & Apologies",
    guidelineDescription:
      "Formal opening, verification of quorum, recorded apologies, and chairperson remarks.",
    defaultNotes:
      "Meeting opened at 14:30. Quorum established. Full department attendance noted. HOD commended staff on punctuality.",
    timeAllocated: "5 mins",
    lead: "HOD Mpofu",
  },
  {
    pointNumber: 2,
    title: "Matters Arising from Previous Minutes",
    guidelineDescription:
      "Action tracker review from preceding cycle, confirmation of completed tasks, accountability check.",
    defaultNotes:
      "Reviewed action items from prior meeting. Previous SBA portfolios successfully verified. All moderation sign-offs archived.",
    timeAllocated: "10 mins",
    lead: "All Staff",
  },
  {
    pointNumber: 3,
    title: "Curriculum Progress & ATP Pacing Alignment",
    guidelineDescription:
      "Comparison of completed topics vs. CAPS ATPs & IEB SAGS milestones, syllabus coverage spot-checks, identification of delays, catch-up scheduling.",
    defaultNotes:
      "Bi-weekly pacing audit confirmed. Grades 8-11 are on schedule against ATPs. Grade 12 Calculus pacing is slightly compressed; two additional revision tutorial clinics scheduled.",
    timeAllocated: "15 mins",
    lead: "Subject Teachers",
  },
  {
    pointNumber: 4,
    title: "Assessment & Moderation Compliance (§7.1 & §7.2)",
    guidelineDescription:
      "Enforcement of 5-day pre-moderation lead-time (§7.1), Bloom's Taxonomy cognitive level weighting (Levels 1-4), quality of marking guidelines, and post-moderation 10% stratified purple pen sample (§7.2).",
    defaultNotes:
      "Reiterated strict compliance with Policy §7.1: all test draft papers, full marking memos, and cognitive grid analyses must be submitted to the HOD at least 5 school days prior to assessment dates. Policy §7.2 post-moderation sampling requires a 10% stratified sample audited in purple pen within 48 hours of marking completion.",
    timeAllocated: "15 mins",
    lead: "HOD Mpofu",
  },
  {
    pointNumber: 5,
    title: "Learner Performance & Diagnostic Data",
    guidelineDescription:
      "Diagnostic review of recent tests, grade-by-grade mark distributions, pass rates, identification of common conceptual misconceptions.",
    defaultNotes:
      "Analyzed diagnostic distributions from recent cycle tests. Common error patterns identified in Grade 10 analytical geometry and Grade 11 circle theorems. Remediation drills agreed upon.",
    timeAllocated: "15 mins",
    lead: "All Staff",
  },
  {
    pointNumber: 6,
    title: "Learners Requiring Academic Intervention (Appendix 10)",
    guidelineDescription:
      "Review of at-risk learners scoring <30%, activation and monitoring of Appendix 10 action roadmaps, morning/afternoon support clinics, and communication with parents.",
    defaultNotes:
      "Reviewed active Appendix 10 support trackers for all learners scoring below 30% threshold. Mandatory remedial afternoon clinics running on Tuesdays and Thursdays.",
    timeAllocated: "10 mins",
    lead: "Grade Teachers",
  },
  {
    pointNumber: 7,
    title: "Educator Support, Teaching Practice & Professional Development",
    guidelineDescription:
      "Peer learning walks, lesson observations feedback ('What? So What? Now What?'), pedagogical methodology sharing, and instructional coaching.",
    defaultNotes:
      "Department learning walks scheduled for upcoming fortnight focusing on higher-order cognitive questioning and active whiteboard problem-solving.",
    timeAllocated: "10 mins",
    lead: "HOD Mpofu",
  },
  {
    pointNumber: 8,
    title: "Resources, Textbooks & Technology",
    guidelineDescription:
      "Textbook stock review, Casio scientific calculator compliance, graphing software (GeoGebra / Desmos), and exam paper printing requirements.",
    defaultNotes:
      "Inventory check of Grade 8-12 textbooks complete; 100% textbook allocation achieved. Examination paper copying requests must be logged 72 hours in advance.",
    timeAllocated: "5 mins",
    lead: "Luthando",
  },
  {
    pointNumber: 9,
    title: "Matters Requiring Escalation to Senior Leadership (SMT)",
    guidelineDescription:
      "Departmental issues, infrastructure needs, or learner pastoral concerns requiring SMT or Academic Head intervention (categorized Green/Amber/Red).",
    defaultNotes:
      "Classroom M3 ceiling projector requires maintenance (Amber Priority). Request submitted to Academic Head for additional scientific calculator loan kits.",
    timeAllocated: "5 mins",
    lead: "HOD Mpofu",
  },
  {
    pointNumber: 10,
    title: "Any Other Business (AOB) & Date of Next Meeting",
    guidelineDescription:
      "Miscellaneous items, final summary of agreed action items, scheduling next cycle meeting, formal adjournment.",
    defaultNotes:
      "Next departmental cycle meeting scheduled for next month in the Mathematics Department office. Action items confirmed and assigned. Meeting formally adjourned at 15:45.",
    timeAllocated: "5 mins",
    lead: "HOD Mpofu",
  },
];

// Backwards compatibility export
export const HOD_STANDARD_10_AGENDA_ITEMS = STANDARD_STAFF_MEETING_ITEMS;

// 2. MODERATION MEETING (Eagle House Assessment Quality Assurance Policy §7.1 & §7.2)
export const MODERATION_MEETING_ITEMS: AgendaPointTemplateItem[] = [
  {
    pointNumber: 1,
    title: "Quorum Verification & Internal Moderation Objectives",
    guidelineDescription:
      "Establish moderation panel quorum, assign senior moderators per grade, review moderation code of conduct, and align with Policy §7.",
    defaultNotes:
      "Moderation panel constituted with HOD and subject leads. Quorum verified. Moderation objectives aligned with HOD Handbook Policy §7.1 and §7.2.",
    timeAllocated: "5 mins",
    lead: "HOD Mpofu",
  },
  {
    pointNumber: 2,
    title: "Matters Arising & Action Audit from Prior Moderation Cycle",
    guidelineDescription:
      "Audit of corrections mandated during prior cycle, verification of amended question papers, marking memos, and resolved discrepancies.",
    defaultNotes:
      "Audited corrections from preceding assessment cycle. All flagged mark discrepancies resolved; updated question bank and revised memos verified.",
    timeAllocated: "10 mins",
    lead: "Senior Moderators",
  },
  {
    pointNumber: 3,
    title: "Assessment Blueprint & Cognitive Weighting Grid (Bloom's Levels 1–4)",
    guidelineDescription:
      "Scrutiny of question paper blueprints against CAPS/IEB taxonomy: Knowledge L1 (20%), Routine L2 (35%), Complex L3 (30%), Problem Solving L4 (15%).",
    defaultNotes:
      "Cognitive weighting grids verified for all grade test drafts. Grade 10 Paper balanced at 20% L1, 35% L2, 30% L3, 15% L4. Grade 11 requires slight upward adjustment in Level 4 non-routine questions.",
    timeAllocated: "15 mins",
    lead: "All Subject Teachers",
  },
  {
    pointNumber: 4,
    title: "Policy §7.1 Compliance: 5-Day Pre-Moderation Lead Time Review",
    guidelineDescription:
      "Rigorous verification of draft submission deadlines (minimum 5 school days prior to test date). Formatting, typography, mark allocations, and diagram clarity.",
    defaultNotes:
      "100% adherence to 5-day pre-moderation lead time confirmed for upcoming Term 1 tests. All drafts reviewed for clarity, font consistency, mark allocations, and formula sheet accuracy.",
    timeAllocated: "15 mins",
    lead: "HOD Mpofu",
  },
  {
    pointNumber: 5,
    title: "Marking Memorandum Standardization & Alternative Solutions Calibration",
    guidelineDescription:
      "Comprehensive walk-through of marking memoranda. Identification and recording of valid alternative learner solution methods and consequential mark allocations.",
    defaultNotes:
      "Marking memo standardization completed. Accepted 2 valid alternative geometric proof methods for Grade 11 Circle Geometry Q4. Consequential marking rules established for multi-step trigonometry.",
    timeAllocated: "20 mins",
    lead: "Subject Specialists",
  },
  {
    pointNumber: 6,
    title: "Policy §7.2 Post-Moderation: 10% Stratified Purple Pen Protocol",
    guidelineDescription:
      "Verification of 10% sample stratification (top, middle, bottom mark bands). Purple pen re-marking protocol, consistency of mark additions, and memo adherence.",
    defaultNotes:
      "Post-moderation protocol established: 10% stratified sample (high, average, at-risk) will be audited in purple pen within 48 hours of marking completion. Moderation stamps and signatures applied.",
    timeAllocated: "15 mins",
    lead: "HOD & Internal Moderators",
  },
  {
    pointNumber: 7,
    title: "Moderation Discrepancy & Mark Variance Resolution Register",
    guidelineDescription:
      "Protocol for mark variances exceeding 5% or 3 marks between teacher and moderator. Re-marking thresholds, adjustments register, and arbitration by HOD.",
    defaultNotes:
      "Variance tolerance set at ±3 marks or 5%. Any paper exceeding variance threshold will trigger full cohort re-audit by HOD. All adjustments recorded in statutory moderation register.",
    timeAllocated: "10 mins",
    lead: "Moderation Panel",
  },
  {
    pointNumber: 8,
    title: "Question Discrimination Index & Diagnostic Error Trends",
    guidelineDescription:
      "Item analysis on high-failure questions, ambiguous question phrasing, cognitive load barriers, and curriculum gaps.",
    defaultNotes:
      "Item discrimination analysis reviewed from prior test. Identified common misconception in 3D trigonometric angles of elevation; remediation exercise embedded.",
    timeAllocated: "10 mins",
    lead: "Grade Leads",
  },
  {
    pointNumber: 9,
    title: "Statutory Moderation Tool Sign-off & Appendix 7 Certification",
    guidelineDescription:
      "Completion and formal signing of Eagle House Official Moderation Instruments (Appendix 7), verification checklists, and HOD certification.",
    defaultNotes:
      "Official Appendix 7 moderation tools signed by internal moderators. Final pre-moderation compliance certificates signed off by HOD.",
    timeAllocated: "5 mins",
    lead: "HOD Mpofu",
  },
  {
    pointNumber: 10,
    title: "Moderation Remedial Orders & SMT Escalation",
    guidelineDescription:
      "Summary of binding moderation directives, test paper security sign-off, date for final post-moderation file submission to SMT.",
    defaultNotes:
      "Final moderated master papers locked in secure department archive. Final moderation audit report scheduled for submission to Academic Head by Friday.",
    timeAllocated: "5 mins",
    lead: "HOD Mpofu",
  },
];

// 3. CURRICULUM PLANNING (CAPS ATP & SAGS Milestones)
export const CURRICULUM_PLANNING_ITEMS: AgendaPointTemplateItem[] = [
  {
    pointNumber: 1,
    title: "Department Academic Vision & Term Strategic Targets",
    guidelineDescription:
      "Establish departmental achievement targets (e.g. 80%+ cohort pass rate, 25%+ distinctions, 0 unmanaged <30%), core pedagogical focus, and curriculum vision.",
    defaultNotes:
      "Chair opened session establishing Term 2 target: 80% pass rate in Mathematics with zero unmanaged failures below 30%. Core pillar: conceptual understanding over rote memorization.",
    timeAllocated: "10 mins",
    lead: "HOD Mpofu",
  },
  {
    pointNumber: 2,
    title: "CAPS/IEB Annual Teaching Plan (ATP) Milestone Mapping & Pacing Calendar",
    guidelineDescription:
      "Week-by-week syllabus scheduling across Grades 8–12. Alignment with school calendar, examination periods, public holidays, and athletics days.",
    defaultNotes:
      "Reviewed 10-week ATP progression. Adjusted Grade 10 Euclidean Geometry pacing to absorb lost sports fixture hours. Grade 11 Functions and Grade 12 Calculus pacing calendars synchronized.",
    timeAllocated: "15 mins",
    lead: "Subject Teachers",
  },
  {
    pointNumber: 3,
    title: "Prerequisite Diagnostic Gaps & Baseline Remediation Strategy",
    guidelineDescription:
      "Analysis of baseline diagnostic assessment results. Identification of prerequisite knowledge deficits from prior grade and structured 10-minute starter bridge lessons.",
    defaultNotes:
      "Diagnostic baseline identified algebra factorisation and fraction manipulation gaps in Grade 8 and 9. 2-week starter bridge drills integrated into daily lesson plans.",
    timeAllocated: "15 mins",
    lead: "All Staff",
  },
  {
    pointNumber: 4,
    title: "Common Assessment Task (CAT) & SBA Schedule Synchronization",
    guidelineDescription:
      "Scheduling control tests, assignments, practical investigations, and portfolio tasks in accordance with NPA and locking 5-day pre-moderation deadlines (§7.1).",
    defaultNotes:
      "Formal assessment calendar locked. Grade 8–9 investigations scheduled for Week 4; Grade 10–12 Control Tests scheduled for Week 7. Pre-moderation deadlines locked 5 days ahead (§7.1).",
    timeAllocated: "10 mins",
    lead: "Assessment Coordinator",
  },
  {
    pointNumber: 5,
    title: "Pedagogical Methodology, Lesson Study & Differentiated CRA Instruction",
    guidelineDescription:
      "Sharing best instructional practices, Concrete-Representational-Abstract (CRA) models, peer learning walk schedule, and differentiated task tiers.",
    defaultNotes:
      "Adopted CRA visual modeling for teaching quadratic functions. Peer lesson observation pairings confirmed: Shingi with Reggie, Luthando with Mpofu.",
    timeAllocated: "15 mins",
    lead: "Subject Leads",
  },
  {
    pointNumber: 6,
    title: "Textbook, Digital LMS & Technology Resource Allocation",
    guidelineDescription:
      "Audit of physical textbooks, online LMS learning modules (Google Classroom/Moodle), graphing software (GeoGebra/Desmos), and Casio calculator supply.",
    defaultNotes:
      "Resource check completed. 100% textbook allocation verified. Interactive GeoGebra classroom activities shared on department drive. Calculator loan kits prepared.",
    timeAllocated: "10 mins",
    lead: "Luthando",
  },
  {
    pointNumber: 7,
    title: "Inclusive Education & High-Potential / At-Risk Tiering Framework",
    guidelineDescription:
      "Identification of tier-3 at-risk learners (<30%) for Appendix 10 support roadmaps, and tier-1 high-potential learners for Mathematics Olympiad preparation (SAMO).",
    defaultNotes:
      "Support framework established: Grade 8–11 at-risk learners assigned to Tuesday/Thursday afternoon clinic roadmaps. High-potential learners enrolled in South African Mathematics Olympiad (SAMO).",
    timeAllocated: "10 mins",
    lead: "Grade Teachers",
  },
  {
    pointNumber: 8,
    title: "Educator Workload, Subject Allocations & Mentorship Pairing",
    guidelineDescription:
      "Review of teaching load distribution, class sizes, subject allocations, and novice educator mentorship.",
    defaultNotes:
      "Teaching allocations and period distribution reviewed. Mentorship check-ins scheduled fortnightly for junior grade educators.",
    timeAllocated: "5 mins",
    lead: "HOD Mpofu",
  },
  {
    pointNumber: 9,
    title: "Cross-Curricular STEM Integration & Academic Enrichment",
    guidelineDescription:
      "Coordination with Physical Sciences, Life Sciences, and Accounting departments on shared mathematical skills (vectors, data handling, financial graphs).",
    defaultNotes:
      "Liaised with Physical Sciences on timing of vectors and kinematics in Grade 11. Coordinated financial mathematics with Accounting department.",
    timeAllocated: "5 mins",
    lead: "Reggie",
  },
  {
    pointNumber: 10,
    title: "Department Milestones Approval, SMT Submission & Adjournment",
    guidelineDescription:
      "Formal approval of term curriculum map, commitment signatures, submission to Senior Management Team (SMT), and next review date.",
    defaultNotes:
      "Term Curriculum Blueprint unanimously approved by department. HOD will submit final consolidated planning pack to SMT by Friday. Next meeting: Mid-term progress check.",
    timeAllocated: "5 mins",
    lead: "HOD Mpofu",
  },
];

export interface MeetingTemplateConfig {
  id: MeetingTemplateType;
  title: string;
  badge: string;
  policyTag: string;
  summary: string;
  iconName: "clipboard" | "shield" | "book";
  colorClasses: {
    activeBorder: string;
    activeBg: string;
    activeText: string;
    badgeBg: string;
    badgeText: string;
    accentDot: string;
    cardBorder: string;
  };
  defaultTitle: string;
  defaultMeetingType: "Regular Departmental" | "Pre-Moderation Calibration" | "Post-Exam Review" | "Urgent / Escalation";
  defaultFocus: string;
  items: AgendaPointTemplateItem[];
  quickPresets: {
    label: string;
    title: string;
    type: "Regular Departmental" | "Pre-Moderation Calibration" | "Post-Exam Review" | "Urgent / Escalation";
    focus: string;
  }[];
}

export const FOLLOW_UP_MEETING_ITEMS: AgendaPointTemplateItem[] = [
  { pointNumber: 1, title: "Welcome & Purpose", defaultNotes: "Confirm the purpose of the follow-up meeting and expected outcomes." },
  { pointNumber: 2, title: "Review Previous Action Items", defaultNotes: "Review outstanding actions from the previous meeting and record progress." },
  { pointNumber: 3, title: "Key Matters Requiring Follow-up", defaultNotes: "Discuss the specific matters that require attention since the previous meeting." },
  { pointNumber: 4, title: "Decisions & Actions", defaultNotes: "Record decisions made, responsible persons and agreed deadlines." },
  { pointNumber: 5, title: "Any Other Business", defaultNotes: "Record any additional matters raised for discussion." },
  { pointNumber: 6, title: "Next Steps & Next Meeting", defaultNotes: "Confirm immediate next steps and the next meeting date if required." },
];

export const MEETING_TEMPLATE_CONFIGS: MeetingTemplateConfig[] = [
  {
    id: "Follow-up Meeting",
    title: "Follow-up Meeting",
    badge: "Simple",
    policyTag: "Department Follow-up",
    summary: "A short practical agenda for following up previous decisions and outstanding actions.",
    iconName: "check-circle",
    colorClasses: {
      activeBorder: "border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/20",
      activeBg: "bg-emerald-50/70 dark:bg-emerald-950/40",
      activeText: "text-emerald-900 dark:text-emerald-200",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/60",
      badgeText: "text-emerald-800 dark:text-emerald-300",
      accentDot: "bg-emerald-600",
      cardBorder: "border-slate-200 dark:border-slate-800",
    },
    defaultTitle: "Mathematics Department Follow-up Meeting",
    defaultMeetingType: "Regular Departmental",
    defaultFocus: "Review outstanding actions, address follow-up matters, agree decisions and confirm next steps.",
    items: FOLLOW_UP_MEETING_ITEMS,
    quickPresets: [],
  },
  {
    id: "Standard Staff Meeting",
    title: "Standard Staff Meeting",
    badge: "HOD Handbook §1",
    policyTag: "Eagle House Governance Standard §1",
    summary:
      "Departmental governance, statutory compliance, ATP pacing checks, diagnostic mark reviews, Appendix 10 at-risk interventions (<30%), and SMT escalation.",
    iconName: "clipboard",
    colorClasses: {
      activeBorder: "border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20",
      activeBg: "bg-blue-50/70 dark:bg-blue-950/40",
      activeText: "text-blue-900 dark:text-blue-200",
      badgeBg: "bg-blue-100 dark:bg-blue-900/60",
      badgeText: "text-blue-800 dark:text-blue-300",
      accentDot: "bg-blue-600",
      cardBorder: "border-slate-200 dark:border-slate-800",
    },
    defaultTitle: "Term 1 Cycle 2 Mathematics Department Meeting",
    defaultMeetingType: "Regular Departmental",
    defaultFocus:
      "Curriculum pacing spot-check against ATP, assessment compliance (§7.1 pre-mod & §7.2 post-mod), diagnostic data review, and Appendix 10 academic support trackers.",
    items: STANDARD_STAFF_MEETING_ITEMS,
    quickPresets: [
      {
        label: "Term Launch",
        title: "Term 1 Cycle 1 Launch & Curriculum Pacing Alignment",
        type: "Regular Departmental",
        focus: "Syllabus coverage calibration, baseline diagnostics, and ATP scheduling for Term 1.",
      },
      {
        label: "Mid-Term Review",
        title: "Mid-Term Cycle 2 Departmental Review & Quality Assurance",
        type: "Regular Departmental",
        focus: "Mid-term pacing spot-check, test moderation compliance, and student performance data analysis.",
      },
      {
        label: "Interventions (<30%)",
        title: "Post-Assessment Diagnostic Review & Appendix 10 Interventions",
        type: "Post-Exam Review",
        focus: "Mark distributions, diagnostic error trends, and support trackers for learners scoring <30%.",
      },
    ],
  },
  {
    id: "Moderation Meeting",
    title: "Moderation Meeting",
    badge: "Policy §7.1 & §7.2",
    policyTag: "Assessment Quality Assurance (§7.1 & §7.2)",
    summary:
      "Rigorous quality assurance: 5-day pre-moderation lead-time audit, Bloom's cognitive taxonomy weighting (L1–L4 balance), memorandum calibration, and post-moderation 10% purple pen stratified audit.",
    iconName: "shield",
    colorClasses: {
      activeBorder: "border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/20",
      activeBg: "bg-emerald-50/70 dark:bg-emerald-950/40",
      activeText: "text-emerald-900 dark:text-emerald-200",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/60",
      badgeText: "text-emerald-800 dark:text-emerald-300",
      accentDot: "bg-emerald-600",
      cardBorder: "border-slate-200 dark:border-slate-800",
    },
    defaultTitle: "Term 1 Pre- & Post-Assessment Moderation & Standardization Calibration",
    defaultMeetingType: "Pre-Moderation Calibration",
    defaultFocus:
      "Policy §7.1 five-day submission audit, Bloom's cognitive level weighting (Levels 1–4), memo alternative solution standardisation, and §7.2 purple pen 10% stratified sampling.",
    items: MODERATION_MEETING_ITEMS,
    quickPresets: [
      {
        label: "Pre-Moderation Calibration",
        title: "Mid-Term Pre-Moderation Calibration & Assessment Blueprint Audit",
        type: "Pre-Moderation Calibration",
        focus: "Policy §7.1 five-day submission deadlines, cognitive weighting grid review, and formatting standardization.",
      },
      {
        label: "Post-Moderation Purple Pen",
        title: "Control Test Post-Moderation Review & 10% Stratified Purple Pen Audit",
        type: "Post-Exam Review",
        focus: "Policy §7.2 post-moderation 10% stratified sample verification, purple pen remarks, and mark additions audit.",
      },
      {
        label: "Memo Standardization",
        title: "Memorandum Standardization & Alternative Solutions Calibration",
        type: "Pre-Moderation Calibration",
        focus: "Joint memorandum walkthrough, establishing consequential mark rules, and standardizing alternative solution methods.",
      },
    ],
  },
  {
    id: "Curriculum Planning",
    title: "Curriculum Planning",
    badge: "CAPS ATP & SAGS",
    policyTag: "Curriculum Milestones & Pedagogy Roadmapping",
    summary:
      "Strategic syllabus alignment: week-by-week CAPS/IEB ATP milestones, diagnostic gap bridging, common assessment schedule synchronization, CRA instructional modeling, and resource management.",
    iconName: "book",
    colorClasses: {
      activeBorder: "border-purple-600 dark:border-purple-500 ring-2 ring-purple-500/20",
      activeBg: "bg-purple-50/70 dark:bg-purple-950/40",
      activeText: "text-purple-900 dark:text-purple-200",
      badgeBg: "bg-purple-100 dark:bg-purple-900/60",
      badgeText: "text-purple-800 dark:text-purple-300",
      accentDot: "bg-purple-600",
      cardBorder: "border-slate-200 dark:border-slate-800",
    },
    defaultTitle: "Term 2 Curriculum Planning, ATP Milestones & Instructional Roadmapping",
    defaultMeetingType: "Regular Departmental",
    defaultFocus:
      "CAPS Annual Teaching Plan (ATP) milestone alignment, term syllabus mapping, baseline diagnostic remediation, common assessment scheduling, and differentiated learning.",
    items: CURRICULUM_PLANNING_ITEMS,
    quickPresets: [
      {
        label: "Term ATP Mapping",
        title: "Term 2 Week-by-Week ATP Milestone & Syllabus Coverage Mapping",
        type: "Regular Departmental",
        focus: "Week-by-week syllabus progression, public holiday adjustments, and CAPS/IEB SAGS milestone alignment.",
      },
      {
        label: "Prerequisite Gap Bridging",
        title: "Diagnostic Baseline Analysis & Prerequisite Bridge Drill Planning",
        type: "Regular Departmental",
        focus: "Analyzing baseline test diagnostics, designing 10-minute starter bridge drills, and scaffolding prerequisite concepts.",
      },
      {
        label: "Common Assessment Sync",
        title: "Common Assessment Task (CAT) & SBA Schedule Synchronization",
        type: "Regular Departmental",
        focus: "Harmonizing formal assessment dates, investigation tasks, and locking 5-day pre-moderation deadlines (§7.1).",
      },
    ],
  },
];

export const MeetingsView: React.FC<MeetingsViewProps> = ({ staffList }) => {
  const [activeTab, setActiveTab] = useState<"scheduled" | "upload" | "generate" | "actions">("scheduled");
  const [viewSubTab, setViewSubTab] = useState<"agenda" | "signatures">("agenda");

  // Template Selector state for meeting agenda generator
  const [selectedTemplate, setSelectedTemplate] = useState<MeetingTemplateType>("Standard Staff Meeting");
  const [templateFilter, setTemplateFilter] = useState<"All" | MeetingTemplateType>("All");

  // Generator inputs
  const [meetingTitle, setMeetingTitle] = useState("Department Meeting");
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [meetingType, setMeetingType] = useState<
    "Regular Departmental" | "Pre-Moderation Calibration" | "Post-Exam Review" | "Urgent / Escalation"
  >("Regular Departmental");
  const [customFocus, setCustomFocus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Template switch handler
  const handleTemplateChange = (tmplId: MeetingTemplateType) => {
    setSelectedTemplate(tmplId);
    const tmpl = MEETING_TEMPLATE_CONFIGS.find((t) => t.id === tmplId);
    if (tmpl) {
      setMeetingTitle(tmpl.defaultTitle);
      setMeetingType(tmpl.defaultMeetingType);
      setCustomFocus(tmpl.defaultFocus);
    }
  };

  // Roster is supplied by the Department Configuration; never seed meeting attendees/signatures.
  const defaultDepartmentTeachers: NonNullable<MeetingRecord["teacherSignatures"]> = staffList
    .filter((teacher) => teacher.isMathsDept && teacher.status !== "inactive")
    .map((teacher) => ({
      teacherId: teacher.id,
      name: teacher.name,
      role: teacher.role || "Educator",
      allocation: teacher.allocations.length > 0
        ? teacher.allocations.map((a) => `${a.subject} — Grade ${a.grade} (${a.curriculum})`).join("; ")
        : "Department allocation not specified",
      signed: false,
      signedDate: "",
    }));

  // Operational meeting records are blank until the HOD creates or loads a record.
  const defaultMeetings: MeetingRecord[] = [];


  const [meetings, setMeetings] = useState<MeetingRecord[]>(defaultMeetings);

  useEffect(() => {
    fetch("/api/data/meetings.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const normalizedMeetings = data
            .filter((record): record is MeetingRecord => Boolean(record && typeof record === "object"))
            .map((record) => ({
              ...record,
              attendees: Array.isArray(record.attendees) ? record.attendees : [],
              apologies: Array.isArray(record.apologies) ? record.apologies : [],
              teacherSignatures: Array.isArray(record.teacherSignatures) ? record.teacherSignatures : [],
              agendaPoints: Array.isArray(record.agendaPoints) ? record.agendaPoints : [],
              actionItems: Array.isArray(record.actionItems) ? record.actionItems : [],
            }));
          setMeetings(normalizedMeetings);
          setSelectedMeeting(normalizedMeetings[0] || blankMeeting());
        }
      })
      .catch((err) => console.error("Failed to load meetings:", err));
  }, []);

  const updateMeetingsAndPersist = (newMeetings: MeetingRecord[]) => {
    setMeetings(newMeetings);
    fetch("/api/data/meetings.json", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMeetings),
    }).catch((err) => console.error("Failed to save meetings:", err));
  };

  const blankMeeting = (): MeetingRecord => ({
    id: `MTG-${Date.now()}`,
    title: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    venue: "",
    chairperson: "",
    meetingType: "Regular Departmental",
    templateType: "Standard Staff Meeting",
    attendees: [],
    apologies: [],
    teacherSignatures: [],
    agendaPoints: [],
    actionItems: [],
    minutesSummary: "",
    status: "Draft",
  });
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecord>(meetings[0] || blankMeeting());

  // Toggle teacher signature
  const toggleTeacherSignature = (teacherId: string) => {
    const currentSignatures = selectedMeeting.teacherSignatures || defaultDepartmentTeachers;
    const updatedSignatures = currentSignatures.map((sig) => {
      if (sig.teacherId === teacherId) {
        const nextSigned = !sig.signed;
        return {
          ...sig,
          signed: nextSigned,
          signedDate: nextSigned ? new Date().toISOString().split("T")[0] : "",
        };
      }
      return sig;
    });

    const updatedMeeting = {
      ...selectedMeeting,
      teacherSignatures: updatedSignatures,
    };

    setSelectedMeeting(updatedMeeting);
    updateMeetingsAndPersist(meetings.map((m) => (m.id === updatedMeeting.id ? updatedMeeting : m)));
  };

  // Generate automated agenda using AI with template-specific 10-point guideline structure
  const handleGenerateAgenda = async () => {
    setIsGenerating(true);
    const activeTemplateConfig =
      MEETING_TEMPLATE_CONFIGS.find((t) => t.id === selectedTemplate) ||
      MEETING_TEMPLATE_CONFIGS[0];

    // A follow-up agenda is intentionally simple: it does not invoke AI or the
    // 10-point governance framework. The HOD can edit the six practical items.
    if (selectedTemplate === "Follow-up Meeting") {
      const followUpRecord: MeetingRecord = {
        id: `MTG-${Date.now()}`,
        title: meetingTitle || "Mathematics Department Follow-up Meeting",
        date: meetingDate,
        startTime,
        endTime,
        venue,
        chairperson: "Mr. N. Mpofu (HOD)",
        meetingType,
        templateType: selectedTemplate,
        attendees: defaultDepartmentTeachers.map((t) => t.name),
        apologies: [],
        teacherSignatures: defaultDepartmentTeachers.map((t) => ({ ...t, signed: false, signedDate: "" })),
        agendaPoints: FOLLOW_UP_MEETING_ITEMS.map((item) => ({
          pointNumber: item.pointNumber,
          title: item.title,
          notes: customFocus && item.pointNumber === 3
            ? `${item.defaultNotes} Focus: ${customFocus}`
            : item.defaultNotes,
        })),
        actionItems: [],
        minutesSummary: "Simple follow-up meeting agenda. Edit the agenda points and action items before circulation.",
        status: "Draft",
      };
      updateMeetingsAndPersist([followUpRecord, ...meetings]);
      setSelectedMeeting(followUpRecord);
      setActiveTab("scheduled");
      setIsGenerating(false);
      return;
    }

    try {
      const result = await safePost("/api/meetings/generate", {
        templateType: selectedTemplate,
        meetingTitle,
        meetingDate,
        startTime,
        endTime,
        meetingType,
        specificFocus: customFocus,
        previousActionItems: selectedMeeting.actionItems,
      });

      if (!result.success || !result.data?.meeting) {
        throw new Error(result.error || "Failed to generate meeting agenda.");
      }

      const data = result.data;

      // Ensure all 10 template-specific points are present
      const generatedPoints = data.meeting?.agendaPoints || [];
      const complete10Points = activeTemplateConfig.items.map((std) => {
        const found = generatedPoints.find((gp: any) => gp.pointNumber === std.pointNumber);
        return {
          pointNumber: std.pointNumber,
          title: std.title,
          notes: found?.notes || std.defaultNotes,
        };
      });

      const newRecord: MeetingRecord = {
        id: `MTG-${Date.now()}`,
        title: data.meeting?.title || meetingTitle,
        date: data.meeting?.date || meetingDate,
        startTime,
        endTime,
        venue,
        chairperson: "Mr. N. Mpofu (HOD)",
        meetingType,
        templateType: selectedTemplate,
        attendees: defaultDepartmentTeachers.map((t) => t.name),
        apologies: [],
        teacherSignatures: defaultDepartmentTeachers.map((t) => ({ ...t, signed: false, signedDate: "" })),
        agendaPoints: complete10Points,
        actionItems: Array.isArray(data.meeting?.actionItems) ? data.meeting.actionItems : [],
        minutesSummary: data.meeting?.minutesSummary || `${activeTemplateConfig.title} draft prepared for departmental use.`,
        status: "Draft",
      };

      updateMeetingsAndPersist([newRecord, ...meetings]);
      setSelectedMeeting(newRecord);
      setActiveTab("scheduled");
    } catch (err: any) {
      // Fallback: construct standard template matching selected template
      const fallbackRecord: MeetingRecord = {
        id: `MTG-${Date.now()}`,
        title: meetingTitle,
        date: meetingDate,
        startTime,
        endTime,
        venue,
        chairperson: "Mr. N. Mpofu (HOD)",
        meetingType,
        templateType: selectedTemplate,
        attendees: defaultDepartmentTeachers.map((t) => t.name),
        apologies: [],
        teacherSignatures: defaultDepartmentTeachers.map((t) => ({ ...t, signed: false, signedDate: "" })),
        agendaPoints: activeTemplateConfig.items.map((item) => ({
          pointNumber: item.pointNumber,
          title: item.title,
          notes: customFocus && item.pointNumber === 3 ? `${item.defaultNotes} Focus: ${customFocus}` : item.defaultNotes,
        })),
        actionItems: [
          {
            id: `ACT-${Date.now()}-1`,
            description: `Execute ${activeTemplateConfig.title} directives as recorded`,
            responsible: "Subject Teachers",
            deadline: meetingDate,
            status: "Pending",
          },
          {
            id: `ACT-${Date.now()}-2`,
            description: "Submit governance sign-off pack to Academic Head",
            responsible: "Mr. N. Mpofu (HOD)",
            deadline: meetingDate,
            status: "Pending",
          },
        ],
        minutesSummary: `${activeTemplateConfig.title} draft prepared for ${meetingTitle}.`
        status: "Draft",
      };

      updateMeetingsAndPersist([fallbackRecord, ...meetings]);
      setSelectedMeeting(fallbackRecord);
      setActiveTab("scheduled");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper: Export Department Agenda Draft to Word (.docx)
  const exportAgendaDraftDocx = async (record: MeetingRecord) => {
    const teachers = record.teacherSignatures || defaultDepartmentTeachers;
    const targetTemplateType = record.templateType || selectedTemplate || "Standard Staff Meeting";
    const targetTemplateConfig =
      MEETING_TEMPLATE_CONFIGS.find((t) => t.id === targetTemplateType) ||
      MEETING_TEMPLATE_CONFIGS[0];
    const templateItems = targetTemplateConfig.items;

    const doc = new Document({
      sections: [
        {
          children: [
            // Letterhead
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "EAGLE HOUSE SCHOOL",
                  bold: true,
                  size: 28,
                  color: "1A365D",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "praxis BORDERLESS LEARNING  •  DEPARTMENT OF MATHEMATICS & MATHEMATICAL LITERACY",
                  bold: true,
                  size: 16,
                  color: "4A5568",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Secondary Departmental Governance Suite  •  Academic Year 2026`,
                  italics: true,
                  size: 14,
                  color: "718096",
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "_________________________________________________________________________________",
                  color: "CBD5E1",
                }),
              ],
              spacing: { after: 200 },
            }),

            // Title
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${targetTemplateType === "Follow-up Meeting" ? "MEETING AGENDA — " : "OFFICIAL AGENDA — "}${targetTemplateConfig.title.toUpperCase()}`,
                  bold: true,
                  size: 24,
                  color: "1A365D",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: targetTemplateType === "Follow-up Meeting" ? "SIMPLE FOLLOW-UP AGENDA" : `STANDARDIZED 10-POINT SEQUENCE (${targetTemplateConfig.policyTag.toUpperCase()})`,
                  bold: true,
                  size: 16,
                  color: "2B6CB0",
                }),
              ],
              spacing: { after: 200 },
            }),

            // Meeting Details Metadata Table
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "MEETING TITLE:", bold: true, size: 16 })] })],
                      width: { size: 2600, type: WidthType.DXA },
                      shading: { fill: "F1F5F9" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: record.title, bold: true, size: 16 })] })],
                      width: { size: 6800, type: WidthType.DXA },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "TEMPLATE FORMAT:", bold: true, size: 16 })] })],
                      width: { size: 2600, type: WidthType.DXA },
                      shading: { fill: "F1F5F9" },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${targetTemplateConfig.title}  •  ${targetTemplateConfig.badge}`,
                              bold: true,
                              color: "1A365D",
                              size: 16,
                            }),
                          ],
                        }),
                      ],
                      width: { size: 6800, type: WidthType.DXA },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "DATE & TIME:", bold: true, size: 16 })] })],
                      width: { size: 2600, type: WidthType.DXA },
                      shading: { fill: "F1F5F9" },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${record.date}  |  ${record.startTime} - ${record.endTime}`,
                              size: 16,
                            }),
                          ],
                        }),
                      ],
                      width: { size: 6800, type: WidthType.DXA },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "VENUE:", bold: true, size: 16 })] })],
                      width: { size: 2600, type: WidthType.DXA },
                      shading: { fill: "F1F5F9" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: record.venue || "Secondary Mathematics Staffroom", size: 16 })] })],
                      width: { size: 6800, type: WidthType.DXA },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "CHAIRPERSON:", bold: true, size: 16 })] })],
                      width: { size: 2600, type: WidthType.DXA },
                      shading: { fill: "F1F5F9" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: record.chairperson || "Mr. N. Mpofu (Head of Department)", size: 16 })] })],
                      width: { size: 6800, type: WidthType.DXA },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "MEETING TYPE:", bold: true, size: 16 })] })],
                      width: { size: 2600, type: WidthType.DXA },
                      shading: { fill: "F1F5F9" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: `${record.meetingType} (${targetTemplateConfig.policyTag})`, size: 16 })] })],
                      width: { size: 6800, type: WidthType.DXA },
                    }),
                  ],
                }),
              ],
              width: { size: 9400, type: WidthType.DXA },
            }),

            new Paragraph({ spacing: { before: 250, after: 100 }, text: "" }),

            // Policy Notice Banner
            new Paragraph({
              children: [
                new TextRun({
                  text: `STATUTORY POLICY NOTICE (${targetTemplateConfig.policyTag.toUpperCase()}):`,
                  bold: true,
                  size: 16,
                  color: "1A365D",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: targetTemplateConfig.summary,
                  italics: true,
                  size: 14,
                  color: "4A5568",
                }),
              ],
              spacing: { after: 200 },
            }),

            // Agenda Agenda Table
            new Paragraph({
              children: [
                new TextRun({
                  text: targetTemplateType === "Follow-up Meeting" ? "AGENDA" : `STANDARDIZED 10-POINT ORDER OF BUSINESS (${targetTemplateConfig.title.toUpperCase()}):`,
                  bold: true,
                  size: 18,
                  color: "1A365D",
                }),
              ],
              spacing: { after: 100 },
            }),

            new Table({
              rows: [
                new TableRow({
                  tableHeader: true,
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "ITEM", bold: true, size: 15 })], alignment: AlignmentType.CENTER })],
                      width: { size: 800, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "AGENDA TOPIC (STANDARDIZED)", bold: true, size: 15 })] })],
                      width: { size: 3000, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "TIME & LEAD", bold: true, size: 15 })] })],
                      width: { size: 1600, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "DISCUSSION FOCUS & STATUTORY OBJECTIVES", bold: true, size: 15 })] })],
                      width: { size: 4000, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                  ],
                }),
                ...templateItems.map((item) => {
                  const recordPoint = record.agendaPoints?.find((p) => p.pointNumber === item.pointNumber);
                  return new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: `${item.pointNumber}`, bold: true, size: 15 })], alignment: AlignmentType.CENTER })],
                        width: { size: 800, type: WidthType.DXA },
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: item.title, bold: true, size: 15, color: "1A365D" })] })],
                        width: { size: 3000, type: WidthType.DXA },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: `${item.timeAllocated}`, bold: true, size: 14 })] }),
                          new Paragraph({ children: [new TextRun({ text: item.lead, italics: true, size: 13, color: "4A5568" })] }),
                        ],
                        width: { size: 1600, type: WidthType.DXA },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: item.guidelineDescription, size: 14 })] }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: `Draft Notes: ${recordPoint?.notes || item.defaultNotes}`,
                                size: 13,
                                color: "2B6CB0",
                              }),
                            ],
                            spacing: { before: 50 },
                          }),
                        ],
                        width: { size: 4000, type: WidthType.DXA },
                      }),
                    ],
                  });
                }),
              ],
              width: { size: 9400, type: WidthType.DXA },
            }),

            new Paragraph({ spacing: { before: 300, after: 100 }, text: "" }),

            // Department Attendance & Signatures Table
            new Paragraph({
              children: [
                new TextRun({
                  text: "DEPARTMENT ATTENDANCE REGISTER & SIGN-OFF TABLE:",
                  bold: true,
                  size: 18,
                  color: "1A365D",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: targetTemplateType === "Follow-up Meeting" ? "Notes / decisions / action items can be recorded during the meeting." : "By signing below, each departmental member acknowledges receipt of this agenda, confirms attendance, and commits to the moderation, pacing, and intervention deadlines stipulated herein.",
                  italics: true,
                  size: 14,
                  color: "4A5568",
                }),
              ],
              spacing: { after: 150 },
            }),

            new Table({
              rows: [
                new TableRow({
                  tableHeader: true,
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "NO.", bold: true, size: 15 })], alignment: AlignmentType.CENTER })],
                      width: { size: 600, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "TEACHER NAME & DESIGNATION", bold: true, size: 15 })] })],
                      width: { size: 2800, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "DEPARTMENT ALLOCATION", bold: true, size: 15 })] })],
                      width: { size: 2200, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "DATE", bold: true, size: 15 })], alignment: AlignmentType.CENTER })],
                      width: { size: 1400, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "SIGNATURE SPACE", bold: true, size: 15 })], alignment: AlignmentType.CENTER })],
                      width: { size: 2400, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                  ],
                }),
                ...teachers.map((t, idx) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: `${idx + 1}`, size: 15 })], alignment: AlignmentType.CENTER })],
                        width: { size: 600, type: WidthType.DXA },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: t.name, bold: true, size: 15 })] }),
                          new Paragraph({ children: [new TextRun({ text: t.role, italics: true, size: 13, color: "4A5568" })] }),
                        ],
                        width: { size: 2800, type: WidthType.DXA },
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: t.allocation, size: 14 })] })],
                        width: { size: 2200, type: WidthType.DXA },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: t.signedDate || record.date || "____/____/2026", size: 14 })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 1400, type: WidthType.DXA },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: t.signed ? `[SIGNED: ${t.name}]` : "___________________________",
                                bold: t.signed,
                                color: t.signed ? "1F4D3D" : "000000",
                                size: 14,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 2400, type: WidthType.DXA },
                      }),
                    ],
                  })
                ),
              ],
              width: { size: 9400, type: WidthType.DXA },
            }),

            new Paragraph({ spacing: { before: 300, after: 100 }, text: "" }),

            // HOD Final Sign-off
            new Paragraph({
              children: [
                new TextRun({
                  text: "HEAD OF DEPARTMENT CERTIFICATION & APPROVAL:",
                  bold: true,
                  size: 16,
                  color: "1A365D",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: targetTemplateType === "Follow-up Meeting" ? "Follow-up agenda prepared for practical departmental use." : "I hereby confirm that this department meeting agenda has been constructed and circulated in strict adherence to the Eagle House School HOD Governance Handbook §1 standard meeting record.",
                  size: 14,
                }),
              ],
              spacing: { after: 150 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "HOD Signature:  ____________________________________        Date:  ____________________",
                  bold: true,
                  size: 15,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Eagle_House_${targetTemplateConfig.title.replace(/\s+/g, "_")}_Agenda_${record.date}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper: Export Complete Minutes and Action Tracker to Word (.docx)
  const exportMinutesDocx = async (record: MeetingRecord) => {
    const teachers = record.teacherSignatures || defaultDepartmentTeachers;

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "EAGLE HOUSE SCHOOL", bold: true, size: 28, color: "1A365D" })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "praxis BORDERLESS LEARNING  •  DEPARTMENT OF MATHEMATICS & MATHEMATICAL LITERACY",
                  bold: true,
                  size: 16,
                  color: "4A5568",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: `OFFICIAL MEETING MINUTES & ACCOUNTABILITY TRACKER\n${record.title.toUpperCase()}`,
                  bold: true,
                  size: 22,
                  color: "2B6CB0",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Date: ${record.date}  |  Time: ${record.startTime} - ${record.endTime}  |  Venue: ${record.venue || "Staffroom"}`,
                  bold: true,
                  size: 16,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Chairperson: ${record.chairperson || "Mr. N. Mpofu (HOD)"}  |  Attendees: ${record.attendees.join(", ")}`,
                  size: 16,
                }),
              ],
              spacing: { after: 200 },
            }),

            // Agenda Minutes Details
            new Paragraph({
              children: [
                new TextRun({
                  text: "RECORDED MINUTES (STANDARDIZED 10-POINT SEQUENCE):",
                  bold: true,
                  size: 18,
                  color: "1A365D",
                }),
              ],
              spacing: { after: 100 },
            }),
            ...record.agendaPoints.map(
              (pt) =>
                new Paragraph({
                  spacing: { before: 80 },
                  children: [
                    new TextRun({ text: `${pt.pointNumber}. ${pt.title}: `, bold: true, size: 16, color: "1A365D" }),
                    new TextRun({ text: pt.notes || "Deliberated and recorded.", size: 15 }),
                  ],
                })
            ),

            new Paragraph({ spacing: { before: 200, after: 100 }, text: "" }),

            // Action Items Table
            new Paragraph({
              children: [
                new TextRun({
                  text: "ACTION ITEMS & ACCOUNTABILITY TRACKER:",
                  bold: true,
                  size: 18,
                  color: "C53030",
                }),
              ],
              spacing: { after: 100 },
            }),
            new Table({
              rows: [
                new TableRow({
                  tableHeader: true,
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "TASK DESCRIPTION", bold: true, size: 15 })] })],
                      width: { size: 4500, type: WidthType.DXA },
                      shading: { fill: "FEE2E2" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "PERSON RESPONSIBLE", bold: true, size: 15 })] })],
                      width: { size: 2200, type: WidthType.DXA },
                      shading: { fill: "FEE2E2" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "TARGET DATE", bold: true, size: 15 })] })],
                      width: { size: 1500, type: WidthType.DXA },
                      shading: { fill: "FEE2E2" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "STATUS", bold: true, size: 15 })] })],
                      width: { size: 1200, type: WidthType.DXA },
                      shading: { fill: "FEE2E2" },
                    }),
                  ],
                }),
                ...record.actionItems.map(
                  (act) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: act.description, size: 14 })] })],
                          width: { size: 4500, type: WidthType.DXA },
                        }),
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: act.responsible, bold: true, size: 14 })] })],
                          width: { size: 2200, type: WidthType.DXA },
                        }),
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: act.deadline, size: 14 })] })],
                          width: { size: 1500, type: WidthType.DXA },
                        }),
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: act.status, bold: true, size: 14 })] })],
                          width: { size: 1200, type: WidthType.DXA },
                        }),
                      ],
                    })
                ),
              ],
              width: { size: 9400, type: WidthType.DXA },
            }),

            new Paragraph({ spacing: { before: 250, after: 100 }, text: "" }),

            // Department Signatures Table
            new Paragraph({
              children: [
                new TextRun({
                  text: "DEPARTMENT MEMBER CONFIRMATION & SIGNATURES:",
                  bold: true,
                  size: 18,
                  color: "1A365D",
                }),
              ],
              spacing: { after: 100 },
            }),
            new Table({
              rows: [
                new TableRow({
                  tableHeader: true,
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "NO.", bold: true, size: 15 })], alignment: AlignmentType.CENTER })],
                      width: { size: 600, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "TEACHER NAME & ROLE", bold: true, size: 15 })] })],
                      width: { size: 2800, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "ALLOCATION", bold: true, size: 15 })] })],
                      width: { size: 2200, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "DATE", bold: true, size: 15 })], alignment: AlignmentType.CENTER })],
                      width: { size: 1400, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "SIGNATURE", bold: true, size: 15 })], alignment: AlignmentType.CENTER })],
                      width: { size: 2400, type: WidthType.DXA },
                      shading: { fill: "E2E8F0" },
                    }),
                  ],
                }),
                ...teachers.map((t, idx) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: `${idx + 1}`, size: 15 })], alignment: AlignmentType.CENTER })],
                        width: { size: 600, type: WidthType.DXA },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: t.name, bold: true, size: 15 })] }),
                          new Paragraph({ children: [new TextRun({ text: t.role, italics: true, size: 13, color: "4A5568" })] }),
                        ],
                        width: { size: 2800, type: WidthType.DXA },
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: t.allocation, size: 14 })] })],
                        width: { size: 2200, type: WidthType.DXA },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: t.signedDate || record.date || "____/____/2026", size: 14 })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 1400, type: WidthType.DXA },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: t.signed ? `[SIGNED: ${t.name}]` : "___________________________",
                                bold: t.signed,
                                color: t.signed ? "1F4D3D" : "000000",
                                size: 14,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 2400, type: WidthType.DXA },
                      }),
                    ],
                  })
                ),
              ],
              width: { size: 9400, type: WidthType.DXA },
            }),

            new Paragraph({ spacing: { before: 250, after: 100 }, text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "HOD Signature:  ____________________________________        Date:  ____________________",
                  bold: true,
                  size: 15,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Eagle_House_Maths_Meeting_Minutes_${record.date}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle action status
  const toggleActionStatus = (actionId: string) => {
    const updated = {
      ...selectedMeeting,
      actionItems: selectedMeeting.actionItems.map((item) => {
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
    updateMeetingsAndPersist(meetings.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleMeetingProcessed = (record: MeetingRecord, target: "minutes" | "agenda") => {
    updateMeetingsAndPersist([record, ...meetings]);
    setSelectedMeeting(record);
    setViewSubTab("agenda");
    setActiveTab("scheduled");
  };

  const handleDownloadFromIntake = (record: MeetingRecord, target: "minutes" | "agenda") => {
    if (target === "agenda") {
      exportAgendaDraftDocx(record);
    } else {
      exportMinutesDocx(record);
    }
  };

  const activeTeachers = selectedMeeting.teacherSignatures || defaultDepartmentTeachers;

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Department Meetings & Agendas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
              HOD Handbook §1 Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create, review and export practical department meeting agendas and minutes. Use a formal template when governance detail is required; use Follow-up Meeting for a short practical agenda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "scheduled"
                ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Meeting Minutes & Agendas
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "upload"
                ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Upload & OCR Intake</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
              OCR • Audio • Typed
            </span>
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "generate"
                ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            + Generate & Draft Agenda
          </button>
          <button
            onClick={() => setActiveTab("actions")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "actions"
                ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Action Tracker ({selectedMeeting.actionItems.length})
          </button>
        </div>
      </div>

      {/* SCHEDULED TAB */}
      {activeTab === "scheduled" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Meetings List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Department Meeting Records
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {meetings.filter((m) => templateFilter === "All" || m.templateType === templateFilter).length} Records
              </span>
            </div>

            {/* Template Filter Pills */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px]">
              {(["All", "Standard Staff Meeting", "Moderation Meeting", "Curriculum Planning"] as const).map((filter) => {
                const isSelected = templateFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setTemplateFilter(filter)}
                    className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {filter === "All" ? "All Formats" : filter.replace(" Meeting", "")}
                  </button>
                );
              })}
            </div>

            {meetings
              .filter((m) => templateFilter === "All" || m.templateType === templateFilter)
              .map((m) => {
                const meetingTmpl = MEETING_TEMPLATE_CONFIGS.find((t) => t.id === m.templateType) || MEETING_TEMPLATE_CONFIGS[0];
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMeeting(m)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedMeeting.id === m.id
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{m.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          m.status === "Completed"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    {/* Template Badge */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded text-[10px] font-semibold">
                        {m.templateType || "Standard Staff Meeting"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {meetingTmpl.policyTag}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {m.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {m.startTime} - {m.endTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{m.minutesSummary}</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        {m.venue || "Staffroom"}
                      </span>
                      <span className="font-semibold text-blue-700 dark:text-blue-400">Agenda ✓</span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Right Column: Active Meeting Document with Word DOCX Download */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            {/* Header with Title and DOCX Download Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedMeeting.title}</h2>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded font-semibold">
                    {selectedMeeting.templateType || "Standard Staff Meeting"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-mono">
                    {selectedMeeting.meetingType}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <strong>Date:</strong> {selectedMeeting.date} ({selectedMeeting.startTime} - {selectedMeeting.endTime})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Venue:</strong> {selectedMeeting.venue || "Secondary Mathematics Staffroom"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Chair:</strong> {selectedMeeting.chairperson || "Mr. N. Mpofu (HOD)"}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Download DOCX & Intake */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab("upload")}
                  className="px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Upload handwritten scan (OCR), audio recording, or typed notes to populate template"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload / OCR Intake</span>
                </button>

                <button
                  onClick={() => exportAgendaDraftDocx(selectedMeeting)}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  title="Download clean official 10-point Agenda Draft with teacher signature spaces as a Microsoft Word document (.docx)"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Agenda (.docx)</span>
                </button>

                <button
                  onClick={() => exportMinutesDocx(selectedMeeting)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Download full meeting minutes with discussion notes, action items, and teacher signatures as a Word document (.docx)"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Minutes (.docx)</span>
                </button>
              </div>
            </div>

            {/* Sub Tabs: Agenda Agenda View vs Department Signatures */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setViewSubTab("agenda")}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewSubTab === "agenda"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Agenda Agenda & Minutes Draft</span>
              </button>

              <button
                onClick={() => setViewSubTab("signatures")}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewSubTab === "signatures"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>
                  Department Sign-Off Register ({activeTeachers.filter((t) => t.signed).length}/{activeTeachers.length})
                </span>
              </button>
            </div>

            {/* TAB CONTENT: Agenda Agenda Layout */}
            {viewSubTab === "agenda" && (() => {
              const activeTmpl =
                MEETING_TEMPLATE_CONFIGS.find((t) => t.id === selectedMeeting.templateType) ||
                MEETING_TEMPLATE_CONFIGS[0];
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-blue-600" />
                      {activeTmpl.title} — Agenda
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {activeTmpl.policyTag} Guidelines
                    </span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                    {selectedMeeting.agendaPoints.map((pt) => {
                      const stdMeta = activeTmpl.items.find(
                        (h) => h.pointNumber === pt.pointNumber
                      ) || HOD_STANDARD_10_AGENDA_ITEMS.find((h) => h.pointNumber === pt.pointNumber);
                      return (
                        <div key={pt.pointNumber} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs flex items-center justify-center font-bold">
                                {pt.pointNumber}
                              </span>
                              {pt.title}
                            </span>
                            <div className="flex items-center gap-2 text-[11px]">
                              {stdMeta?.timeAllocated && (
                                <span className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                                  {stdMeta.timeAllocated}
                                </span>
                              )}
                              {stdMeta?.lead && (
                                <span className="text-blue-700 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                  Lead: {stdMeta.lead}
                                </span>
                              )}
                            </div>
                          </div>

                          {stdMeta?.guidelineDescription && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pl-7">
                              Framework Directive: {stdMeta.guidelineDescription}
                            </p>
                          )}

                          <div className="pl-7 pt-1">
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                              {pt.notes || "Discussed and approved by department."}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* TAB CONTENT: Department Sign-Off Register */}
            {viewSubTab === "signatures" && (
              <div className="space-y-4">
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    Official Department Attendance & Sign-off Register
                  </div>
                  <p className="text-xs text-blue-800 mt-1">
                    Educators can sign to confirm attendance and acknowledge the meeting record and agreed actions.
                  </p>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-3 w-10 text-center">No.</th>
                        <th className="p-3">Department Teacher Name & Role</th>
                        <th className="p-3">Subject / Grade Allocation</th>
                        <th className="p-3 text-center">Date</th>
                        <th className="p-3 text-center">Space to Sign (Hardcopy / Digital)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeTeachers.map((teacher, idx) => (
                        <tr key={teacher.teacherId} className="hover:bg-slate-50/60">
                          <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{teacher.name}</span>
                            <span className="text-[11px] text-slate-500">{teacher.role}</span>
                          </td>
                          <td className="p-3 text-slate-600 font-medium">{teacher.allocation}</td>
                          <td className="p-3 text-center text-slate-500 font-mono text-[11px]">
                            {teacher.signedDate || selectedMeeting.date || "____/____/2026"}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              {teacher.signed ? (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Signed Electronically</span>
                                </div>
                              ) : (
                                <div className="font-mono text-slate-400 tracking-wider text-[11px]">
                                  ___________________________
                                </div>
                              )}
                              <button
                                onClick={() => toggleTeacherSignature(teacher.teacherId)}
                                className={`text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer ${
                                  teacher.signed
                                    ? "text-slate-400 hover:text-slate-600"
                                    : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-medium"
                                }`}
                              >
                                {teacher.signed ? "Clear Signature" : "Sign Now"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* HOD Endorsement statement */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900 block">
                    Head of Department (HOD) Declaration & Certification:
                  </span>
                  <p className="text-slate-600 italic">
                    "I hereby certify that this department meeting was convened in full accordance with the Eagle House School HOD Handbook §1 standardized meeting record, and all assessment moderation guidelines (§7.1 and §7.2) were explicitly reviewed and recorded."
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                    <span className="font-semibold text-slate-800">
                      HOD Signature: <span className="font-mono underline">Mr. N. Mpofu</span>
                    </span>
                    <span className="text-slate-500 font-mono">Date: {selectedMeeting.date}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Items Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Action Items Agreed & Assigned ({selectedMeeting.actionItems.length}):</span>
                <span className="text-[11px] text-slate-500 lowercase font-normal">
                  click checkbox to update status
                </span>
              </h4>

              <div className="space-y-2">
                {selectedMeeting.actionItems.map((act) => (
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

      {/* UPLOAD & OCR / AUDIO INTAKE TAB */}
      {activeTab === "upload" && (
        <MeetingUploadIntake
          onMeetingProcessed={handleMeetingProcessed}
          onDownloadDocx={handleDownloadFromIntake}
          defaultTeachers={defaultDepartmentTeachers}
          initialTemplateType={selectedTemplate}
        />
      )}

      {/* GENERATE TAB */}
      {activeTab === "generate" && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Quick link to Upload Intake */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <span className="font-bold text-blue-900 dark:text-blue-300 block">
                  Have handwritten meeting notes, a voice recording, or a document?
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Use our multimodal AI Intake to run OCR on handwritten scans, transcribe audio, or parse Word documents directly into this template.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-xs text-xs whitespace-nowrap transition-colors"
            >
              Open Upload & OCR Intake →
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Meeting Agenda & Minutes Generator
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose a meeting template format compliant with Eagle House School governance standards. The AI engine synthesizes a structured meeting record, pre-populates department members, and generates a downloadable Word document (.docx).
              </p>
            </div>

            {/* Template Selector for Generator */}
            {(() => {
              const activeTmplConfig =
                MEETING_TEMPLATE_CONFIGS.find((t) => t.id === selectedTemplate) ||
                MEETING_TEMPLATE_CONFIGS[0];
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                      Select Meeting Agenda Template:
                    </label>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      Current: <strong>{activeTmplConfig.title}</strong> ({activeTmplConfig.policyTag})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {MEETING_TEMPLATE_CONFIGS.map((tmpl) => {
                      const isSelected = selectedTemplate === tmpl.id;
                      return (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => handleTemplateChange(tmpl.id)}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                              : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {tmpl.policyTag}
                              </span>
                              {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                            </div>
                            <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                              {tmpl.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug line-clamp-3">
                              {tmpl.summary}
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                            <span>{tmpl.items.length} Items</span>
                            <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{tmpl.badge}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Presets dynamically mapped to active template */}
                  <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {activeTmplConfig.title} Presets:
                    </span>
                    {activeTmplConfig.quickPresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setMeetingTitle(preset.title);
                          setMeetingType(preset.type as any);
                          setCustomFocus(preset.focus);
                        }}
                        className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] cursor-pointer font-medium transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Meeting Title</label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Meeting Date</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Meeting Type</label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Regular Departmental">Regular Departmental</option>
                  <option value="Pre-Moderation Calibration">Pre-Moderation Calibration</option>
                  <option value="Post-Exam Review">Post-Exam Review</option>
                  <option value="Urgent / Escalation">Urgent / Escalation</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Meeting Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g. Secondary Mathematics Staffroom"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Department Context, Discussion Focus & Statutory Items
                </label>
                <textarea
                  rows={3}
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Specify upcoming assessment tasks, moderation notes, ATP topics to review, or learner intervention groups..."
                />
              </div>
            </div>

            <button
              onClick={handleGenerateAgenda}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing {selectedTemplate} Agenda & Guidelines...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Official {selectedTemplate} Agenda & Minutes Draft</span>
                </>
              )}
            </button>
          </div>

          {/* Live Preview of Agenda Layout with Signature Section */}
          {(() => {
            const previewTmpl =
              MEETING_TEMPLATE_CONFIGS.find((t) => t.id === selectedTemplate) ||
              MEETING_TEMPLATE_CONFIGS[0];
            return (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                        Live Preview: {previewTmpl.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono">
                        {previewTmpl.policyTag}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{meetingTitle}</h3>
                  </div>
                  <button
                    onClick={() =>
                      exportAgendaDraftDocx({
                        id: "DRAFT-01",
                        title: meetingTitle,
                        date: meetingDate,
                        startTime,
                        endTime,
                        venue,
                        chairperson: "Mr. N. Mpofu (HOD)",
                        meetingType,
                        templateType: selectedTemplate,
                        attendees: defaultDepartmentTeachers.map((t) => t.name),
                        apologies: [],
                        teacherSignatures: defaultDepartmentTeachers,
                        agendaPoints: previewTmpl.items.map((item) => ({
                          pointNumber: item.pointNumber,
                          title: item.title,
                          notes: customFocus && item.pointNumber === 3 ? `${item.defaultNotes} Focus: ${customFocus}` : item.defaultNotes,
                        })),
                        actionItems: [],
                        minutesSummary: `Official preview draft conforming to ${previewTmpl.title} guidelines.`,
                        status: "Draft",
                      })
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download This Draft (.docx)</span>
                  </button>
                </div>

                {/* 10 Points in Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      {previewTmpl.title} Sequence (10 Points)
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">{previewTmpl.badge}</span>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                    {previewTmpl.items.map((item) => (
                      <div key={item.pointNumber} className="p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.pointNumber}. {item.title}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {item.timeAllocated} • {item.lead}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.guidelineDescription}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Department Attendance and Signature Preview */}
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Department Teachers Attendance & Sign-off Register
                    </h4>
                    <span className="text-[11px] text-slate-500">All department members included</span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-2.5 w-10 text-center">No.</th>
                          <th className="p-2.5">Teacher Name & Designation</th>
                          <th className="p-2.5">Allocation</th>
                          <th className="p-2.5 text-center">Date</th>
                          <th className="p-2.5 text-center">Space to Sign</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {defaultDepartmentTeachers.map((teacher, idx) => (
                          <tr key={teacher.teacherId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-2.5">
                              <span className="font-bold text-slate-900 dark:text-white block">{teacher.name}</span>
                              <span className="text-[10px] text-slate-500">{teacher.role}</span>
                            </td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">{teacher.allocation}</td>
                            <td className="p-2.5 text-center font-mono text-[11px] text-slate-500">
                              {meetingDate || "____/____/2026"}
                            </td>
                            <td className="p-2.5 text-center font-mono text-[11px] text-slate-400">
                              ___________________________
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ACTION TRACKER TAB */}
      {activeTab === "actions" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Department Action Tracker & Accountability Reminders
              </h2>
              <p className="text-xs text-slate-500">
                Action points agreed upon during department meetings are tracked through completion.
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
                {meetings.flatMap((m) =>
                  m.actionItems.map((act) => (
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
