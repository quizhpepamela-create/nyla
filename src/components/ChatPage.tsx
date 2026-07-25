import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Search, Check, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { ViewState, ChatThread, Message } from '../types';
import { useAuth } from '../context/AuthContext';

interface ChatPageProps {
  setView: (view: ViewState) => void;
}

interface Contact {
  id: string;
  name: string;
  role: 'STUDENT' | 'ENTREPRENEUR';
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

const AI_THREAD_ID = 'nyla-ai';

function buildAiThread(): ChatThread {
  return {
    id: AI_THREAD_ID,
    name: 'NYLA AI Guide',
    avatar: '🚀',
    isAI: true,
    online: true,
    lastMessage: 'Pregúntame sobre registro, pagos, tarifas o cómo funciona NYLA.',
    time: 'Ahora',
    messages: [
      {
        id: 'm1',
        role: 'model',
        content: 'Hola, soy tu guía de NYLA. Puedo ayudarte con el registro, cómo funciona el match, métodos de pago, tarifas o soporte. ¿En qué puedo ayudarte hoy?',
        timestamp: '10:00 AM',
      },
    ],
  };
}

export default function ChatPage({ setView }: ChatPageProps) {
  const { user } = useAuth();
  const [aiThread, setAiThread] = useState<ChatThread>(buildAiThread());
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactMessages, setContactMessages] = useState<Record<string, Message[]>>({});
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState(AI_THREAD_ID);
  const [searchInput, setSearchInput] = useState('');
  const [msgInput, setMsgInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadContacts = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/contacts', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setContacts(data.contacts);
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
    const interval = setInterval(loadContacts, 15000);
    return () => clearInterval(interval);
  }, [loadContacts]);

  const loadThreadMessages = useCallback(async (contactId: string) => {
    const res = await fetch(`/api/messages/${contactId}`, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) return;
    const formatted: Message[] = data.messages.map((m: any) => ({
      id: m.id,
      role: m.senderId === user?.id ? 'user' : 'model',
      content: m.content,
      timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    setContactMessages(prev => ({ ...prev, [contactId]: formatted }));
    setContacts(prev => prev.map(c => (c.id === contactId ? { ...c, unreadCount: 0 } : c)));
  }, [user?.id]);

  useEffect(() => {
    if (activeThreadId === AI_THREAD_ID) return;
    loadThreadMessages(activeThreadId);
    const interval = setInterval(() => loadThreadMessages(activeThreadId), 4000);
    return () => clearInterval(interval);
  }, [activeThreadId, loadThreadMessages]);

  const isAIActive = activeThreadId === AI_THREAD_ID;
  const activeContact = contacts.find(c => c.id === activeThreadId) || null;

  const activeThread: ChatThread = isAIActive
    ? aiThread
    : {
        id: activeContact?.id ?? '',
        name: activeContact?.name ?? '',
        avatar: activeContact?.role === 'STUDENT' ? '🎓' : '🏢',
        isAI: false,
        online: false,
        lastMessage: activeContact?.lastMessage ?? '',
        time: '',
        messages: contactMessages[activeThreadId] ?? [],
      };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread.messages, typing]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;

    const userText = msgInput;
    setMsgInput('');

    if (isAIActive) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const userMsg: Message = { id: Math.random().toString(), role: 'user', content: userText, timestamp };
      setAiThread(prev => ({ ...prev, lastMessage: userText, time: 'Ahora', messages: [...prev.messages, userMsg] }));
      setTyping(true);
      try {
        const contextMessages = aiThread.messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }));
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: contextMessages }),
        });
        const data = await response.json();
        const botMsg: Message = {
          id: Math.random().toString(),
          role: 'model',
          content: data.text || 'He recibido tu solicitud.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setAiThread(prev => ({ ...prev, lastMessage: botMsg.content, time: 'Ahora', messages: [...prev.messages, botMsg] }));
      } catch (err) {
        console.error('Error generating AI response:', err);
        const fallbackMsg: Message = {
          id: Math.random().toString(),
          role: 'model',
          content: 'Lo siento, en este momento tengo dificultades para conectar con el servidor.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setAiThread(prev => ({ ...prev, messages: [...prev.messages, fallbackMsg] }));
      } finally {
        setTyping(false);
      }
      return;
    }

    // Real message to a real contact
    setSending(true);
    const optimistic: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setContactMessages(prev => ({ ...prev, [activeThreadId]: [...(prev[activeThreadId] ?? []), optimistic] }));
    try {
      const res = await fetch(`/api/messages/${activeThreadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: userText }),
      });
      if (res.ok) {
        loadThreadMessages(activeThreadId);
        loadContacts();
      }
    } finally {
      setSending(false);
    }
  };

  const filteredThreads = [
    { id: AI_THREAD_ID, name: aiThread.name, avatar: aiThread.avatar, isAI: true, lastMessage: aiThread.lastMessage, time: aiThread.time, unreadCount: 0 },
    ...contacts.map(c => ({
      id: c.id,
      name: c.name,
      avatar: c.role === 'STUDENT' ? '🎓' : '🏢',
      isAI: false,
      lastMessage: c.lastMessage || (c.role === 'STUDENT' ? 'Estudiante — inicia la conversación' : 'Emprendedor — inicia la conversación'),
      time: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      unreadCount: c.unreadCount,
    })),
  ].filter(t => t.name.toLowerCase().includes(searchInput.toLowerCase()));

  return (
    <div className="min-h-screen bg-editorial-bg pb-24 md:pb-8 flex flex-col">

      {/* Page Title */}
      <div className="mb-8 pb-6 border-b border-editorial-border">
        <button
          onClick={() => setView('landing')}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-editorial-muted hover:text-editorial-text transition-colors bg-white border border-editorial-border px-3 py-1.5 rounded-full cursor-pointer"
        >
          ← Volver a la Portada (Inicio)
        </button>
        <h2 className="text-3xl md:text-5xl font-serif font-black text-editorial-text tracking-tight">Mensajería y Asistente AI</h2>
        <p className="text-sm text-editorial-muted mt-1">Chatea con estudiantes y emprendedores con quienes tienes un proyecto en común, o pide ayuda a la IA.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 border border-editorial-border rounded-[32px] bg-editorial-bg shadow-none overflow-hidden min-h-[580px]">

        {/* Conversations Column */}
        <div className="border-r border-editorial-border flex flex-col bg-editorial-bg">
          <div className="p-4 border-b border-editorial-border">
            <div className="relative">
              <Search className="w-4 h-4 text-editorial-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar conversaciones..."
                className="w-full bg-editorial-light border border-transparent rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-editorial-text focus:bg-editorial-bg text-editorial-text"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 p-2">
            {filteredThreads.map((t) => {
              const isActive = t.id === activeThreadId;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-editorial-text text-editorial-bg shadow-none'
                      : 'hover:bg-editorial-light/60'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0 ${
                      isActive ? 'bg-editorial-bg text-editorial-text' : 'bg-editorial-text text-editorial-bg'
                    }`}>
                      {t.avatar}
                    </div>
                    {t.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {t.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className={`text-xs font-bold truncate ${isActive ? 'text-editorial-bg' : 'text-editorial-text'}`}>
                        {t.name}
                      </h4>
                      <span className={`text-[10px] font-semibold ${isActive ? 'text-editorial-bg/70' : 'text-editorial-muted'}`}>{t.time}</span>
                    </div>
                    <p className={`text-[11px] truncate ${isActive ? 'text-editorial-bg/85' : 'text-editorial-muted'}`}>
                      {t.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
            {!loadingContacts && contacts.length === 0 && (
              <p className="text-[11px] text-editorial-muted p-4 leading-relaxed">
                Aún no tienes conversaciones. Cuando te postules a un proyecto, o un estudiante se postule al tuyo, podrás chatear aquí.
              </p>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-2 flex flex-col bg-white">
          {/* Active Chat Header */}
          <div className="p-4 border-b border-editorial-border flex justify-between items-center bg-editorial-bg/25">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-editorial-text text-editorial-bg flex items-center justify-center text-base shrink-0">
                {activeThread.avatar}
              </div>
              <div>
                <h3 className="text-xs font-bold text-editorial-text">{activeThread.name}</h3>
                <p className="text-[10px] text-editorial-muted font-bold mt-0.5">
                  {isAIActive ? 'Asistente virtual' : activeContact?.role === 'STUDENT' ? 'Estudiante' : 'Emprendedor'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-editorial-light/10">
            {!isAIActive && !activeContact && (
              <div className="h-full flex items-center justify-center text-xs text-editorial-muted text-center px-8">
                Selecciona una conversación de la izquierda para empezar a chatear.
              </div>
            )}

            {activeThread.messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-editorial-text/5 text-editorial-text flex items-center justify-center text-xs shrink-0">
                    {activeThread.avatar}
                  </div>
                )}

                <div className="max-w-[85%] space-y-2">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-editorial-text text-editorial-bg rounded-tr-none'
                      : 'bg-editorial-bg border border-editorial-border text-editorial-text rounded-tl-none shadow-none'
                  }`}>
                    {m.content}
                  </div>
                  <span className={`text-[9px] text-editorial-muted block ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-full bg-editorial-text/5 text-editorial-text flex items-center justify-center text-xs shrink-0">
                  🚀
                </div>
                <div className="bg-editorial-bg border border-editorial-border p-3 rounded-2xl rounded-tl-none text-xs text-editorial-muted flex gap-1">
                  <span className="w-1.5 h-1.5 bg-editorial-text rounded-full animate-pulse"></span>
                  <span className="w-1.5 h-1.5 bg-editorial-text rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-editorial-text rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-editorial-border bg-editorial-bg space-y-2">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                disabled={!isAIActive && !activeContact}
                placeholder={isAIActive ? 'Escribe un mensaje o pide ayuda a la AI...' : 'Escribe un mensaje...'}
                className="flex-1 bg-editorial-light border-none rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-editorial-text focus:bg-white text-editorial-text placeholder-editorial-muted disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={sending || (!isAIActive && !activeContact)}
                className="p-3 bg-editorial-text text-editorial-bg rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-none active:scale-95 shrink-0 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            {isAIActive && (
              <p className="text-[9px] text-editorial-muted text-center flex items-center justify-center gap-1 leading-normal">
                <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                La IA de NYLA puede cometer errores. Verifica la información importante.
              </p>
            )}
          </form>
        </div>

        {/* Right Details Panel */}
        <div className="hidden lg:flex flex-col bg-editorial-bg p-6 space-y-6 overflow-y-auto">
          {isAIActive ? (
            <>
              <div className="space-y-2 text-center pb-4 border-b border-editorial-border">
                <div className="w-14 h-14 bg-editorial-text text-editorial-bg flex items-center justify-center text-2xl rounded-full mx-auto shadow-none">
                  🚀
                </div>
                <h4 className="font-serif font-bold text-sm text-editorial-text">NYLA AI Guide</h4>
                <p className="text-[10px] text-editorial-muted">Tu copiloto de soporte en la plataforma</p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-[9px] text-editorial-muted uppercase tracking-wider">Puede ayudarte con</h5>
                <ul className="space-y-2 text-xs text-editorial-text">
                  <li className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-editorial-text shrink-0" />
                    <span>Cómo registrarte y usar la plataforma</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-editorial-text shrink-0" />
                    <span>Tarifas, comisión y pagos en garantía</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-editorial-text shrink-0" />
                    <span>Redactar un modelo de contrato</span>
                  </li>
                </ul>
              </div>
            </>
          ) : activeContact ? (
            <>
              <div className="space-y-2 text-center pb-4 border-b border-editorial-border">
                <div className="w-14 h-14 rounded-full border border-editorial-border bg-editorial-text text-editorial-bg flex items-center justify-center text-2xl mx-auto">
                  {activeThread.avatar}
                </div>
                <h4 className="font-serif font-bold text-sm text-editorial-text">{activeContact.name}</h4>
                <p className="text-[10px] text-editorial-muted font-bold uppercase tracking-wider">
                  {activeContact.role === 'STUDENT' ? 'Estudiante' : 'Emprendedor'}
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-[9px] text-editorial-muted uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Conversación real
                </h5>
                <p className="text-xs text-editorial-text leading-relaxed">
                  Esta conversación está conectada a un proyecto que tienen en común en NYLA. Los mensajes se guardan de forma real y se actualizan automáticamente.
                </p>
              </div>
            </>
          ) : (
            <p className="text-xs text-editorial-muted text-center pt-8">Selecciona una conversación para ver los detalles.</p>
          )}
        </div>

      </div>

    </div>
  );
}
