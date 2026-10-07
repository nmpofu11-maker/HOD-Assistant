import { z } from 'zod';

export const PreModerationSchema = z.object({
  subject: z.string(),
  code: z.string(),
  teacher: z.string(),
  grade: z.string(),
  moderator: z.string(),
  level: z.string(),
  testDate: z.string(),
  paper: z.string(),
  testType: z.string(),
  totalMarks: z.number(),
  moderatorComments: z.string(),
  cognitiveDemandBreakdown: z.object({
    lowerOrderPercent: z.number(),
    middleOrderPercent: z.number(),
    higherOrderPercent: z.number(),
    analysisNotes: z.string(),
  }),
  checklist: z.array(z.object({
    item: z.string(),
    status: z.enum(["Yes", "No", "Partial"]),
    comment: z.string(),
  })),
  overallOutcome: z.enum(["Approved", "Approved with Minor Corrections", "Resubmission Required"]),
  requiredCorrections: z.array(z.string()),
  otherComments: z.string(),
});

export const PostModerationSchema = z.object({
  subject: z.string(),
  grade: z.string(),
  teacher: z.string(),
  moderator: z.string(),
  sampleCompliance: z.object({
    totalScripts: z.number(),
    sampleCount: z.number(),
    percentageSampled: z.number(),
    isCompliantWith10PercentRule: z.boolean(),
  }),
  markingAccuracySummary: z.string(),
  scriptFindings: z.array(z.object({
    learnerCode: z.string(),
    band: z.enum(["Top", "Average", "Weak"]),
    originalMark: z.number(),
    moderatedMark: z.number(),
    variance: z.number(),
    auditNotes: z.string(),
  })),
  commonErrorTrends: z.array(z.string()),
  markingQualityVerdict: z.enum(["Marks Upheld", "Minor Adjustments Applied", "Remark Required Across Cohort"]),
  remediationRecommendations: z.array(z.string()),
  actionPlanForTeacher: z.string(),
});

export const MeetingSchema = z.object({
  title: z.string(),
  templateType: z.string().default("Standard Staff Meeting"),
  date: z.string(),
  attendees: z.array(z.string()),
  agendaPoints: z.array(z.object({
    pointNumber: z.number(),
    title: z.string(),
    notes: z.string(),
  })),
  actionItems: z.array(z.object({
    id: z.string(),
    description: z.string(),
    responsible: z.string(),
    deadline: z.string(),
    status: z.enum(["Pending", "In Progress", "Completed"]),
  })),
  minutesSummary: z.string(),
  rawTranscribedText: z.string().optional(),
});

export const ResultsSchema = z.object({
  executiveSummary: z.string(),
  subject: z.string(),
  grade: z.string(),
  term: z.string(),
  overallHealth: z.enum(["Exceeding Expectations", "Satisfactory", "Requires Targeted Intervention", "Critical Concern"]),
  keyStrengths: z.array(z.string()),
  criticalGaps: z.array(z.object({
    strand: z.string(),
    observedWeakness: z.string(),
    rootCause: z.string(),
    pedagogicalFix: z.string(),
  })),
  learnerInterventions: z.array(z.object({
    learnerName: z.string(),
    concern: z.string(),
    evidence: z.string(),
    intervention: z.string(),
    responsible: z.string(),
    reviewDate: z.string(),
    outcomeMetric: z.string(),
  })),
  departmentActionDirectives: z.array(z.string()),
  curriculumAdjustments: z.string(),
});

export const DeadlineSchema = z.object({
  teacherName: z.string(),
  subject: z.string(),
  curriculum: z.enum(["IEB", "CAPS", "Cambridge"]),
  grade: z.string(),
  taskName: z.string(),
  testDate: z.string(),
  totalMarks: z.number(),
  term: z.number().optional(),
});

export const ScriptAnalysisSchema = z.object({
  totalMarkDetected: z.number(),
  calculationErrorFound: z.boolean(),
  calculationAuditNotes: z.string(),
  markingConsistencyComments: z.string(),
  handwritingObservations: z.string(),
});
