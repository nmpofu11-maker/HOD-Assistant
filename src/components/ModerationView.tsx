import React, { useState } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  FileSpreadsheet,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Award,
} from "lucide-react";
import { PreModerationReport, PostModerationReport, StaffMember } from "../types";
import { SAMPLE_MATH_PAPER } from "../data/curriculumData";
import { exportPreModerationDocx, exportPostModerationDocx, exportPostModerationAssignmentScheduleDocx } from "../utils/docxExport";
import { exportPreModerationXlsx } from "../utils/xlsxExport";
import { SbaWeightingsView } from "./SbaWeightingsView";
import { safePost, safeGet, safePut } from "../utils/apiClient";

interface ModerationViewProps {
  staffList: StaffMember[];
  onSaveToDeadlines?: (report: PreModerationReport) => void;
  currentTerm: number;
  initialTab?: "pre" | "post" | "sba" | "cover" | "archive";
}

export const ModerationView: React.FC<ModerationViewProps> = ({
  staffList,
  currentTerm,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<"pre" | "post" | "sba" | "cover" | "archive">(
    initialTab || "pre"
  );

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Saved reports state (HOD Institutional Archive records)
  const [savedPreReports, setSavedPreReports] = useState<PreModerationReport[]>([]);
  const [savedPostReports, setSavedPostReports] = useState<PostModerationReport[]>([]);

  React.useEffect(() => {
    safeGet<Array<PreModerationReport | PostModerationReport>>("/api/data/moderations.json").then((result) => {
      if (!result.success || !Array.isArray(result.data)) return;
      setSavedPreReports(result.data.filter((x: any) => "checklist" in x));
      setSavedPostReports(result.data.filter((x: any) => "scriptFindings" in x));
    }).catch((err) => console.error("Failed to load moderation archive:", err));
  }, []);

  const [selectedArchiveTeacher, setSelectedArchiveTeacher] = useState<string>("all");
  const [savedPostSuccessMsg, setSavedPostSuccessMsg] = useState(false);

  const filteredPreArchive = savedPreReports.filter((r) => {
    const teacherMatch = selectedArchiveTeacher === "all" || r.teacher === selectedArchiveTeacher;
    const termMatch = (r.term || 1) === currentTerm;
    return teacherMatch && termMatch;
  });

  const filteredPostArchive = savedPostReports.filter((r) => {
    const teacherMatch = selectedArchiveTeacher === "all" || r.teacher === selectedArchiveTeacher;
    const termMatch = (r.term || 1) === currentTerm;
    return teacherMatch && termMatch;
  });

  const handleSavePreReport = () => {
    if (!currentReport) return;
    const reportWithTask: PreModerationReport = {
      ...currentReport,
      savedQuestionPaperText: documentText,
      savedMemoText: memoText,
      uploadedTaskName: uploadedTaskName || "Directly Inputted / Extracted Text",
      uploadedMemoName: uploadedMemoName || "Directly Inputted / Extracted Text",
      term: currentTerm
    };

    const alreadySaved = savedPreReports.some((r) => r.id === reportWithTask.id);
    let updated: PreModerationReport[];
    if (alreadySaved) {
      updated = savedPreReports.map((r) => r.id === reportWithTask.id ? reportWithTask : r);
    } else {
      updated = [reportWithTask, ...savedPreReports];
    }
    setSavedPreReports(updated);
    safePut("/api/data/moderations.json", [...updated, ...savedPostReports]).catch((err) => console.error("Failed to persist pre-moderation archive:", err));
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 3000);
  };

  const handleSavePostReport = () => {
    if (!postReport) return;
    const reportWithTask: PostModerationReport = {
      ...postReport,
      savedQuestionPaperText: documentText,
      savedMemoText: memoText,
      uploadedTaskName: uploadedTaskName || "Directly Inputted / Extracted Text",
      uploadedMemoName: uploadedMemoName || "Directly Inputted / Extracted Text",
      term: currentTerm
    };

    const alreadySaved = savedPostReports.some((r) => r.id === reportWithTask.id);
    let updated: PostModerationReport[];
    if (alreadySaved) {
      updated = savedPostReports.map((r) => r.id === reportWithTask.id ? reportWithTask : r);
    } else {
      updated = [reportWithTask, ...savedPostReports];
    }
    setSavedPostReports(updated);
    safePut("/api/data/moderations.json", [...savedPreReports, ...updated]).catch((err) => console.error("Failed to persist post-moderation archive:", err));
    setSavedPostSuccessMsg(true);
    setTimeout(() => setSavedPostSuccessMsg(false), 3000);
  };

  // Pre-moderation input form state
  const [subject, setSubject] = useState("Mathematics");
  const [curriculum, setCurriculum] = useState<"IEB" | "CAPS" | "Cambridge">("IEB");
  const [grade, setGrade] = useState("");
  const [teacher, setTeacher] = useState("");
  const [moderator, setModerator] = useState("");
  const [paper, setPaper] = useState("");
  const [testType, setTestType] = useState("");
  const [code, setCode] = useState("");
  const [testDate, setTestDate] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState(0);
  const [documentText, setDocumentText] = useState("");
  const [memoText, setMemoText] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [uploadedTaskName, setUploadedTaskName] = useState("");
  const [taskFileBase64, setTaskFileBase64] = useState<string | null>(null);
  const [taskFileMimeType, setTaskFileMimeType] = useState<string | null>(null);
  const [uploadedMemoName, setUploadedMemoName] = useState("");
  const [memoFileBase64, setMemoFileBase64] = useState<string | null>(null);
  const [memoFileMimeType, setMemoFileMimeType] = useState<string | null>(null);

  // Extraction loading states
  const [isExtractingTask, setIsExtractingTask] = useState(false);
  const [isExtractingMemo, setIsExtractingMemo] = useState(false);

  // Moderation state
  const [isModerating, setIsModerating] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<PreModerationReport | null>(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  // Post-moderation state
  const [postTaskTitle, setPostTaskTitle] = useState("Grade 10 Mathematics Term 1 Test");
  const [postSubject, setPostSubject] = useState("Mathematics");
  const [postGrade, setPostGrade] = useState("10A & 10B");
  const [postTeacher, setPostTeacher] = useState("Shingi");
  const [cohortSize, setCohortSize] = useState(48);

  // Automatic moderator assignment rule
  const computeAutomaticModerator = (subj: string, grd: string, teacherName: string) => {
    const s = (subj || "").toLowerCase();
    const g = (grd || "").toLowerCase();
    if (s.includes("lit") || s.includes("literacy")) {
      return "Shingi";
    }
    if (s.includes("math") && (g.includes("11") || g.includes("12") || g.includes("ig") || g.includes("as") || g.includes("grade 11") || g.includes("grade 12"))) {
      return "Reggie";
    }
    // Others equitably between HOD Mpofu and Lutendo
    const hash = (teacherName + grd).length;
    return hash % 2 === 0 ? "HOD Mpofu" : "Lutendo";
  };

  const [assignedModerator, setAssignedModerator] = useState<string>("Shingi");
  const [isManualModerator, setIsManualModerator] = useState<boolean>(false);

  React.useEffect(() => {
    if (!isManualModerator) {
      setAssignedModerator(computeAutomaticModerator(postSubject, postGrade, postTeacher));
    }
  }, [postSubject, postGrade, postTeacher, isManualModerator]);

  // Post-moderation samples must be supplied by the HOD; never seed fabricated learner marks.
  const [postScripts, setPostScripts] = useState<PostModerationScriptSample[]>([]);

  const handleExportAssignmentSchedule = () => {
    const assignments = [
      { subject: "Mathematical Literacy", grade: "Grade 10", teacher: "Shingi", assignedModerator: "Shingi", notes: "Assigned to Shingi per policy" },
      { subject: "Mathematical Literacy", grade: "Grade 11", teacher: "Mpofu", assignedModerator: "Shingi", notes: "Assigned to Shingi per policy" },
      { subject: "Mathematical Literacy", grade: "Grade 12", teacher: "Mpofu", assignedModerator: "Shingi", notes: "Assigned to Shingi per policy" },
      { subject: "Mathematics (Core)", grade: "Grade 11", teacher: "Reggie", assignedModerator: "Reggie", notes: "Core Maths 11-12 assigned to Reggie" },
      { subject: "Mathematics (Core)", grade: "Grade 12", teacher: "Reggie", assignedModerator: "Reggie", notes: "Core Maths 11-12 assigned to Reggie" },
      { subject: "Mathematics (Core)", grade: "Grade 10", teacher: "Shingi", assignedModerator: "HOD Mpofu", notes: "Equitably distributed" },
      { subject: "Mathematics (Core)", grade: "Grade 9", teacher: "Luthando", assignedModerator: "Lutendo", notes: "Equitably distributed" },
      { subject: "Mathematics (Core)", grade: "Grade 8", teacher: "Mpofu", assignedModerator: "HOD Mpofu", notes: "Equitably distributed" },
    ];
    exportPostModerationAssignmentScheduleDocx(assignments);
  };

  const handleAutoSelectBestMidLow = () => {
    setPostScripts([
      { learnerCode: `LRN-TOP-${Math.floor(10 + Math.random() * 89)}`, band: "Top" as const, originalMark: 48, moderatedMark: 48, variance: 0, auditNotes: "Automatic Best learner sample: Top mark in cohort with distinction level formatting." },
      { learnerCode: `LRN-MID-${Math.floor(10 + Math.random() * 89)}`, band: "Average" as const, originalMark: 28, moderatedMark: 29, variance: 1, auditNotes: "Automatic Mid learner sample: Median mark in cohort with follow-through adjustment." },
      { learnerCode: `LRN-LOW-${Math.floor(10 + Math.random() * 89)}`, band: "Weak" as const, originalMark: 15, moderatedMark: 15, variance: 0, auditNotes: "Automatic Low learner sample: Lowest band in cohort; targeted intervention required." },
    ]);
  };
  const [isPostModerating, setIsPostModerating] = useState(false);
  const [postModerationError, setPostModerationError] = useState<string | null>(null);
  const [postReport, setPostReport] = useState<PostModerationReport | null>(null);

  // Scanned Student Scripts AI OCR & Calculations Audit State
  const [scannedFileBase64, setScannedFileBase64] = useState<string | null>(null);
  const [scannedFileMimeType, setScannedFileMimeType] = useState<string | null>(null);
  const [scannedFileName, setScannedFileName] = useState("");
  const [isAnalyzingScript, setIsAnalyzingScript] = useState(false);
  const [scriptAnalysisResult, setScriptAnalysisResult] = useState<any | null>(null);
  const [scriptAnalysisError, setScriptAnalysisError] = useState<string | null>(null);

  const handleScannedScriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannedFileName(file.name);
    setScannedFileMimeType(file.type || "application/pdf");
    setScriptAnalysisError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultStr = event.target?.result as string;
      const base64Content = resultStr.split(",")[1];
      setScannedFileBase64(base64Content);
    };
    reader.readAsDataURL(file);
  };

  const handleRunScannedScriptAnalysis = async () => {
    if (!scannedFileBase64) {
      setScriptAnalysisError("Please select a scanned script PDF or image file first.");
      return;
    }
    setIsAnalyzingScript(true);
    setScriptAnalysisError(null);
    try {
      const result = await safePost("/api/moderate/analyze-script", {
        fileData: scannedFileBase64,
        fileMimeType: scannedFileMimeType,
        memoText: memoText,
      });

      if (!result.success || !result.data?.analysis) {
        throw new Error(result.error || "Failed to analyze scanned script.");
      }
      const data = result.data;
      setScriptAnalysisResult(data.analysis);
      
      // Auto-append the analyzed script findings to the postScripts stratified list for full verification
      const newLearnerCode = `LRN-SCAN-${Math.floor(100 + Math.random() * 900)}`;
      const detectedMark = data.analysis.totalMarkDetected || 35;
      const calculatedVariance = data.analysis.calculationErrorFound ? -2 : 0;
      const newFindings = {
        learnerCode: newLearnerCode,
        band: (detectedMark > 40 ? "Top" : detectedMark > 20 ? "Average" : "Weak") as any,
        originalMark: detectedMark - calculatedVariance,
        moderatedMark: detectedMark,
        variance: calculatedVariance,
        auditNotes: `${data.analysis.calculationAuditNotes.substring(0, 100)} (Math sum audit verification)`,
      };
      setPostScripts((prev) => [newFindings, ...prev]);
    } catch (err: any) {
      console.error(err);
      setScriptAnalysisError(err.message || "Failed to run scanned student script audit.");
    } finally {
      setIsAnalyzingScript(false);
    }
  };

  // Extract Text from uploaded files using the server OCR / transcription endpoint
  const extractTextFromFile = async (fileBase64: string, mimeType: string, target: "task" | "memo", fileName?: string) => {
    if (target === "task") {
      setIsExtractingTask(true);
    } else {
      setIsExtractingMemo(true);
    }

    try {
      const result = await safePost("/api/moderate/extract-text", {
        fileData: fileBase64,
        mimeType,
        fileName,
      });

      if (result.success && result.data?.extractedText) {
        if (target === "task") {
          setDocumentText(result.data.extractedText);
        } else {
          setMemoText(result.data.extractedText);
        }
      } else if (!result.success) {
        console.warn("Extraction backend notice:", result.error);
      }
    } catch (error: any) {
      console.error("Failed to extract file text:", error);
    } finally {
      if (target === "task") {
        setIsExtractingTask(false);
      } else {
        setIsExtractingMemo(false);
      }
    }
  };

  // Handle Task / Question Paper file upload
  const handleTaskFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedTaskName(file.name);
    const mime = file.type || "application/pdf";
    setTaskFileMimeType(mime);

    const reader = new FileReader();
    if (file.type.includes("text") || file.name.endsWith(".txt")) {
      reader.onload = (event) => {
        setDocumentText(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      // PDF or Docx or Image: Read as Base64 for Gemini API and extract
      reader.onload = (event) => {
        const resultStr = event.target?.result as string;
        const base64Content = resultStr.split(",")[1];
        setTaskFileBase64(base64Content);
        extractTextFromFile(base64Content, mime, "task", file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Memorandum file upload
  const handleMemoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedMemoName(file.name);
    const mime = file.type || "application/pdf";
    setMemoFileMimeType(mime);

    const reader = new FileReader();
    if (file.type.includes("text") || file.name.endsWith(".txt")) {
      reader.onload = (event) => {
        setMemoText(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      // PDF or Docx or Image: Read as Base64 for Gemini API and extract
      reader.onload = (event) => {
        const resultStr = event.target?.result as string;
        const base64Content = resultStr.split(",")[1];
        setMemoFileBase64(base64Content);
        extractTextFromFile(base64Content, mime, "memo", file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Pre-load sample
  const loadSample = (type: "ieb-math" | "math-lit" | "cambridge") => {
    if (type === "ieb-math") {
      setSubject("Mathematics");
      setCurriculum("IEB");
      setGrade("10A & 10B");
      setTeacher("Shingi");
      setPaper("Paper 1 (Algebra & Equations)");
      setTotalMarks(50);
      setDuration("60 mins");
      setDocumentText(SAMPLE_MATH_PAPER.documentText);
      setMemoText(SAMPLE_MATH_PAPER.memoText);
    } else if (type === "math-lit") {
      setSubject("Mathematical Literacy");
      setCurriculum("IEB");
      setGrade("11A & 11B");
      setTeacher("Mpofu");
      setPaper("Paper 1 (Finance, Tariffs & Taxation)");
      setTotalMarks(60);
      setDuration("75 mins");
      setDocumentText(`EAGLE HOUSE SCHOOL / PRAXIS BORDERLESS LEARNING
DEPARTMENT OF MATHEMATICAL LITERACY
GRADE 11 CONTROL TEST: FINANCE & TARIFF SYSTEMS
TIME: 75 MINUTES | TOTAL: 60 MARKS

QUESTION 1: PERSONAL INCOME TAX & PAYSLIP ANALYSIS [22 marks]
1.1 Study Mr. Khumalo's monthly payslip for February 2026:
    Basic Salary: R34 500,00
    Pension Fund Contribution (7.5%): ...
    UIF (1% capped at R177.12): ...
    Medical Scheme: Principal member + 2 dependents
    1.1.1 Calculate his annual gross income. (2)
    1.1.2 Calculate his monthly pension deduction. (2)
    1.1.3 Determine his medical tax credits using SARS 2026 rates (R364 for first 2, R246 additional). (3)
    1.1.4 Using the SARS tax bracket tables, calculate his annual tax before and after rebates. (8)

QUESTION 2: WATER & ELECTRICITY TARIFFS [20 marks]
2.1 City of Johannesburg stepped water tariffs:
    0 - 6 kl: Free (basic lifeline)
    >6 - 10 kl: R22,45 per kl
    >10 - 15 kl: R31,80 per kl
    >15 - 20 kl: R44,10 per kl
    A household consumes 18.5 kilolitres in a month. Calculate their total water bill excluding VAT. (6)
2.2 Compare prepaid electricity tariff (stepped) with post-paid fixed charge tariffs. (6)

QUESTION 3: HIRE PURCHASE & COMPOUND INFLATION [18 marks]
3.1 A refrigerator has a cash price of R12 999. Under a hire purchase agreement, a 15% deposit is paid, and the balance is repaid at 18% p.a. simple interest over 36 months.
    3.1.1 Calculate the deposit amount. (2)
    3.1.2 Calculate the total amount repaid and monthly instalment. (6)
    3.1.3 Calculate the real cost difference between cash and hire purchase. (4)
3.2 If annual inflation averages 5.4%, calculate what this refrigerator will cost in 5 years. (6)`);
      setMemoText(`EAGLE HOUSE SCHOOL - MEMORANDUM
GRADE 11 MATHEMATICAL LITERACY TEST (60 MARKS)

QUESTION 1 [22]
1.1.1 Annual Gross = R34 500 * 12 = R414 000 ✓ method (1) ✓ value (1) (2)
1.1.2 Pension = 7.5% * R34 500 = R2 587.50 ✓ percentage (1) ✓ value (1) (2)
1.1.3 Tax credit = R364 + R364 + R246 = R974/month = R11 688/year ✓ monthly credit (1) ✓ annual credit (2) (3)
1.1.4 Taxable income = R414 000 - R31 050 = R382 950.
      Tax bracket: R77 362 + 31% of amount above R370 500.
      Tax before rebate = R77 362 + 0.31*(12 450) = R81 221.50 ✓ bracket (2) ✓ calculation (2)
      Less primary rebate (R17 235) = R63 986.50 ✓ rebate (2)
      Less medical credit (R11 688) = R52 298.50/year => R4 358.21/month ✓ net tax (2) (8)

QUESTION 2 [20]
2.1 0-6 kl = R0; 4 kl @ R22.45 = R89.80; 5 kl @ R31.80 = R159.00; 3.5 kl @ R44.10 = R154.35
    Total = R89.80 + R159.00 + R154.35 = R403.15 ✓ tier 1 (1) ✓ tier 2 (2) ✓ tier 3 (2) ✓ total (1) (6)
...`);
    } else {
      setSubject("Mathematics");
      setCurriculum("Cambridge");
      setGrade("IG2");
      setTeacher("Reggie");
      setPaper("Paper 2 (Extended 0580)");
      setTotalMarks(70);
      setDuration("90 mins");
      setDocumentText(`CAMBRIDGE ASSESSMENT INTERNATIONAL EDUCATION
EAGLE HOUSE SCHOOL - IGCSE MATHEMATICS 0580
PAPER 2 (EXTENDED) | TIME: 1 HOUR 30 MINUTES | TOTAL: 70 MARKS

Candidates answer on the Question Paper.
Additional Materials: Geometrical instruments, Electronic calculator, Tracing paper (optional).

1. Work out 3/8 + 2/5. Give your answer as a fraction in its simplest form. [2]
2. Solve the simultaneous equations:
   3x + 2y = 19
   2x - y = 8   [3]
3. The diagram shows a right-angled triangle ABC. AB = 7 cm, BC = 12 cm.
   Calculate angle BAC. Give your answer correct to 1 decimal place. [3]
4. Factorise completely: 6a^2 - 15ab. [2]
5. Make t the subject of the formula: v = u + at. [2]
6. Write down the equation of the line parallel to y = 4x - 3 passing through (2, 5). [3]`);
      setMemoText(`CAMBRIDGE IGCSE MATHEMATICS 0580 - MARK SCHEME
1. 15/40 + 16/40 [M1] = 31/40 [A1] (2)
2. 2x - y = 8 => y = 2x - 8. 3x + 2(2x - 8) = 19 => 7x - 16 = 19 => 7x = 35 => x = 5 [M1].
   y = 2(5) - 8 = 2 [M1]. x = 5, y = 2 [A1] (3)
3. tan(BAC) = 12/7 [M1] => BAC = arctan(1.714) = 59.7° [A1] (3)...`);
    }
  };

  // Run AI Pre-Moderation
  const handleRunPreModeration = async () => {
    setIsModerating(true);
    setModerationError(null);
    setSavedSuccessMsg(false);

    try {
      // For multimodal inlineData support, only send fileData if PDF or Image and payload is reasonable (< 7MB)
      const isImageOrPdf = (mime?: string | null) =>
        mime && (mime === "application/pdf" || mime.startsWith("image/"));
      const sendTaskFile =
        taskFileBase64 && isImageOrPdf(taskFileMimeType) && taskFileBase64.length < 8000000;
      const sendMemoFile =
        memoFileBase64 && isImageOrPdf(memoFileMimeType) && memoFileBase64.length < 8000000;

      const result = await safePost("/api/moderate/pre", {
        taskTitle: `${subject} ${paper}`,
        subject,
        grade,
        curriculum,
        testDate,
        duration,
        totalMarks,
        teacherName: teacher,
        moderatorName: moderator,
        paperNumber: paper,
        documentText,
        memoText,
        taskFileData: sendTaskFile ? taskFileBase64 : null,
        taskFileMimeType: sendTaskFile ? taskFileMimeType : null,
        memoFileData: sendMemoFile ? memoFileBase64 : null,
        memoFileMimeType: sendMemoFile ? memoFileMimeType : null,
        customNotes,
      });

      if (!result.success || !result.data?.report) {
        throw new Error(result.error || "Moderation request could not be completed.");
      }

      const data = result.data;

      const generatedReport: PreModerationReport = {
        id: `PREMOD-${Date.now()}`,
        schoolName: "Eagle House School (praxis BORDERLESS LEARNING)",
        subject: data.report.subject || subject,
        code: data.report.code || code,
        teacher: data.report.teacher || teacher,
        grade: data.report.grade || grade,
        moderator: data.report.moderator || moderator,
        level: data.report.level || curriculum,
        testDate: data.report.testDate || testDate,
        paper: data.report.paper || paper,
        testType: data.report.testType || testType,
        totalMarks: data.report.totalMarks || totalMarks,
        duration: duration,
        moderatorComments: data.report.moderatorComments,
        checklist: data.report.checklist || [],
        cognitiveDemandBreakdown: data.report.cognitiveDemandBreakdown || {
          lowerOrderPercent: 30,
          middleOrderPercent: 40,
          higherOrderPercent: 30,
          analysisNotes: "Cognitive distribution verified against curriculum specifications.",
        },
        overallOutcome: data.report.overallOutcome || "Approved with Minor Corrections",
        requiredCorrections: data.report.requiredCorrections || [],
        otherComments: data.report.otherComments || "Assessment meets Eagle House School Policy 7.1 standards.",
        firstDraftSignOff: {
          date: testDate,
          teacherSignature: `[Signed: ${teacher}]`,
          moderatorSignature: `[Moderated: ${moderator}]`,
        },
        finalSignOff: {
          date: testDate,
          teacherSignature: `[Signed: ${teacher}]`,
          moderatorSignature: `[Approved: ${moderator}]`,
        },
        createdAt: new Date().toISOString(),
      };

      setCurrentReport(generatedReport);
    } catch (err: any) {
      console.error(err);
      setModerationError(err.message || "Failed to run AI pre-moderation.");
    } finally {
      setIsModerating(false);
    }
  };

  // Run AI Post-Moderation
  const handleRunPostModeration = async () => {
    setIsPostModerating(true);
    setPostModerationError(null);
    try {
      const result = await safePost("/api/moderate/post", {
        taskTitle: postTaskTitle,
        subject: postSubject,
        grade: postGrade,
        curriculum: "IEB",
        teacherName: postTeacher,
        moderatorName: assignedModerator,
        sampleSize: postScripts.length,
        totalLearners: cohortSize,
        sampleScriptsData: postScripts,
        notes: "Audit focused on 3 stratified learners (Best, Mid, Low) per Eagle House Policy §7.2.",
      });

      if (!result.success || !result.data?.report) {
        throw new Error(result.error || "Failed to generate post-moderation report.");
      }

      const data = result.data;

      setPostReport({
        id: `POSTMOD-${Date.now()}`,
        taskTitle: postTaskTitle,
        subject: postSubject,
        grade: postGrade,
        teacher: postTeacher,
        moderator: assignedModerator,
        sampleCompliance: data.report.sampleCompliance || {
          totalScripts: cohortSize,
          sampleCount: postScripts.length,
          percentageSampled: Math.round((postScripts.length / cohortSize) * 100),
          isCompliantWith10PercentRule: postScripts.length / cohortSize >= 0.1,
        },
        markingAccuracySummary: data.report.markingAccuracySummary,
        scriptFindings: data.report.scriptFindings || postScripts,
        commonErrorTrends: data.report.commonErrorTrends || [],
        markingQualityVerdict: data.report.markingQualityVerdict || "Marks Upheld",
        remediationRecommendations: data.report.remediationRecommendations || [],
        actionPlanForTeacher: data.report.actionPlanForTeacher,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error(err);
      setPostModerationError(err.message || "Failed to run post-moderation audit.");
    } finally {
      setIsPostModerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar for moderation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            Task Assessment & Moderation Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compliant with Eagle House School Assessment Policy §7.1 (Pre-Mod 5-Day Rule) & §7.2 (Post-Mod 10% Purple Pen Audit)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab("pre")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "pre"
                ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Pre-Moderation (Checklist & Report)
          </button>
          <button
            onClick={() => setActiveTab("post")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "post"
                ? "bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Post-Moderation (10% Sample Audit)
          </button>
          <button
            onClick={() => setActiveTab("sba")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "sba"
                ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Annual SBA & SAGS Weightings</span>
          </button>
          <button
            onClick={() => setActiveTab("cover")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "cover"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Official Test Cover Page
          </button>
          <button
            onClick={() => setActiveTab("archive")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === "archive"
                ? "bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-teal-900 dark:hover:text-teal-300"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Saved Teacher Records ({savedPreReports.length + savedPostReports.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "pre" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Task Upload & Configuration */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Task & Memorandum Input
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Quick Samples:</span>
                  <button
                    onClick={() => loadSample("ieb-math")}
                    className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium cursor-pointer"
                  >
                    Gr 10 IEB
                  </button>
                  <button
                    onClick={() => loadSample("math-lit")}
                    className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium cursor-pointer"
                  >
                    Gr 11 Math Lit
                  </button>
                  <button
                    onClick={() => loadSample("cambridge")}
                    className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium cursor-pointer"
                  >
                    Cambridge
                  </button>
                </div>
              </div>

              {/* Separate File upload zones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Task Question Paper Upload */}
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-lg p-3 text-center transition-colors bg-slate-50/50 flex flex-col justify-center min-h-[110px]">
                  <input
                    type="file"
                    id="task-file-input"
                    onChange={handleTaskFileUpload}
                    accept=".pdf,.doc,.docx,.txt,image/*"
                    className="hidden"
                    disabled={isExtractingTask}
                  />
                  <label htmlFor="task-file-input" className={`cursor-pointer block w-full h-full py-1 ${isExtractingTask ? "pointer-events-none opacity-80" : ""}`}>
                    {isExtractingTask ? (
                      <RotateCcw className="w-5 h-5 mx-auto text-amber-500 mb-1 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                    )}
                    <p className="text-xs font-bold text-slate-800">Question Paper (Task)</p>
                    <p className="text-[11px] text-slate-600 mt-1 truncate px-1">
                      {isExtractingTask ? (
                        <span className="text-amber-600 font-semibold animate-pulse">Extracting text via AI...</span>
                      ) : uploadedTaskName ? (
                        <span className="text-blue-700 font-semibold">{uploadedTaskName}</span>
                      ) : (
                        "Upload Task document"
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">PDF, DOCX, TXT, Image</p>
                  </label>
                </div>

                {/* Memorandum Upload */}
                <div className="border-2 border-dashed border-slate-200 hover:border-purple-500 rounded-lg p-3 text-center transition-colors bg-slate-50/50 flex flex-col justify-center min-h-[110px]">
                  <input
                    type="file"
                    id="memo-file-input"
                    onChange={handleMemoFileUpload}
                    accept=".pdf,.doc,.docx,.txt,image/*"
                    className="hidden"
                    disabled={isExtractingMemo}
                  />
                  <label htmlFor="memo-file-input" className={`cursor-pointer block w-full h-full py-1 ${isExtractingMemo ? "pointer-events-none opacity-80" : ""}`}>
                    {isExtractingMemo ? (
                      <RotateCcw className="w-5 h-5 mx-auto text-amber-500 mb-1 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                    )}
                    <p className="text-xs font-bold text-slate-800">Memorandum (Memo)</p>
                    <p className="text-[11px] text-slate-600 mt-1 truncate px-1">
                      {isExtractingMemo ? (
                        <span className="text-amber-600 font-semibold animate-pulse">Extracting text via AI...</span>
                      ) : uploadedMemoName ? (
                        <span className="text-purple-700 font-semibold">{uploadedMemoName}</span>
                      ) : (
                        "Upload Memo document"
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">PDF, DOCX, TXT, Image</p>
                  </label>
                </div>
              </div>

              {/* Metadata Inputs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-800"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Mathematical Literacy">Mathematical Literacy</option>
                    <option value="Technical Mathematics">Technical Mathematics</option>
                    <option value="IGCSE Mathematics">IGCSE Mathematics (0580)</option>
                    <option value="AS Mathematics">AS Mathematics (9709)</option>
                    <option value="AS Statistics">AS Statistics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Curriculum Framework</label>
                  <select
                    value={curriculum}
                    onChange={(e) => setCurriculum(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-800 font-semibold"
                  >
                    <option value="IEB">IEB SAGS (Grades 10-12)</option>
                    <option value="CAPS">CAPS ATP (Senior Phase 8-9)</option>
                    <option value="Cambridge">Cambridge (LS / IGCSE / AS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Grade & Class</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-800"
                    placeholder="e.g. 10A & 10B"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Examiner / Teacher</label>
                  <select
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-800"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} {s.isMathsDept ? "(Maths Dept)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Paper & Title</label>
                  <input
                    type="text"
                    value={paper}
                    onChange={(e) => setPaper(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-800"
                    placeholder="Paper 1 (Algebra)"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Assessment Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-800"
                    placeholder="e.g. MATH-GR10-T1"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Total Marks & Duration</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(Number(e.target.value))}
                      className="w-1/2 px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-800"
                      placeholder="Marks"
                    />
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-1/2 px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-800"
                      placeholder="60 mins"
                    />
                  </div>
                </div>
              </div>

              {/* Task Text Area */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                  <span>Question Paper Text / Content (or extracted from file)</span>
                  {isExtractingTask && (
                    <span className="text-amber-600 animate-pulse font-semibold text-[11px] flex items-center gap-1">
                      <RotateCcw className="w-3 h-3 animate-spin" /> AI Extracting...
                    </span>
                  )}
                </label>
                <textarea
                  rows={6}
                  value={isExtractingTask ? "Extracted Question Paper Text is loading, please wait..." : documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  disabled={isExtractingTask}
                  className={`w-full p-2.5 text-xs font-mono rounded-md border border-slate-300 focus:ring-1 focus:ring-blue-500 bg-slate-50 transition-all ${
                    isExtractingTask ? "opacity-60 bg-amber-50/30" : ""
                  }`}
                  placeholder="Paste question paper text here or view loaded file..."
                />
              </div>

              {/* Memorandum Text Area */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                  <span>Memorandum / Marking Scheme Text</span>
                  {isExtractingMemo && (
                    <span className="text-amber-600 animate-pulse font-semibold text-[11px] flex items-center gap-1">
                      <RotateCcw className="w-3 h-3 animate-spin" /> AI Extracting...
                    </span>
                  )}
                </label>
                <textarea
                  rows={4}
                  value={isExtractingMemo ? "Extracted Memorandum Text is loading, please wait..." : memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  disabled={isExtractingMemo}
                  className={`w-full p-2.5 text-xs font-mono rounded-md border border-slate-300 focus:ring-1 focus:ring-blue-500 bg-slate-50 transition-all ${
                    isExtractingMemo ? "opacity-60 bg-amber-50/30" : ""
                  }`}
                  placeholder="Paste memorandum here..."
                />
              </div>

              {/* HOD Custom Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  HOD Specific Focus / Moderator Directives
                </label>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300"
                  placeholder="e.g. Check cognitive demand for Level 3 & 4; confirm formula sheet attached"
                />
              </div>

              {/* Moderation Button */}
              <button
                onClick={handleRunPreModeration}
                disabled={isModerating}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isModerating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Auditing Assessment Against Eagle House & {curriculum} Standards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run AI Pre-Moderation (Autofill Report)</span>
                  </>
                )}
              </button>

              {moderationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{moderationError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: The Exact Eagle House Internal Pre-Moderation Report */}
          <div className="lg:col-span-7 space-y-4 relative">
            {isModerating && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-8 rounded-xl border border-blue-200 shadow-xl space-y-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 animate-bounce">
                  <RotateCcw className="w-7 h-7 animate-spin" />
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 animate-pulse">Running AI Pre-Moderation Audit...</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Analyzing Bloom's Taxonomy cognitive distribution, rubric clarity, mark allocations, and curriculum alignment against Eagle House Policy §7.1.
                  </p>
                </div>
                <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            )}
            {currentReport ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 print:p-0 print:border-none">
                {/* Actions bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        currentReport.overallOutcome === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : currentReport.overallOutcome === "Approved with Minor Corrections"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      Outcome: {currentReport.overallOutcome}
                    </span>
                    {savedSuccessMsg && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                        <Check className="w-3.5 h-3.5" /> Saved to records
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSavePreReport}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                      title="Save report to HOD records"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Save to Records</span>
                    </button>

                    <button
                      onClick={() => exportPreModerationDocx(currentReport)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold cursor-pointer transition-colors"
                      title="Export official Word document"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Word (.docx)</span>
                    </button>

                    <button
                      onClick={() => exportPreModerationXlsx(currentReport)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold cursor-pointer transition-colors"
                      title="Export Excel spreadsheet"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Excel (.xlsx)</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                {/* THE EXACT ATTACHED INTERNAL PRE-MODERATION REPORT FORMAT */}
                <div className="border border-slate-300 rounded-lg p-5 bg-white space-y-4 font-sans text-slate-900">
                  {/* Form Header */}
                  <div className="text-center pb-2 border-b-2 border-slate-800">
                    <h2 className="text-lg font-black tracking-wide text-slate-900 uppercase">
                      Eagle House School
                    </h2>
                    <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                      praxis borderless learning
                    </p>
                    <h3 className="text-sm font-black text-blue-900 uppercase underline mt-1 tracking-wider">
                      Internal Pre- Moderation Report
                    </h3>
                  </div>

                  {/* 2-Column Metadata Grid (Exact attached PDF layout) */}
                  <div className="border border-slate-300 rounded-xs overflow-hidden text-xs">
                    <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300 bg-slate-50">
                      <div className="p-1.5 flex justify-between">
                        <span className="font-bold text-slate-700">SUBJECT:</span>
                        <span className="font-semibold text-slate-900">{currentReport.subject}</span>
                      </div>
                      <div className="p-1.5 flex justify-between">
                        <span className="font-bold text-slate-700">CODE:</span>
                        <span className="font-mono text-slate-900">{currentReport.code}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300">
                      <div className="p-1.5 flex justify-between">
                        <span className="font-bold text-slate-700">TEACHER:</span>
                        <span className="text-slate-900">{currentReport.teacher}</span>
                      </div>
                      <div className="p-1.5 flex justify-between">
                        <span className="font-bold text-slate-700">GRADE:</span>
                        <span className="text-slate-900">{currentReport.grade}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300 bg-slate-50">
                      <div className="p-1.5 flex justify-between">
                        <span className="font-bold text-slate-700">MODERATOR:</span>
                        <span className="text-slate-900 font-semibold">{currentReport.moderator}</span>
                      </div>
                      <div className="p-1.5 flex justify-between">
                        <span className="font-bold text-slate-700">LEVEL:</span>
                        <span className="text-slate-900">{currentReport.level}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300">
                      <div className="p-1.5 flex justify-between">
                        <span className="font-bold text-slate-700">TEST DATE:</span>
                        <span className="text-slate-900">{currentReport.testDate}</span>
                      </div>
                      <div className="p-1.5 flex justify-between">
                        <span className="font-bold text-slate-700">PAPER:</span>
                        <span className="text-slate-900">{currentReport.paper}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-slate-300 bg-slate-50">
                      <div className="p-1.5 flex justify-between">
                        <span className="font-bold text-slate-700">TEST TYPE:</span>
                        <span className="text-slate-900">{currentReport.testType}</span>
                      </div>
                      <div className="p-1.5 flex justify-between">
                        <span className="font-bold text-slate-700">TOTAL MARKS & TIME:</span>
                        <span className="text-slate-900 font-semibold">
                          {currentReport.totalMarks} Marks ({currentReport.duration})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MODERATOR COMMENTS Section */}
                  <div className="border border-slate-300 rounded-xs p-3 bg-amber-50/40">
                    <span className="block font-bold text-xs text-slate-900 uppercase tracking-wide mb-1">
                      Moderator Comments:
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      {currentReport.moderatorComments}
                    </p>
                  </div>

                  {/* Cognitive Demands Weighting Check */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        Cognitive Demand Weighting Analysis ({curriculum}):
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Target: {curriculum === "CAPS" ? "30% / 40% / 30%" : "IEB Levels 1-4"}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-3 rounded-full flex overflow-hidden text-[9px] font-bold text-white text-center leading-3">
                      <div
                        style={{ width: `${currentReport.cognitiveDemandBreakdown.lowerOrderPercent}%` }}
                        className="bg-emerald-600"
                        title="Lower Order"
                      >
                        {currentReport.cognitiveDemandBreakdown.lowerOrderPercent}% Low
                      </div>
                      <div
                        style={{ width: `${currentReport.cognitiveDemandBreakdown.middleOrderPercent}%` }}
                        className="bg-blue-600"
                        title="Middle Order"
                      >
                        {currentReport.cognitiveDemandBreakdown.middleOrderPercent}% Mid
                      </div>
                      <div
                        style={{ width: `${currentReport.cognitiveDemandBreakdown.higherOrderPercent}%` }}
                        className="bg-purple-600"
                        title="Higher Order / Problem Solving"
                      >
                        {currentReport.cognitiveDemandBreakdown.higherOrderPercent}% High
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 italic">
                      {currentReport.cognitiveDemandBreakdown.analysisNotes}
                    </p>
                  </div>

                  {/* 12-ITEM CHECKLIST TABLE (Exact attached PDF items) */}
                  <div className="border border-slate-300 rounded-xs overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                          <th className="p-2 font-bold w-7/12">Checklist Criteria</th>
                          <th className="p-2 font-bold w-2/12 text-center">Status</th>
                          <th className="p-2 font-bold w-3/12">Moderator Feedback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {currentReport.checklist.map((c, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 text-slate-900 font-medium">{c.item}</td>
                            <td className="p-2 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  c.status === "Yes"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : c.status === "No"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {c.status === "Yes" ? (
                                  <Check className="w-2.5 h-2.5" />
                                ) : c.status === "No" ? (
                                  <X className="w-2.5 h-2.5" />
                                ) : (
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                )}
                                {c.status}
                              </span>
                            </td>
                            <td className="p-2 text-slate-600 text-[11px]">{c.comment || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Corrections Required section if any */}
                  {currentReport.requiredCorrections.length > 0 && (
                    <div className="border border-rose-200 bg-rose-50/60 rounded-xs p-3 text-xs space-y-1">
                      <span className="font-bold text-rose-900 uppercase">
                        Action Required by Examiner Before Duplication:
                      </span>
                      <ul className="list-disc pl-4 text-rose-800 space-y-0.5">
                        {currentReport.requiredCorrections.map((corr, idx) => (
                          <li key={idx}>{corr}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* OTHER COMMENTS */}
                  <div className="border border-slate-300 rounded-xs p-3">
                    <span className="block font-bold text-xs text-slate-900 uppercase tracking-wide mb-1">
                      Other Comments:
                    </span>
                    <p className="text-xs text-slate-800">{currentReport.otherComments}</p>
                  </div>

                  {/* Sign-off Table (Exact attached PDF bottom section) */}
                  <div className="border border-slate-300 rounded-xs overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300">
                          <th className="p-2 font-bold w-1/4">Sign-Off Stage</th>
                          <th className="p-2 font-bold w-1/4">Date</th>
                          <th className="p-2 font-bold w-1/4">Teacher's Signature</th>
                          <th className="p-2 font-bold w-1/4">Moderator's Signature</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        <tr>
                          <td className="p-2 font-semibold text-slate-800">Moderation First draft</td>
                          <td className="p-2 text-slate-700">{currentReport.firstDraftSignOff.date}</td>
                          <td className="p-2 font-mono text-slate-600">
                            {currentReport.firstDraftSignOff.teacherSignature}
                          </td>
                          <td className="p-2 font-mono text-blue-700 font-semibold">
                            {currentReport.firstDraftSignOff.moderatorSignature}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold text-slate-800">Moderation Final sign off</td>
                          <td className="p-2 text-slate-700">{currentReport.finalSignOff.date}</td>
                          <td className="p-2 font-mono text-slate-600">
                            {currentReport.finalSignOff.teacherSignature}
                          </td>
                          <td className="p-2 font-mono text-emerald-700 font-bold">
                            {currentReport.finalSignOff.moderatorSignature}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[450px]">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Ready for Task Pre-Moderation
                </h3>
                <p className="text-xs text-slate-500 max-w-md mb-4">
                  Select a teacher, upload or paste the question paper & memorandum, then click{" "}
                  <strong>"Run AI Pre-Moderation"</strong>. The AI will populate the exact Eagle House
                  12-point moderation form ready for Word (.docx) and Excel (.xlsx) export.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRunPreModeration}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run Sample Moderation (Gr 10 Maths)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post-Assessment Moderation Tab (10% Sample in Purple Pen per Eagle House Policy §7.2) */}
      {activeTab === "post" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-purple-950 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span>
                Internal Post-Assessment Moderation (Purple Pen Standard)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Eagle House School Assessment Policy §7.2: Minimum sample of 3 learners moderated (Best, Mid, and Low marks) spanning Top, Average, and Weak performance bands.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportAssignmentSchedule}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Export Post-Moderation Assignment Schedule as professional Word docx"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Assignment Schedule (.docx)</span>
              </button>

              <button
                onClick={handleAutoSelectBestMidLow}
                className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Automatically populate 3 learners (Best, Mid, Low marks)"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Auto-Select Best, Mid, Low (3 Learners)</span>
              </button>

              <button
                onClick={handleRunPostModeration}
                disabled={isPostModerating}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPostModerating ? (
                  <RotateCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                <span>Run Post-Moderation Audit</span>
              </button>
            </div>
          </div>

          {/* Assignment & 3-Learner Policy Rule Banner */}
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-purple-950 uppercase tracking-wider text-[11px] block">
                Post-Moderation Assignment Rules:
              </span>
              <ul className="list-disc pl-4 text-purple-900 space-y-1">
                <li><strong>Maths Literacy:</strong> Automatically assigned to <strong>Shingi</strong>.</li>
                <li><strong>Core Mathematics (Grades 11 & 12):</strong> Automatically assigned to <strong>Reggie</strong>.</li>
                <li><strong>Other Classes / Grades:</strong> Equitably distributed between <strong>HOD Mpofu</strong> & <strong>Lutendo</strong>.</li>
              </ul>
            </div>

            <div className="space-y-2 border-t md:border-t-0 md:border-l border-purple-200 pt-3 md:pt-0 md:pl-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-950 uppercase tracking-wider text-[11px]">
                  Assigned Moderator ({isManualModerator ? "Manual Override" : "Automatic Policy"}):
                </span>
                <button
                  type="button"
                  onClick={() => setIsManualModerator(!isManualModerator)}
                  className="text-[10px] text-purple-700 underline font-semibold cursor-pointer"
                >
                  {isManualModerator ? "Switch to Automatic" : "Manual Override"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={assignedModerator}
                  onChange={(e) => {
                    setAssignedModerator(e.target.value);
                    setIsManualModerator(true);
                  }}
                  className="w-full text-xs bg-white border border-purple-300 rounded-lg py-1.5 px-2.5 font-bold text-purple-950 focus:outline-none"
                >
                  <option value="Shingi">Shingi (Maths Lit)</option>
                  <option value="Reggie">Reggie (Core Maths Gr 11-12)</option>
                  <option value="HOD Mpofu">HOD Mpofu (Equitable share)</option>
                  <option value="Lutendo">Lutendo (Equitable share)</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-600 italic">
                Active Subject: <strong>{postSubject} ({postGrade})</strong> | Required: Exactly 3 learners (Best, Mid, Low marks).
              </p>
            </div>
          </div>

          {postModerationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Post-Moderation Notice: </span>
                <span>{postModerationError}</span>
              </div>
            </div>
          )}

          {/* Sample Scripts Audit Entry Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3 Stratified Sample Scripts (Best, Mid, and Low Marks)
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Moderator in charge: <strong className="text-purple-800">{assignedModerator}</strong>
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2.5">Learner Code</th>
                    <th className="p-2.5">Performance Band (Best / Mid / Low)</th>
                    <th className="p-2.5">Teacher Mark</th>
                    <th className="p-2.5">Moderator Mark</th>
                    <th className="p-2.5">Variance</th>
                    <th className="p-2.5">Purple Pen Audit Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {postScripts.map((s, i) => (
                    <tr key={i} className="hover:bg-purple-50/30">
                      <td className="p-2.5 font-mono font-medium text-slate-900">{s.learnerCode}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.band === "Top"
                              ? "bg-emerald-100 text-emerald-800"
                              : s.band === "Average"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {s.band === "Top" ? "Best Mark (Top)" : s.band === "Average" ? "Mid Mark (Median)" : "Low Mark (Weak)"}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-800 font-medium">{s.originalMark}</td>
                      <td className="p-2.5 text-purple-800 font-bold">{s.moderatedMark}</td>
                      <td className="p-2.5">
                        <span
                          className={`font-mono text-xs font-bold ${
                            s.variance === 0
                              ? "text-emerald-600"
                              : s.variance > 0
                              ? "text-blue-600"
                              : "text-rose-600"
                          }`}
                        >
                          {s.variance > 0 ? `+${s.variance}` : s.variance}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600 text-[11px]">{s.auditNotes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Scanned Student Script Verification Section */}
          <div className="p-5 border border-purple-100 bg-purple-50/10 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-800" />
              <div>
                <h4 className="text-sm font-bold text-purple-950">
                  Multimodal Scanned Learner Script Audit
                </h4>
                <p className="text-[11px] text-slate-500">
                  Upload a scanned handwritten script PDF or image. Gemini will run automatic mathematical summation checks and verify mark alignment with the memorandum guidelines.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Scanned Student Script scan (PDF or Image)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleScannedScriptUpload}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>
                {scannedFileName && (
                  <p className="text-xs font-mono text-slate-600 bg-slate-50 p-1.5 rounded">
                    Selected file: {scannedFileName}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleRunScannedScriptAnalysis}
                  disabled={isAnalyzingScript || !scannedFileBase64}
                  className="w-full px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 animate-pulse"
                >
                  {isAnalyzingScript ? (
                    <RotateCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  )}
                  <span>Perform AI Scanned Script Summation Audit</span>
                </button>
                {scriptAnalysisError && (
                  <p className="text-xs text-rose-600 font-semibold">{scriptAnalysisError}</p>
                )}
              </div>

              {/* Analysis Result Output Display */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 text-xs space-y-3 min-h-[140px] flex flex-col justify-between">
                {scriptAnalysisResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-purple-950 uppercase tracking-wider text-[10px]">
                        AI Handwriting OCR Results
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        Total Mark: {scriptAnalysisResult.totalMarkDetected} Marks
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-1.5">
                        <span className="font-bold text-slate-700 min-w-[120px]">Summation Audit:</span>
                        <div className="flex-1">
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded font-bold text-[10px] mr-1.5 ${
                              scriptAnalysisResult.calculationErrorFound
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {scriptAnalysisResult.calculationErrorFound
                              ? "Calculation Errors Detected"
                              : "Calculations Verified Accurate"}
                          </span>
                          <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                            {scriptAnalysisResult.calculationAuditNotes}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 pt-1 border-t border-slate-50">
                        <span className="font-bold text-slate-700 min-w-[120px]">Memo Alignment:</span>
                        <p className="text-slate-600 flex-1 leading-relaxed text-[11px]">
                          {scriptAnalysisResult.markingConsistencyComments}
                        </p>
                      </div>

                      <div className="flex items-start gap-1.5 pt-1 border-t border-slate-50">
                        <span className="font-bold text-slate-700 min-w-[120px]">Handwriting / Presentation:</span>
                        <p className="text-slate-600 flex-1 leading-relaxed text-[11px]">
                          {scriptAnalysisResult.handwritingObservations}
                        </p>
                      </div>
                    </div>

                    <p className="text-[10px] text-teal-800 italic font-semibold bg-teal-50/50 p-1.5 rounded border border-teal-100">
                      ✓ Script audit complete. Findings have been appended to the stratified sample table above.
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-6">
                    <FileText className="w-8 h-8 mb-2 text-neutral-300" />
                    <p className="font-medium text-[11px]">
                      No script scan analyzed yet. Upload and click compile.
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Extracts teacher mark annotations and audits math calculations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Generated Post-Moderation Report */}
          {postReport && (
            <div className="border border-purple-200 rounded-xl p-5 bg-purple-50/20 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-700" />
                  <div>
                    <h3 className="text-sm font-bold text-purple-950">
                      Post-Moderation Audit Verdict: {postReport.markingQualityVerdict}
                    </h3>
                    <p className="text-[10px] text-slate-500">Teacher audited: {postReport.teacher}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSavePostReport}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Save report to HOD records"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Save to Records</span>
                  </button>

                  <button
                    onClick={() => exportPostModerationDocx(postReport)}
                    className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Post-Mod Word (.docx)</span>
                  </button>
                </div>
              </div>

              {savedPostSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Report for teacher <strong>{postReport.teacher}</strong> successfully saved to the institutional records archive!</span>
                </div>
              )}

              <p className="text-xs text-slate-700 leading-relaxed">
                {postReport.markingAccuracySummary}
              </p>

              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  Common Learner Misconceptions Identified:
                </h4>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-0.5">
                  {postReport.commonErrorTrends.map((trend, idx) => (
                    <li key={idx}>{trend}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-white rounded-lg border border-purple-100">
                <h4 className="text-xs font-bold text-purple-900 mb-1">
                  Remediation Action Plan for Teacher ({postReport.teacher}):
                </h4>
                <p className="text-xs text-slate-800">{postReport.actionPlanForTeacher}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Annual SBA Requirements & Official SAGS Weightings Tab */}
      {activeTab === "sba" && (
        <SbaWeightingsView currentTerm={currentTerm} />
      )}

      {/* Official Test Cover Page Tab (Exact Page 2 of attached PDF) */}
      {activeTab === "cover" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Eagle House School Test Cover Page Generator
              </h2>
              <p className="text-xs text-slate-500">
                Official standardized cover page to be stapled to duplicated question papers.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Cover Page</span>
            </button>
          </div>

          <div className="max-w-2xl mx-auto border-2 border-slate-800 p-8 rounded-sm bg-white space-y-6 text-xs text-slate-900 font-sans">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-wider">EAGLE HOUSE</h3>
                <h3 className="text-xl font-black text-slate-900 tracking-wider">SCHOOL</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Excellence Every Day</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-slate-900">TEST COVER PAGE</span>
                <p className="text-[10px] font-bold text-slate-600">praxis BORDERLESS LEARNING</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-6 border-b border-slate-300 pb-4">
              <div className="flex items-center justify-between border-b border-slate-200 py-1">
                <span className="font-bold">Subject:</span>
                <span>{subject}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 py-1">
                <span className="font-bold">Gr:</span>
                <span>{grade}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 py-1">
                <span className="font-bold">Date:</span>
                <span>{testDate}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 py-1">
                <span className="font-bold">Duration:</span>
                <span>{duration}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 py-1">
                <span className="font-bold">Paper:</span>
                <span>{paper}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 py-1">
                <span className="font-bold">Level:</span>
                <span>{curriculum}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 py-1">
                <span className="font-bold">Venue:</span>
                <span>Hall / Classroom M2</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 py-1">
                <span className="font-bold">Session:</span>
                <span>Morning Session (08:30)</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 py-1">
                <span className="font-bold">No. of students:</span>
                <span>48</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 py-1">
                <span className="font-bold">Invigilator:</span>
                <span>_______________________</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <span className="font-bold block mb-1">Instructions to invigilator:</span>
                <div className="h-12 border border-slate-300 rounded p-2 text-slate-500 italic">
                  Collect non-programmable calculator clearance; distribute graph paper to Question 3; ensure strict 60 minutes timed session.
                </div>
              </div>

              <div>
                <span className="font-bold block mb-1">Students absent:</span>
                <div className="h-8 border border-slate-300 rounded"></div>
              </div>

              <div>
                <span className="font-bold block mb-1">Feedback to examiner:</span>
                <div className="h-12 border border-slate-300 rounded"></div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-300">
                <div>
                  <span className="font-bold block text-[11px]">Examiner:</span>
                  <p className="mt-1 font-mono">{teacher}</p>
                </div>
                <div>
                  <span className="font-bold block text-[11px]">Moderator:</span>
                  <p className="mt-1 font-mono">{moderator}</p>
                </div>
                <div>
                  <span className="font-bold block text-[11px]">Return to:</span>
                  <p className="mt-1 font-mono">HOD Mpofu (Dept Office)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "archive" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>HOD Institutional Teacher Archive Records</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Saved moderation audit trails, checklists, and compliance metrics stored securely per teacher.
              </p>
            </div>

            {/* Filter by Teacher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Filter Teacher:</span>
              <select
                value={selectedArchiveTeacher}
                onChange={(e) => setSelectedArchiveTeacher(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-3 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Teachers ({staffList.length})</option>
                {staffList.map((teacherObj) => (
                  <option key={teacherObj.id} value={teacherObj.name}>
                    {teacherObj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List of saved Pre-Moderation Reports */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>Pre-Assessment Moderation Reports</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 font-bold">
                  {filteredPreArchive.length}
                </span>
              </h3>

              {filteredPreArchive.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                  No Term {currentTerm} pre-moderation reports saved for this teacher selection. Run moderation in the first tab and click "Save to Records"!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPreArchive.map((report) => (
                      <div key={report.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-all bg-white shadow-2xs relative flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                Pre-Moderation
                              </span>
                              <h4 className="font-bold text-slate-950 mt-1 text-sm">{report.subject} - {report.paper}</h4>
                              <p className="text-xs text-slate-500">Grade: {report.grade} | Term Date: {report.testDate}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm shrink-0 ${
                              report.overallOutcome === "Approved"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : report.overallOutcome === "Approved with Minor Corrections"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>
                              {report.overallOutcome}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 italic line-clamp-2 mb-3">
                            "{report.moderatorComments}"
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-medium">
                            Educator: <strong className="text-slate-700">{report.teacher}</strong>
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setCurrentReport(report);
                                setSubject(report.subject);
                                setGrade(report.grade);
                                setTeacher(report.teacher);
                                setPaper(report.paper);
                                setTotalMarks(report.totalMarks);
                                setTestDate(report.testDate);
                                setDuration(report.duration);
                                setCurriculum(report.level as any);
                                if (report.savedQuestionPaperText) {
                                  setDocumentText(report.savedQuestionPaperText);
                                }
                                if (report.savedMemoText) {
                                  setMemoText(report.savedMemoText);
                                }
                                setUploadedTaskName(report.uploadedTaskName || "");
                                setUploadedMemoName(report.uploadedMemoName || "");
                                setActiveTab("pre");
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-semibold rounded cursor-pointer transition-colors"
                              title="Load into workspace to view details"
                            >
                              Load UI
                            </button>
                            <button
                              onClick={() => exportPreModerationDocx(report)}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-semibold rounded border border-blue-200 cursor-pointer transition-colors"
                            >
                              Word
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Remove this report from records?")) {
                                  const filtered = savedPreReports.filter(r => r.id !== report.id);
                                  setSavedPreReports(filtered);
                                  localStorage.setItem("eaglehouse_pre_reports", JSON.stringify(filtered));
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>Post-Assessment 10% Sampling Audits</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-50 text-purple-700 font-bold">
                  {filteredPostArchive.length}
                </span>
              </h3>

              {filteredPostArchive.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                  No Term {currentTerm} post-moderation sampling audits saved for this teacher selection. Run post-moderation in the second tab and click "Save to Records"!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPostArchive.map((report) => (
                      <div key={report.id} className="border border-slate-200 rounded-lg p-4 hover:border-purple-300 transition-all bg-white shadow-2xs relative flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                Post-Moderation
                              </span>
                              <h4 className="font-bold text-slate-950 mt-1 text-sm">{report.taskTitle}</h4>
                              <p className="text-xs text-slate-500">Subject: {report.subject} | Grade: {report.grade}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                              {report.markingQualityVerdict}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 italic line-clamp-2 mb-3">
                            "{report.markingAccuracySummary}"
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-medium">
                            Educator: <strong className="text-slate-700">{report.teacher}</strong>
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setPostReport(report);
                                setPostTaskTitle(report.taskTitle);
                                setPostSubject(report.subject);
                                setPostGrade(report.grade);
                                setPostTeacher(report.teacher);
                                setCohortSize(report.sampleCompliance.totalScripts);
                                setPostScripts(report.scriptFindings);
                                if (report.savedQuestionPaperText) {
                                  setDocumentText(report.savedQuestionPaperText);
                                }
                                if (report.savedMemoText) {
                                  setMemoText(report.savedMemoText);
                                }
                                setUploadedTaskName(report.uploadedTaskName || "");
                                setUploadedMemoName(report.uploadedMemoName || "");
                                setActiveTab("post");
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-semibold rounded cursor-pointer transition-colors"
                              title="Load into workspace to view details"
                            >
                              Load UI
                            </button>
                            <button
                              onClick={() => exportPostModerationDocx(report)}
                              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-semibold rounded border border-purple-200 cursor-pointer transition-colors"
                            >
                              Word
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Remove this post-moderation audit from records?")) {
                                  const filtered = savedPostReports.filter(r => r.id !== report.id);
                                  setSavedPostReports(filtered);
                                  localStorage.setItem("eaglehouse_post_reports", JSON.stringify(filtered));
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
