import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function AiAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !user || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const res = await api.post<string>("/ai/chat", {
        userId: user.id,
        message: userMessage,
      });
      setMessages((prev) => [...prev, { role: "assistant", text: res.data }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I couldn't get a response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <nav className="topbar">
        <span className="topbar-brand">BudgetBounder</span>
        <div className="topbar-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/transactions">Transactions</Link>
          <Link to="/saving-goals">Saving Goals</Link>
        </div>
      </nav>
      <main>
        <div className="page-heading">
          <h2>AI Assistant</h2>
          <p>Ask questions about your finances and spending habits.</p>
        </div>

        <div className="section">
          <div className="card" style={{ display: "flex", flexDirection: "column", height: 480 }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 4px", marginBottom: 12 }}>
              {messages.length === 0 && (
                <p className="empty">
                  Ask me anything about your spending, savings, or budgeting habits!
                </p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: msg.role === "user" ? "var(--accent)" : "var(--surface)",
                      color: msg.role === "user" ? "#fff" : "var(--text)",
                      fontSize: 14,
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "var(--surface)",
                      color: "var(--text-muted)",
                      fontSize: 14,
                    }}
                  >
                    Thinking…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your transactions…"
                disabled={loading}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !input.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
