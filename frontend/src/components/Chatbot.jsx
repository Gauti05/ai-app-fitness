import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { MessageSquare, X, Send, Zap, Loader } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hey! I'm your AI Coach. Ask me anything about your training or diet." }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMsg.text });
      const aiMsg = { role: 'ai', text: res.data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      let errorText = "I'm having trouble connecting. Check your internet or try again later.";

      // SPECIFIC CHECK FOR 429 (Rate Limit)
      if (err.response && err.response.status === 429) {
        errorText = "I'm thinking too fast! 🧠💨 Please wait about 30 seconds before asking again (Quota Exceeded).";
      } else if (err.response?.data?.msg) {
        errorText = err.response.data.msg;
      }

      setMessages(prev => [...prev, { role: 'ai', text: errorText }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-slate-900 border border-teal-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10">
          
          {/* Header */}
          <div className="bg-slate-800 p-4 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                <Zap size={16} className="text-slate-900 fill-slate-900" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Trainer AI</h3>
                <span className="flex items-center gap-1 text-[10px] text-teal-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span> Online
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-teal-500 text-slate-900 rounded-tr-none font-medium' 
                    : 'bg-slate-800 text-slate-200 border border-white/10 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-white/10">
                  <Loader size={16} className="text-teal-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-slate-800 border-t border-white/10 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-900 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-teal-500 border border-white/5"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="p-3 bg-teal-500 text-slate-900 rounded-xl hover:bg-teal-400 transition disabled:opacity-50 font-bold"
            >
              <Send size={18} />
            </button>
          </form>

        </div>
      )}

      {/* FLOATING BUTTON (FAB) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-teal-500 text-slate-900'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} fill="currentColor" />}
      </button>

    </div>
  );
};

export default Chatbot;