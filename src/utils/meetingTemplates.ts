import { MeetingTemplateType } from "../types";

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
  { pointNumber: 1, title: "Welcome & Purpose", guidelineDescription: "", defaultNotes: "Confirm the purpose of the follow-up meeting and expected outcomes.", timeAllocated: "", lead: "" },
  { pointNumber: 2, title: "Review Previous Action Items", guidelineDescription: "", defaultNotes: "Review outstanding actions from the previous meeting and record progress.", timeAllocated: "", lead: "" },
  { pointNumber: 3, title: "Key Matters Requiring Follow-up", guidelineDescription: "", defaultNotes: "Discuss the specific matters that require attention since the previous meeting.", timeAllocated: "", lead: "" },
  { pointNumber: 4, title: "Decisions & Actions", guidelineDescription: "", defaultNotes: "Record decisions made, responsible persons and agreed deadlines.", timeAllocated: "", lead: "" },
  { pointNumber: 5, title: "Any Other Business", guidelineDescription: "", defaultNotes: "Record any additional matters raised for discussion.", timeAllocated: "", lead: "" },
  { pointNumber: 6, title: "Next Steps & Next Meeting", guidelineDescription: "", defaultNotes: "Confirm immediate next steps and the next meeting date if required.", timeAllocated: "", lead: "" },
];

export const MEETING_TEMPLATE_CONFIGS: MeetingTemplateConfig[] = [
  {
    id: "Follow-up Meeting",
    title: "Follow-up Meeting",
    badge: "Simple",
    policyTag: "Department Follow-up",
    summary: "A short practical agenda for following up previous decisions and outstanding actions.",
    iconName: "clipboard",
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
