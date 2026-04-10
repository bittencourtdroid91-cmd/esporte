import { useState } from 'react';
import { Send, Bot, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { DailyLog, Protocol } from '../types';
import { cn } from '../lib/utils';

interface AIAssistantProps {
  protocol: Protocol;
  recentLogs: DailyLog[];
}

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export default function AIAssistant({ protocol, recentLogs }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', content: 'Ola! Sou sua assistente do protocolo. Posso revisar sintomas, refeicoes e adesao diaria.' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          protocol,
          recentLogs,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao consultar assistente');
      }

      const payload = await response.json();
      setMessages((prev) => [...prev, { role: 'bot', content: payload.text || 'Sem resposta do assistente.' }]);
    } catch (error) {
      const fallback = import.meta.env.VITE_API_BASE_URL
        ? 'Erro ao conectar com API do assistente.'
        : 'Configure VITE_API_BASE_URL apontando para sua API na Vercel para habilitar IA segura.';
      setMessages((prev) => [...prev, { role: 'bot', content: fallback }]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary-container text-white shadow-xl flex items-center justify-center z-40 hover:scale-105 transition-transform"
      >
        <Bot size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed inset-0 z-50 flex flex-col bg-background md:inset-auto md:bottom-24 md:right-6 md:w-96 md:h-[600px] md:rounded-2xl md:shadow-2xl overflow-hidden border border-on-surface/10"
          >
            <div className="p-4 bg-surface-container flex justify-between items-center border-b border-on-surface/10">
              <div className="flex items-center gap-2">
                <Bot className="text-primary" />
                <span className="font-bold">Assistente Vitalis</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-on-surface/10 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((m, index) => (
                <div key={`${m.role}-${index}`} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[80%] p-3 rounded-2xl text-sm',
                      m.role === 'user' ? 'bg-primary-container text-white rounded-tr-none' : 'bg-surface-container-high text-on-surface rounded-tl-none'
                    )}
                  >
                    <div className="prose prose-invert prose-sm">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-high p-3 rounded-2xl rounded-tl-none">
                    <Loader2 className="animate-spin text-primary" size={20} />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-surface-container border-t border-on-surface/10 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSend()}
                placeholder="Pergunte sobre seu protocolo..."
                className="flex-1 bg-surface-container-low border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-primary"
              />
              <button onClick={handleSend} disabled={isLoading} className="p-2 bg-primary-container text-white rounded-full disabled:opacity-50">
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
