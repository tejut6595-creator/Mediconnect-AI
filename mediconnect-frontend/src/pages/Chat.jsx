import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageCircle, Sparkles, Trash2, Download } from 'lucide-react';
import { aiAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'mc_chat_messages';

const quickQuestions = [
  'What are flu symptoms?',
  'Is Aspirin safe?',
  'Book an appointment',
  'I have chest pain',
  'Nearby hospitals?',
  'Check my BMI',
  'Mental health tips',
  'COVID symptoms',
];

const loadMessages = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved?.length ? saved : null;
  } catch { return null; }
};

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => loadMessages() || [
    {
      id: 1, type: 'ai',
      text: `Hello${user ? ` ${user.name.split(' ')[0]}` : ''}! 👋 I'm MediConnect AI.\n\nI can help you with:\n• Symptom guidance & analysis\n• Medicine safety checks\n• Appointment booking\n• Emergency assistance\n• General health questions\n\nHow can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Persist messages
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || typing) return;

    const userMsg = {
      id: Date.now(), type: 'user', text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 600));
      const res = await aiAPI.chat(msg);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, type: 'ai',
        text: res.data.data.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, type: 'ai',
        text: "I'm having trouble connecting right now. Please try again in a moment. 🔄",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(), type: 'ai',
      text: "Chat cleared! How can I help you? 😊",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Chat cleared');
  };

  const exportChat = () => {
    const text = messages.map(m => `[${m.time}] ${m.type === 'ai' ? 'MediConnect AI' : (user?.name || 'You')}: ${m.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'mediconnect-chat.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">AI Health Assistant</h1>
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-blue-200 text-sm">Always online • Responds instantly</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col" style={{ minHeight: 0 }}>
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col">
          {/* Chat header bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">MediConnect AI</p>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <button onClick={exportChat} title="Export chat"
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
              <button onClick={clearChat} title="Clear chat"
                className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(100vh - 380px)', minHeight: '300px' }}>
            {messages.map((msg) => (
              <div key={msg.id}
                className={`flex items-end gap-2 animate-fade-in ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.type === 'ai' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-gray-600 to-gray-800'
                }`}>
                  {msg.type === 'ai'
                    ? <Bot className="w-4 h-4 text-white" />
                    : user?.avatar
                      ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-xl object-cover" onError={e => { e.target.style.display='none'; }} />
                      : <User className="w-4 h-4 text-white" />
                  }
                </div>
                <div className={`flex flex-col max-w-[75%] sm:max-w-md lg:max-w-lg ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line break-words ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-1">{msg.time}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex items-end gap-2 animate-fade-in">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {quickQuestions.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  className="flex-shrink-0 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium border border-blue-100 dark:border-blue-800 whitespace-nowrap">
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-end gap-2">
              <textarea ref={textareaRef} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask me anything about your health..."
                rows={1}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                style={{ maxHeight: '120px', overflowY: 'auto' }}
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || typing}
                className="w-11 h-11 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">Enter to send • Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
