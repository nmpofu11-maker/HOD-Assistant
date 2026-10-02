import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

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
  const modelsToTry = [params.model || process.env.GEMINI_MODEL || "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let attempts = 2;
    let delay = 400; // base delay in ms

    while (attempts > 0) {
      try {
        console.log(`[Gemini Request] Attempting with model: ${model} (Remaining attempts: ${attempts})`);
        const safeConfig = { ...(params.config || {}) };
        // Gemini 3.8 Flash does not use legacy sampling parameters.
        delete safeConfig.temperature;
        delete safeConfig.top_p;
        delete safeConfig.top_k;

        const response = await ai.models.generateContent({
          ...params,
          model,
          config: safeConfig,
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
          const jitter = Math.floor(Math.random() * 200);
          const currentDelay = delay + jitter;
          console.warn(`[Gemini Transient Error] Status ${statusCode || "unknown"}. Retrying in ${currentDelay}ms... Details: ${err.message}`);
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          delay *= 1.5;
          attempts--;
        } else {
          console.error(`[Gemini Error] Moving to next model or aborting for ${model}:`, err.message);
          break;
        }
      }
    }
    console.warn(`[Gemini Fallback] Model ${model} finished. Checking next candidate...`);
  }

  throw lastError || new Error("Failed to generate content from Gemini after multiple attempts and fallbacks.");
}

// Persistence helper functions
const DATA_DIR = path.join(process.cwd(), "data");
function readJsonFile(filename: string): any[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    return [];
  }
}

function writeJsonFile(filename: string, data: any[]): void {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// Persistence Endpoints
// Only expose the application's known JSON stores. This prevents path traversal
// and accidental reads/writes of arbitrary server files.
const ALLOWED_DATA_FILES = new Set(["deadlines.json", "meetings.json", "results.json"]);

function validateDataFilename(filename: string): string | null {
  const safe = path.basename(filename);
  return ALLOWED_DATA_FILES.has(safe) ? safe : null;
}

app.get("/api/data/:filename", (req, res) => {
  const filename = validateDataFilename(req.params.filename);
  if (!filename) return res.status(404).json({ success: false, error: "Unknown data resource." });
  return res.json(readJsonFile(filename));
});

app.post("/api/data/:filename", (req, res) => {
  const filename = validateDataFilename(req.params.filename);
  if (!filename) return res.status(404).json({ success: false, error: "Unknown data resource." });
  const data = readJsonFile(filename);
  if (!Array.isArray(data)) return res.status(500).json({ success: false, error: "Data store is invalid." });
  data.push(req.body);
  writeJsonFile(filename, data);
  return res.json({ success: true });
});

app.put("/api/data/:filename", (req, res) => {
  const filename = validateDataFilename(req.params.filename);
  if (!filename) return res.status(404).json({ success: false, error: "Unknown data resource." });
  if (!Array.isArray(req.body)) return res.status(400).json({ success: false, error: "Expected an array payload." });
  writeJsonFile(filename, req.body);
  return res.json({ success: true });
});

// Endpoint: Upload Exam/Assessment Calendar
app.post("/api/deadlines/upload-calendar", async (req, res) => {
  try {
    const { fileData, mimeType, fileName } = req.body;
    if (!fileData) {
      return res.status(400).json({ success: false, error: "Missing fileData" });
    }

    const { text } = await extractTextFromAnyFile(fileData, mimeType, fileName);

    const ai = getGeminiClient();
    const systemInstruction = `You are the HOD Assistant for Eagle House School.
Extract assessment deadlines from the provided text into a JSON array of objects.
Shape each object like: { teacherName, subject, grade, curriculum, taskName, testDate, totalMarks, term }.
Return valid JSON ONLY with this structure:
{
  "deadlines": [
    {
      "teacherName": string,
      "subject": string,
      "grade": string,
      "curriculum": "IEB" | "CAPS" | "Cambridge",
      "taskName": string,
      "testDate": string,
      "totalMarks": number,
      "term": number
    }
  ]
}`;

    const promptText = `Extract assessment deadlines from the following calendar content:
${text}`;

    const report = await parseAndValidate(ai, {
      model: "gemini-flash-latest",
      contents: [{ text: promptText }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    }, z.object({ deadlines: z.array(DeadlineSchema) }));

    res.json({ success: true, deadlines: report.deadlines });
  } catch (error: any) {
    console.error("Error in upload-calendar:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process calendar.",
    });
  }
});


import { PreModerationSchema, PostModerationSchema, ScriptAnalysisSchema, MeetingSchema, ResultsSchema, DeadlineSchema } from "./src/utils/validation";
import { buildCurriculumContext, retrieveKnowledge } from "./src/data/hodKnowledgeBase";
import { z } from "zod";

async function parseAndValidate<T>(
  ai: GoogleGenAI,
  params: any,
  schema: z.ZodSchema<T>
): Promise<T> {
  const response = await generateContentWithRetry(ai, params);
  let responseText = response.text?.trim() || "{}";
  
  try {
    const json = JSON.parse(responseText);
    return schema.parse(json);
  } catch (err) {
    console.warn("[Gemini Validation] Schema mismatch. Retrying with explicit instructions...");
    
    // Retry once with extra instruction
    const retryParams = {
        ...params,
        contents: [
            ...params.contents,
            { text: "Your previous response was not valid JSON matching the required schema — return ONLY valid JSON this time following the requested structure." }
        ]
    };

    const retryResponse = await generateContentWithRetry(ai, retryParams);
    responseText = retryResponse.text?.trim() || "{}";
    const json = JSON.parse(responseText);
    return schema.parse(json);
  }
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
    
    const isGeminiInlineAllowed = (mime?: string) => {
      if (!mime) return false;
      const m = mime.toLowerCase();
      return m === "application/pdf" || m.startsWith("image/");
    };

    // Support separate task file upload (PDF / Image only for inlineData)
    const rawTask = taskFileData || fileData;
    const rawTaskMime = taskFileMimeType || fileMimeType;
    if (rawTask && isGeminiInlineAllowed(rawTaskMime)) {
      const cleanData = rawTask.replace(/^data:[a-zA-Z0-9_\-+./]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: rawTaskMime!,
          data: cleanData,
        },
      });
    }

    // Support separate memo file upload (PDF / Image only for inlineData)
    if (memoFileData && isGeminiInlineAllowed(memoFileMimeType)) {
      const cleanMemo = memoFileData.replace(/^data:[a-zA-Z0-9_\-+./]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: memoFileMimeType!,
          data: cleanMemo,
        },
      });
    }

    parts.push({ text: promptText });

    const report = await parseAndValidate(ai, {
      model: "gemini-flash-latest",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }, PreModerationSchema);

    res.json({ success: true, report });
  } catch (error: any) {
    console.error("Error in pre-moderation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to moderate task.",
    });
  }
});

// Universal helper to perform OCR / transcription / text extraction on ANY uploaded file
async function extractTextFromAnyFile(
  fileData: string,
  mimeType?: string,
  fileName?: string
): Promise<{ text: string; detectedType: string; wordCount: number; charCount: number }> {
  const cleanBase64 = (fileData || "").replace(/^data:[a-zA-Z0-9_\-+./]+;base64,/, "");
  const normalizedMime = (mimeType || "").toLowerCase();
  const lowerName = (fileName || "").toLowerCase();

  // 1. Word Document (.docx)
  if (lowerName.endsWith(".docx") || normalizedMime.includes("wordprocessingml") || normalizedMime.includes("docx")) {
    if (cleanBase64) {
      try {
        const buffer = Buffer.from(cleanBase64, "base64");
        const parsedDocx = await mammoth.extractRawText({ buffer });
        const text = parsedDocx.value?.trim() || "";
        return {
          text,
          detectedType: "Word Document (.docx)",
          wordCount: text ? text.split(/\s+/).length : 0,
          charCount: text.length,
        };
      } catch (docxErr) {
        console.warn("Mammoth DOCX extraction warning:", docxErr);
      }
    }
  }

  // 1b. Excel Spreadsheet (.xlsx, .xls)
  if (
    lowerName.endsWith(".xlsx") ||
    lowerName.endsWith(".xls") ||
    normalizedMime.includes("spreadsheetml") ||
    normalizedMime.includes("ms-excel")
  ) {
    if (cleanBase64) {
      try {
        const buffer = Buffer.from(cleanBase64, "base64");
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetTexts: string[] = [];
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          if (csv && csv.trim()) {
            sheetTexts.push(`--- Sheet: ${sheetName} ---\n${csv.trim()}`);
          }
        });
        const text = sheetTexts.join("\n\n");
        return {
          text,
          detectedType: "Excel Spreadsheet (.xlsx / .xls)",
          wordCount: text ? text.split(/\s+/).length : 0,
          charCount: text.length,
        };
      } catch (excelErr) {
        console.warn("XLSX extraction warning:", excelErr);
      }
    }
  }

  // 2. Plain Text / Markdown / CSV / JSON
  if (
    normalizedMime.startsWith("text/") ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".csv") ||
    lowerName.endsWith(".md") ||
    lowerName.endsWith(".json")
  ) {
    let text = "";
    if (cleanBase64 && cleanBase64.length % 4 === 0 && /^[A-Za-z0-9+/=]+$/.test(cleanBase64.slice(0, 100))) {
      try {
        text = Buffer.from(cleanBase64, "base64").toString("utf-8");
      } catch {
        text = fileData;
      }
    } else {
      text = fileData;
    }
    text = text.trim();
    return {
      text,
      detectedType: "Plain Text / Document",
      wordCount: text ? text.split(/\s+/).length : 0,
      charCount: text.length,
    };
  }

  // 3. Audio Speech-to-Text Transcription
  if (
    normalizedMime.startsWith("audio/") ||
    lowerName.match(/\.(mp3|wav|m4a|webm|ogg|aac|flac)$/)
  ) {
    const ai = getGeminiClient();
    const systemInstruction =
      "You are an expert audio transcriptionist for Eagle House School. Accurately transcribe all spoken dialogue, educator remarks, agenda items, decisions, and action items verbatim with timestamps and speaker tags where identifiable.";
    const parts = [
      {
        inlineData: {
          mimeType: normalizedMime || "audio/webm",
          data: cleanBase64,
        },
      },
      {
        text: "Transcribe this audio recording verbatim into clean text. Include speaker labels (e.g. Chair/HOD, Educator, Teacher), key points discussed, and agreed actions.",
      },
    ];

    const response = await generateContentWithRetry(ai, {
      model: "gemini-flash-latest",
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    const text = response.text?.trim() || "";
    return {
      text,
      detectedType: "Recorded Audio (Speech-to-Text)",
      wordCount: text ? text.split(/\s+/).length : 0,
      charCount: text.length,
    };
  }

  // 4. Multimodal Optical Character Recognition (OCR) for Images and PDFs
  const isPdf = normalizedMime === "application/pdf" || lowerName.endsWith(".pdf");
  const isImage = normalizedMime.startsWith("image/") || lowerName.match(/\.(png|jpe?g|webp|bmp|gif|tiff)$/);

  const ai = getGeminiClient();
  const systemInstruction = isPdf
    ? "You are an expert PDF document and handwritten scan OCR specialist at Eagle House School. Extract and transcribe all text, questions, mathematical formulas, tabular data, handwritten notations, teacher annotations, and signatures accurately without omission."
    : "You are an expert Optical Character Recognition (OCR) vision specialist for Eagle House School. Meticulously transcribe all handwritten text, cursive script, whiteboard notes, printed forms, mathematical symbols, educator signatures, and margin notes. Return verbatim clean text.";

  const effectiveMime = isPdf ? "application/pdf" : normalizedMime || "image/jpeg";
  const parts = [
    {
      inlineData: {
        mimeType: effectiveMime,
        data: cleanBase64,
      },
    },
    {
      text: "Extract and transcribe all text from this uploaded scan/document. Preserve layout structure, section headings, bullet points, numbers, and handwritten remarks. Return only the extracted text without introductory chatter.",
    },
  ];

  const response = await generateContentWithRetry(ai, {
    model: "gemini-flash-latest",
    contents: { parts },
    config: {
      systemInstruction,
      temperature: 0.1,
    },
  });

  const text = response.text?.trim() || "";
  return {
    text,
    detectedType: isPdf ? "Scanned Document (PDF OCR)" : "Handwritten Scan / Image (Vision OCR)",
    wordCount: text ? text.split(/\s+/).length : 0,
    charCount: text.length,
  };
}

// Universal Endpoint: OCR-to-Text for ANY uploaded file (Image, PDF, DOCX, Audio, TXT)
app.post("/api/ocr/extract-text", async (req, res) => {
  try {
    const { fileData, mimeType, fileName } = req.body;
    if (!fileData) {
      return res.status(400).json({ success: false, error: "Missing fileData" });
    }

    const result = await extractTextFromAnyFile(fileData, mimeType, fileName);
    res.json({
      success: true,
      extractedText: result.text,
      detectedType: result.detectedType,
      wordCount: result.wordCount,
      charCount: result.charCount,
    });
  } catch (error: any) {
    console.error("Universal OCR text extraction failed:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to perform OCR text extraction.",
    });
  }
});

// Endpoint: AI-Powered Text Extraction from uploaded PDF/Image/DOCX files for Moderation
app.post("/api/moderate/extract-text", async (req, res) => {
  try {
    const { fileData, mimeType, fileName } = req.body;
    if (!fileData) {
      return res.status(400).json({ success: false, error: "Missing fileData" });
    }

    const result = await extractTextFromAnyFile(fileData, mimeType, fileName);
    res.json({
      success: true,
      extractedText: result.text,
      detectedType: result.detectedType,
    });
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

    const report = await parseAndValidate(ai, {
      model: "gemini-flash-latest",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }, PostModerationSchema);

    res.json({ success: true, report });
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

    const analysis = await parseAndValidate(ai, {
      model: "gemini-flash-latest",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    }, ScriptAnalysisSchema);

    res.json({ success: true, analysis });
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
      templateType = "Standard Staff Meeting",
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

    let templateSpecificStructure = "";
    if (templateType === "Moderation Meeting") {
      templateSpecificStructure = `Eagle House Moderation Meeting 10-Point Sequence (Policy §7.1 & §7.2 Quality Assurance):
1. Quorum Verification & Internal Moderation Objectives (HOD Mpofu)
2. Matters Arising & Action Audit from Prior Moderation Cycle (Senior Moderators)
3. Assessment Blueprint & Cognitive Weighting Grid (Bloom's Taxonomy Levels 1–4 Balance)
4. Policy §7.1 Compliance: 5-Day Pre-Moderation Lead-Time & Technical Formatting Review
5. Marking Memorandum Standardization & Alternative Solution Methods Calibration
6. Policy §7.2 Post-Moderation: 10% Stratified Purple Pen Protocol & Marking Audit
7. Moderation Discrepancy & Mark Variance Resolution Register (±5% threshold)
8. Question Discrimination Index & Diagnostic Error Analysis
9. Statutory Moderation Tool Sign-off & Appendix 7 Compliance Certification
10. Moderation Remedial Orders & Senior Leadership (SMT) Escalation`;
    } else if (templateType === "Curriculum Planning") {
      templateSpecificStructure = `Eagle House Curriculum Planning 10-Point Sequence (CAPS ATP & SAGS Milestones):
1. Department Academic Vision & Term Strategic Targets (HOD Mpofu)
2. CAPS/IEB Annual Teaching Plan (ATP) Milestone Mapping & Pacing Calendar
3. Prerequisite Diagnostic Gaps & Baseline Remediation Strategy
4. Common Assessment Task (CAT) & SBA Schedule Synchronization
5. Pedagogical Methodology, Lesson Study & Differentiated CRA Instruction
6. Textbook, Digital LMS & Technology Resource Allocation
7. Inclusive Education & High-Potential / At-Risk Tiering Framework
8. Educator Workload, Subject Allocations & Mentorship Pairing
9. Cross-Curricular STEM Integration & Academic Enrichment
10. Department Milestones Approval, SMT Submission & Adjournment`;
    } else {
      templateSpecificStructure = `Eagle House Standard 10-Item Meeting Agenda (HOD Handbook §1):
1. Welcome & Apologies
2. Matters Arising from Previous Minutes
3. Curriculum Progress & ATP Pacing Alignment
4. Assessment & Moderation Compliance (§7.1 pre-mod 5 days ahead, §7.2 post-mod 10% purple pen)
5. Learner Performance & Diagnostic Data
6. Learners Requiring Academic Intervention (Appendix 10 trackers for learners <30%)
7. Educator Support, Teaching Practice & Professional Development
8. Resources, Textbooks & Technology
9. Matters Requiring Escalation to Senior Leadership (SMT Green/Amber/Red)
10. Any Other Business (AOB) & Date of Next Meeting`;
    }

    const systemInstruction = `You are an AI assistant for the Head of Department (HOD) for Mathematics & Mathematical Literacy at Eagle House School.
You follow the Eagle House School HOD Handbook guidelines for professional department meetings and minutes:
"Department meetings should be purposeful and action-driven, a working session, not a status update read aloud. Protect the time, keep to the agenda, and always close with clear actions."

Selected Template Format: ${templateType}
${templateSpecificStructure}

Generate both a professional standardized Agenda and structured Minutes summary with specific Action Items.
Return valid JSON ONLY with this exact format:
{
  "title": string,
  "templateType": string,
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

    const prompt = `Generate formal meeting agenda, professional discussion notes, and action items using the "${templateType}" template format:
- Template Format: ${templateType}
- Meeting Title: ${meetingTitle || "Department Meeting"}
- Meeting Type: ${meetingType || "Regular Departmental"}
- Date: ${meetingDate || new Date().toISOString().split("T")[0]}
- Specific Focus: ${specificFocus || "Standard term review and moderation alignment"}
- Previous Action Items: ${JSON.stringify(previousActionItems || [])}

Ensure all 10 agenda points corresponding to the "${templateType}" format are fully populated with realistic, professional discussion notes, decisions, and clear action items for Eagle House School Mathematics educators.`;

    const meeting = await parseAndValidate(ai, {
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    }, MeetingSchema);

    res.json({ success: true, meeting });
  } catch (error: any) {
    console.error("Error generating meeting:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate meeting agenda/minutes.",
    });
  }
});

// Endpoint: Parse Uploaded Meeting Notes / Scans / Audio into 10-Point Minutes or Agenda Template
app.post("/api/meetings/parse-upload", async (req, res) => {
  try {
    const {
      targetType, // "minutes" | "agenda"
      templateType = "Standard Staff Meeting", // "Standard Staff Meeting" | "Moderation Meeting" | "Curriculum Planning"
      inputFormat, // "typed_text" | "typed_file" | "recorded_audio" | "handwritten_ocr"
      fileData, // base64 string or plain text
      mimeType, // e.g. "image/png", "audio/mp3", "application/pdf", "text/plain", etc.
      fileName,
      meetingDate,
      additionalContext,
    } = req.body;

    const ai = getGeminiClient();

    let rawTextContent = "";
    let inlinePart: any = null;

    const cleanBase64 = (fileData || "").replace(/^data:([a-zA-Z0-9_\-+.]+\/[a-zA-Z0-9_\-+.]+);base64,/, "");

    // If docx file, extract text with mammoth
    const isDocx = (fileName && fileName.toLowerCase().endsWith(".docx")) ||
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (isDocx && cleanBase64) {
      try {
        const buffer = Buffer.from(cleanBase64, "base64");
        const parsedDocx = await mammoth.extractRawText({ buffer });
        rawTextContent = parsedDocx.value || "";
      } catch (docxErr) {
        console.warn("Failed to extract docx with mammoth, falling back:", docxErr);
      }
    }

    if (!rawTextContent) {
      if (inputFormat === "typed_text" || mimeType?.startsWith("text/")) {
        rawTextContent = typeof fileData === "string" ? fileData : "";
      } else if (cleanBase64 && (mimeType?.startsWith("image/") || mimeType?.startsWith("audio/") || mimeType === "application/pdf")) {
        inlinePart = {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || (inputFormat === "recorded_audio" ? "audio/webm" : "image/jpeg"),
          },
        };
      } else if (typeof fileData === "string") {
        rawTextContent = fileData;
      }
    }

    let templateSpecificStructure = "";
    if (templateType === "Moderation Meeting") {
      templateSpecificStructure = `Eagle House Moderation Meeting 10-Point Sequence (Policy §7.1 & §7.2 Quality Assurance):
1. Quorum Verification & Internal Moderation Objectives (HOD Mpofu)
2. Matters Arising & Action Audit from Prior Moderation Cycle (Senior Moderators)
3. Assessment Blueprint & Cognitive Weighting Grid (Bloom's Taxonomy Levels 1–4 Balance)
4. Policy §7.1 Compliance: 5-Day Pre-Moderation Lead-Time & Technical Formatting Review
5. Marking Memorandum Standardization & Alternative Solution Methods Calibration
6. Policy §7.2 Post-Moderation: 10% Stratified Purple Pen Protocol & Marking Audit
7. Moderation Discrepancy & Mark Variance Resolution Register (±5% threshold)
8. Question Discrimination Index & Diagnostic Error Analysis
9. Statutory Moderation Tool Sign-off & Appendix 7 Compliance Certification
10. Moderation Remedial Orders & Senior Leadership (SMT) Escalation`;
    } else if (templateType === "Curriculum Planning") {
      templateSpecificStructure = `Eagle House Curriculum Planning 10-Point Sequence (CAPS ATP & SAGS Milestones):
1. Department Academic Vision & Term Strategic Targets (HOD Mpofu)
2. CAPS/IEB Annual Teaching Plan (ATP) Milestone Mapping & Pacing Calendar
3. Prerequisite Diagnostic Gaps & Baseline Remediation Strategy
4. Common Assessment Task (CAT) & SBA Schedule Synchronization
5. Pedagogical Methodology, Lesson Study & Differentiated CRA Instruction
6. Textbook, Digital LMS & Technology Resource Allocation
7. Inclusive Education & High-Potential / At-Risk Tiering Framework
8. Educator Workload, Subject Allocations & Mentorship Pairing
9. Cross-Curricular STEM Integration & Academic Enrichment
10. Department Milestones Approval, SMT Submission & Adjournment`;
    } else {
      templateSpecificStructure = `Eagle House Standard 10-Item Meeting Sequence (HOD Handbook §1):
1. Welcome & Apologies
2. Matters Arising from Previous Minutes
3. Curriculum Progress & ATP Pacing Alignment
4. Assessment & Moderation Compliance (§7.1 5-day pre-moderation lead time, §7.2 10% stratified purple pen post-moderation audit)
5. Learner Performance & Diagnostic Data
6. Learners Requiring Academic Intervention (Appendix 10 trackers for learners <30%)
7. Educator Support, Teaching Practice & Professional Development
8. Resources, Textbooks & Technology
9. Matters Requiring Escalation to Senior Leadership (SMT Green/Amber/Red)
10. Any Other Business (AOB) & Date of Next Meeting`;
    }

    const templatePrompt = targetType === "agenda"
      ? `You are preparing an official Eagle House School Department Meeting AGENDA DRAFT for a "${templateType}".
Map the extracted information into upcoming agenda discussion points, intended objectives, suggested leads, and time allocations according to the selected format.`
      : `You are preparing the official Eagle House School Department Meeting MINUTES & ACCOUNTABILITY TRACKER for a "${templateType}".
Map the extracted information into formal minutes records, discussions held, decisions reached, diagnostic figures, learner intervention metrics, and clear action items according to the selected format.`;

    const formatSpecificInstruction = inputFormat === "handwritten_ocr"
      ? `CRITICAL OCR & HANDWRITING INSTRUCTION:
The provided image is a handwritten note, meeting journal page, whiteboard photo, or scanned document.
Perform meticulous Optical Character Recognition (OCR) on all handwritten script, including cursive, shorthand, teacher initials, math symbols, and margin notes.
Transcribe and interpret all handwritten text accurately.`
      : inputFormat === "recorded_audio"
      ? `CRITICAL AUDIO TRANSCRIPTION INSTRUCTION:
The provided file is an audio recording of an Eagle House School Mathematics Department meeting or voice note.
Transcribe all spoken discussions, identifying speaking educators, decisions made, curriculum pacing reports, test moderation remarks, and assigned duties.`
      : `CRITICAL DOCUMENT INSTRUCTION:
Extract all typed text, minutes notes, agenda outlines, and action points from this document.`;

    const systemInstruction = `You are an expert Head of Department (HOD) Assistant for Mathematics & Mathematical Literacy at Eagle House School.
${templatePrompt}
${formatSpecificInstruction}

Selected Template Format: ${templateType}
${templateSpecificStructure}

Mathematics Department Staff Roster:
- Mr. N. Mpofu (Head of Department — Chair)
- Shingi (Mathematics Educator)
- Reggie (Mathematics Educator)
- Luthando (Mathematics Educator)

You MUST populate all 10 agenda points. If specific details for any point were not mentioned in the source material, provide professional, context-appropriate standard notes or leave a concise standard placeholder aligned with Eagle House guidelines.
Extract all actionable tasks into the actionItems array with realistic deadlines and responsible educators.
Return valid JSON ONLY with this exact structure:
{
  "title": string,
  "date": string,
  "startTime": string,
  "endTime": string,
  "venue": string,
  "chairperson": string,
  "meetingType": "Regular Departmental" | "Pre-Moderation Calibration" | "Post-Exam Review" | "Urgent / Escalation",
  "attendees": [string],
  "apologies": [string],
  "rawTranscribedText": string,
  "transcriptionSummary": string,
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
  "teacherSignatures": [
    {
      "teacherId": "mpofu" | "shingi" | "reggie" | "luthando",
      "name": string,
      "role": string,
      "allocation": string,
      "signed": boolean,
      "signedDate": string
    }
  ],
  "minutesSummary": string
}`;

    const promptText = `Process this uploaded ${inputFormat} meeting source material and populate the Eagle House School ${targetType === "agenda" ? "Agenda Draft" : "Meeting Minutes Template"}.
Target Date: ${meetingDate || new Date().toISOString().split("T")[0]}
Additional Context from User: ${additionalContext || "None provided"}
${rawTextContent ? `\n--- SOURCE TEXT EXTRACTED ---\n${rawTextContent}` : ""}`;

    const contentParts: any[] = [];
    if (inlinePart) {
      contentParts.push(inlinePart);
    }
    contentParts.push({ text: promptText });

    const result = await parseAndValidate(ai, {
      model: "gemini-flash-latest",
      contents: contentParts,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }, MeetingSchema);

    if (!result.rawTranscribedText && rawTextContent) {
      result.rawTranscribedText = rawTextContent;
    }

    res.json({
      success: true,
      targetType,
      inputFormat,
      parsedRecord: result,
    });
  } catch (error: any) {
    console.error("Error parsing uploaded meeting material:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to parse meeting material via OCR/AI.",
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

    const analysis = await parseAndValidate(ai, {
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    }, ResultsSchema);

    res.json({ success: true, analysis });
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
    const lowerFileName = (fileName || "").toLowerCase();
    const isDocOrSheet =
      lowerFileName.endsWith(".xlsx") ||
      lowerFileName.endsWith(".xls") ||
      lowerFileName.endsWith(".docx") ||
      lowerFileName.endsWith(".csv") ||
      lowerFileName.endsWith(".txt") ||
      lowerFileName.endsWith(".json");

    if (isDocOrSheet || !fileData.startsWith("data:")) {
      const extracted = await extractTextFromAnyFile(fileData, mimeType, fileName);
      contents.push({
        text: `Analyze this uploaded assessment results dataset (${fileName || "results file"}):
Subject: ${subject || "Mathematics"}
Grade: ${grade || "10"}
Term: ${term || "Term 1"}
Task: ${taskName || "Assessment"}
Extracted Data Type: ${extracted.detectedType}

--- EXTRACTED RESULTS CONTENT ---
${extracted.text || fileData}`,
      });
    } else if (fileData.startsWith("data:")) {
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
    }

    const result = await parseAndValidate(ai, {
      model: "gemini-flash-latest",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }, ResultsSchema);

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
    const {
      query,
      conversationHistory,
      department = "Mathematics & Mathematical Literacy",
      subject,
      grade,
      curriculum
    } = req.body || {};

    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ success: false, error: "Please enter a question." });
    }

    const ai = getGeminiClient();
    const context = buildCurriculumContext(subject || department, grade, curriculum);
    const retrieved = retrieveKnowledge(query.trim(), subject || department, grade, curriculum, 8);

    const sourceText = retrieved.map(({ chunk, score }) =>
      [
        `SOURCE ID: ${chunk.id}`,
        `SOURCE: ${chunk.sourceTitle}`,
        `AUTHORITY: ${chunk.authority}`,
        `SCOPE: ${chunk.scope}`,
        `RELEVANCE SCORE: ${score}`,
        `EVIDENCE: ${chunk.text}`
      ].join("\n")
    ).join("\n\n");

    const systemInstruction = `You are Eagle House School's HOD Assistant: a curriculum-literate, evidence-aware professional assistant for school leadership.

Your job is to help an HOD make sound operational, curriculum, assessment and pedagogical decisions. You are not a generic chatbot.

CURRENT CONTEXT:
- Department: ${department}
- Subject: ${subject || "Not specified"}
- Grade: ${grade || "Not specified"}
- Curriculum: ${curriculum || "Not specified"}

SOURCE PRIORITY:
1. Supplied Eagle House internal policy/guide for school-specific procedures.
2. Named IEB/DBE/Cambridge source for external curriculum and assessment requirements.
3. Clearly labelled professional recommendation where the sources do not settle the question.

IMPORTANT ACCURACY RULES:
- Do not invent policy clauses, statutory requirements, curriculum weightings, dates or syllabus content.
- Distinguish "Eagle House policy" from "IEB/DBE/Cambridge requirement".
- If sources conflict or the question requires a current external document not supplied here, say so and recommend verification against the current official document.
- Never present a recommendation as a mandatory requirement.
- When useful, structure answers as: Answer; Evidence/requirement; Action steps; Documentation; Escalation/verification.
- Ground factual claims in the retrieved evidence below. Do not treat relevance score as evidence strength.
- When citing retrieved evidence, use the exact source title in square brackets, e.g. [Eagle House School Assessment Policy V2 2026].
- For moderation, check validity, curriculum alignment, cognitive demand, mark totals, timing, memo quality, language, diagrams/data, accessibility and policy compliance.
- For results, convert findings into specific interventions with owners, dates and measurable success criteria.
- For difficult staff matters, remain professional, evidence-based and supportive; do not diagnose or speculate about people.
- Keep answers concise enough for a working HOD, but provide detail when the task requires it.

CURRICULUM AND POLICY KNOWLEDGE:
${sourceText}

OPERATING RULES:
${context.operatingRules.map((rule) => `- ${rule}`).join("\n")}`;

    const historyText = Array.isArray(conversationHistory)
      ? conversationHistory
          .slice(-10)
          .filter((item: any) => item?.content)
          .map((item: any) => `${item.role === "user" ? "HOD" : "Advisor"}: ${String(item.content).slice(0, 6000)}`)
          .join("\n\n")
      : "";

    // Keep the request in a single user turn so the current Gemini generation
    // API does not receive prefilled model turns.
    const contents = [{
      role: "user",
      parts: [{
        text: [
          historyText ? `RECENT CONVERSATION:\n${historyText}` : "",
          `CURRENT QUESTION:\n${query.trim()}`
        ].filter(Boolean).join("\n\n")
      }]
    }];

    const response = await generateContentWithRetry(ai, {
      model: "gemini-flash-latest",
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    return res.json({
      success: true,
      reply: response.text?.trim() || "I could not generate a response. Please try again.",
      advice: response.text?.trim() || ""
    });
  } catch (error: any) {
    console.error("Error in HOD advisor:", error);
    const message = error?.message || "Failed to query HOD advisor.";
    return res.status(500).json({
      success: false,
      error: message.includes("GEMINI_API_KEY")
        ? "The AI service is not configured. Add GEMINI_API_KEY to the server environment."
        : message
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
