import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { API, TOKEN_KEY } from "@/lib/apiClient";

const SUGGESTIONS = [
  "What should I learn next?",
  "Suggest a project using my current skills",
  "Am I ready for a software internship?",
  "Create a 30-day learning plan",
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm Skill Flow AI — your personal career mentor. Ask me what to learn, what to build, or whether you're ready for an opportunity." },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);
  const sessionRef = useRef(`sf-${Date.now()}`);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ""}` },
        body: JSON.stringify({ message: msg, session_id: sessionRef.current }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "Sorry, I couldn't reach the AI service. Please try again." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      <motion.button
        data-testid="ai-assistant-button"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30"
        style={{ background: "linear-gradient(135deg,#FF6B00,#FF8A3D)" }}
        aria-label="Open Skill Flow AI"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#FF6B00] opacity-30 animate-ping" />
        {open ? <X className="h-6 w-6 relative" /> : <Sparkles className="h-6 w-6 relative" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="ai-assistant-panel"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed bottom-36 md:bottom-24 right-4 md:right-6 z-50 w-[92vw] max-w-[400px] h-[540px] max-h-[70vh] bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ background: "linear-gradient(135deg,#FF6B00,#FF8A3D)" }}>
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center"><Bot className="h-5 w-5" /></div>
              <div>
                <p className="font-heading font-bold leading-none">Skill Flow AI</p>
                <p className="text-[11px] text-white/80 mt-0.5">Your career mentor</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto sf-scroll p-4 space-y-3 bg-[#F8FAFC]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-[#FF6B00] text-white rounded-br-sm" : "bg-white border border-gray-200 text-[#111827] rounded-bl-sm"}`}>
                    {m.content || <span className="inline-flex gap-1"><Dot /><Dot d={0.15} /><Dot d={0.3} /></span>}
                  </div>
                </div>
              ))}
              {messages.length <= 1 && (
                <div className="pt-2 space-y-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} data-testid="ai-suggestion" onClick={() => send(s)} className="w-full text-left text-sm px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  data-testid="ai-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask Skill Flow AI…"
                  className="flex-1 text-sm px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
                <button data-testid="ai-send" onClick={() => send()} disabled={streaming} className="h-10 w-10 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const Dot = ({ d = 0 }) => (
  <motion.span className="h-1.5 w-1.5 rounded-full bg-[#FF6B00] inline-block" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: d }} />
);
