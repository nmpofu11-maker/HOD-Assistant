import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertOctagon,
  Award,
  Download,
  Sparkles,
  Users,
  CheckCircle2,
  Calendar,
  RotateCcw,
  BookOpen,
  PieChart as PieIcon,
  Activity,
  UploadCloud,
  FileText,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { ResultsAnalysisData, LearnerInterventionItem, StaffMember, StaffDeadlineItem } from "../types";
import { exportResultsAnalysisXlsx } from "../utils/xlsxExport";
import { exportResultsAnalysisDocx } from "../utils/docxExport";

interface ResultsAnalysisViewProps {
  staffList?: StaffMember[];
  deadlines?: StaffDeadlineItem[];
}

export const ResultsAnalysisView: React.FC<ResultsAnalysisViewProps> = ({
  staffList = [],
  deadlines = [],
}) => {
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedGrade, setSelectedGrade] = useState("10A & 10B");
  const [selectedTerm, setSelectedTerm] = useState("Term 1 (2026)");
  const [selectedTeacher, setSelectedTeacher] = useState("Shingi");
  const [selectedClass, setSelectedClass] = useState("Grade 10A");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTaskName, setUploadTaskName] = useState("Term 1 Control Test");
  const [uploadTeacher, setUploadTeacher] = useState("Shingi");
  const [uploadClass, setUploadClass] = useState("Grade 10A");
  const [uploadTaskDate, setUploadTaskDate] = useState(new Date().toISOString().split("T")[0]);

  // Helper to compute results analysis due date (5 days after task is written)
  const computeAnalysisDueDate = (taskDateStr: string) => {
    const d = new Date(taskDateStr);
    d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  };

  const handleFileUploadAndAnalyze = async () => {
    if (!uploadFile) {
      alert("Please select a file to upload.");
      return;
    }

    setIsUploadingFile(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        try {
          const res = await fetch("/api/results/upload-analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileData,
              fileName: uploadFile.name,
              mimeType: uploadFile.type,
              subject: selectedSubject,
              grade: uploadClass,
              teacher: uploadTeacher,
              taskDate: uploadTaskDate,
              term: selectedTerm,
              taskName: uploadTaskName,
            }),
          });

          const data = await res.json();
          if (!data.success) throw new Error(data.error);

          setAnalysisData({
            ...analysisData,
            ...data.analysis,
            grade: uploadClass,
            subject: selectedSubject,
            term: selectedTerm,
            taskName: uploadTaskName,
            marksDistribution: data.analysis.marksDistribution || analysisData.marksDistribution,
            strandPerformance: data.analysis.strandPerformance || analysisData.strandPerformance,
          });
          setSelectedTeacher(uploadTeacher);
          setSelectedClass(uploadClass);
          setUploadModalOpen(false);
          setUploadFile(null);
          alert(`Successfully extracted and analyzed results for ${uploadTeacher} (${uploadClass}) from uploaded file (${uploadFile.name})! Analysis alert scheduled 5 days post-task.`);
        } catch (err: any) {
          alert("Upload analysis error: " + err.message);
        } finally {
          setIsUploadingFile(false);
        }
      };
      reader.onerror = () => {
        setIsUploadingFile(false);
        alert("Failed to read file.");
      };

      if (uploadFile.type.includes("text") || uploadFile.name.endsWith(".csv") || uploadFile.name.endsWith(".json")) {
        reader.readAsText(uploadFile);
      } else {
        reader.readAsDataURL(uploadFile);
      }
    } catch (err: any) {
      setIsUploadingFile(false);
      alert("Error reading file: " + err.message);
    }
  };

  // Sample active analysis dataset for Grade 10 Mathematics
  const [analysisData, setAnalysisData] = useState<ResultsAnalysisData>({
    id: "RES-GR10-T1",
    subject: "Mathematics",
    grade: "10A & 10B",
    term: "Term 1 (2026)",
    taskName: "Term 1 Control Test (Algebra, Equations & Sequences)",
    cohortSize: 48,
    averagePercentage: 58.4,
    passRatePercentage: 83.3,
    distinctionsCount: 9,
    overallHealth: "Satisfactory",
    marksDistribution: {
      "Level 7 (80-100%)": 9,
      "Level 6 (70-79%)": 8,
      "Level 5 (60-69%)": 12,
      "Level 4 (50-59%)": 11,
      "Level 3 (40-49%)": 4,
      "Level 2 (30-39%)": 3,
      "Level 1 (0-29%)": 1,
    },
    strandPerformance: {
      "Algebraic Products & Expansions": 74,
      "Factorisation (Trinomials & Cubes)": 62,
      "Linear & Quadratic Equations": 58,
      "Exponential Equations": 48,
      "Number Patterns (Linear Sequences)": 66,
      "Mathematical Word Problems / Area": 42,
    },
    executiveSummary:
      "Overall cohort attainment stands at 58.4% with an 83.3% pass rate. Strong performance was observed in routine algebraic products and linear sequences. However, noticeable diagnostic drop-offs occurred in exponential equations (2^(x+1)+2^x=24) and contextual word problems converting geometric measurements into quadratic equations.",
    keyStrengths: [
      "9 distinctions (18.8% of cohort) demonstrating high higher-order capability.",
      "Solid mastery of standard linear number patterns (arithmetic difference).",
      "Neat mathematical layout and notation adherence across the majority of scripts.",
    ],
    criticalGaps: [
      {
        strand: "Exponential Equations & Laws",
        observedWeakness: "Learners failed to recognize common factoring of 2^x in 2^(x+1) + 2^x.",
        rootCause: "Over-reliance on calculators without mastering exponent properties (a^(m+n) = a^m * a^n).",
        pedagogicalFix: "Implement a 10-minute daily starter drill on splitting index terms before solving.",
      },
      {
        strand: "Contextual Word Problems / Modelling",
        observedWeakness: "Struggled to translate word problems into quadratic expressions (Area = (2x+3)(x-1)).",
        rootCause: "Weak linguistic-to-algebraic decoding skills; learners skip drawing visual sketches.",
        pedagogicalFix: "Explicit modeling of the 3-step 'Read -> Diagram -> Equation' heuristic.",
      },
    ],
    learnerInterventions: [
      {
        id: "INT-1",
        learnerName: "Kagiso M.",
        grade: "10A",
        subject: "Mathematics",
        concern: "Mark dropped to 28% (Level 1). Severe difficulty with quadratic factorisation.",
        evidence: "Test 1 score 14/50; diagnostic reveals inability to find factors of 12 summing to -7.",
        intervention: "Assigned to Tuesday afternoon peer-tutoring & factorisation flashcard drill.",
        responsible: "Shingi (Teacher) & Mpofu (HOD)",
        reviewDate: "2026-03-24",
        outcomeMetric: "Score >= 50% on factorisation diagnostic re-test.",
        status: "Active",
      },
      {
        id: "INT-2",
        learnerName: "Sarah V.",
        grade: "10B",
        subject: "Mathematics",
        concern: "CAT4 quantitative SAS of 115 but achieved 52% (underperforming ability).",
        evidence: "Left Question 3.2 and Question 4 incomplete due to poor time management.",
        intervention: "Timed sectional practice with clock checkpoints; calculator speed techniques.",
        responsible: "Shingi (Teacher)",
        reviewDate: "2026-03-27",
        outcomeMetric: "Complete 100% of test questions within allotted time.",
        status: "Under Review",
      },
      {
        id: "INT-3",
        learnerName: "Thabo N.",
        grade: "10A",
        subject: "Mathematics",
        concern: "Borderline fail (38% Level 2). High anxiety on algebraic fractions.",
        evidence: "Adding numerators without finding Lowest Common Denominator (LCD).",
        intervention: "Guided worksheet on numerical fractions before algebraic fraction transitions.",
        responsible: "Shingi (Teacher)",
        reviewDate: "2026-03-25",
        outcomeMetric: "Correctly determine LCD on 5 consecutive algebraic fraction questions.",
        status: "Active",
      },
    ],
    departmentActionDirectives: [
      "Dedicate next department working session (March 12) to calibrating exponential equation pedagogy.",
      "Verify that homework checks are conducted consistently twice weekly across both Grade 10 sets.",
      "Monitor intervention attendance every Friday afternoon in department log.",
    ],
    curriculumAdjustments:
      "Adjust Term 1 pacing to allocate 2 additional periods for quadratics remediation before introducing hyperbolic functions.",
  });

  // Recharts Data Prep
  const marksChartData = Object.entries(analysisData.marksDistribution).map(([level, count]) => ({
    level: level.replace(" (", "\n("),
    learners: count,
    percentage: Math.round((count / analysisData.cohortSize) * 100),
  }));

  const strandChartData = Object.entries(analysisData.strandPerformance).map(([strand, score]) => ({
    strand,
    score,
  }));

  const termTrendData = [
    { term: "Term 1 '25", average: 54.2, passRate: 78.0 },
    { term: "Term 2 '25", average: 56.0, passRate: 80.5 },
    { term: "Term 3 '25", average: 57.1, passRate: 81.2 },
    { term: "Term 4 '25", average: 55.8, passRate: 79.5 },
    { term: "Term 1 '26", average: analysisData.averagePercentage, passRate: analysisData.passRatePercentage },
  ];

  const interventionStatusData = [
    { name: "Active", value: analysisData.learnerInterventions.filter(i => i.status === "Active").length, color: "#2563eb" },
    { name: "Under Review", value: analysisData.learnerInterventions.filter(i => i.status === "Under Review").length, color: "#d97706" },
    { name: "Resolved", value: analysisData.learnerInterventions.filter(i => i.status === "Resolved").length, color: "#059669" },
  ];

  // Run AI Results Re-analysis
  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/results/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject,
          grade: selectedGrade,
          term: selectedTerm,
          taskName: analysisData.taskName,
          cohortSize: analysisData.cohortSize,
          averagePercentage: analysisData.averagePercentage,
          passRatePercentage: analysisData.passRatePercentage,
          distinctionsCount: analysisData.distinctionsCount,
          marksDistribution: analysisData.marksDistribution,
          strandPerformance: analysisData.strandPerformance,
          flaggedLearners: analysisData.learnerInterventions,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setAnalysisData({
        ...analysisData,
        ...data.analysis,
        marksDistribution: data.analysis.marksDistribution || analysisData.marksDistribution,
        strandPerformance: data.analysis.strandPerformance || analysisData.strandPerformance,
      });
    } catch (err: any) {
      alert("Analysis error: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-700" />
            Subject Results Analysis & Learner Intervention Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Eagle House HOD Handbook: "Data should lead to action. A spreadsheet full of marks is only useful once someone asks what it means and does something about it."
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Results (Digital, OCR PDF, Handwritten)</span>
          </button>

          <button
            onClick={() => exportResultsAnalysisXlsx(analysisData)}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportResultsAnalysisDocx(analysisData)}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Word (.docx)</span>
          </button>

          <button
            onClick={handleRunAiAnalysis}
            disabled={isAnalyzing}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isAnalyzing ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>Re-Analyze with AI HOD</span>
          </button>
        </div>
      </div>

      {(isAnalyzing || isUploadingFile) && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-xl shadow-lg flex items-center gap-4 animate-pulse">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <RotateCcw className="w-6 h-6 animate-spin text-amber-300" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
              {isUploadingFile ? "Multimodal AI Vision OCR & Results Extraction..." : "AI HOD Results Re-Analysis in Progress..."}
            </p>
            <p className="text-xs text-blue-100">
              Parsing student marks, calculating IEB Level 1–7 distributions, and synthesizing intervention trackers...
            </p>
          </div>
        </div>
      )}

      {/* Cohort, Teacher, Class & Subject Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-700">Teacher:</label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="py-1.5 px-3 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
          >
            <option value="Shingi">Shingi (Maths)</option>
            <option value="Reggie">Reggie (Math Lit)</option>
            <option value="Luthando">Luthando (Cambridge)</option>
            <option value="Sipho">Sipho (Grade 9)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-700">Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="py-1.5 px-3 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
          >
            <option value="Grade 10A">Grade 10A</option>
            <option value="Grade 10B">Grade 10B</option>
            <option value="Grade 11A">Grade 11A</option>
            <option value="Grade 12">Grade 12</option>
            <option value="Grade 9A">Grade 9A</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-700">Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="py-1.5 px-3 rounded-lg border border-slate-300 bg-white"
          >
            <option value="Mathematics">Mathematics</option>
            <option value="Mathematical Literacy">Mathematical Literacy</option>
            <option value="Cambridge IGCSE Math">Cambridge IGCSE Math</option>
            <option value="Cambridge AS Statistics">Cambridge AS Statistics</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-700">Term:</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="py-1.5 px-3 rounded-lg border border-slate-300 bg-white"
          >
            <option value="Term 1 (2026)">Term 1 (2026)</option>
            <option value="Term 2 (2026)">Term 2 (2026)</option>
            <option value="Term 3 (2026)">Term 3 (2026)</option>
            <option value="Term 4 (2026)">Term 4 (2026)</option>
          </select>
        </div>
      </div>

      {/* 5-Day Post-Task Results Analysis Alerts Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-300" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Department Results Analysis Alerts (5 Days Post-Task Policy)</h2>
          </div>
          <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full font-medium">
            Active Scans & Analyses per Class / Teacher
          </span>
        </div>
        <p className="text-xs text-blue-100">
          Per Eagle House policy, departmental results analysis and intervention logs are automatically alerted exactly 5 days after each assessment task is written.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {deadlines.map((item) => {
            const analysisDueDate = computeAnalysisDueDate(item.testDate);
            const isOverdue = new Date(analysisDueDate).getTime() < new Date().getTime();
            return (
              <div key={item.id} className="bg-white/10 border border-white/15 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">{item.teacherName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                    {item.grade}
                  </span>
                </div>
                <p className="font-semibold text-white truncate">{item.taskName}</p>
                <div className="text-[11px] text-blue-200 flex justify-between">
                  <span>Written: {item.testDate}</span>
                  <span className={isOverdue ? "text-rose-300 font-bold" : "text-emerald-300 font-bold"}>
                    Analysis Due: {analysisDueDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Cohort Average</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{analysisData.averagePercentage}%</span>
            <span className="text-xs text-emerald-700 font-medium">+3.2% vs baseline</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{analysisData.cohortSize} Learners assessed</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Pass Rate (&gt;= 40%)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-600">{analysisData.passRatePercentage}%</span>
            <span className="text-xs text-slate-500">Target: 85%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">40 of 48 learners achieved &gt;= Level 3</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Distinctions (Level 7)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-amber-600">{analysisData.distinctionsCount}</span>
            <span className="text-xs text-amber-700 font-medium">18.8% of cohort</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Exceeding IEB national benchmark</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">At-Risk / Underperforming</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-rose-600">
              {analysisData.learnerInterventions.length}
            </span>
            <span className="text-xs text-rose-700 font-medium">Appendix 10 active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Interventions assigned with review dates</p>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION SUITE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Marks Distribution (Bar Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">Marks Distribution by IEB Level</h3>
            </div>
            <span className="text-xs text-slate-500">Cohort Count</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="level" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                  formatter={(value: any) => [`${value} learners`, "Count"]}
                />
                <Bar dataKey="learners" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Mathematical Strand Mastery (Bar Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Mathematical Strand Mastery (%)</h3>
            </div>
            <span className="text-xs text-slate-500">Benchmark: 60%</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strandChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="strand" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                  formatter={(value: any) => [`${value}%`, "Average Score"]}
                />
                <Bar dataKey="score" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Term-on-Term Grade Trends (Line Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">Term-on-Term Grade Trends</h3>
            </div>
            <span className="text-xs text-slate-500">2025 - 2026 Comparison</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={termTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="term" tick={{ fontSize: 10 }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="average" name="Cohort Average (%)" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="passRate" name="Pass Rate (%)" stroke="#047857" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Teacher Intervention Metrics (Pie Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-700" />
              <h3 className="text-sm font-bold text-slate-900">Teacher Intervention Status (Appendix 10)</h3>
            </div>
            <span className="text-xs text-slate-500">Active vs Resolved</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={interventionStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {interventionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                  formatter={(value: any) => [`${value} learners`, "Count"]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Executive Diagnostic & Critical Gaps */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            HOD Executive Diagnostic & Pacing Guidance
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">{analysisData.executiveSummary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Department Key Strengths:
            </h4>
            <ul className="list-disc pl-4 text-emerald-900 space-y-1">
              {analysisData.keyStrengths.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200 text-xs space-y-2">
            <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-amber-600" />
              Action Directives for Department:
            </h4>
            <ul className="list-disc pl-4 text-amber-900 space-y-1">
              {analysisData.departmentActionDirectives.map((d, idx) => (
                <li key={idx}>{d}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Critical Conceptual Gaps with Pedagogical Fixes */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Diagnostic Root Causes & Remediation Tactics:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysisData.criticalGaps.map((gap, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                <span className="font-bold text-blue-900 block">{gap.strand}</span>
                <p className="text-slate-700">
                  <strong>Observed Weakness:</strong> {gap.observedWeakness}
                </p>
                <p className="text-slate-600">
                  <strong>Root Cause:</strong> {gap.rootCause}
                </p>
                <div className="p-2 bg-white rounded border border-slate-200 text-slate-800">
                  <strong>Pedagogical Fix:</strong> {gap.pedagogicalFix}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LEARNER INTERVENTION TRACKER (EAGLE HOUSE APPENDIX 10) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-700" />
              Learner Intervention Tracker (Eagle House Handbook Appendix 10)
            </h3>
            <p className="text-xs text-slate-500">
              "Intervention is only meaningful if it is monitored for impact. Every intervention needs a review date."
            </p>
          </div>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-800 font-bold text-xs rounded-md border border-blue-200">
            {analysisData.learnerInterventions.length} Monitored Learners
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="p-3">Learner</th>
                <th className="p-3">Concern & Diagnostic Evidence</th>
                <th className="p-3">Targeted Intervention</th>
                <th className="p-3">Responsible</th>
                <th className="p-3">Review Date</th>
                <th className="p-3">Outcome Metric</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {analysisData.learnerInterventions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-bold text-slate-900">
                    {item.learnerName}
                    <span className="block text-[10px] text-slate-500 font-normal">Gr {item.grade}</span>
                  </td>
                  <td className="p-3 max-w-xs">
                    <p className="font-medium text-slate-800">{item.concern}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.evidence}</p>
                  </td>
                  <td className="p-3 text-slate-800 font-medium max-w-xs">{item.intervention}</td>
                  <td className="p-3 text-slate-700 font-semibold whitespace-nowrap">{item.responsible}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-900">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.reviewDate}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-slate-600 max-w-xs">{item.outcomeMetric}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === "Resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "Under Review"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Results Modal (Digital, OCR PDF, Handwritten) */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Results for AI Analysis</h3>
                  <p className="text-xs text-slate-500">Supports Digital (CSV/Excel/JSON), OCR PDFs, and Handwritten Scans/Photos</p>
                </div>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/65 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teacher</label>
                  <select
                    value={uploadTeacher}
                    onChange={(e) => setUploadTeacher(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-semibold text-slate-900"
                  >
                    <option value="Shingi">Shingi (Maths)</option>
                    <option value="Reggie">Reggie (Math Lit)</option>
                    <option value="Luthando">Luthando (Cambridge)</option>
                    <option value="Sipho">Sipho (Grade 9)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class / Grade</label>
                  <select
                    value={uploadClass}
                    onChange={(e) => setUploadClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-semibold text-slate-900"
                  >
                    <option value="Grade 10A">Grade 10A</option>
                    <option value="Grade 10B">Grade 10B</option>
                    <option value="Grade 11A">Grade 11A</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="Grade 9A">Grade 9A</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assessment / Task Name</label>
                  <input
                    type="text"
                    value={uploadTaskName}
                    onChange={(e) => setUploadTaskName(e.target.value)}
                    placeholder="e.g. Term 1 Control Test"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Task Written Date</label>
                  <input
                    type="date"
                    value={uploadTaskDate}
                    onChange={(e) => setUploadTaskDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Analysis alert due: {computeAnalysisDueDate(uploadTaskDate)} (+5 days)</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Results File</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.json,.pdf,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="space-y-2 pointer-events-none">
                    <div className="mx-auto w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    {uploadFile ? (
                      <div>
                        <p className="text-xs font-bold text-slate-950">{uploadFile.name}</p>
                        <p className="text-[11px] text-emerald-600 font-medium">Ready for AI OCR & Multimodal Analysis</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-slate-700">Click to browse or drag and drop</p>
                        <p className="text-[11px] text-slate-500">Excel, CSV, OCR PDF, or handwritten mark register photos (JPG, PNG)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-[11px] text-indigo-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Multimodal AI Extraction Engine:
                </p>
                <p className="text-indigo-800 leading-relaxed">
                  Our AI vision and OCR model automatically scans handwritten scripts or scanned PDF mark registers, parses student marks, computes IEB distributions, and builds the intervention tracker.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!uploadFile || isUploadingFile}
                  onClick={handleFileUploadAndAnalyze}
                  className="px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isUploadingFile ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting & Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Process & Analyze File</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
