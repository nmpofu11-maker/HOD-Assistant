export type CurriculumType = "IEB" | "CAPS" | "Cambridge";

export interface EducatorAllocation {
  id: string;
  curriculum: CurriculumType;
  grade: string;
  subject: string;
}

export interface DepartmentEducator {
  id: string;
  name: string;
  role: string;
  email: string;
  isMathsDept: boolean;
  status: "active" | "inactive";
  notes?: string;
  allocations: EducatorAllocation[];
}

export interface AcademicYearConfig {
  year: number;
  label: string;
  isActive: boolean;
  isArchived?: boolean;
  notes?: string;
  educators: DepartmentEducator[];
}

export interface DepartmentConfigState {
  currentAcademicYear: number;
  years: AcademicYearConfig[];
}

// Backward compatibility alias for views expecting StaffMember
export interface StaffMember {
  id: string;
  name: string;
  role?: string;
  email?: string;
  status?: "active" | "inactive";
  notes?: string;
  isMathsDept: boolean;
  allocations: {
    id?: string;
    curriculum: CurriculumType;
    grade: string;
    subject: string;
  }[];
}

export interface ModerationChecklistItem {
  item: string;
  status: "Yes" | "No" | "Partial";
  comment: string;
}

export interface PreModerationReport {
  id: string;
  schoolName: string;
  subject: string;
  code: string;
  teacher: string;
  grade: string;
  moderator: string;
  level: string;
  testDate: string;
  paper: string;
  testType: string;
  totalMarks: number;
  duration: string;
  moderatorComments: string;
  checklist: ModerationChecklistItem[];
  cognitiveDemandBreakdown: {
    lowerOrderPercent: number;
    middleOrderPercent: number;
    higherOrderPercent: number;
    analysisNotes: string;
  };
  overallOutcome: "Approved" | "Approved with Minor Corrections" | "Resubmission Required";
  requiredCorrections: string[];
  otherComments: string;
  firstDraftSignOff: {
    date: string;
    teacherSignature: string;
    moderatorSignature: string;
  };
  finalSignOff: {
    date: string;
    teacherSignature: string;
    moderatorSignature: string;
  };
  createdAt: string;
  savedQuestionPaperText?: string;
  savedMemoText?: string;
  uploadedTaskName?: string;
  uploadedMemoName?: string;
  term?: number;
}

export interface PostModerationScriptSample {
  learnerCode: string;
  band: "Top" | "Average" | "Weak";
  originalMark: number;
  moderatedMark: number;
  variance: number;
  auditNotes: string;
}

export interface PostModerationReport {
  id: string;
  taskTitle: string;
  subject: string;
  grade: string;
  teacher: string;
  moderator: string;
  sampleCompliance: {
    totalScripts: number;
    sampleCount: number;
    percentageSampled: number;
    isCompliantWith10PercentRule: boolean;
  };
  markingAccuracySummary: string;
  scriptFindings: PostModerationScriptSample[];
  commonErrorTrends: string[];
  markingQualityVerdict: "Marks Upheld" | "Minor Adjustments Applied" | "Remark Required Across Cohort";
  remediationRecommendations: string[];
  actionPlanForTeacher: string;
  createdAt: string;
  savedQuestionPaperText?: string;
  savedMemoText?: string;
  uploadedTaskName?: string;
  uploadedMemoName?: string;
  term?: number;
}

export type SubjectDifficultyTier =
  | "Tier 1: Advanced / High Rigour"
  | "Tier 2: Senior Core Pure Maths"
  | "Tier 3: Core FET Foundations"
  | "Tier 4: Applied / Contextual";

export interface StaffDeadlineItem {
  id: string;
  teacherName: string;
  subject: string;
  curriculum: CurriculumType;
  grade: string;
  taskName: string;
  testDate: string;
  preModDueDate: string; // 5 days prior
  preModStatus: "Pending" | "Submitted" | "Approved" | "Changes Requested" | "Overdue";
  postModStatus: "Not Due Yet" | "Sample Due" | "In Moderation" | "Completed";
  totalMarks: number;
  hasDocument: boolean;
  term?: number;
  difficultyCategory?: SubjectDifficultyTier;
}

export interface MeetingAgendaItem {
  number: number;
  title: string;
  allocatedMinutes: number;
  discussionNotes: string;
  decisions: string;
}

export interface ActionTrackerItem {
  id: string;
  action: string;
  personResponsible: string;
  deadline: string;
  status: "Pending" | "In Progress" | "Completed";
  notes?: string;
}

export interface DepartmentMeeting {
  id: string;
  title: string;
  date: string;
  term: string;
  meetingType: string;
  attendees: string[];
  meetingObjectives: string[];
  agendaItems: MeetingAgendaItem[];
  actionTracker: ActionTrackerItem[];
  escalationNotes: string;
  nextMeetingDate: string;
}

export type MeetingTemplateType =
  | "Standard Staff Meeting"
  | "Follow-up Meeting"
  | "Moderation Meeting"
  | "Curriculum Planning";

export interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingType: "Regular Departmental" | "Pre-Moderation Calibration" | "Post-Exam Review" | "Urgent / Escalation";
  templateType?: MeetingTemplateType;
  attendees: string[];
  apologies: string[];
  venue?: string;
  chairperson?: string;
  department?: string;
  teacherSignatures?: {
    teacherId: string;
    name: string;
    role: string;
    allocation: string;
    signed: boolean;
    signedDate?: string;
  }[];
  agendaPoints: {
    pointNumber: number;
    title: string;
    notes: string;
  }[];
  actionItems: {
    id: string;
    description: string;
    responsible: string;
    deadline: string;
    status: "Pending" | "In Progress" | "Completed";
  }[];
  minutesSummary: string;
  transcriptionSummary?: string;
  rawTranscribedText?: string;
  sourceType?: "manual" | "typed_upload" | "typed_file" | "typed_text" | "recorded_audio" | "handwritten_ocr";
  status: "Completed" | "Draft";
}

export interface LearnerInterventionItem {
  id: string;
  learnerName: string;
  grade: string;
  subject: string;
  concern: string;
  evidence: string;
  intervention: string;
  responsible: string;
  reviewDate: string;
  outcomeMetric: string;
  status: "Active" | "Under Review" | "Resolved";
}

export interface ResultsAnalysisData {
  id: string;
  subject: string;
  grade: string;
  term: string;
  taskName: string;
  cohortSize: number;
  averagePercentage: number;
  passRatePercentage: number;
  distinctionsCount: number;
  marksDistribution: { [range: string]: number };
  strandPerformance: { [strand: string]: number };
  overallHealth: "Exceeding Expectations" | "Satisfactory" | "Requires Targeted Intervention" | "Critical Concern";
  executiveSummary: string;
  keyStrengths: string[];
  criticalGaps: {
    strand: string;
    observedWeakness: string;
    rootCause: string;
    pedagogicalFix: string;
  }[];
  learnerInterventions: LearnerInterventionItem[];
  departmentActionDirectives: string[];
  curriculumAdjustments: string;
}

export interface HodDutySection {
  id: string;
  title: string;
  number: number;
  keyResponsibility: string;
  practiceInAction: string;
  keyToolsAndChecklists: string[];
  detailedGuidance: string[];
  escalationRules?: string[];
  templates?: string[];
}

export interface ClassroomVisitRecord {
  id: string;
  educatorName: string;
  subject: string;
  grade: string;
  curriculum: CurriculumType;
  visitDate: string;
  focusArea: string;
  observer: string;
  whatObserved: string;
  soWhatImpact: string;
  nowWhatAction: string;
  commendations: string[];
  growthAreas: string[];
  followUpDate?: string;
  status: "Draft" | "Finalised";
  createdAt: string;
}
