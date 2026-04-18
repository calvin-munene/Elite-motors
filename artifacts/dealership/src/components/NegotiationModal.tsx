import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentSessionId } from "@/hooks/useVisitorTracking";

export function NegotiationModal({ car, onClose }: { car: any; onClose: () => void }) {
  const [negotiationId, setNegotiationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"active" | "accepted">("active");
  const [contactInfo, setContactInfo] = useState({ name: "", phone: "" });
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const start = async () => {
    if (!contactInfo.name || !contactInfo.phone) return;
    setLoading(true);
    try {
      const r = await fetch("/api/negotiate/start", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car.id, sessionId: getCurrentSessionId(),
          customerName: contactInfo.name, customerPhone: contactInfo.phone,
        }),
      });
      const data = await r.json();
      setNegotiationId(data.negotiationId);
      setMessages([{ role: "assistant", content: data.message }]);
      setStarted(true);
    } finally { setLoading(false); }
  };

  const send = async () => {
    if (!input.trim() || !negotiationId || loading) return;
    const userMsg = input.trim();
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch(`/api/negotiate/${negotiationId}/message`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await r.json();
      setMessages(m => [...m, { role: "assistant", content: data.message }]);
      if (data.status === "accepted") setStatus("accepted");
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Sorry, I had a connection issue. Try again?" }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-card border border-white/10 rounded-t-2xl md:rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="border-b border-white/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/15 rounded-full flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-white font-serif">AI Price Negotiator</p>
              <p className="text-xs text-gray-500">{car.year} {car.title}</p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {!started ? (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-400">Negotiate the price of this vehicle with our AI specialist. Reach a deal you both like.</p>
            <input value={contactInfo.name} onChange={e => setContactInfo({ ...contactInfo, name: e.target.value })} placeholder="Your name" className="w-full bg-background border border-white/10 rounded px-4 py-3 text-white text-sm" />
            <input value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} placeholder="Phone number (e.g. 0712345678)" className="w-full bg-background border border-white/10 rounded px-4 py-3 text-white text-sm" />
            <Button onClick={start} disabled={loading || !contactInfo.name || !contactInfo.phone} className="w-full bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Negotiation"}
            </Button>
            <p className="text-[10px] text-gray-600 text-center">An AI handles the conversation. Final pricing confirmed by our sales team.</p>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.role === "user" ? "bg-primary text-white" : "bg-background text-gray-200"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <div className="flex justify-start"><div className="bg-background px-4 py-2 rounded-2xl"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div></div>}
              {status === "accepted" && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-emerald-300 font-bold">Deal Recorded!</p>
                  <p className="text-xs text-gray-400 mt-1">Our team will contact you within 1 hour to finalize.</p>
                </div>
              )}
            </div>
            {status === "active" && (
              <div className="border-t border-white/5 p-3 flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                  placeholder="Make an offer..." disabled={loading}
                  className="flex-1 bg-background border border-white/10 rounded-full px-4 py-2 text-sm text-white" />
                <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="rounded-full bg-primary hover:bg-primary/90"><Send className="w-4 h-4" /></Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
