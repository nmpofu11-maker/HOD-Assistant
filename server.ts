import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve public directory static files (for PWA assets like manifest.json, sw.js, and images)
app.use(express.static(path.join(process.cwd(), "public")));

// Increase payload limit for base64 documents/images/PDFs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialize Gemini API client with telemetry header
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper function to execute Gemini API calls with exponential backoff retries and model fallbacks (e.g. for high-demand 503 errors)
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: {
    model: string;
    contents: any;
    config?: any;
  }
) {
  const modelsToTry = Array.from(
    new Set([params.model, "gemini-2.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"])
  );
  let lastError: any = null;

  for (const model of modelsToTry) {
    let attempts = 4;
    let delay = 800; // base delay in ms

    while (attempts > 0) {
      try {
        console.log(`[Gemini Request] Attempting with model: ${model} (Remaining attempts: ${attempts})`);
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        
        // Extract status code robustly
        let statusCode = err.status || err.statusCode || 0;
        if (!statusCode && err.message) {
          if (err.message.includes("503") || err.message.includes("UNAVAILABLE")) {
            statusCode = 503;
          } else if (err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED")) {
            statusCode = 429;
          }
        }

        const isTransient =
          statusCode === 503 ||
          statusCode === 429 ||
          (err.message &&
            (err.message.toLowerCase().includes("high demand") ||
              err.message.toLowerCase().includes("unavailable") ||
              err.message.toLowerCase().includes("rate limit") ||
              err.message.toLowerCase().includes("overloaded") ||
              err.message.toLowerCase().includes("capacity")));

        if (isTransient && attempts > 1) {
          // Add randomized jitter to avoid synchronized retry waves (thundering herd)
          const jitter = Math.floor(Math.random() * 400);
          const currentDelay = delay + jitter;
          console.warn(`[Gemini Transient Error] Status ${statusCode || "unknown"}. Retrying in ${currentDelay}ms... Details: ${err.message}`);
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          delay *= 2; // Exponential backoff scaling
          attempts--;
        } else {
          // Break inner loop to try the fallback model if attempts are exhausted or the error is non-transient
          console.error(`[Gemini Error] Non-transient or exhausted attempts for model ${model}:`, err.message);
          break;
        }
      }
    }
    console.warn(`[Gemini Fallback] Model ${model} failed or is highly congested. Trying fallback model...`);
  }

  throw lastError || new Error("Failed to generate content from Gemini after multiple attempts and fallbacks.");
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Endpoint: AI Pre-Moderation of uploaded task / memorandum
app.post("/api/moderate/pre", async (req, res) => {
  try {
    const {
      taskTitle,
      subject,
      grade,
      curriculum, // 'IEB', 'CAPS', 'Cambridge'
      testDate,
      duration,
      totalMarks,
      teacherName,
      moderatorName,
      paperNumber,
      documentText,
      memoText,
      fileData, // fallback base64
      fileMimeType, // fallback mime
      taskFileData, // separate task file
      taskFileMimeType,
      memoFileData, // separate memo file
      memoFileMimeType,
      customNotes,
    } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `You are an expert Head of Department (HOD) for Mathematics and Mathematical Literacy at Eagle House School (using Praxis Borderless Learning standards).
You are conducting an official, rigorous Pre-Assessment Moderation on an assessment task and memorandum according to:
1. Eagle House School Assessment Policy (Rule 7.1: Pre-assessment moderation).
2. Curriculum standards:
   - If IEB: IEB Subject Assessment Guidelines (SAGS) for Mathematics or Mathematical Literacy, including Bloom's/cognitive levels (Knowledge 20%, Routine 35%, Complex 30%, Problem Solving 15% for Maths; or Level 1-4 for Math Lit).
   - If CAPS Senior Phase (Grades 8-9): CAPS ATP specifications, 40% SBA/60% Exam, cognitive demand (30% lower order, 40% middle order, 30% higher order).
   - If Cambridge: Cambridge Lower Secondary Checkpoint, IGCSE (0580/0607), or AS/A Level (9709) syllabus specifications and mark schemes (M, A, B marks).

You must populate the EXACT Eagle House School "Internal Pre-Moderation Report" checklist:
Checklist Items to evaluate strictly:
1. correctTestTemplateUsed: (Yes/No/Partial + comment)
2. correctLogoUsed: (Yes/No/Partial + comment: Eagle House School / Praxis logo requirement)
3. correctDateAndTestDuration: (Yes/No/Partial + comment: realistic time for marks, usually 1 mark per minute + reading time)
4. instructionsAndAdditionalMaterialsCorrect: (Yes/No/Partial + comment: e.g. non-programmable calculator, mathematical instruments, formula sheet, rounding instructions to 2 decimal places unless stated otherwise)
5. generalOutlinesCorrect: (Yes/No/Partial + comment: font size, clear layout, neat spacing, mark allocations indicated per question)
6. pageNumbersCorrectAndInHeader: (Yes/No/Partial + comment: "Page X of Y" in header or footer)
7. sequenceOfQuestionsAndNumberingCorrect: (Yes/No/Partial + comment: Question 1.1, 1.2, sub-numbering hierarchical correctness)
8. diagramsSketchesClear: (Yes/No/Partial + comment: geometry diagrams clearly labeled, drawn to scale or indicated "not to scale", Cartesian axes labeled)
9. answerSheetsProvidedIfNecessary: (Yes/No/Partial + comment: special graph paper or answer book included if needed)
10. totalsCorrect: (Yes/No/Partial + comment: arithmetic check of sub-totals matching total marks)
11. compiledFromVisibleOnCover: (Yes/No/Partial + comment: Examiner name, date compiled, sources attributed)
12. memorandumIncludedAndCorrect: (Yes/No/Partial + comment: full solution with method marks [M], accuracy marks [A], alternative methods considered, mark consistency)

You must return valid JSON ONLY with this exact structure:
{
  "subject": string,
  "code": string,
  "teacher": string,
  "grade": string,
  "moderator": string,
  "level": string,
  "testDate": string,
  "paper": string,
  "testType": string,
  "totalMarks": number,
  "moderatorComments": string,
  "cognitiveDemandBreakdown": {
    "lowerOrderPercent": number,
    "middleOrderPercent": number,
    "higherOrderPercent": number,
    "analysisNotes": string
  },
  "checklist": [
    {
      "item": "Correct test template used",
      "status": "Yes" | "No" | "Partial",
      "comment": string
    },
    {
      "item": "Correct logo used",
      "status": "Yes" | "No" | "Partial",
      "comment": string
    },
    {
      "item": "Correct date and test duration",
      "status": "Yes" | "No" | "Partial",
      "comment": string
    },
    {
      "item": "Instructions and additional materials correct",
      "status": "Yes" | "No" | "Partial",
      "comment": string
    },
    {
      "item": "General outlines correct",
      "status": "Yes" | "No" | "Partial",
      "comment": string
    },
    {
      "item": "Page numbers correct and in header",
      "status": "Yes" | "No" | "Partial",
      "comment": string
    },
    {
      "item": "Sequence of questions and numbering correct",
      "status": "Yes" | "No" | "Partial",
      "comment": string
    },
    {
      "item": "Diagrams / sketches clear",
      "status": "Yes" | "No" | "Partial",
      "comment": string
    },
    {
      "item": "Answer sheets provided if necessary / answer on paper",
      "status": "Yes" | "No" | "Partial",
      "comment": string
    },
    {
      "item": "Totals correct",
      "status": "Yes" | "No" | "Partial",
      "comment": string
    },
    {
      "item": "Compiled from - visible on cover",
      "status": "Yes" | "No" | "Partial",
      "comment": string
    },
    {
      "item": "Memorandum included and correct",
      "status": "Yes" | "No" | "Partial",
      "comment": string
    }
  ],
  "overallOutcome": "Approved" | "Approved with Minor Corrections" | "Resubmission Required",
  "requiredCorrections": [string],
  "otherComments": string
}`;

    const promptText = `Assessment Details:
- Subject: ${subject || "Mathematics"}
- Curriculum: ${curriculum || "IEB"}
- Grade: ${grade || "10"}
- Paper: ${paperNumber || "Paper 1"}
- Scheduled Test Date: ${testDate || "Upcoming"}
- Duration: ${duration || "60 mins"}
- Total Marks: ${totalMarks || "50"}
- Teacher/Examiner: ${teacherName || "Assigned Teacher"}
- Moderator: ${moderatorName || "HOD Mpofu"}
- Custom HOD Notes: ${customNotes || "None"}

Task Content / Question Paper Content:
${documentText || "(See attached document or sample task provided)"}

Memorandum Content:
${memoText || "(Memorandum text included in task or separate)"}

Evaluate all 12 checklist points rigorously, provide deep constructive mathematical feedback, check formula & mark distribution, and return the complete JSON object.`;

    const parts: any[] = [];
    
    // Support separate task file upload
    if (taskFileData && taskFileMimeType) {
      parts.push({
        inlineData: {
          mimeType: taskFileMimeType,
          data: taskFileData,
        },
      });
    } else if (fileData && fileMimeType) {
      // Fallback for older client or generic uploads
      parts.push({
        inlineData: {
          mimeType: fileMimeType,
          data: fileData,
        },
      });
    }

    // Support separate memo file upload
    if (memoFileData && memoFileMimeType) {
      parts.push({
        inlineData: {
          mimeType: memoFileMimeType,
          data: memoFileData,
        },
      });
    }

    parts.push({ text: promptText });

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = response.text?.trim() || "{}";
    const result = JSON.parse(responseText);
    res.json({ success: true, report: result });
  } catch (error: any) {
    console.error("Error in pre-moderation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to moderate task.",
    });
  }
});

// Endpoint: AI-Powered Text Extraction from uploaded PDF/Image files
app.post("/api/moderate/extract-text", async (req, res) => {
  try {
    const { fileData, mimeType } = req.body;
    if (!fileData || !mimeType) {
      return res.status(400).json({ success: false, error: "Missing fileData or mimeType" });
    }

    const ai = getGeminiClient();
    const systemInstruction = "You are an expert document layout reader and OCR assistant at Eagle House School. Extract all text, headings, formulas, and mark counts exactly. Preserve mathematical formatting, questions structure, and columns layout.";
    const parts = [
      {
        inlineData: {
          mimeType,
          data: fileData,
        },
      },
      {
        text: "Extract and transcribe all text from this assessment document. Return only the clean transcribed text/markdown content without any conversational preamble or AI commentary.",
      },
    ];

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    const extractedText = response.text?.trim() || "";
    res.json({ success: true, extractedText });
  } catch (error: any) {
    console.error("Text extraction failed:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to extract text." });
  }
});

// Endpoint: AI Post-Moderation Analysis (10% Sample verification per Eagle House Policy 7.2)
app.post("/api/moderate/post", async (req, res) => {
  try {
    const {
      taskTitle,
      subject,
      grade,
      curriculum,
      teacherName,
      moderatorName,
      sampleSize,
      totalLearners,
      sampleScriptsData, // array of { learnerCode, performanceBand ('Top'|'Average'|'Weak'), originalMark, moderatorMark, comments }
      notes,
    } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `You are the Head of Department for Mathematics and Mathematical Literacy at Eagle House School.
You are completing an official Post-Assessment Moderation Report according to Eagle House School Assessment Policy 7.2:
- A minimum sample of 10% of assessed scripts spanning top, average, and weak performance bands must undergo internal post-assessment moderation.
- Moderation verified in purple pen standard.
- Key inspection areas:
  1. Addition and calculation accuracy across questions.
  2. Adherence to approved memorandum and mark allocation schemes.
  3. Consistent application of error carrying forward (CA marks) and method marks (M marks).
  4. Diagnostic annotations and teacher constructive feedback to learners.
  5. Identification of systemic learner misconceptions, question outliers, and curriculum pacing gaps.
  6. Actionable recommendations for remediation and re-teaching.

Return valid JSON ONLY with this structure:
{
  "subject": string,
  "grade": string,
  "teacher": string,
  "moderator": string,
  "sampleCompliance": {
    "totalScripts": number,
    "sampleCount": number,
    "percentageSampled": number,
    "isCompliantWith10PercentRule": boolean
  },
  "markingAccuracySummary": string,
  "scriptFindings": [
    {
      "learnerCode": string,
      "band": "Top" | "Average" | "Weak",
      "originalMark": number,
      "moderatedMark": number,
      "variance": number,
      "auditNotes": string
    }
  ],
  "commonErrorTrends": [string],
  "markingQualityVerdict": "Marks Upheld" | "Minor Adjustments Applied" | "Remark Required Across Cohort",
  "remediationRecommendations": [string],
  "actionPlanForTeacher": string
}`;

    const promptText = `Post-Assessment Moderation Audit:
- Task: ${taskTitle}
- Subject: ${subject} (${curriculum})
- Grade: ${grade}
- Teacher: ${teacherName}
- Moderator: ${moderatorName || "HOD Mpofu"}
- Total Cohort Size: ${totalLearners}
- Scripts Sampled: ${sampleSize}
- Sample Audit Records: ${JSON.stringify(sampleScriptsData, null, 2)}
- Moderator Notes: ${notes || "None"}

Perform a detailed audit and generate the post-moderation report in JSON.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = response.text?.trim() || "{}";
    const result = JSON.parse(responseText);
    res.json({ success: true, report: result });
  } catch (error: any) {
    console.error("Error in post-moderation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate post-moderation report.",
    });
  }
});

// Endpoint: AI-Powered Handwritten Learner Script Analysis / Scanned PDF Moderation Audit (Policy 7.2)
app.post("/api/moderate/analyze-script", async (req, res) => {
  try {
    const { fileData, fileMimeType, memoText } = req.body;

    if (!fileData || !fileMimeType) {
      return res.status(400).json({
        success: false,
        error: "Missing uploaded scanned script PDF or image file data.",
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are an expert school HOD conducting an official post-assessment moderation audit of a handwritten student script scan.
Your objective is to perform deep page-by-page mathematical calculations and marking alignment checks against the curriculum standards.

Rigorously analyze the pages of this document to:
1. Transcribe the marks written by the teacher on each page/question.
2. Verify the mathematical summation of the marks page-by-page. Highlight any calculation or carrying errors.
3. Identify any questions where the teacher marks do not match the memorandum answer guidelines.
4. Note any handwriting legibility or student presentation concerns.

You must return valid JSON ONLY with this exact structure:
{
  "totalMarkDetected": number,
  "calculationErrorFound": boolean,
  "calculationAuditNotes": "string detailing page-by-page checks",
  "markingConsistencyComments": "string detailing memo compliance and method marks",
  "handwritingObservations": "string detailing student legibility/formatting observations"
}`;

    const promptText = `Memorandum Content:
${memoText || "Refer to the task guidelines and standard memorandum for this subject."}

Perform a rigorous, exact mathematical and quality audit on the uploaded handwritten script scan. Detect and sum up marks page-by-page or question-by-question, and return the completed JSON review.`;

    const parts: any[] = [];
    parts.push({
      inlineData: {
        mimeType: fileMimeType,
        data: fileData,
      },
    });
    parts.push({ text: promptText });

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const responseText = response.text?.trim() || "{}";
    const result = JSON.parse(responseText);
    res.json({ success: true, analysis: result });
  } catch (error: any) {
    console.error("Error in scanned script analysis:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze handwritten student script.",
    });
  }
});

// Endpoint: AI Meeting Agenda and Minutes Generator
app.post("/api/meetings/generate", async (req, res) => {
  try {
    const {
      meetingType,
      meetingTitle,
      term,
      meetingDate,
      startTime,
      endTime,
      specificFocus,
      previousActionItems,
    } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `You are an AI assistant for the Head of Department (HOD) for Mathematics & Mathematical Literacy at Eagle House School.
You follow the Eagle House School HOD Handbook guidelines for professional department meetings and minutes:
"Department meetings should be purposeful and action-driven, a working session, not a status update read aloud. Protect the time, keep to the agenda, and always close with clear actions."
Eagle House Standard 10-Item Meeting Agenda:
1. Welcome & Apologies
2. Matters Arising from Previous Minutes
3. Curriculum Progress (pacing against ATP / term plan, gaps)
4. Assessment & Moderation (pre-mod 5 days ahead, post-mod 10% purple pen)
5. Learner Performance & Data (trends, diagnostic insights)
6. Learners Requiring Intervention (Appendix 10 trackers)
7. Educator Support & Professional Development
8. Resources, Textbooks & Technology
9. Matters Requiring Escalation to Senior Leadership (Green/Amber/Red)
10. Any Other Business (AOB) & Date of Next Meeting

Generate both a professional standardized Agenda and structured Minutes summary with specific Action Items.
Return valid JSON ONLY with this exact format:
{
  "title": string,
  "date": string,
  "attendees": [string],
  "agendaPoints": [
    {
      "pointNumber": number,
      "title": string,
      "notes": string
    }
  ],
  "actionItems": [
    {
      "id": string,
      "description": string,
      "responsible": string,
      "deadline": string,
      "status": "Pending" | "In Progress" | "Completed"
    }
  ],
  "minutesSummary": string
}`;

    const prompt = `Generate formal meeting agenda, professional discussion notes, and action items:
- Meeting Title: ${meetingTitle || "Department Meeting"}
- Meeting Type: ${meetingType || "Regular Departmental"}
- Date: ${meetingDate || new Date().toISOString().split("T")[0]}
- Specific Focus: ${specificFocus || "Standard term review and moderation alignment"}
- Previous Action Items: ${JSON.stringify(previousActionItems || [])}

Ensure all 10 standard Eagle House agenda points are fully populated with professional discussion notes, decisions, and clear action items.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const responseText = response.text?.trim() || "{}";
    const result = JSON.parse(responseText);
    res.json({ success: true, meeting: result });
  } catch (error: any) {
    console.error("Error generating meeting:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate meeting agenda/minutes.",
    });
  }
});

// Endpoint: AI Results Analysis & Diagnostic Intervention Report
app.post("/api/results/analyze", async (req, res) => {
  try {
    const {
      subject,
      grade,
      term,
      taskName,
      cohortSize,
      averagePercentage,
      passRatePercentage,
      distinctionsCount,
      marksDistribution, // e.g. { "Level 7 (80-100%)": 5, "Level 6 (70-79%)": 8, ... }
      strandPerformance, // e.g. { "Algebra": 62, "Functions": 51, "Trigonometry": 44, "Geometry": 39 }
      flaggedLearners, // list of learners needing intervention
      teacherFeedback,
    } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `You are the Head of Department for Mathematics and Mathematical Literacy at Eagle House School.
You are performing a comprehensive Results Analysis and generating a Learner Intervention Strategy in alignment with:
- Eagle House Assessment Policy and Data Interpretation Guidelines ("Data should lead to action. A spreadsheet full of marks is only useful once someone asks what it means and does something about it.")
- Grade weightings (CAPS Senior Phase 40/60; FET IEB 25/75; Cambridge mark boundaries).
- At-risk learner identification and Appendix 10 Learner Intervention Tracker.

Return valid JSON ONLY with this structure:
{
  "executiveSummary": string,
  "subject": string,
  "grade": string,
  "term": string,
  "overallHealth": "Exceeding Expectations" | "Satisfactory" | "Requires Targeted Intervention" | "Critical Concern",
  "keyStrengths": [string],
  "criticalGaps": [
    {
      "strand": string,
      "observedWeakness": string,
      "rootCause": string,
      "pedagogicalFix": string
    }
  ],
  "learnerInterventions": [
    {
      "learnerName": string,
      "concern": string,
      "evidence": string,
      "intervention": string,
      "responsible": string,
      "reviewDate": string,
      "outcomeMetric": string
    }
  ],
  "departmentActionDirectives": [string],
  "curriculumAdjustments": string
}`;

    const prompt = `Analyze this dataset:
- Subject: ${subject}
- Grade: ${grade}
- Term: ${term}
- Assessment: ${taskName}
- Cohort Size: ${cohortSize}
- Average: ${averagePercentage}%
- Pass Rate: ${passRatePercentage}%
- Distinctions: ${distinctionsCount}
- Marks Distribution: ${JSON.stringify(marksDistribution)}
- Strand/Topic Performance: ${JSON.stringify(strandPerformance)}
- Flagged Learners: ${JSON.stringify(flaggedLearners)}
- Teacher's Observations: ${teacherFeedback || "Learners struggled with 3D trigonometry and algebraic manipulation under timed conditions."}

Provide a deep pedagogical diagnostic and actionable HOD interventions.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const responseText = response.text?.trim() || "{}";
    const result = JSON.parse(responseText);
    res.json({ success: true, analysis: result });
  } catch (error: any) {
    console.error("Error analyzing results:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze results.",
    });
  }
});

// Endpoint: Upload Digital, OCR PDF, or Handwritten Results for AI Analysis & Extraction
app.post("/api/results/upload-analyze", async (req, res) => {
  try {
    const { fileData, fileName, mimeType, subject, grade, term, taskName } = req.body;
    if (!fileData) {
      return res.status(400).json({ success: false, error: "No file data provided." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are the expert HOD Results Analysis & OCR Extraction Engine for Eagle House School.
Your task is to analyze uploaded assessment results files. The uploaded file can be:
1. Digital mark sheets (CSV, Excel spreadsheets, JSON).
2. OCR PDF reports (scanned mark sheets, school management system PDF reports).
3. Handwritten results (scanned photos of handwritten mark registers, teacher assessment sheets, or handwritten exam scripts).

You must accurately extract student marks, calculate cohort statistics (average percentage, pass rate percentage, distinctions count), determine IEB / CAPS mark distributions (Levels 1 to 7), analyze topical/strand performance, and identify struggling learners for the Appendix 10 Learner Intervention Tracker.

Return valid JSON ONLY with this structure:
{
  "id": string,
  "subject": string,
  "grade": string,
  "term": string,
  "taskName": string,
  "cohortSize": number,
  "averagePercentage": number,
  "passRatePercentage": number,
  "distinctionsCount": number,
  "overallHealth": "Exceeding Expectations" | "Satisfactory" | "Requires Targeted Intervention" | "Critical Concern",
  "marksDistribution": {
    "Level 7 (80-100%)": number,
    "Level 6 (70-79%)": number,
    "Level 5 (60-69%)": number,
    "Level 4 (50-59%)": number,
    "Level 3 (40-49%)": number,
    "Level 2 (30-39%)": number,
    "Level 1 (0-29%)": number
  },
  "strandPerformance": {
    [strandName: string]: number
  },
  "executiveSummary": string,
  "keyStrengths": [string],
  "criticalGaps": [
    {
      "strand": string,
      "observedWeakness": string,
      "rootCause": string,
      "pedagogicalFix": string
    }
  ],
  "learnerInterventions": [
    {
      "id": string,
      "learnerName": string,
      "grade": string,
      "subject": string,
      "concern": string,
      "evidence": string,
      "intervention": string,
      "responsible": string,
      "reviewDate": string,
      "outcomeMetric": string,
      "status": "Active" | "Under Review" | "Resolved"
    }
  ],
  "departmentActionDirectives": [string],
  "curriculumAdjustments": string
}`;

    const contents: any[] = [];
    
    if (fileData.startsWith("data:")) {
      const commaIndex = fileData.indexOf(",");
      const header = fileData.substring(0, commaIndex);
      const base64Content = fileData.substring(commaIndex + 1);
      const detectedMime = header.split(":")[1]?.split(";")[0] || mimeType || "application/octet-stream";

      contents.push({
        inlineData: {
          mimeType: detectedMime,
          data: base64Content,
        },
      });
      contents.push({
        text: `Analyze this uploaded assessment file (${fileName || "results document"}) for Subject: ${subject || "Mathematics"}, Grade: ${grade || "10"}, Term: ${term || "Term 1"}, Assessment: ${taskName || "Control Test"}. Perform full OCR extraction of marks, compute statistics, analyze strand mastery, and populate the learner intervention tracker.`,
      });
    } else {
      contents.push({
        text: `Analyze this uploaded assessment dataset (${fileName || "results data"}):
Subject: ${subject || "Mathematics"}
Grade: ${grade || "10"}
Term: ${term || "Term 1"}
Task: ${taskName || "Assessment"}

Content:
${fileData}`,
      });
    }

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = response.text?.trim() || "{}";
    const result = JSON.parse(responseText);
    res.json({ success: true, analysis: result });
  } catch (error: any) {
    console.error("Error processing uploaded results:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process and analyze uploaded results file.",
    });
  }
});

// Endpoint: AI HOD Advisor / Assistant Chat for Departmental Guidance
app.post("/api/hod/advisor", async (req, res) => {
  try {
    const { query, conversationHistory } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `You are the intelligent Head of Department (HOD) Assistant for Mathematics and Mathematical Literacy at Eagle House School (Praxis Borderless Learning).
You are thoroughly grounded in:
1. The Eagle House School HOD Handbook and Assessment Policy:
   - 9 Core Areas: Department Leadership, Curriculum, Teaching & Learning, Assessment & Data, Learner Progress, Educator Development, Communication, Accountability, Department Improvement.
   - Assessment rules: Pre-moderation 5 days prior (Policy 7.1); Post-moderation 10% sample in purple pen (Policy 7.2).
   - Escalation Guide: Green (HOD manages independently), Amber (HOD works with Senior Leadership), Red (Immediate escalation for safeguarding/serious misconduct/legal/safety).
   - Difficult Conversations 8-step protocol (Prepare, Meet privately, State concern clearly, Listen, Clarify expectations, Agree on actions, Document, Follow up).
   - "What? So What? Now What?" feedback framework for learning walks.
2. South African IEB SAGS for Mathematics and Mathematical Literacy.
3. CAPS Senior Phase (Grades 8-9) Mathematics curriculum and ATPs.
4. Cambridge Assessment International Education (Lower Secondary Checkpoint, IGCSE 0580/0607, Cambridge International AS/A Level 9709).
5. Eagle House 2026 Academic Calendar dates:
   - Term 1: Jan 13 - Mar 19, 2026
   - Term 2: Apr 6 - Jun 25, 2026
   - Term 3: Jul 20 - Sep 22, 2026
   - Term 4: Oct 5 - Dec 8, 2026

Provide professional, supportive, compliant, and actionable advice.`;

    const contents: any[] = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((item: any) => {
        contents.push({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.content }],
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: query }],
    });

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error("Error in HOD advisor:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to query HOD advisor.",
    });
  }
});

// Vite middleware setup for SPA
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HOD Assistant Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
