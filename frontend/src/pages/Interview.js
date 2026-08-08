import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessagesSquare, Send, Play, RotateCcw, Bot, User as UserIcon } from "lucide-react";
import { API, TOKEN_KEY } from "@/lib/apiClient";
import { api } from "@/lib/apiClient";
import PageHeader from "@/components/PageHeader";

export default function Interview() {
  const [params] = useSearchParams();
  const { data: opps } = useQuery({ queryKey: ["opportunities"], queryFn: () => api.get("/opportunities").then((r) => r.data) });
  const [oppId, setOppId] = useState(params.get("opp") || "");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [started, setStarted] = useState(false);
  const sessionRef = useRef(`iv-${Date.now()}`);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (text, isStart = false) => {
    const msg = isStart ? "START" : (text ?? input).trim();
    if (!msg || streaming) return;
    if (!isStart) setMessages((m) => [...m, { role: "user", content: msg }]);
    setInput("");
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      const res = await fetch(`${API}/ai/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ""}` },
        body: JSON.stringify({ message: msg, session_id: sessionRef.current, opportunityId: oppId || null }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: acc }; return c; });
      }
    } catch (e) {
      setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: "Couldn't reach the interviewer. Please try again." }; return c; });
    } finally {
      setStreaming(false);
    }
  };

  const start = () => {
    setMessages([]);
    sessionRef.current = `iv-${Date.now()}`;
    setStarted(true);
    send(null, true);
  };
  const reset = () => { setStarted(false); setMessages([]); };

  const selectedOpp = opps?.find((o) => o.id === oppId);

  return (
    <div data-testid="interview-page">
      <PageHeader title="Interview Prep" icon={MessagesSquare} subtitle="Practice a mock interview with Skill Flow AI, tailored to a real opportunity or your target career." />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 h-fit">
          <p className="text-sm font-semibold mb-2">Choose a target</p>
          <select data-testid="interview-target" value={oppId} onChange={(e) => setOppId(e.target.value)} disabled={started} className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] disabled:opacity-60">
            <option value="">My target career</option>
            {(opps || []).map((o) => <option key={o.id} value={o.id}>{o.role} — {o.company}</option>)}
          </select>
          {selectedOpp && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-[#111827] mb-1.5">Focus skills</p>
              <div className="flex flex-wrap gap-1.5">{(selectedOpp.required_skills || []).map((s) => <span key={s.name} className="text-xs px-2 py-0.5 rounded-md bg-orange-50 text-[#FF6B00]">{s.name}</span>)}</div>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            {!started ? (
              <button data-testid="start-interview" onClick={start} className="flex-1 h-11 rounded-xl bg-[#FF6B00] text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#e85f00] transition-colors"><Play className="h-4 w-4" /> Start interview</button>
            ) : (
              <button data-testid="reset-interview" onClick={reset} className="flex-1 h-11 rounded-xl border border-gray-200 font-medium inline-flex items-center justify-center gap-2 hover:bg-gray-50"><RotateCcw className="h-4 w-4" /> New interview</button>
            )}
          </div>
          <p className="text-[11px] text-[#9CA3AF] mt-3">The AI asks one question at a time, scores each answer out of 10 and gives feedback.</p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[560px]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto sf-scroll p-5 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#9CA3AF]">
                <MessagesSquare className="h-10 w-10 mb-3 text-orange-200" />
                <p className="text-sm">Pick a target and hit <b className="text-[#FF6B00]">Start interview</b> to begin your mock interview.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-[#111827] text-white" : "bg-orange-50 text-[#FF6B00]"}`}>
                  {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-[#111827] text-white rounded-tr-sm" : "bg-[#F8FAFC] border border-gray-200 rounded-tl-sm"}`}>
                  {m.content || <span className="text-[#9CA3AF]">thinking…</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input data-testid="interview-input" value={input} disabled={!started} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={started ? "Type your answer…" : "Start an interview to answer"} className="flex-1 h-11 px-3.5 rounded-xl bg-[#F8FAFC] border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] disabled:opacity-60" />
              <button data-testid="interview-send" onClick={() => send()} disabled={!started || streaming} className="h-11 w-11 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center disabled:opacity-50"><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
