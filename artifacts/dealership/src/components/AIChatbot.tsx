import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Minimize2, Maximize2, Loader2 } from "lucide-react";
import { useCreateOpenaiConversation, useGetOpenaiConversation } from "@workspace/api-client-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const createConversation = useCreateOpenaiConversation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initConversation = async () => {
    if (conversationId) return conversationId;
    const result = await createConversation.mutateAsync({
      data: { title: "Car Advice Chat" }
    });
    setConversationId(result.id);
    return result.id;
  };

  const openChat = async () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasNewMessage(false);
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Habari! I'm AutoElite AI, your personal car expert. I can help you with:\n\n• Choosing the right car for your budget and needs\n• Understanding import duties and KRA calculations\n• Japanese import advice and auction grades\n• Financing options in Kenya\n• Any car-related question!\n\nWhat can I help you with today?"
      }]);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);

    try {
      const convId = await initConversation();

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch(`/api/openai/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: updated[updated.length - 1].content + data.content,
                  };
                  return updated;
                });
              }
              if (data.done) break;
            } catch {}
          }
        }
      }
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "I apologize, I'm having trouble connecting right now. Please try again or contact us directly on WhatsApp.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bottom-28 right-6 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 transition-all duration-300 ${
            isMinimized ? "w-72 h-14" : "w-[380px] h-[550px]"
          }`}
          style={{ maxHeight: "calc(100vh - 120px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-red-900/30 to-transparent rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">AutoElite AI</p>
                <p className="text-green-400 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"></span>
                  Car Expert Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMinimized(!isMinimized)} className="text-gray-400 hover:text-white transition-colors">
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: "calc(100% - 120px)" }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-tr-sm"
                          : "bg-white/5 border border-white/8 text-gray-200 rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                      {msg.role === "assistant" && msg.content === "" && (
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {["Best car under KES 2M", "JDM auction grades explained", "How to calculate import duty"].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => { setInputValue(prompt); inputRef.current?.focus(); }}
                      className="text-xs bg-white/5 border border-white/10 text-gray-300 hover:border-primary/50 hover:text-white px-3 py-1.5 rounded-full transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about cars..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm rounded-xl flex-1"
                    disabled={isStreaming}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isStreaming}
                    className="bg-primary hover:bg-primary/90 rounded-xl w-10 h-10 p-0 flex-shrink-0"
                  >
                    {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-gray-600 text-xs text-center mt-2">AutoElite AI — Powered by advanced automotive knowledge</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : openChat}
        className="fixed bottom-6 right-24 z-50 w-14 h-14 bg-gradient-to-br from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 rounded-full shadow-lg shadow-red-900/40 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        title="Chat with AutoElite AI"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <Bot className="w-6 h-6 text-white" />
            {hasNewMessage && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></span>
            )}
          </>
        )}
      </button>
    </>
  );
}
