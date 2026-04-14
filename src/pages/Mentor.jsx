import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Sparkles, Send, RefreshCw } from "lucide-react";

const QUICK_PROMPTS = [
  "How do I build a morning routine?",
  "I keep failing my habits. Help.",
  "Tips for staying focused while working",
  "How to make habits stick long-term?",
  "Best practices for productivity?",
];

export default function Mentor() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hey ${currentUser?.full_name?.split(" ")[0] || "there"} 👋 I'm your personal habit mentor. Ask me anything about habits, productivity, focus, or growth — I'm here to guide you.`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");
    const updatedMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(updatedMessages);
    setLoading(true);

    const history = updatedMessages.map(m => `${m.role === "user" ? "User" : "Mentor"}: ${m.content}`).join("\n");
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a warm, insightful, and highly practical habit and productivity mentor. You give concrete, actionable advice grounded in behavioral science. Keep responses focused and concise (2-4 short paragraphs max). Be encouraging but realistic.

Conversation so far:
${history}

Now respond as the Mentor:`,
    });

    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const reset = () => {
    setMessages([{
      role: "assistant",
      content: `Hey ${currentUser?.full_name?.split(" ")[0] || "there"} 👋 I'm your personal habit mentor. Ask me anything about habits, productivity, focus, or growth — I'm here to guide you.`
    }]);
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-foreground">Habit Mentor</h1>
          <p className="text-sm text-muted-foreground mt-1">Your personal AI coach for habits & growth</p>
        </div>
        <button onClick={reset} className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-all">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="text-xs bg-card border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto mb-6 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                <Sparkles size={13} className="text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-card border border-border text-foreground rounded-bl-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0">
              <Sparkles size={13} className="text-primary" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-card border border-border rounded-2xl flex items-center gap-3 px-4 py-3">
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Ask your mentor anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="w-8 h-8 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}