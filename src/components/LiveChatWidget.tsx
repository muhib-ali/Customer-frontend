"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, MessageCircle, Minimize2, Send, Sparkles, X } from "lucide-react";
import { useTheme } from "next-themes";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

type FaqItem = {
  question: string;
  answer: string;
  match?: string[];
};

const FAQ: FaqItem[] = [
  {
    question: "What does KSR Performance sell?",
    answer:
      "KSR Performance specializes in high-performance automotive parts, including turbocharging, cooling, and racing components.",
    match: ["what do you sell", "products", "parts", "ksr"],
  },
  {
    question: "How long does shipping take?",
    answer:
      "Shipping time depends on your location and the items in your cart. Share your country (and city if possible) and I’ll guide you on typical timelines.",
    match: ["shipping", "delivery", "ship", "deliver"],
  },
  {
    question: "What is your return policy?",
    answer:
      "If you need to return an item, please keep the packaging and share your order number. I can guide you through the return steps and required details.",
    match: ["return", "refund", "exchange"],
  },
  {
    question: "How do I track my order?",
    answer:
      "You can track orders from the **Order Tracking** page on the website. If you share your order number, I can tell you what to look for.",
    match: ["track", "tracking", "order status"],
  },
  {
    question: "Do you help with fitment/compatibility?",
    answer:
      "Yes. Tell me your car’s year, make, model, engine, and the part you’re considering—and I’ll guide you on what to check for fitment.",
    match: ["fitment", "compatible", "compatibility", "will it fit"],
  },
  {
    question: "How can I contact support?",
    answer:
      "Use the site’s **Contact** section for the fastest support. If you tell me whether it’s about an order, payment, or product, I’ll point you to the right place.",
    match: ["support", "contact", "help", "agent"],
  },
];

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function getFaqReply(userMessage: string) {
  const msg = normalize(userMessage);

  for (const item of FAQ) {
    if (item.match?.some((m) => msg.includes(normalize(m)))) return item.answer;
    if (normalize(item.question) === msg) return item.answer;
  }

  return (
    "I can help with: **shipping**, **returns**, **order tracking**, and **fitment guidance**.\n\n" +
    "Try asking:\n" +
    "- How long does shipping take?\n" +
    "- What is your return policy?\n" +
    "- How do I track my order?\n" +
    "- Do you help with fitment?"
  );
}

const LiveChatWidget = () => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Avoid hydration mismatch: theme + inline styles serialize differently on server vs client.
  // Render widget only after mount so server and client output match.
  useEffect(() => {
    setMounted(true);
  }, []);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! Welcome to KSR Performance. I’m KSR Assist, your AI helper. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: userMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 450));
      const response = getFaqReply(userMessage);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry — I’m having trouble connecting right now. Please try again or contact KSR support.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickReplies = [
    "How long does shipping take?",
    "What is your return policy?",
    "How do I track my order?",
  ];

  if (!mounted) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .live-chat-open { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .live-message-enter { animation: bounceIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .live-typing-indicator span { animation: pulse 1.4s infinite; }
        .live-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .live-typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        .live-chat-messages::-webkit-scrollbar { width: 6px; }
        .live-chat-messages::-webkit-scrollbar-track { background: theme === "dark" ? "#1a1a1a" : "#e5e7eb"; border-radius: 10px; }
        .live-chat-messages::-webkit-scrollbar-thumb { background: rgba(107, 114, 128, 0.50); border-radius: 10px; }
        .live-chat-messages::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.70); }
      `,
        }}
      />

      <div
        style={{
          fontFamily: "'Inter', -apple-system, sans-serif",
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "12px",
        }}
      >
        {isOpen && (
          <div
            className="live-chat-open"
            style={{
              width: "360px",
              height: isMinimized ? "60px" : "520px",
              backgroundColor: "#0b1220",
              borderRadius: "16px",
              boxShadow:
                "0 12px 48px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(107, 114, 128, 0.45)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              transition: "height 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              border: "1px solid rgba(107, 114, 128, 0.45)",
            }}
          >
            <div
              style={{
                background: theme === "dark" ? "linear-gradient(135deg, #000000 0%, #111111 50%, #1a1a1a 100%)" : "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <Sparkles size={20} color="#fff" />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-2px",
                      right: "-2px",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "#10b981",
                      border: theme === "dark" ? "2px solid #000000" : "2px solid #ffffff",
                    }}
                  />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: theme === "dark" ? "#fff" : "#1f2937",
                      margin: 0,
                      lineHeight: "1.2",
                    }}
                  >
                    KSR Assist
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
                      margin: 0,
                      lineHeight: "1.2",
                    }}
                  >
                    Online • Typically replies instantly
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  style={{
                    background: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = theme === "dark" ? "rgba(255, 255, 255, 0.14)" : "rgba(0, 0, 0, 0.14)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)")}
                  aria-label="Minimize chat"
                >
                  <Minimize2 size={16} color={theme === "dark" ? "#fff" : "#1f2937"} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = theme === "dark" ? "rgba(255, 255, 255, 0.14)" : "rgba(0, 0, 0, 0.14)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)")}
                  aria-label="Close chat"
                >
                  <X size={16} color={theme === "dark" ? "#fff" : "#1f2937"} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div
                  className="live-chat-messages"
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "20px",
                    backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="live-message-enter"
                      style={{
                        display: "flex",
                        justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "75%",
                          padding: "12px 16px",
                          borderRadius:
                            msg.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background:
                            msg.sender === "user"
                              ? "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)"
                              : theme === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
                          color: msg.sender === "user" ? "#fff" : theme === "dark" ? "#e5e7eb" : "#111827",
                          fontSize: "14px",
                          lineHeight: "1.5",
                          boxShadow: msg.sender === "bot" ? "0 2px 12px rgba(0, 0, 0, 0.25)" : "none",
                          border: msg.sender === "bot" ? "1px solid rgba(107, 114, 128, 0.50)" : "none",
                        }}
                      >
                        {msg.sender === "bot" ? (
                          <div className="markdown-content">
                            <ReactMarkdown
                              components={{
                                a: ({ ...props }) => (
                                  <a
                                    {...props}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: theme === "dark" ? "#f87171" : "#dc2626", textDecoration: "underline", fontWeight: 600 }}
                                  />
                                ),
                                p: ({ ...props }) => <p {...props} style={{ margin: 0 }} />,
                              }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div
                      className="live-message-enter"
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          padding: "12px 16px",
                          borderRadius: "16px 16px 16px 4px",
                          background: theme === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
                          border: theme === "dark" ? "1px solid rgba(148, 163, 184, 0.10)" : "1px solid rgba(107, 114, 128, 0.50)",
                          boxShadow: theme === "dark" ? "0 2px 12px rgba(0, 0, 0, 0.25)" : "0 2px 12px rgba(0, 0, 0, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: theme === "dark" ? "#cbd5e1" : "#475569",
                          fontSize: "14px",
                        }}
                      >
                        <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                        KSR Assist is thinking...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {messages.length <= 2 && (
                  <div
                    style={{
                      padding: "0 20px 12px",
                      backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    {quickReplies.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => setMessage(reply)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "20px",
                          border: theme === "dark" ? "1px solid rgba(148, 163, 184, 0.25)" : "1px solid rgba(0, 0, 0, 0.25)",
                          background: theme === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",
                          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.9)";
                          e.currentTarget.style.color = "#fecaca";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = theme === "dark" ? "rgba(148, 163, 184, 0.25)" : "rgba(0, 0, 0, 0.25)";
                          e.currentTarget.style.color = theme === "dark" ? "#e5e7eb" : "#1f2937";
                        }}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid rgba(148, 163, 184, 0.12)",
                    backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-end",
                  }}
                >
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: theme === "dark" ? "1px solid rgba(148, 163, 184, 0.20)" : "1px solid rgba(0, 0, 0, 0.20)",
                      fontSize: "14px",
                      outline: "none",
                      transition: "border-color 0.2s",
                      fontFamily: "inherit",
                      background: theme === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",
                      color: theme === "dark" ? "#e5e7eb" : "#1f2937",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.9)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = theme === "dark" ? "rgba(148, 163, 184, 0.20)" : "rgba(0, 0, 0, 0.20)")}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || isLoading}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: message.trim()
                        ? "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)"
                        : theme === "dark" ? "rgba(148, 163, 184, 0.25)" : "rgba(0, 0, 0, 0.25)",
                      border: "none",
                      cursor: message.trim() && !isLoading ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (message.trim() && !isLoading) {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    aria-label="Send message"
                  >
                    <Send size={18} color={message.trim() ? "#fff" : theme === "dark" ? "#0b1220" : "#94a3b8"} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setIsMinimized(false);
          }}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
            border: "none",
            boxShadow: theme === "dark" ? "0 8px 24px rgba(239, 68, 68, 0.35)" : "0 8px 24px rgba(239, 68, 68, 0.25)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
          }}
          onMouseEnter={(e) => {
            if (!isOpen) {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = theme === "dark" ? "0 12px 32px rgba(239, 68, 68, 0.45)" : "0 12px 32px rgba(239, 68, 68, 0.35)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isOpen) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = theme === "dark" ? "0 8px 24px rgba(239, 68, 68, 0.35)" : "0 8px 24px rgba(239, 68, 68, 0.25)";
            }
          }}
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {isOpen ? <X size={24} color="#fff" /> : <MessageCircle size={24} color="#fff" />}

          {!isOpen && (
            <div
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#ef4444",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
                border: theme === "dark" ? "2px solid #000000" : "2px solid #ffffff",
              }}
            >
              1
            </div>
          )}
        </button>
      </div>
    </>
  );
};

export default LiveChatWidget;
