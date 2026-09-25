import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Mic,
  Image as ImageIcon,
  FileAudio,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  Square,
  ListOrdered,
  Check,
  Users,
  Calendar,
  MapPin,
  UserCheck,
  ArrowRight,
  Clock,
  Eye,
  FileUp,
  Plus,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Edit3,
  Zap,
  RotateCcw,
  Search,
  Volume2,
  FileCheck,
  Split,
  Layers,
  FileType,
} from "lucide-react";
import { MeetingRecord, MeetingTemplateType } from "../types";
import {
  HOD_STANDARD_10_AGENDA_ITEMS,
  MEETING_TEMPLATE_CONFIGS,
} from "./MeetingsView";
import { safePost } from "../utils/apiClient";

interface MeetingUploadIntakeProps {
  onMeetingProcessed: (record: MeetingRecord, targetType: "minutes" | "agenda") => void;
  onDownloadDocx: (record: MeetingRecord, targetType: "minutes" | "agenda") => void;
  defaultTeachers: {
    teacherId: string;
    name: string;
    role: string;
    allocation: string;
    signed: boolean;
    signedDate?: string;
  }[];
  initialTemplateType?: MeetingTemplateType;
}

export const MeetingUploadIntake: React.FC<MeetingUploadIntakeProps> = ({
  onMeetingProcessed,
  onDownloadDocx,
  defaultTeachers,
  initialTemplateType,
}) => {
  // Target destination: Minutes template or Agenda draft
  const [targetType, setTargetType] = useState<"minutes" | "agenda">("minutes");

  // Template format: 'Standard Staff Meeting' | 'Moderation Meeting' | 'Curriculum Planning'
  const [selectedTemplate, setSelectedTemplate] = useState<MeetingTemplateType>(
    initialTemplateType || "Standard Staff Meeting"
  );

  useEffect(() => {
    if (initialTemplateType) {
      setSelectedTemplate(initialTemplateType);
    }
  }, [initialTemplateType]);

  // Format selection
  const [uploadFormat, setUploadFormat] = useState<
    "handwritten_ocr" | "recorded_audio" | "typed_file" | "typed_text"
  >("handwritten_ocr");

  // Auto-process toggle (default true for instant automated OCR processing)
  const [autoProcessOnUpload, setAutoProcessOnUpload] = useState(true);

  // Uploaded file data
  const [uploadFile, setUploadFile] = useState<{
    dataUrl: string;
    name: string;
    mimeType: string;
    size: number;
    detectedTypeLabel?: string;
  } | null>(null);

  const [typedTextInput, setTypedTextInput] = useState("");
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split("T")[0]);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBadge, setSuccessBadge] = useState<string | null>(null);

  // Parsed and fully editable meeting record
  const [parsedRecord, setParsedRecord] = useState<MeetingRecord | null>(null);
  const [rawOcrText, setRawOcrText] = useState("");
  const [ocrSearchQuery, setOcrSearchQuery] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [ocrSyncNotice, setOcrSyncNotice] = useState(false);

  // View mode for OCR comparison: "split_fields" | "split_ocr" | "fields_only" | "ocr_only" | "preview_only"
  const [viewMode, setViewMode] = useState<
    "split_fields" | "split_ocr" | "fields_only" | "ocr_only" | "preview_only"
  >("split_fields");
  const [zoomLevel, setZoomLevel] = useState(1);

  // Microphone audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  // Core Processing Routine: calls backend OCR & AI parsing endpoint for ANY uploaded format
  const runOcrProcessing = async (
    targetDoc: "minutes" | "agenda",
    format: "handwritten_ocr" | "recorded_audio" | "typed_file" | "typed_text",
    filePayload: { dataUrl: string; name: string; mimeType: string } | null,
    textPayload: string,
    dateVal: string,
    titleVal: string,
    contextVal: string
  ) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessBadge(null);
    setProgressStep(1);

    const isImage = filePayload?.mimeType.startsWith("image/");
    const isPdf = filePayload?.mimeType === "application/pdf" || filePayload?.name.toLowerCase().endsWith(".pdf");
    const isAudio = format === "recorded_audio" || filePayload?.mimeType.startsWith("audio/");
    const isDoc = filePayload?.name.toLowerCase().endsWith(".docx") || filePayload?.mimeType.includes("wordprocessingml");

    setProgressMessage(
      isImage
        ? "1/3 Analyzing handwritten scan resolution & character density via Vision OCR..."
        : isPdf
        ? "1/3 Parsing PDF pages & running multimodal OCR layout extraction..."
        : isAudio
        ? "1/3 Processing audio waveform & acoustic transcription..."
        : isDoc
        ? "1/3 Extracting raw document text & preserving tables..."
        : "1/3 Reading text content & syntax..."
    );

    const stepTimer1 = setTimeout(() => {
      setProgressStep(2);
      setProgressMessage(
        isImage
          ? "2/3 Transcribing handwritten notes, mathematics notations & educator remarks..."
          : isPdf
          ? "2/3 Transcribing document sections, tables & marginal notes..."
          : isAudio
          ? "2/3 Transcribing spoken discussion into text & mapping educator dialogue..."
          : isDoc
          ? "2/3 Transcribing document headings & action sequences..."
          : "2/3 Structuring text into meeting topics..."
      );
    }, 1100);

    const stepTimer2 = setTimeout(() => {
      setProgressStep(3);
      setProgressMessage(
        "3/3 Structuring into Eagle House 10-point sequence & populating editable text fields..."
      );
    }, 2600);

    try {
      const payload = {
        targetType: targetDoc,
        inputFormat: format,
        templateType: selectedTemplate,
        fileData: filePayload?.dataUrl || textPayload,
        mimeType:
          filePayload?.mimeType ||
          (format === "typed_text" ? "text/plain" : "application/octet-stream"),
        fileName:
          filePayload?.name ||
          (format === "typed_text" ? "typed_notes.txt" : "uploaded_material"),
        meetingDate: dateVal,
        additionalContext: `${titleVal ? `Title: ${titleVal}. ` : ""}${contextVal}`,
      };

      const result = await safePost("/api/meetings/parse-upload", payload);

      if (!result.success || !result.data?.parsedRecord) {
        throw new Error(result.error || "Failed to process meeting material.");
      }

      const data = result.data;

      const rec = data.parsedRecord;
      const extractedOcrText =
        rec.rawTranscribedText ||
        (rec.agendaPoints
          ? rec.agendaPoints
              .map((p: any) => `${p.pointNumber}. ${p.title}\n${p.notes}`)
              .join("\n\n")
          : textPayload || "");

      setRawOcrText(extractedOcrText);

      const activeTmplConfig =
        MEETING_TEMPLATE_CONFIGS.find((t) => t.id === selectedTemplate) ||
        MEETING_TEMPLATE_CONFIGS[0];

      const formatted: MeetingRecord = {
        id: `MTG-INTAKE-${Date.now().toString().slice(-4)}`,
        title:
          rec.title ||
          titleVal ||
          `${activeTmplConfig.title} ${targetDoc === "agenda" ? "Agenda Draft" : "Minutes"} (${dateVal})`,
        date: rec.date || dateVal,
        startTime: rec.startTime || "14:30",
        endTime: rec.endTime || "15:45",
        venue: rec.venue || "Secondary Mathematics Staffroom",
        chairperson: rec.chairperson || "Mr. N. Mpofu (HOD)",
        meetingType: rec.meetingType || "Regular Departmental",
        templateType: selectedTemplate,
        attendees: rec.attendees?.length
          ? rec.attendees
          : ["Mr. N. Mpofu (HOD)", "Shingi", "Reggie", "Luthando"],
        apologies: rec.apologies || [],
        teacherSignatures: rec.teacherSignatures?.length
          ? rec.teacherSignatures
          : defaultTeachers,
        agendaPoints: rec.agendaPoints?.length
          ? rec.agendaPoints
          : activeTmplConfig.items.map((h) => ({
              pointNumber: h.pointNumber,
              title: h.title,
              notes: h.defaultNotes,
            })),
        actionItems: rec.actionItems?.length
          ? rec.actionItems
          : [
              {
                id: `ACT-${Date.now().toString().slice(-3)}`,
                description: "Submit Term 1 moderation calibration sample (§7.1)",
                responsible: "Mr. N. Mpofu (HOD)",
                deadline: dateVal,
                status: "Pending",
              },
            ],
        minutesSummary:
          rec.minutesSummary ||
          `Parsed and structured into Eagle House School ${selectedTemplate} standard format.`,
        transcriptionSummary:
          rec.transcriptionSummary ||
          `Extracted from source material and classified under ${activeTmplConfig.policyTag} standards.`,
        rawTranscribedText: extractedOcrText,
        sourceType: format,
        status: targetDoc === "agenda" ? "Draft" : "Completed",
      };

      setParsedRecord(formatted);
      if (rec.title && !meetingTitle) {
        setMeetingTitle(rec.title);
      }

      setSuccessBadge(
        `OCR to Text Successful! ${extractedOcrText.length} characters transcribed into live editable fields.`
      );
    } catch (err: any) {
      console.error("Intake processing error:", err);
      setErrorMessage(
        err.message || "An unexpected error occurred while parsing the upload."
      );
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsProcessing(false);
      setProgressStep(0);
      setProgressMessage("");
    }
  };

  // Automatically trigger processing when ANY file is selected / dropped
  const processUploadedFile = (file: File) => {
    setErrorMessage(null);
    setSuccessBadge(null);
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      let detectedMime = file.type;
      let detectedLabel = "Document";

      if (!detectedMime) {
        if (file.name.endsWith(".docx")) {
          detectedMime =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          detectedLabel = "Word Document (.docx)";
        } else if (file.name.endsWith(".pdf")) {
          detectedMime = "application/pdf";
          detectedLabel = "PDF Document (OCR)";
        } else if (file.name.endsWith(".txt")) {
          detectedMime = "text/plain";
          detectedLabel = "Text Document (.txt)";
        }
      }

      // Auto detect format from MIME / file extension
      let format: "handwritten_ocr" | "recorded_audio" | "typed_file" | "typed_text" = "typed_file";
      if (
        detectedMime.startsWith("image/") ||
        file.name.match(/\.(png|jpe?g|webp|gif|bmp|tiff)$/i)
      ) {
        format = "handwritten_ocr";
        detectedLabel = "Handwritten Scan / Image (Vision OCR)";
        setUploadFormat("handwritten_ocr");
      } else if (
        detectedMime.startsWith("audio/") ||
        file.name.match(/\.(mp3|wav|m4a|webm|ogg|aac|flac)$/i)
      ) {
        format = "recorded_audio";
        detectedLabel = "Recorded Audio (Speech-to-Text OCR)";
        setUploadFormat("recorded_audio");
      } else if (detectedMime === "application/pdf" || file.name.endsWith(".pdf")) {
        format = "handwritten_ocr";
        detectedLabel = "Scanned PDF (Multimodal OCR)";
        setUploadFormat("handwritten_ocr");
      } else {
        format = "typed_file";
        detectedLabel = file.name.endsWith(".docx")
          ? "Word Document (.docx)"
          : "Typed Document (Text OCR)";
        setUploadFormat("typed_file");
      }

      const fileObj = {
        dataUrl,
        name: file.name,
        mimeType: detectedMime || "application/octet-stream",
        size: file.size,
        detectedTypeLabel: detectedLabel,
      };

      setUploadFile(fileObj);

      // If autoProcess is enabled, automatically start OCR on the uploaded file
      if (autoProcessOnUpload) {
        runOcrProcessing(
          targetType,
          format,
          fileObj,
          typedTextInput,
          meetingDate,
          meetingTitle,
          additionalContext
        );
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Start microphone recording
  const startRecording = async () => {
    try {
      setErrorMessage(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Audio recording is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const audioFile = {
            dataUrl,
            name: `Recorded_Meeting_VoiceNote_${new Date().toISOString().slice(0, 10)}.webm`,
            mimeType: "audio/webm",
            size: audioBlob.size,
            detectedTypeLabel: "Browser Live Voice Recording (Speech-to-Text OCR)",
          };
          setUploadFile(audioFile);

          if (autoProcessOnUpload) {
            runOcrProcessing(
              targetType,
              "recorded_audio",
              audioFile,
              typedTextInput,
              meetingDate,
              meetingTitle,
              additionalContext
            );
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Recording error:", err);
      setErrorMessage(
        err.message || "Microphone access denied or unavailable. You can upload an audio file instead."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  // Quick Preset Simulators across ALL file types
  const loadPreset = (format: "handwritten_ocr" | "recorded_audio" | "typed_file" | "typed_text") => {
    setUploadFormat(format);
    setErrorMessage(null);
    setParsedRecord(null);

    if (format === "handwritten_ocr") {
      const canvas = document.createElement("canvas");
      canvas.width = 960;
      canvas.height = 1200;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#fffdf5";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ruled notebook lines
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        for (let y = 80; y < canvas.height; y += 32) {
          ctx.beginPath();
          ctx.moveTo(40, y);
          ctx.lineTo(920, y);
          ctx.stroke();
        }

        // Red left margin
        ctx.strokeStyle = "#fca5a5";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(110, 0);
        ctx.lineTo(110, canvas.height);
        ctx.stroke();

        // Handwritten text simulation
        ctx.fillStyle = "#1e293b";
        ctx.font = "italic bold 21px 'Courier New', monospace";
        ctx.fillText("Eagle House Maths Dept - Meeting Minutes (24/03/2026)", 130, 70);

        ctx.font = "italic 16px 'Courier New', monospace";
        ctx.fillText("Chair: Mr. N. Mpofu (HOD)  |  Present: Shingi, Reggie, Luthando", 130, 102);
        ctx.fillText("1. Prev min signed. Action items from cycle 1 cleared.", 130, 134);
        ctx.fillText("2. ATP pacing: Gr 10 algebra 2 days behind due to athletics.", 130, 166);
        ctx.fillText("   Catch-up clinic scheduled for Friday 14:30 in Room M2.", 130, 198);
        ctx.fillText("3. §7.1 pre-mod test drafts due 5 days before assessment date.", 130, 230);
        ctx.fillText("   Reggie submitting Gr 9 term test draft on 18th March.", 130, 262);
        ctx.fillText("4. Diagnostic analysis: Gr 8 baseline averages 58.4%.", 130, 294);
        ctx.fillText("5. Learners <30%: 4 learners flagged (Appendix 10 required).", 130, 326);
        ctx.fillText("   Luthando to issue parental notification letters by Mon.", 130, 358);
        ctx.fillText("6. Casio calculators: 15 loan units inspected & working.", 130, 390);
        ctx.fillText("7. SMT Escalation: Projector bulb in M3 replaced; needs HDMI cable.", 130, 422);
        ctx.fillText("Next meeting: 15 April 2026 at 14:30 in Staffroom.", 130, 454);

        ctx.font = "italic bold 15px 'Courier New', monospace";
        ctx.fillText("Signed: [N. Mpofu - HOD]  [Shingi]  [Reggie]  [Luthando]", 130, 520);
      }

      const dataUrl = canvas.toDataURL("image/png");
      const sampleFile = {
        dataUrl,
        name: "Handwritten_Meeting_Minutes_Scan_March2026.png",
        mimeType: "image/png",
        size: 28400,
        detectedTypeLabel: "Handwritten Journal Scan (Vision OCR)",
      };
      setUploadFile(sampleFile);
      setMeetingTitle("Handwritten Notes Scan - Mathematics Term Review");
      setAdditionalContext("Scanned handwritten journal notes from secondary maths staffroom meeting.");

      runOcrProcessing(
        targetType,
        "handwritten_ocr",
        sampleFile,
        "",
        meetingDate,
        "Handwritten Notes Scan - Mathematics Term Review",
        "Scanned handwritten journal notes from secondary maths staffroom meeting."
      );
    } else if (format === "recorded_audio") {
      const sampleAudio = {
        dataUrl:
          "data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwEAAAAAAAHTEU2bmcleGQEAABXalFXlGZgEAAAAAAAAAA=",
        name: "Meeting_Audio_Recording_DeptDiscussion.m4a",
        mimeType: "audio/m4a",
        size: 51200,
        detectedTypeLabel: "Audio Voice Note (Speech-to-Text OCR)",
      };
      setUploadFile(sampleAudio);
      const transcript =
        "[Voice Recording Transcript for AI Engine]\nHOD Mpofu: 'Welcome colleagues. Let us review matters arising from our previous minutes, specifically the ATP pacing in Grade 10 and 11. Shingi, how is the syllabus pacing?'\nShingi: 'We are on track with Functions. Term 1 test pre-moderation draft is ready for HOD review 5 days in advance as per policy §7.1.'\nReggie: 'Grade 9 financial math had difficulties with simple vs compound interest; 3 learners scored below 30%. I am putting them on Appendix 10 remedial roadmaps.'\nLuthando: 'Cambridge lower secondary stats coverage is solid. Calculators were audited.'\nHOD Mpofu: 'Action items agreed: Shingi to submit drafts by Wednesday; Reggie to issue intervention trackers. Meeting adjourned at 15:40.'";
      setTypedTextInput(transcript);
      setMeetingTitle("Audio Voice Recording - Department Pacing & Moderation");

      runOcrProcessing(
        targetType,
        "recorded_audio",
        sampleAudio,
        transcript,
        meetingDate,
        "Audio Voice Recording - Department Pacing & Moderation",
        "Audio meeting recording."
      );
    } else if (format === "typed_file") {
      const docSample = {
        dataUrl:
          "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQABgAIAAAAIQA=",
        name: "EagleHouse_Maths_Minutes_Official_Term1.docx",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 38200,
        detectedTypeLabel: "Word Document (.docx OCR Intake)",
      };
      setUploadFile(docSample);
      const docText = `EAGLE HOUSE SCHOOL - MATHEMATICS DEPARTMENT
OFFICIAL MEETING PROCEEDINGS & MINUTES
Date: 2026-03-24 | Time: 14:30 - 15:45 | Venue: Staffroom M1
Chairperson: Mr. N. Mpofu (HOD)
Attendees: Mr. N. Mpofu, Shingi, Reggie, Luthando

1. Welcome & Apologies: Full attendance. Apologies: None.
2. Matters Arising: Follow-up on textbook allocations confirmed 100% distribution across all grades.
3. Curriculum Progress: Grade 10 Trigonometry ahead of schedule. Grade 11 Analytical Geometry aligned with CAPS ATP week 8.
4. Assessment & Moderation: Pre-moderation submissions verified under Policy §7.1. Post-moderation sampling will follow §7.2 10% purple pen protocol.
5. Learner Diagnostics: Grade 10 test median was 61.2%. High cognitive error on 3D trigonometry problem-solving questions.
6. Interventions: 5 learners requiring Appendix 10 support roadmaps identified in Grade 11.
7. Educator Development: Lesson observation peer-visit scheduled for next Tuesday.
8. Resources: 12 additional Casio scientific calculators received from school store.
9. SMT Escalation: Classroom projector bulb replacement completed.
10. AOB: Department cycle meeting confirmed for next term.

Agreed Action Items:
- Reggie: Submit Grade 9 Term 1 control test memorandum by 28 March
- Shingi: Run Grade 11 algebra clinic on Thursday afternoons
- Luthando: Finalize Appendix 10 learner intervention contracts by 30 March`;
      setTypedTextInput(docText);
      setMeetingTitle("Word Document Minutes - Term 1 Progress");

      runOcrProcessing(
        targetType,
        "typed_file",
        docSample,
        docText,
        meetingDate,
        "Word Document Minutes - Term 1 Progress",
        "Official department meeting Word document."
      );
    } else if (format === "typed_text") {
      const typed = `EAGLE HOUSE SCHOOL - MATHEMATICS DEPARTMENT
OFFICIAL MEETING PROCEEDINGS & MINUTES
Date: 2026-03-24 | Time: 14:30 - 15:45 | Venue: Staffroom M1
Chairperson: Mr. N. Mpofu (HOD)
Attendees: Mr. N. Mpofu, Shingi, Reggie, Luthando

1. Welcome & Apologies: Full attendance. Apologies: None.
2. Matters Arising: Follow-up on textbook allocations confirmed 100% distribution across all grades.
3. Curriculum Progress: Grade 10 Trigonometry ahead of schedule. Grade 11 Analytical Geometry aligned with CAPS ATP week 8.
4. Assessment & Moderation: Pre-moderation submissions verified under Policy §7.1. Post-moderation sampling will follow §7.2 10% purple pen protocol.
5. Learner Diagnostics: Grade 10 test median was 61.2%. High cognitive error on 3D trigonometry problem-solving questions.
6. Interventions: 5 learners requiring Appendix 10 support roadmaps identified in Grade 11.
7. Educator Development: Lesson observation peer-visit scheduled for next Tuesday.
8. Resources: 12 additional Casio scientific calculators received from school store.
9. SMT Escalation: Classroom projector bulb replacement completed.
10. AOB: Department cycle meeting confirmed for next term.

Agreed Action Items:
- Reggie: Submit Grade 9 Term 1 control test memorandum by 28 March
- Shingi: Run Grade 11 algebra clinic on Thursday afternoons
- Luthando: Finalize Appendix 10 learner intervention contracts by 30 March`;
      setTypedTextInput(typed);
      setMeetingTitle("Typed Department Meeting Record - Term 1 Progress");

      runOcrProcessing(
        targetType,
        "typed_text",
        null,
        typed,
        meetingDate,
        "Typed Department Meeting Record - Term 1 Progress",
        "Typed executive notes."
      );
    }
  };

  // EDITABLE FIELD MUTATION HANDLERS
  const updateMeetingField = (field: keyof MeetingRecord, value: any) => {
    if (!parsedRecord) return;
    setParsedRecord({
      ...parsedRecord,
      [field]: value,
    });
  };

  const updateAgendaPoint = (pointNumber: number, field: "title" | "notes", value: string) => {
    if (!parsedRecord) return;
    const updated = parsedRecord.agendaPoints.map((pt) =>
      pt.pointNumber === pointNumber ? { ...pt, [field]: value } : pt
    );
    setParsedRecord({
      ...parsedRecord,
      agendaPoints: updated,
    });
  };

  const updateActionItem = (id: string, field: string, value: any) => {
    if (!parsedRecord) return;
    const updated = parsedRecord.actionItems.map((act) =>
      act.id === id ? { ...act, [field]: value } : act
    );
    setParsedRecord({
      ...parsedRecord,
      actionItems: updated,
    });
  };

  const addActionItem = () => {
    if (!parsedRecord) return;
    const newItem = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      description: "New agreed action item",
      responsible: "Mr. N. Mpofu (HOD)",
      deadline: parsedRecord.date || meetingDate,
      status: "Pending" as const,
    };
    setParsedRecord({
      ...parsedRecord,
      actionItems: [...parsedRecord.actionItems, newItem],
    });
  };

  const deleteActionItem = (id: string) => {
    if (!parsedRecord) return;
    setParsedRecord({
      ...parsedRecord,
      actionItems: parsedRecord.actionItems.filter((act) => act.id !== id),
    });
  };

  const updateTeacherSignature = (teacherId: string, field: string, value: any) => {
    if (!parsedRecord) return;
    const updated = (parsedRecord.teacherSignatures || defaultTeachers).map((t) =>
      t.teacherId === teacherId ? { ...t, [field]: value } : t
    );
    setParsedRecord({
      ...parsedRecord,
      teacherSignatures: updated,
    });
  };

  // Sync edits from raw OCR text editor into the 10-point fields
  const syncRawOcrTextToFields = () => {
    if (!rawOcrText.trim() || !parsedRecord) return;
    setOcrSyncNotice(true);
    setTimeout(() => setOcrSyncNotice(false), 2500);

    // Look for lines starting with numbers like "1. ", "2. ", etc.
    const pointLines = rawOcrText.split(/\n(?=\d+\.\s*)/g);
    if (pointLines.length > 1) {
      const updatedAgenda = [...parsedRecord.agendaPoints];
      pointLines.forEach((block) => {
        const match = block.match(/^(\d+)\.\s*([^\n]+)([\s\S]*)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          const title = match[2].trim();
          const notes = match[3]?.trim() || "";
          const idx = updatedAgenda.findIndex((p) => p.pointNumber === num);
          if (idx !== -1) {
            updatedAgenda[idx] = {
              ...updatedAgenda[idx],
              title: title || updatedAgenda[idx].title,
              notes: notes || updatedAgenda[idx].notes,
            };
          }
        }
      });
      setParsedRecord({
        ...parsedRecord,
        agendaPoints: updatedAgenda,
        rawTranscribedText: rawOcrText,
      });
    } else {
      setParsedRecord({
        ...parsedRecord,
        rawTranscribedText: rawOcrText,
        minutesSummary: rawOcrText.slice(0, 300) + "...",
      });
    }
  };

  const copyRawOcrText = () => {
    navigator.clipboard.writeText(rawOcrText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const downloadRawOcrTextFile = () => {
    const blob = new Blob([rawOcrText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Extracted_OCR_Text_${meetingDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAllFormattedText = () => {
    if (!parsedRecord) return;
    const lines = [
      `EAGLE HOUSE SCHOOL - MATHEMATICS DEPARTMENT`,
      `TITLE: ${parsedRecord.title}`,
      `DATE: ${parsedRecord.date} (${parsedRecord.startTime} - ${parsedRecord.endTime})`,
      `VENUE: ${parsedRecord.venue} | CHAIR: ${parsedRecord.chairperson}`,
      `ATTENDEES: ${parsedRecord.attendees.join(", ")}`,
      "",
      "--- 10-POINT SEQUENCE ---",
      ...parsedRecord.agendaPoints.map(
        (p) => `${p.pointNumber}. ${p.title}\n${p.notes}\n`
      ),
      "--- ACTION ITEMS ---",
      ...parsedRecord.actionItems.map(
        (a) => `• [${a.status}] ${a.description} (Lead: ${a.responsible}, Due: ${a.deadline})`
      ),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Overview & Upload Control Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Universal OCR to Text Intake & Minutes Processor
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                OCR to Text for ALL Uploads
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload <strong>any file</strong>: handwritten scans, photos, whiteboard pictures, scanned PDFs, Word documents (.docx), or audio recordings.
              The AI OCR engine automatically transcribes the content into verbatim text and populates interactive, editable fields.
            </p>
          </div>

          {/* Quick Demo Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              Demo Presets:
            </span>
            <button
              type="button"
              onClick={() => loadPreset("handwritten_ocr")}
              className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 text-[11px] cursor-pointer font-semibold transition-colors flex items-center gap-1"
              title="Loads handwritten scan and automatically runs Vision OCR into editable fields"
            >
              <span>✍️ Handwritten Scan</span>
              <span className="text-[9px] bg-amber-200 dark:bg-amber-800 px-1 rounded font-bold">Auto OCR</span>
            </button>
            <button
              type="button"
              onClick={() => loadPreset("recorded_audio")}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] cursor-pointer font-medium transition-colors"
              title="Loads audio voice note and automatically runs speech-to-text OCR"
            >
              🎙️ Audio Recording
            </button>
            <button
              type="button"
              onClick={() => loadPreset("typed_file")}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] cursor-pointer font-medium transition-colors"
              title="Loads Word DOCX and extracts clean text into editable fields"
            >
              📄 Word (.docx)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("typed_text")}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] cursor-pointer font-medium transition-colors"
            >
              ⌨️ Typed Notes
            </button>
          </div>
        </div>

        {/* STEP 1: Destination Template Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setTargetType("minutes")}
            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
              targetType === "minutes"
                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Meeting Minutes Template (Editable Fields)
              </span>
              {targetType === "minutes" && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Extracts and maps OCR text into all 10 items, diagnostics, at-risk learners, and teacher signatures.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTargetType("agenda")}
            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
              targetType === "agenda"
                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Department Agenda Draft
              </span>
              {targetType === "agenda" && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Extracts upcoming topics into discussion points, objectives, suggested leads, time allocations, and signature spaces.
            </p>
          </button>
        </div>

        {/* STEP 1B: Meeting Template Format Selector */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              Meeting Template Format (Select Agenda/Minutes Structure):
            </label>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
              {MEETING_TEMPLATE_CONFIGS.find((c) => c.id === selectedTemplate)?.badge}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {MEETING_TEMPLATE_CONFIGS.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(tmpl.id);
                    if (parsedRecord) {
                      setParsedRecord({
                        ...parsedRecord,
                        templateType: tmpl.id,
                      });
                    }
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                      : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {tmpl.policyTag}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                      {tmpl.title}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-snug">
                      {tmpl.summary}
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>10 Points Sequence</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">{tmpl.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Input Mode Selector */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              Active Upload Mode (OCR to Text Active for All Formats):
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoProcessOnUpload}
                onChange={(e) => setAutoProcessOnUpload(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">Auto-run OCR immediately on any upload</span>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => {
                setUploadFormat("handwritten_ocr");
                setErrorMessage(null);
              }}
              className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                uploadFormat === "handwritten_ocr"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs font-semibold"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <ImageIcon className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-bold">Handwritten Scan / PDF</div>
              <div className="text-[10px] opacity-80">Images, photos, PDF scans</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setUploadFormat("recorded_audio");
                setErrorMessage(null);
              }}
              className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                uploadFormat === "recorded_audio"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs font-semibold"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <FileAudio className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-bold">Recorded Audio</div>
              <div className="text-[10px] opacity-80">Speech-to-Text OCR</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setUploadFormat("typed_file");
                setErrorMessage(null);
              }}
              className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                uploadFormat === "typed_file"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs font-semibold"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <FileUp className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-bold">Word / Text Document</div>
              <div className="text-[10px] opacity-80">DOCX, PDF, TXT extraction</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setUploadFormat("typed_text");
                setErrorMessage(null);
              }}
              className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                uploadFormat === "typed_text"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs font-semibold"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <FileText className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-bold">Direct Text / Paste</div>
              <div className="text-[10px] opacity-80">Raw text & notes</div>
            </button>
          </div>
        </div>

        {/* STEP 3: Unified Drag & Drop Upload Zone (Accepts ANY File Format) */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer bg-blue-50/40 dark:bg-blue-950/20 transition-all group relative"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.docx,.doc,.txt,.mp3,.wav,.m4a,.webm,.ogg"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform shadow-xs">
              <Upload className="w-6 h-6" />
            </div>

            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {uploadFile
                ? `Uploaded: ${uploadFile.name} (${(uploadFile.size / 1024).toFixed(1)} KB) — Click to change`
                : "Drag & Drop ANY File Here or Click to Browse"}
            </p>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto">
              Accepts <strong>handwritten photos & scans</strong> (PNG, JPG), <strong>PDF documents</strong>, <strong>Word files</strong> (.docx), <strong>audio recordings</strong> (.m4a, .mp3, .wav), or <strong>text files</strong> (.txt).
              OCR will automatically convert it into editable text fields.
            </p>

            {uploadFile?.detectedTypeLabel && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 rounded-full border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Detected: {uploadFile.detectedTypeLabel}</span>
              </div>
            )}
          </div>

          {/* Optional Audio Live Recorder (when recorded audio mode is active) */}
          {uploadFormat === "recorded_audio" && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {isRecording
                      ? `Recording in progress... (${formatSeconds(recordingSeconds)})`
                      : "Record Live Microphone Audio"}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Direct voice note to Speech-to-Text OCR
                  </p>
                </div>
              </div>

              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Stop & Run Speech OCR</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Start Microphone Recording</span>
                </button>
              )}
            </div>
          )}

          {/* Direct Text Area (when typed text mode is active) */}
          {uploadFormat === "typed_text" && (
            <textarea
              rows={5}
              value={typedTextInput}
              onChange={(e) => setTypedTextInput(e.target.value)}
              placeholder="Paste or type meeting notes, decisions, at-risk learners, and actions here..."
              className="w-full text-xs font-mono p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          )}
        </div>

        {/* Status Animation & Error Messages */}
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successBadge && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successBadge}</span>
          </div>
        )}

        {isProcessing && (
          <div className="p-4 bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-blue-900 dark:text-blue-300 font-semibold">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                {progressMessage}
              </span>
              <span className="text-[11px] font-mono">{progressStep}/3</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${(progressStep / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {uploadFile && (
              <span>
                Active File: <strong>{uploadFile.name}</strong> ({(uploadFile.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isProcessing || (!uploadFile && !typedTextInput.trim())}
            onClick={() =>
              runOcrProcessing(
                targetType,
                uploadFormat,
                uploadFile,
                typedTextInput,
                meetingDate,
                meetingTitle,
                additionalContext
              )
            }
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running OCR Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {parsedRecord ? "Re-run OCR & Re-populate" : "Run OCR & Populate Editable Fields"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* LIVE EDITABLE FIELDS WORKSPACE */}
      {parsedRecord && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
          {/* Workspace Top Toolbar */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  OCR-Extracted Text & Editable Meeting Workspace
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {selectedTemplate}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {rawOcrText.length} Characters Extracted
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every field below is live and directly editable. Review the extracted OCR transcription, edit notes, and verify accountability items under <strong>{selectedTemplate}</strong> format.
              </p>
            </div>

            {/* Layout View Modes */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("split_fields")}
                  className={`px-2.5 py-1 rounded cursor-pointer font-medium ${
                    viewMode === "split_fields"
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Side-by-side: Source File Preview + Editable 10-Point Fields"
                >
                  Preview + Fields
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("split_ocr")}
                  className={`px-2.5 py-1 rounded cursor-pointer font-medium ${
                    viewMode === "split_ocr"
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Side-by-side: Source File Preview + Full Verbatim OCR Text"
                >
                  Preview + OCR Text
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("ocr_only")}
                  className={`px-2.5 py-1 rounded cursor-pointer font-medium ${
                    viewMode === "ocr_only"
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Full width raw OCR transcribed text editor"
                >
                  Raw OCR Editor
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("fields_only")}
                  className={`px-2.5 py-1 rounded cursor-pointer font-medium ${
                    viewMode === "fields_only"
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Full width 10-point meeting sequence fields"
                >
                  10-Point Fields
                </button>
              </div>

              <button
                type="button"
                onClick={copyAllFormattedText}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700"
                title="Copy all formatted minutes to clipboard"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onDownloadDocx(parsedRecord, targetType)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Download this populated draft as Microsoft Word (.docx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Word (.docx)</span>
              </button>

              <button
                type="button"
                onClick={() => onMeetingProcessed(parsedRecord, targetType)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Save into the department meeting records system"
              >
                <span>Save to Minutes Records</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* MAIN SPLIT-SCREEN / FIELDS AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
            {/* LEFT COLUMN: Universal File Preview (Image / PDF / Audio / Doc) */}
            {(viewMode === "split_fields" || viewMode === "split_ocr" || viewMode === "preview_only") && (
              <div
                className={`${
                  viewMode === "preview_only" ? "lg:col-span-12" : "lg:col-span-5"
                } p-4 bg-slate-100/60 dark:bg-slate-950/40 flex flex-col space-y-3 max-h-[850px] overflow-hidden`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    {uploadFile?.detectedTypeLabel || "Uploaded Source File"}
                  </span>

                  {uploadFile?.mimeType.startsWith("image/") && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                        className="p-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono px-1">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                        className="p-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoomLevel(1)}
                        className="p-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        title="Reset Zoom"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Dynamic Preview Container */}
                <div className="flex-1 overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 flex items-center justify-center min-h-[300px]">
                  {/* 1. Image Preview */}
                  {uploadFile?.mimeType.startsWith("image/") && (
                    <img
                      src={uploadFile.dataUrl}
                      alt="Uploaded Handwritten Scan"
                      style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
                      className="max-w-full object-contain rounded shadow-xs transition-transform duration-150"
                    />
                  )}

                  {/* 2. PDF Preview */}
                  {uploadFile?.mimeType === "application/pdf" && (
                    <iframe
                      src={uploadFile.dataUrl}
                      title="Uploaded PDF Scan Preview"
                      className="w-full h-full min-h-[500px] rounded border border-slate-200 dark:border-slate-800"
                    />
                  )}

                  {/* 3. Audio Player */}
                  {(uploadFile?.mimeType.startsWith("audio/") || uploadFormat === "recorded_audio") && (
                    <div className="w-full p-6 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                        <Volume2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {uploadFile?.name || "Meeting Audio Recording"}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Speech-to-text OCR transcript synchronized with audio
                        </p>
                      </div>
                      {uploadFile?.dataUrl && (
                        <audio
                          controls
                          src={uploadFile.dataUrl}
                          className="w-full mx-auto"
                        />
                      )}
                    </div>
                  )}

                  {/* 4. Word Document / Text File Preview */}
                  {!uploadFile?.mimeType.startsWith("image/") &&
                    uploadFile?.mimeType !== "application/pdf" &&
                    !uploadFile?.mimeType.startsWith("audio/") &&
                    uploadFormat !== "recorded_audio" && (
                      <div className="w-full p-6 text-center space-y-3">
                        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center mx-auto">
                          <FileText className="w-7 h-7" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {uploadFile?.name || "Text Document Intake"}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {uploadFile?.size
                            ? `${(uploadFile.size / 1024).toFixed(1)} KB • Text extraction complete`
                            : "Direct typed intake ready"}
                        </p>
                      </div>
                    )}
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
                  <span>Eagle House OCR Engine</span>
                  <span className="font-mono">Ready for moderation review</span>
                </div>
              </div>
            )}

            {/* RIGHT COLUMN: Dedicated Raw OCR Text Editor OR Structured 10-Point Sequence */}
            <div
              className={`${
                viewMode === "preview_only"
                  ? "hidden"
                  : viewMode === "split_fields" || viewMode === "split_ocr"
                  ? "lg:col-span-7"
                  : "lg:col-span-12"
              } p-6 space-y-6 max-h-[850px] overflow-y-auto`}
            >
              {/* If "split_ocr" or "ocr_only", show the dedicated Raw OCR Text Editor */}
              {(viewMode === "split_ocr" || viewMode === "ocr_only") ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Verbatim Extracted OCR Text (Fully Editable)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {rawOcrText.length} characters • {rawOcrText ? rawOcrText.split(/\s+/).length : 0} words
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={copyRawOcrText}
                        className="px-2.5 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 cursor-pointer"
                        title="Copy raw OCR text"
                      >
                        {copiedNotification ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>

                      <button
                        type="button"
                        onClick={downloadRawOcrTextFile}
                        className="px-2.5 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 cursor-pointer"
                        title="Download extracted text as .txt"
                      >
                        <Download className="w-3 h-3" />
                        <span>.TXT</span>
                      </button>

                      <button
                        type="button"
                        onClick={syncRawOcrTextToFields}
                        className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Sync edits from this raw text into the 10-point sequence fields"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>Sync to 10-Point Fields</span>
                      </button>
                    </div>
                  </div>

                  {ocrSyncNotice && (
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>Changes from raw OCR text synchronized to 10-point sequence fields!</span>
                    </div>
                  )}

                  {/* Search within OCR Text */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search text within OCR transcription..."
                      value={ocrSearchQuery}
                      onChange={(e) => setOcrSearchQuery(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Main Editable Text Area for Raw OCR */}
                  <textarea
                    rows={20}
                    value={rawOcrText}
                    onChange={(e) => {
                      setRawOcrText(e.target.value);
                      updateMeetingField("rawTranscribedText", e.target.value);
                    }}
                    placeholder="OCR extracted text will appear here. You can directly edit, add, or correct notes..."
                    className="w-full text-xs font-mono p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              ) : (
                /* Otherwise show the Structured 10-Point Sequence Form Fields */
                <>
                  {/* Meeting Header Editable Fields */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        Meeting Header & Logistics
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ID: {parsedRecord.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Meeting Title
                        </label>
                        <input
                          type="text"
                          value={parsedRecord.title}
                          onChange={(e) => updateMeetingField("title", e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Meeting Type
                        </label>
                        <select
                          value={parsedRecord.meetingType}
                          onChange={(e) => updateMeetingField("meetingType", e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="Regular Departmental">Regular Departmental</option>
                          <option value="Pre-Moderation Calibration">Pre-Moderation Calibration</option>
                          <option value="Post-Exam Review">Post-Exam Review</option>
                          <option value="Urgent / Escalation">Urgent / Escalation</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={parsedRecord.date}
                            onChange={(e) => updateMeetingField("date", e.target.value)}
                            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Start
                          </label>
                          <input
                            type="text"
                            value={parsedRecord.startTime}
                            onChange={(e) => updateMeetingField("startTime", e.target.value)}
                            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            End
                          </label>
                          <input
                            type="text"
                            value={parsedRecord.endTime}
                            onChange={(e) => updateMeetingField("endTime", e.target.value)}
                            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Venue & Chair
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Venue"
                            value={parsedRecord.venue}
                            onChange={(e) => updateMeetingField("venue", e.target.value)}
                            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <input
                            type="text"
                            placeholder="Chair"
                            value={parsedRecord.chairperson}
                            onChange={(e) => updateMeetingField("chairperson", e.target.value)}
                            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Standardized 10-Point Sequence Form Fields */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <ListOrdered className="w-3.5 h-3.5 text-blue-600" />
                          {selectedTemplate} Sequence (Directly Editable)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono">
                          {MEETING_TEMPLATE_CONFIGS.find((c) => c.id === selectedTemplate)?.policyTag}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewMode("split_ocr")}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Switch to Raw OCR Text Editor</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {parsedRecord.agendaPoints.map((point) => (
                        <div
                          key={point.pointNumber}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                              {point.pointNumber}
                            </span>
                            <input
                              type="text"
                              value={point.title}
                              onChange={(e) =>
                                updateAgendaPoint(point.pointNumber, "title", e.target.value)
                              }
                              className="w-full text-xs font-bold text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 bg-transparent px-1 py-0.5 focus:outline-none"
                            />
                          </div>

                          <textarea
                            rows={3}
                            value={point.notes}
                            onChange={(e) =>
                              updateAgendaPoint(point.pointNumber, "notes", e.target.value)
                            }
                            placeholder={`Record proceedings, decisions, and data for Point ${point.pointNumber}...`}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans leading-relaxed focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Accountability Tracker */}
                  <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        Agreed Action Items ({parsedRecord.actionItems.length})
                      </span>
                      <button
                        type="button"
                        onClick={addActionItem}
                        className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Action Item</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {parsedRecord.actionItems.map((act) => (
                        <div
                          key={act.id}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                        >
                          <div className="sm:col-span-6">
                            <input
                              type="text"
                              value={act.description}
                              onChange={(e) => updateActionItem(act.id, "description", e.target.value)}
                              placeholder="Action description..."
                              className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              value={act.responsible}
                              onChange={(e) => updateActionItem(act.id, "responsible", e.target.value)}
                              placeholder="Responsible"
                              className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="date"
                              value={act.deadline}
                              onChange={(e) => updateActionItem(act.id, "deadline", e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="sm:col-span-2 flex items-center gap-1">
                            <select
                              value={act.status}
                              onChange={(e) => updateActionItem(act.id, "status", e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => deleteActionItem(act.id)}
                              className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                              title="Delete action item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teacher Attendance & Signature Register */}
                  <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      Department Educator Signatures & Attendance Register
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(parsedRecord.teacherSignatures || defaultTeachers).map((t) => (
                        <div
                          key={t.teacherId}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                        >
                          <div>
                            <input
                              type="text"
                              value={t.name}
                              onChange={(e) => updateTeacherSignature(t.teacherId, "name", e.target.value)}
                              className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                            />
                            <div className="text-[10px] text-slate-500">
                              {t.role} • {t.allocation}
                            </div>
                          </div>

                          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={t.signed}
                              onChange={(e) => {
                                updateTeacherSignature(t.teacherId, "signed", e.target.checked);
                                if (e.target.checked) {
                                  updateTeacherSignature(
                                    t.teacherId,
                                    "signedDate",
                                    new Date().toISOString().split("T")[0]
                                  );
                                }
                              }}
                              className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[11px] font-semibold">
                              {t.signed ? "Signed ✓" : "Sign Off"}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
