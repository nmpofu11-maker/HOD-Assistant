import React, { useEffect, useRef, useState } from "react";
import { safePost } from "../utils/apiClient";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Greetings HOD Mpofu. I am your Eagle House School AI Head of Department Advisor for Mathematics & Mathematical Literacy. I can assist you with curriculum pacing, moderation calibration against Policy 7.1/7.2, results diagnostics, meeting agendas, and statutory IEB/CAPS/Cambridge compliance. How can I support your department right now?",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedGrade, setSelectedGrade] = useState("Grade 10");
  const [selectedCurriculum, setSelectedCurriculum] = useState("IEB");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userText = inputQuery.trim();
    setInputQuery("");
    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const result = await safePost("/api/hod/advisor", {
        query: userText,
        conversationHistory: newMessages.slice(-10),
        department: "Mathematics & Mathematical Literacy",
        subject: selectedSubject,
        grade: selectedGrade,
        curriculum: selectedCurriculum,
      });

      if (!result.success) throw new Error(result.error || "Failed to retrieve guidance.");

      const data: any = result.data;
      const replyContent = data?.reply || data?.advice || "No guidance received.";
      const sources = Array.isArray(data?.sources)
        ? data.sources.map((source: any) => source?.title).filter(Boolean)
        : [];
      setMessages([...newMessages, { role: "assistant", content: replyContent, sources }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Apologies, I encountered an issue retrieving guidance: " + err.message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "A teacher missed the 5-day pre-moderation deadline (§7.1). How should I address this?",
    "What are the mandatory cognitive level ratios for Grade 10 IEB Mathematics?",
    "How do I structure post-moderation for a cohort of 60 learners in purple pen?",
    "Draft a quick memo regarding homework checks in the Maths Department.",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full h-[min(760px,92vh)] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <span>AI HOD Executive Advisor</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-amber-400 border border-slate-700">
                  Eagle House Policy Aligned
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Grounded in Eagle House policy plus the supplied 2026 IEB/DBE curriculum sources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="px-4 pt-3 pb-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
          <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
            Subject
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
              <option>Mathematics</option><option>Mathematical Literacy</option><option>Other subject</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
            Grade
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
              <option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
            Framework
            <select value={selectedCurriculum} onChange={(e) => setSelectedCurriculum(e.target.value)} className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
              <option>IEB</option><option>CAPS</option><option>Cambridge</option>
            </select>
          </label>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-xs"
                    : "bg-slate-100 text-slate-800 rounded-tl-xs"
                }`}
              >
                {m.content}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1 font-semibold mb-1">
                      <BookOpen className="w-3 h-3" /> Sources consulted
                    </div>
                    <ul className="space-y-0.5">
                      {m.sources.slice(0, 4).map((source, sourceIndex) => (
                        <li key={sourceIndex}>• {source}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          <div ref={endRef} />
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl text-xs flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Consulting Eagle House Handbook & Curriculum Guidelines...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-200 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => { setInputQuery(p); setTimeout(() => inputRef.current?.focus(), 0); }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <textarea
            ref={inputRef}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={2}
            placeholder="Ask about curriculum, moderation, results, staff, meetings or draft a document..."
            className="flex-1 resize-none px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
        <div className="px-3 pb-3 bg-white dark:bg-slate-900 text-[10px] text-slate-400">Enter to send · Shift+Enter for a new line · AI guidance should be checked against the current official policy/source when compliance is critical.</div>
      </div>
    </div>
  );
};
