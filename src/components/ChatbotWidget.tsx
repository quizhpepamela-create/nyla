import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ChatbotWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: '¡Hola! Soy el asistente de NYLA. Puedo ayudarte con cómo registrarte, cómo funciona el match, métodos de pago, tarifas o soporte general. ¿En qué te ayudo?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [botTyping, setBotTyping] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setBotTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userText }],
        }),
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'bot', text: data.text || 'Lo siento, ha ocurrido un error al procesar tu solicitud.' }]);
    } catch (err) {
      console.error('Error talking to bot:', err);
      setChatMessages(prev => [...prev, { sender: 'bot', text: 'En este momento no puedo conectar con el servidor. Intenta de nuevo en un momento.' }]);
    } finally {
      setBotTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="w-14 h-14 bg-editorial-text text-editorial-bg rounded-full flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer border-none"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="absolute bottom-20 right-0 w-80 md:w-96 bg-editorial-bg rounded-[32px] shadow-md border border-editorial-border flex flex-col overflow-hidden"
          >
            {/* Chatbot Header */}
            <div className="bg-editorial-text p-4 flex justify-between items-center text-editorial-bg">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                <span className="font-bold text-xs uppercase tracking-wider">NYLA AI Assistant</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-editorial-bg/80 hover:text-editorial-bg bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chatbot Messages */}
            <div className="h-80 p-4 space-y-4 overflow-y-auto bg-editorial-light/40 flex flex-col">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-editorial-text/10 flex items-center justify-center text-editorial-text shrink-0 text-xs font-bold">
                      AI
                    </div>
                  )}
                  <div className={`p-3 rounded-[16px] text-xs max-w-[75%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-editorial-text text-editorial-bg rounded-tr-none'
                      : 'bg-editorial-bg border border-editorial-border text-editorial-text rounded-tl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {botTyping && (
                <div className="flex gap-2.5 justify-start items-center">
                  <div className="w-8 h-8 rounded-full bg-editorial-text/10 flex items-center justify-center text-editorial-text shrink-0 text-xs font-bold">
                    ...
                  </div>
                  <div className="bg-editorial-bg border border-editorial-border p-3 rounded-[16px] rounded-tl-none text-xs text-editorial-muted flex gap-1">
                    <span className="w-1.5 h-1.5 bg-editorial-text rounded-full animate-pulse"></span>
                    <span className="w-1.5 h-1.5 bg-editorial-text rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-editorial-text rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Chatbot Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-editorial-border bg-editorial-bg flex gap-2 items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pregúntale a NYLA AI..."
                className="flex-1 bg-editorial-light border-none rounded-xl py-2 px-4 text-xs focus:ring-1 focus:ring-editorial-text text-editorial-text placeholder-editorial-muted outline-none"
              />
              <button
                type="submit"
                className="text-editorial-text p-2 hover:bg-editorial-light rounded-xl transition-all cursor-pointer border-none bg-transparent"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
