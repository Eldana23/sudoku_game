"use client";

import { useState, useRef, useEffect } from "react";
import { Board } from "@/lib/sudoku";
import { buildCellContext } from "@/lib/sudoku";
import { Brain, Send, ChevronDown, ChevronUp, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  board: Board;
  selected: { row: number; col: number } | null;
  given: boolean[][];
}

export default function AICoachPanel({ board, selected, given }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const getContextMessage = () => {
    if (!selected) return "";
    const { row, col } = selected;
    const context = buildCellContext(board, row, col);
    return `\n\n[Current cell: Row ${row + 1}, Column ${col + 1}]\n${context}`;
  };

  const handleSend = async (userMessage?: string) => {
    const text = (userMessage ?? input).trim();
    if (!text || isLoading) return;

    const contextMessage = getContextMessage();
    const fullUserMessage = text + contextMessage;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: "user", content: fullUserMessage },
          ],
        }),
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;
          setMessages([
            ...newMessages,
            { role: "assistant", content: assistantText },
          ]);
        }
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Make sure your `ANTHROPIC_API_KEY` is set in your `.env.local` file. In the meantime, try looking at which numbers are already in the row, column, and box of your selected cell — that elimination process is the foundation of Sudoku!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_ACTIONS = [
    "Why can't I place a number here?",
    "What strategy should I use?",
    "Explain naked singles",
    "Help me find the next move",
  ];

  return (
    <div
      className="ai-coach-panel"
      style={{
        background: "var(--bg-2)",
        border: "1px solid rgba(130, 130, 240, 0.2)",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "1px solid rgba(100, 100, 200, 0.12)",
          background: "rgba(109, 93, 252, 0.06)",
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              background: "linear-gradient(135deg, #6d5dfc, #818cf8)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(109, 93, 252, 0.4)",
            }}
          >
            <Brain size={15} color="white" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "var(--text-primary)",
              }}
            >
              AI Coach
            </div>
            <div style={{ fontSize: "0.7rem", color: "#6d5dfc" }}>
              Powered by Claude
            </div>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp size={16} color="#9090b8" />
        ) : (
          <ChevronDown size={16} color="#9090b8" />
        )}
      </div>

      {isOpen && (
        <>
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              minHeight: "180px",
              maxHeight: "300px",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: "2rem",
                    marginBottom: "8px",
                    opacity: 0.5,
                  }}
                >
                  🧠
                </div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    lineHeight: 1.6,
                  }}
                >
                  Select a cell on the board, then ask me anything about it.
                  I'll explain Sudoku strategies and guide your thinking.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    justifyContent: "center",
                    marginTop: "14px",
                  }}
                >
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleSend(action)}
                      style={{
                        padding: "5px 10px",
                        background: "rgba(109, 93, 252, 0.1)",
                        border: "1px solid rgba(109, 93, 252, 0.25)",
                        borderRadius: "20px",
                        color: "#818cf8",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(109, 93, 252, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(109, 93, 252, 0.1)";
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  gap: "4px",
                  animationDelay: `${i * 0.05}s`,
                }}
                className="animate-fade-up"
              >
                <div
                  style={{
                    maxWidth: "88%",
                    padding: "10px 13px",
                    borderRadius:
                      msg.role === "user"
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                    background:
                      msg.role === "user"
                        ? "rgba(109, 93, 252, 0.2)"
                        : "rgba(24, 24, 58, 0.8)",
                    border:
                      msg.role === "user"
                        ? "1px solid rgba(109, 93, 252, 0.3)"
                        : "1px solid rgba(100, 100, 200, 0.12)",
                    fontSize: "0.85rem",
                    lineHeight: 1.65,
                    color:
                      msg.role === "user" ? "#c7d2fe" : "#b0b0d0",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                  {i === messages.length - 1 &&
                    msg.role === "assistant" &&
                    isLoading && (
                      <span
                        style={{
                          display: "inline-block",
                          width: "2px",
                          height: "14px",
                          background: "#818cf8",
                          marginLeft: "2px",
                          verticalAlign: "middle",
                          animation: "thinkBounce 0.8s ease infinite",
                          borderRadius: "1px",
                        }}
                      />
                    )}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(24, 24, 58, 0.8)",
                    border: "1px solid var(--border)",
                    borderRadius: "14px 14px 14px 4px",
                  }}
                >
                  <div className="thinking-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid rgba(100, 100, 200, 0.12)",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              background: "rgba(7, 7, 15, 0.5)",
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                selected
                  ? `Ask about R${selected.row + 1}C${selected.col + 1}...`
                  : "Select a cell first..."
              }
              style={{
                flex: 1,
                background: "var(--bg-3)",
                border: "1px solid rgba(100, 100, 200, 0.2)",
                borderRadius: "8px",
                padding: "9px 13px",
                color: "var(--text-primary)",
                fontSize: "0.85rem",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(109, 93, 252, 0.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(100, 100, 200, 0.2)";
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              style={{
                width: "36px",
                height: "36px",
                background:
                  input.trim() && !isLoading
                    ? "linear-gradient(135deg, #6d5dfc, #818cf8)"
                    : "rgba(100, 100, 200, 0.12)",
                border: "none",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: input.trim() && !isLoading ? "pointer" : "default",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            >
              <Send size={14} color={input.trim() && !isLoading ? "white" : "#4a4a72"} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
