import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, Info, Paperclip, Image, Mic, Search, ChevronRight, Check, X, FileText, Download, HelpCircle, Shield, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState, ChatThread, Message } from '../types';

interface ChatPageProps {
  setView: (view: ViewState) => void;
}

export default function ChatPage({ setView }: ChatPageProps) {
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: 'nyla-ai',
      name: 'NYLA AI Guide',
      avatar: '🚀',
      isAI: true,
      online: true,
      lastMessage: 'He generado la propuesta de contrato para el desarrollador React.',
      time: 'Ahora',
      messages: [
        {
          id: 'm1',
          role: 'model',
          content: 'Hola, soy tu guía de NYLA. He analizado tu perfil y los requerimientos de tu última postulación. ¿En qué puedo ayudarte hoy?',
          timestamp: '10:00 AM'
        },
        {
          id: 'm2',
          role: 'user',
          content: 'Por favor, genera un contrato estándar para el desarrollador frontend del proyecto Fintech. El presupuesto es de $84.32 USD con entrega en 8 horas de trabajo (tarifa estudiantil de $10.54/hora).',
          timestamp: '10:01 AM'
        },
        {
          id: 'm3',
          role: 'model',
          content: 'Entendido. He redactado una propuesta de Contrato de Colaboración Digital formal para el desarrollo frontend. Revisa los términos y confírmalos.',
          timestamp: '10:01 AM',
          isContract: true,
          contractData: {
            id: '294',
            parties: 'NYLA Corp & Estudiante',
            service: 'Desarrollo Frontend React (Fintech App)',
            amount: '$84.32 USD',
            duration: '8 Horas de Trabajo',
            status: 'pending'
          }
        }
      ]
    },
    {
      id: 'elena-v',
      name: 'Elena Valery',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCg-sYd74mPtldBVLjpMlInRZpS-FvyONN-uEnSbU5vVhIMzgq1_nliHBmaDbOMJD6R0Vtrp-71v-t-N0l2Fi3itvfMNYHSX8XBlLq41trEqzFB1up1u-kbIYaqYU2O0R1iiffM2KBBBkS1q8nIZwwdlFTFReP6Uj4IxFhJa1GZB6pM4j75ZCuovgwg7vTUP_aJAqltVKtJArj5AayWm1kmDLUGpqFUOP2ekK9iac2W2wn32zwj-SFSIP6O_CM7qWrOKFPY2SIBlZn',
      isAI: false,
      online: true,
      lastMessage: '¡Hola! Encantada de conocerte, acabo de ver tu mensaje.',
      time: '12m',
      messages: [
        {
          id: 'ev1',
          role: 'user',
          content: 'Hola Elena, vi tu excelente portafolio en NYLA Portal. ¿Estarías disponible para conversar sobre una startup Fintech?',
          timestamp: '10:15 AM'
        },
        {
          id: 'ev2',
          role: 'model',
          content: '¡Hola! Encantada de conocerte, acabo de ver tu mensaje. Claro, me interesa mucho el ámbito Fintech. ¿Cuándo te vendría bien conversar?',
          timestamp: '10:17 AM'
        }
      ]
    },
    {
      id: 'prof-julian',
      name: 'Prof. Julian Ricci',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPM_EOkdz_yQmQF_D9wPJtQzWYtEm7jgBzRKIL886hCRRp01BICSyxOAk9SpvfZEbKIPvW7zkUvaB5LndbPDqMsFRZaY6Wmwh06_meJ8x1vrRVs2HRJdt6BEBy6VMrLmRRB3fLs0c9vekw3kJlbxosJUBdxFa3N02of0kM-EPgeWFpntsFgoXAly-fsBzqACZX90eq7_1IjKl8umoDxLXLmpFN6Ebk5vo7OmPcZOmYG_JwBE4B4LbXfvwiPvTvpVr7fTI-W--KSsPu',
      isAI: false,
      online: true,
      lastMessage: 'Hola, revisa los requisitos del proyecto.',
      time: '1h',
      messages: [
        {
          id: 'pj1',
          role: 'model',
          content: 'Hola, recuerda revisar el entregable final del módulo de analítica antes de subirlo.',
          timestamp: '09:00 AM'
        }
      ]
    },
    {
      id: 'eq-backend',
      name: 'Equipo Backend',
      avatar: '💻',
      isAI: false,
      online: false,
      lastMessage: 'La API de autenticación está lista para pruebas.',
      time: 'Ayer',
      messages: [
        {
          id: 'eqb1',
          role: 'model',
          content: 'Hemos desplegado el entorno staging. La API de autenticación está lista para pruebas.',
          timestamp: 'Ayer 5:30 PM'
        }
      ]
    }
  ]);

  const [activeThreadId, setActiveThreadId] = useState('nyla-ai');
  const [searchInput, setSearchInput] = useState('');
  const [msgInput, setMsgInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('$84.32 USD');
  const [editDuration, setEditDuration] = useState('8 Horas de Trabajo');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread.messages, typing]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;

    const userText = msgInput;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: userText,
      timestamp
    };

    setThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          lastMessage: userText,
          time: 'Ahora',
          messages: [...t.messages, userMsg]
        };
      }
      return t;
    }));

    setMsgInput('');

    if (activeThread.isAI) {
      setTyping(true);

      try {
        // Send previous conversation context to the server
        const contextMessages = activeThread.messages.concat(userMsg).map(m => ({
          role: m.role,
          content: m.content
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: contextMessages })
        });
        const data = await response.json();

        const botMsg: Message = {
          id: Math.random().toString(),
          role: 'model',
          content: data.text || 'He recibido tu solicitud. ¿Te gustaría generar una propuesta de contrato o buscar más proyectos?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Check if the bot message is structured to suggest a contract
        const textLower = (data.text || '').toLowerCase();
        if (textLower.includes('contrato de colaboración') || textLower.includes('partes:') || textLower.includes('monto:')) {
          botMsg.isContract = true;
          botMsg.contractData = {
            id: Math.floor(100 + Math.random() * 900).toString(),
            parties: 'NYLA Corp & Estudiante',
            service: 'Desarrollo de Software / UX',
            amount: '$84.32 USD',
            duration: '8 Horas de Trabajo',
            status: 'pending'
          };
        }

        setThreads(prev => prev.map(t => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              lastMessage: botMsg.content,
              time: 'Ahora',
              messages: [...t.messages, botMsg]
            };
          }
          return t;
        }));

      } catch (err) {
        console.error('Error generating AI response:', err);
        const fallbackMsg: Message = {
          id: Math.random().toString(),
          role: 'model',
          content: 'Lo siento, en este momento tengo dificultades para conectar con el servidor. ¿Deseas firmar la propuesta de contrato existente?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setThreads(prev => prev.map(t => {
          if (t.id === activeThreadId) {
            return { ...t, messages: [...t.messages, fallbackMsg] };
          }
          return t;
        }));
      } finally {
        setTyping(false);
      }
    } else {
      // Simulate contact response
      setTyping(true);
      setTimeout(() => {
        const replyMsg: Message = {
          id: Math.random().toString(),
          role: 'model',
          content: `¡Entendido! Me parece genial tu propuesta. Podemos agendar una llamada de 15 minutos mañana para alinear detalles.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setThreads(prev => prev.map(t => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              lastMessage: replyMsg.content,
              time: 'Ahora',
              messages: [...t.messages, replyMsg]
            };
          }
          return t;
        }));
        setTyping(false);
      }, 1500);
    }
  };

  const handleAcceptContract = (msgId: string) => {
    let approvedAmount = 160;
    setThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        const updatedMsgs = t.messages.map(m => {
          if (m.id === msgId && m.contractData) {
            const parsed = parseFloat(m.contractData.amount.replace(/[^0-9.]/g, ''));
            if (!isNaN(parsed) && parsed > 0) {
              approvedAmount = parsed;
            }
            return {
              ...m,
              contractData: {
                ...m.contractData,
                status: 'accepted' as const
              }
            };
          }
          return m;
        });
        return { ...t, messages: updatedMsgs };
      }
      return t;
    }));

  };

  const handleSaveEditContract = (msgId: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        const updatedMsgs = t.messages.map(m => {
          if (m.id === msgId && m.contractData) {
            return {
              ...m,
              contractData: {
                ...m.contractData,
                amount: editAmount,
                duration: editDuration,
                status: 'modified' as const
              }
            };
          }
          return m;
        });
        return { ...t, messages: updatedMsgs };
      }
      return t;
    }));
    setEditingContractId(null);
  };

  const filteredThreads = threads.filter(t => 
    t.name.toLowerCase().includes(searchInput.toLowerCase())
  );

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
        <p className="text-sm text-editorial-muted mt-1">Colabora con startups, habla con mentores y redacta contratos con ayuda de la IA.</p>
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
                  onClick={() => {
                    setActiveThreadId(t.id);
                    setEditingContractId(null);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-editorial-text text-editorial-bg shadow-none' 
                      : 'hover:bg-editorial-light/60'
                  }`}
                >
                  <div className="relative">
                    {t.isAI ? (
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0 ${
                        isActive ? 'bg-editorial-bg text-editorial-text' : 'bg-editorial-text text-editorial-bg'
                      }`}>
                        {t.avatar}
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-full overflow-hidden border border-editorial-border bg-white shrink-0">
                        <img className="w-full h-full object-cover" referrerPolicy="no-referrer" src={t.avatar} alt={t.name} />
                      </div>
                    )}
                    {t.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-editorial-bg"></span>
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
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-2 flex flex-col bg-white">
          {/* Active Chat Header */}
          <div className="p-4 border-b border-editorial-border flex justify-between items-center bg-editorial-bg/25">
            <div className="flex items-center gap-3">
              {activeThread.isAI ? (
                <div className="w-10 h-10 rounded-full bg-editorial-text text-editorial-bg flex items-center justify-center text-base shrink-0">
                  {activeThread.avatar}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-editorial-border bg-editorial-bg shrink-0">
                  <img className="w-full h-full object-cover" referrerPolicy="no-referrer" src={activeThread.avatar} alt={activeThread.name} />
                </div>
              )}
              <div>
                <h3 className="text-xs font-bold text-editorial-text">{activeThread.name}</h3>
                <p className="text-[10px] text-green-600 font-bold mt-0.5 animate-pulse">
                  {activeThread.online ? 'En línea' : 'Desconectado'}
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <button 
                onClick={() => alert('Llamadas de voz integradas con el portal NYLA próximamente.')}
                className="p-2 hover:bg-editorial-light rounded-xl text-editorial-text cursor-pointer"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button 
                onClick={() => alert('Llamadas de video de NYLA integradas próximamente.')}
                className="p-2 hover:bg-editorial-light rounded-xl text-editorial-text cursor-pointer"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-editorial-light/10">
            {activeThread.messages.map((m) => (
              <div 
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-editorial-text/5 text-editorial-text flex items-center justify-center text-xs shrink-0">
                    {activeThread.isAI ? '🚀' : '👤'}
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

                  {/* Render contract UI block */}
                  {m.isContract && m.contractData && (
                    <div className="bg-editorial-bg p-5 rounded-2xl border border-editorial-border text-xs space-y-4">
                      <div className="flex items-center gap-2 text-editorial-text">
                        <FileText className="w-4 h-4" />
                        <span className="font-serif font-bold text-sm">Contrato de Colaboración Digital #{m.contractData.id}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-[11px] border-t border-b border-editorial-border py-3">
                        <div>
                          <p className="text-editorial-muted font-bold uppercase tracking-wider text-[9px]">Partes</p>
                          <p className="font-bold text-editorial-text mt-0.5">{m.contractData.parties}</p>
                        </div>
                        <div>
                          <p className="text-editorial-muted font-bold uppercase tracking-wider text-[9px]">Servicio</p>
                          <p className="font-bold text-editorial-text mt-0.5">{m.contractData.service}</p>
                        </div>
                        
                        {editingContractId === m.id ? (
                          <>
                            <div>
                              <p className="text-editorial-muted font-bold uppercase tracking-wider text-[9px]">Monto</p>
                              <input 
                                type="text"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="bg-white border border-editorial-border rounded-lg px-2 py-1 font-bold text-editorial-text w-full mt-0.5"
                              />
                            </div>
                            <div>
                              <p className="text-editorial-muted font-bold uppercase tracking-wider text-[9px]">Plazo</p>
                              <input 
                                type="text"
                                value={editDuration}
                                onChange={(e) => setEditDuration(e.target.value)}
                                className="bg-white border border-editorial-border rounded-lg px-2 py-1 font-bold text-editorial-text w-full mt-0.5"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <p className="text-editorial-muted font-bold uppercase tracking-wider text-[9px]">Monto</p>
                              <p className="font-bold text-editorial-text mt-0.5">{m.contractData.amount}</p>
                            </div>
                            <div>
                              <p className="text-editorial-muted font-bold uppercase tracking-wider text-[9px]">Plazo</p>
                              <p className="font-bold text-editorial-text mt-0.5">{m.contractData.duration}</p>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          m.contractData.status === 'accepted'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : m.contractData.status === 'modified'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {m.contractData.status === 'accepted' ? 'Firmado' : m.contractData.status === 'modified' ? 'Modificado' : 'Pendiente de firma'}
                        </span>

                        {m.contractData.status !== 'accepted' && (
                          <div className="flex gap-2 w-full sm:w-auto">
                            {editingContractId === m.id ? (
                              <button 
                                onClick={() => handleSaveEditContract(m.id)}
                                className="bg-editorial-text text-editorial-bg px-4 py-2 rounded-lg font-bold hover:opacity-95 transition-opacity cursor-pointer text-xs"
                              >
                                Guardar
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  setEditingContractId(m.id);
                                  setEditAmount(m.contractData?.amount || '');
                                  setEditDuration(m.contractData?.duration || '');
                                }}
                                className="border border-editorial-border text-editorial-text px-4 py-2 rounded-lg font-bold hover:bg-white transition-all cursor-pointer text-xs"
                              >
                                Modificar
                              </button>
                            )}
                            <button 
                              onClick={() => handleAcceptContract(m.id)}
                              className="bg-editorial-text text-editorial-bg px-4 py-2 rounded-lg font-bold hover:opacity-95 transition-opacity flex items-center gap-1 cursor-pointer text-xs"
                            >
                              <Check className="w-3.5 h-3.5" /> Aceptar Contrato
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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

          {/* Quick reply tags for AI thread */}
          {activeThread.isAI && (
            <div className="px-4 py-2 bg-editorial-bg/40 border-t border-editorial-border flex gap-2 overflow-x-auto">
              <button 
                onClick={() => {
                  setMsgInput('Por favor redacta una propuesta de contrato.');
                }}
                className="bg-white border border-editorial-border text-editorial-text px-3 py-1.5 rounded-full text-[10px] font-bold hover:bg-editorial-light transition-all whitespace-nowrap cursor-pointer"
              >
                📝 Redactar contrato
              </button>
              <button 
                onClick={() => {
                  setMsgInput('Buscar colaboradores para proyecto Frontend.');
                }}
                className="bg-white border border-editorial-border text-editorial-text px-3 py-1.5 rounded-full text-[10px] font-bold hover:bg-editorial-light transition-all whitespace-nowrap cursor-pointer"
              >
                👥 Buscar colaboradores
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-editorial-border bg-editorial-bg space-y-2">
            <div className="flex gap-2 items-center">
              <button 
                type="button" 
                onClick={() => alert('Sube documentos PDF, Word o imágenes para el análisis de la IA.')}
                className="p-2 hover:bg-editorial-light rounded-xl text-editorial-text cursor-pointer shrink-0"
                title="Adjuntar archivo"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button 
                type="button" 
                onClick={() => alert('Carga capturas de pantalla o mockups.')}
                className="p-2 hover:bg-editorial-light rounded-xl text-editorial-text cursor-pointer shrink-0"
                title="Subir imagen"
              >
                <Image className="w-5 h-5" />
              </button>
              
              <input 
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder={activeThread.isAI ? "Escribe un mensaje o pide ayuda a la AI..." : "Escribe un mensaje..."}
                className="flex-1 bg-editorial-light border-none rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-editorial-text focus:bg-white text-editorial-text placeholder-editorial-muted"
              />

              <button 
                type="button" 
                onClick={() => alert('Nota de voz próximamente.')}
                className="p-2 hover:bg-editorial-light rounded-xl text-editorial-text cursor-pointer shrink-0"
                title="Mensaje de voz"
              >
                <Mic className="w-5 h-5" />
              </button>

              <button 
                type="submit"
                className="p-3 bg-editorial-text text-editorial-bg rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-none active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {activeThread.isAI && (
              <p className="text-[9px] text-editorial-muted text-center flex items-center justify-center gap-1 leading-normal">
                <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                La IA de NYLA puede cometer errores. Por favor, revisa la información contractual antes de firmar.
              </p>
            )}
          </form>
        </div>

        {/* Right Details Panel */}
        <div className="hidden lg:flex flex-col bg-editorial-bg p-6 space-y-6 overflow-y-auto">
          {activeThread.isAI ? (
            <>
              <div className="space-y-2 text-center pb-4 border-b border-editorial-border">
                <div className="w-14 h-14 bg-editorial-text text-editorial-bg flex items-center justify-center text-2xl rounded-full mx-auto shadow-none">
                  🚀
                </div>
                <h4 className="font-serif font-bold text-sm text-editorial-text">NYLA AI Guide</h4>
                <p className="text-[10px] text-editorial-muted">Tu copiloto de desarrollo y contratos</p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-[9px] text-editorial-muted uppercase tracking-wider">Capacidades</h5>
                <ul className="space-y-2 text-xs text-editorial-text">
                  <li className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-editorial-text shrink-0" />
                    <span>Redactar contratos formales de colaboración</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-editorial-text shrink-0" />
                    <span>Evaluar habilidades y compatibilidad</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-editorial-text shrink-0" />
                    <span>Sugerir mejoras de código y UI/UX</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-4 border-t border-editorial-border">
                <h5 className="font-bold text-[9px] text-editorial-muted uppercase tracking-wider">Proyecto Actual</h5>
                <div className="space-y-2 bg-white p-4 rounded-[20px] border border-editorial-border shadow-none">
                  <p className="font-serif font-bold text-xs text-editorial-text">Fintech Revolution App</p>
                  <p className="text-[10px] text-editorial-muted">Rediseño del flujo de pagos</p>
                  <div className="w-full bg-editorial-light h-1 rounded-full overflow-hidden mt-2">
                    <div className="bg-editorial-text h-full w-[65%] rounded-full"></div>
                  </div>
                  <p className="text-[9px] font-bold text-editorial-text mt-1 text-right">65% completado</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-editorial-border">
                <h5 className="font-bold text-[9px] text-editorial-muted uppercase tracking-wider">Documentos Compartidos</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-editorial-border text-xs shadow-none">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-editorial-text" />
                      <span className="font-semibold text-editorial-text truncate max-w-[120px]">Brief_Final.pdf</span>
                    </div>
                    <button 
                      onClick={() => alert('Descargando archivo Brief_Final.pdf...')}
                      className="text-editorial-text p-1.5 hover:bg-editorial-light rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-editorial-border text-xs shadow-none">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-editorial-text" />
                      <span className="font-semibold text-editorial-text truncate max-w-[120px]">User_Flow.fig</span>
                    </div>
                    <button 
                      onClick={() => alert('Descargando archivo User_Flow.fig...')}
                      className="text-editorial-text p-1.5 hover:bg-editorial-light rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2 text-center pb-4 border-b border-editorial-border">
                <div className="w-14 h-14 rounded-full border border-editorial-border overflow-hidden mx-auto">
                  <img className="w-full h-full object-cover" referrerPolicy="no-referrer" src={activeThread.avatar} alt={activeThread.name} />
                </div>
                <h4 className="font-serif font-bold text-sm text-editorial-text">{activeThread.name}</h4>
                <button 
                  onClick={() => setView('perfil')}
                  className="text-[10px] text-editorial-text font-bold uppercase tracking-wider hover:underline"
                >
                  Ver Perfil de Talento
                </button>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-[9px] text-editorial-muted uppercase tracking-wider">Sobre el Colaborador</h5>
                <p className="text-xs text-editorial-text leading-relaxed">
                  Estudiante certificada por NYLA con excelente historial de entregas. Especialista en React.js, Figma y desarrollo full-stack.
                </p>
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
}
