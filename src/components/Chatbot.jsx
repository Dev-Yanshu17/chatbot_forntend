import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";   // ✅ ADD THIS
import "../styles/Chatbot.css";

const API_URL = "http://localhost:8000/chat";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello 👋 How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ---------------- EXPORT TO PDF ----------------
  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(16);
    doc.text("AI Chat Export", 14, y);
    y += 10;

    doc.setFontSize(11);

    messages.forEach((msg, index) => {
      const prefix = msg.role === "user" ? "User: " : "Bot: ";
      const textLines = doc.splitTextToSize(prefix + msg.text, 180);

      if (y + textLines.length * 6 > 280) {
        doc.addPage();
        y = 15;
      }

      doc.text(textLines, 14, y);
      y += textLines.length * 6 + 4;
    });

    doc.save("chat-history.pdf");
  };

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply || "⚠️ No response from AI" }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Backend server is not running." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        🤖 Smart AI Chatbot
        <button className="pdf-btn" onClick={exportToPDF}>
          📄 Export PDF
        </button>
      </div>

      <div className="chat-body">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-message bot typing">Typing...</div>}
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