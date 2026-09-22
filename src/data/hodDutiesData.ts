import { HodDutySection } from "../types";

export const HOD_DUTIES_INDEX: HodDutySection[] = [
  {
    id: "leadership",
    number: 1,
    title: "Department Leadership",
    keyResponsibility: "Setting direction, model standards, take ownership of outcomes.",
    practiceInAction:
      "Chairing meetings; setting department goals; being visible and approachable; making timely decisions.",
    keyToolsAndChecklists: [
      "Weekly HOD Checklist (check comms, pacing, educator & learner concerns, outstanding actions)",
      "Monthly HOD Checklist (step back from day-to-day, review bigger picture, leadership report)",
      "Standard Department Meeting Agenda (10-point structured sequence)",
      "Action Tracker with Person Responsible & Deadlines",
    ],
    detailedGuidance: [
      "The goal of an HOD is not to do everything themselves, but to ensure that the department functions effectively.",
      "Lead by example in lesson preparation, punctuality, and adherence to Eagle House assessment deadlines.",
      "Protect your team's focus on teaching and learning while ensuring compliance with IEB SAGS, CAPS, and Cambridge expectations.",
    ],
    templates: ["Weekly Checklist", "Monthly Checklist", "Annual Department Planning Cycle"],
  },
  {
    id: "curriculum",
    number: 2,
    title: "Curriculum Management & Pacing",
    keyResponsibility: "Ensure what is taught is complete, sequenced, and appropriate.",
    practiceInAction:
      "Reviewing schemes of work; checking pacing against the term plan; identifying and closing curriculum gaps.",
    keyToolsAndChecklists: [
      "Curriculum Pacing Tracker (comparison of completed topics vs. ATP / SAGS milestones)",
      "Term-by-Term Curriculum Review Matrix",
      "Syllabus Gap Identification & Remediation Protocol",
    ],
    detailedGuidance: [
      "Ensure senior phase (Grades 8 & 9) aligns with CAPS ATPs, FET aligns with IEB SAGS, and Cambridge grades meet syllabus requirements.",
      "Conduct bi-weekly pacing spot checks to prevent rushed content delivery before examination periods.",
      "Identify common stumbling blocks (e.g. 3D Trigonometry, Financial Mathematics, Euclidean proofs) early.",
    ],
    templates: ["Curriculum Coverage Sheet", "Pacing Discrepancy Log"],
  },
  {
    id: "teaching-learning",
    number: 3,
    title: "Teaching & Learning (Observations & Walks)",
    keyResponsibility: "Support and monitor the quality of classroom practice across the department.",
    practiceInAction:
      "Learning walks; peer observation; sharing good practice; coaching conversations.",
    keyToolsAndChecklists: [
      "Observe -> Understand -> Support -> Improve Cycle",
      "Objective Observation vs. Subjective Judgement Guidelines",
      "'What? -> So What? -> Now What?' Feedback Framework",
      "8-Step Difficult Conversations Protocol",
    ],
    detailedGuidance: [
      "HOD monitoring must never create a culture of 'checking up on teachers'. It should feel like a supportive, ongoing conversation about what is working.",
      "Before the visit ask: What am I looking for? What is the purpose of this visit? Routine monitoring or targeted support?",
      "Use objective evidence: 'During the first 20 minutes, 5 of 22 learners contributed' rather than 'The lesson was poorly taught'.",
      "Use the feedback framework: What was observed? Why it matters / impact on learners? Actionable next steps agreed upon.",
    ],
    templates: ["Learning Walk Observation Sheet", "Teacher Feedback Card (What/So What/Now What)"],
  },
  {
    id: "assessment-data",
    number: 4,
    title: "Assessment & Moderation (Pre & Post)",
    keyResponsibility: "Ensure assessment is valid, fair, consistent, and used to inform teaching.",
    practiceInAction:
      "Pre-moderating tasks 5 days prior; post-moderating sample of 10% scripts in purple pen; analysing results; setting up interventions.",
    keyToolsAndChecklists: [
      "Eagle House School Internal Pre-Moderation Report (12-point checklist)",
      "Eagle House School Test Cover Page Specifications",
      "Policy §7.1: Pre-Assessment submission rule (5 school days prior)",
      "Policy §7.2: Post-Assessment minimum 10% sample audit (Top/Average/Weak in purple pen)",
      "Phase Weights (Gr 8-9: 40/60 SBA/Exam; Gr 10-12: 25/75 SBA/Exam)",
    ],
    detailedGuidance: [
      "Pre-moderation must verify: correct template, logo, date, duration, instruction clarity, numbering, diagram clarity, arithmetic total checks, and memorandum rigor.",
      "Cognitive demand check: Gr 8-9 CAPS requires 30% lower order, 40% middle order, 30% higher order. Gr 10-12 IEB requires strict SAGS distribution.",
      "Post-moderation: Audit addition of marks, mark scheme fidelity, consistency of method marks, and diagnostic annotations.",
    ],
    templates: ["Pre-Moderation Form", "Post-Moderation Audit Sheet", "Test Cover Page"],
  },
  {
    id: "learner-progress",
    number: 5,
    title: "Learner Progress & Intervention",
    keyResponsibility: "Monitoring outcomes and acting on data.",
    practiceInAction:
      "Tracking at-risk learners; baseline data analysis (CAT4); setting up and monitoring interventions.",
    keyToolsAndChecklists: [
      "Learner Intervention Tracker (Appendix 10: Learner, Concern, Evidence, Intervention, Responsible, Review Date, Outcome)",
      "Cognitive Ability Data (CAT4) vs. Attainment Tracking",
      "At-Risk Borderline Band Identification (<40% or dropping >10%)",
    ],
    detailedGuidance: [
      "Guiding Principle: Data should lead to action. A spreadsheet full of marks is only useful once someone asks what it means and does something about it.",
      "Look for patterns across classes, not only individual outliers.",
      "Every intervention needs a definite review date. Without one, intervention becomes a permanent label rather than a temporary measure.",
    ],
    templates: ["Learner Intervention Tracker (Appendix 10)", "Cohort Progress Dashboard"],
  },
  {
    id: "educator-development",
    number: 6,
    title: "Educator Development & Support",
    keyResponsibility: "Growing the capability and confidence of your team.",
    practiceInAction:
      "Regular check-ins; timely feedback; coaching conversations; identifying PD needs.",
    keyToolsAndChecklists: [
      "Professional Development Needs Analysis (Appendix 15: Educator, Development Area, Planned Action, Timeframe, Review Notes)",
      "Identify -> Plan -> Implement -> Reflect -> Review Cycle",
      "Department Mentorship & Resource Sharing",
    ],
    detailedGuidance: [
      "Identifying what your educators need to grow and helping them access it is one of the highest-leverage things an HOD can do.",
      "Conduct PD needs analysis with each member of your department at least once a year.",
      "Support new educators with marking calibration and curriculum sequencing.",
    ],
    templates: ["PD Needs Analysis (Appendix 15)", "Mentorship Check-in Log"],
  },
  {
    id: "communication",
    number: 7,
    title: "Communication & Confidentiality",
    keyResponsibility: "Keeping people informed, and escalating what matters.",
    practiceInAction:
      "Timely department notices; parent communication bridging; adherence to 5-question communication test.",
    keyToolsAndChecklists: [
      "The 5 Questions Before Communicating: Is it necessary? Accurate? Relevant? Timely? Appropriate for this audience?",
      "Parent Communication & Escalation Flowchart (Educator -> HOD -> Senior Leadership)",
      "Confidentiality Protocols (Staff matters, learner records, investigations)",
    ],
    detailedGuidance: [
      "Never promise a parent an outcome before the matter has been investigated. It is always acceptable to say you will look into it and respond within a reasonable timeframe.",
      "When a parent raises a departmental concern, the HOD plays an important bridging role between the classroom and Senior Leadership.",
      "Ensure marks and staff performance discussions are treated with strict confidentiality.",
    ],
    templates: ["Parent Meeting Record", "Department Notice Template"],
  },
  {
    id: "accountability",
    number: 8,
    title: "Accountability & Escalation Framework",
    keyResponsibility: "For yourself, your team, and your department's results.",
    practiceInAction:
      "Traffic-light decision framework (Green, Amber, Red); HOD red-flag check; managing boundaries.",
    keyToolsAndChecklists: [
      "HOD Escalation Guide (Green: HOD manages; Amber: HOD + Senior Leadership; Red: Immediate escalation)",
      "HOD Red-Flag Diagnostic Questions",
      "Delegation Framework (Task, Standard, Checkpoints, Outcome)",
    ],
    detailedGuidance: [
      "GREEN (HOD manages independently): Routine curriculum/timetable queries, single missed homework/minor lateness, normal resource requests, first-time low-level classroom concerns.",
      "AMBER (HOD works with Senior Leadership): Pattern of missed deadlines by an educator, parent complaint escalating in tone, curriculum concerns spanning multiple classes, recurring unresolved learner difficulties.",
      "RED (Immediate escalation): Any safeguarding concern, serious misconduct or allegations, safety threats of any kind, legal matters.",
      "Guiding Principle on Delegation: Delegating the task does not mean offloading responsibility. You remain accountable for the outcome.",
    ],
    templates: ["Incident Escalation Form", "Delegation Agreement Log"],
  },
  {
    id: "improvement",
    number: 9,
    title: "Department Improvement & Review Cycles",
    keyResponsibility: "Continuously raising the bar, one term at a time.",
    practiceInAction:
      "Termly reflection; curriculum review; post-exam audits; annual departmental planning.",
    keyToolsAndChecklists: [
      "HOD Annual Calendar & Rhythms",
      "Termly HOD Self-Reflection Checklist",
      "Exam Analysis & Future Academic Year Planning",
    ],
    detailedGuidance: [
      "While every school year brings surprises, most of an HOD's core work follows a predictable rhythm aligned with the Eagle House calendar.",
      "Use Term 4 to analyse final exam outcomes, review the syllabus delivery, and prepare staffing and resources for the next year.",
    ],
    templates: ["Termly Review Document", "Annual Department Strategy"],
  },
];

export const HOD_DUTIES = HOD_DUTIES_INDEX;

export const DIFFICULT_CONVERSATION_STEPS = [
  {
    step: 1,
    title: "Clarify the Issue",
    guidance: "Determine the exact behavior, pattern, or outcome that needs to change. Gather objective evidence (e.g. specific dates of late submissions, unmoderated papers) to avoid generalized claims.",
  },
  {
    step: 2,
    title: "Check Your Motives",
    guidance: "Ensure the conversation's goal is developmental. It must be focused on supporting the teacher to improve and protecting learner progress, not venting frustration or asserting power.",
  },
  {
    step: 3,
    title: "Choose the Right Setting",
    guidance: "Schedule a private, formal, and uninterrupted meeting. Allow enough time so the conversation doesn't feel rushed, and establish a calm, professional tone from the start.",
  },
  {
    step: 4,
    title: "State the Issue Directly",
    guidance: "Be clear, direct, and non-judgmental. Use the 'I-message' format: 'I noticed that the Grade 10 tests were duplicated without pre-moderation, which is required 5 school days prior under Policy 7.1.'",
  },
  {
    step: 5,
    title: "Listen to Their Perspective",
    guidance: "Allow the educator to explain their view of the situation. Active listening helps identify underlying bottlenecks, resource issues, or personal challenges that need addressing.",
  },
  {
    step: 6,
    title: "Focus on Impact (So What?)",
    guidance: "Explain why the issue matters. For example, explain how unmoderated tests risk errors that confuse students, disrupt lesson pacing, or breach IEB/CAPS compliance guidelines.",
  },
  {
    step: 7,
    title: "Agree on Action (Now What?)",
    guidance: "Collaborate on concrete, actionable next steps. Define the support the department will provide, the educator's responsibilities, and clear indicators of success.",
  },
  {
    step: 8,
    title: "Follow Up & Review Date",
    guidance: "Set a definite review date (e.g., in two weeks) to check progress. Document the agreed actions and outcomes in writing so both parties have a clear point of reference.",
  },
];

export const ESCALATION_FRAMEWORK = {
  green: {
    description: "Routine departmental matters managed independently by the HOD.",
    triggers: [
      "First-time minor educator lateness or single late submission of lesson planning.",
      "Single missed homework or low-level learner behavior concerns in class.",
      "Routine curriculum questions or standard classroom resource requests.",
    ],
    action: "Address directly with the teacher or learner. Record notes in internal department records for review during normal check-ins.",
  },
  amber: {
    description: "Escalating concerns requiring formal HOD intervention and SMT awareness.",
    triggers: [
      "A pattern of missed assessment deadlines (breaching Policy 7.1 five-day rule).",
      "Parental complaints escalating in tone or frequency regarding marking or class pacing.",
      "Recurring, unresolved learner learning or behavioral difficulties across multiple classes.",
    ],
    action: "Initiate the 8-step difficult conversation protocol. Draft a development and support plan (Appendix 15), notify Senior Leadership (SMT), and schedule bi-weekly check-ins.",
  },
  red: {
    description: "Critical safety or policy issues requiring immediate escalation to Senior Management.",
    triggers: [
      "Any safeguarding, child protection, or learner safety concerns.",
      "Allegations of serious educator professional misconduct, ethical breaches, or safety hazards.",
      "Critical assessment leaks, tampering with official SBA marks, or direct defiance of policy.",
    ],
    action: "Secure all physical or digital evidence immediately. Cease independent departmental action and report directly to the Principal or SMT within 2 hours.",
  },
};

export const OBSERVATION_FRAMEWORK = {
  what: "What did I see? Gather objective, observable, and quantifiable evidence from the learning walk. (e.g. 'In the first 15 minutes, 8 out of 24 learners were off-task; the teacher asked 4 closed recall questions.')",
  soWhat: "What is the impact? Analyze why this observation matters. (e.g. 'Learner passivity meant that misconceptions about algebraic fraction denominators went uncorrected before the homework was set.')",
  nowWhat: "What are the action steps? Co-create a simple, highly focused next step for the educator. (e.g. 'For next week's algebra lessons, implement a 5-minute warm-up using mini-whiteboards to check every learner's denominator choice.')",
};

export const RED_FLAG_QUESTIONS = [
  "Do all educators in my department know exactly what they are teaching next week?",
  "Are our termly results aligned with baseline CAT4 quantitative predictions?",
  "Has every assessment this term been pre-moderated at least 5 school days prior?",
  "Are we meeting the 10% stratified sample post-moderation requirement in purple pen?",
  "Who are the at-risk learners, and are their Appendix 10 interventions active?",
  "What professional development support does each team member need this term?",
  "Are homework checks occurring consistently at least twice weekly?",
  "Are all department meeting decisions logged in the action tracker?",
  "Do our assessment cognitive levels match CAPS or IEB SAGS requirements?",
  "Is there a healthy, supportive, and collaborative atmosphere in our department?",
];

export const HOD_CHECKLISTS = {
  weekly: [
    "Review upcoming assessment deadlines and enforce the 5 school days prior rule (§7.1)",
    "Conduct bi-weekly curriculum pacing spot checks against ATP and SAGS milestones",
    "Spot-check homework books for consistent feedback and marking compliance",
    "Monitor active Appendix 10 learner interventions and check-in with subject teachers",
    "Update the department action tracker and follow up on outstanding minutes tasks",
  ],
  monthly: [
    "Conduct classroom learning walks using the 'What? So What? Now What?' framework",
    "Evaluate professional development development plans (Appendix 15) for underperforming educators",
    "Host formal department meeting following the standardized 10-point agenda",
    "Compile the department results diagnostics and report to SMT",
    "Verify that the 10% stratified script sample post-moderation (§7.2) is completed in purple pen",
  ],
};

