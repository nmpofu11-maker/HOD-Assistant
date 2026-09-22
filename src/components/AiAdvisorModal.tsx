import React, { useState } from "react";
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
      const response = await fetch("/api/hod/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userText,
          department: "Mathematics & Mathematical Literacy",
          curriculum: "IEB SAGS, CAPS ATP, Cambridge",
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setMessages([...newMessages, { role: "assistant", content: data.advice }]);
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
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[620px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
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
                Trained on Eagle House HOD Handbook, Assessment Policies §7.1/§7.2, and Curriculum SAGS
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
              </div>
              {m.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

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
                onClick={() => setInputQuery(p)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI HOD Advisor for guidance or drafting..."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
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
      </div>
    </div>
  );
};
