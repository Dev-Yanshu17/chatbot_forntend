import React, { useState, useRef, useEffect } from "react";
import "../styles/Chatbot.css";

const API_URL = "http://localhost:8000/chat";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello 👋 How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userText })
      });

      if (!response.ok) {
        throw new Error("Server not responding");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.reply || "⚠️ No response from AI"
        }
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Backend server is not running."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="chat-container">
      <div className="chat-header">🤖 Smart AI Chatbot</div>

      <div className="chat-body">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="chat-message bot typing">Typing...</div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="chat-footer">
        <input
          type="text"
          placeholder="Ask anything..."
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
