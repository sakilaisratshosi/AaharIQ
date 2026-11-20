import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  Bot,
  User,
  Lightbulb,
  AlertCircle,
  Database,
} from 'lucide-react';

const STARTER_PROMPTS = [
  {
    en: 'Compare the nutrition of Hilsa (Ilish) vs Rohu fish using Bangladesh Food Composition data.',
    bn: 'বাংলাদেশ খাদ্য তালিকা অনুযায়ী ইলিশ ও রুই মাছের পুষ্টিমান তুলনা করুন।',
  },
  {
    en: 'What food testing parameters does BFSA list for fish or leafy vegetables?',
    bn: 'মাছ বা শাকসবজির জন্য BFSA ল্যাবরেটরিতে কোন কোন পরীক্ষার কথা বলা হয়েছে?',
  },
  {
    en: 'How should I store leftover cooked rice and spinach safely to prevent food waste?',
    bn: 'বেঁচে যাওয়া ভাত ও শাক অপচয় রোধে কীভাবে নিরাপদে সংরক্ষণ করবো?',
  },
  {
    en: 'Explain the difference between Use-By and Best-Before dates on packaged foods.',
    bn: 'প্যাকেটজাত খাবারে Use-By এবং Best-Before তারিখের পার্থক্য বুঝিয়ে বলুন।',
  },
];

export const GeminiAssistantView: React.FC = () => {
  const { language, t, chatHistory, addChatMessage, clearChatHistory, showNotification } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    setInputMessage('');
    setError(null);
    addChatMessage({ role: 'user', content: text });
    setLoading(true);

    try {
      const payloadMessages = chatHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      payloadMessages.push({ role: 'user', content: text });

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch assistant response.');

      addChatMessage({
        role: 'assistant',
        content: data.reply,
        groundedSources: Array.isArray(data.groundedSources) ? data.groundedSources : undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Error communicating with AaharIQ Food Assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showNotification(language === 'bn' ? 'ক্লিপবোর্ডে কপি হয়েছে' : 'Copied to clipboard');
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-300">
              <Database className="w-3.5 h-3.5" />
              <span>
                {language === 'bn'
                  ? 'INFS বাংলাদেশ খাদ্য তালিকা ও BFSA তথ্যসূত্রে সমন্বিত'
                  : 'Grounded in INFS Bangladesh FCTB & BFSA Safety References'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              AaharIQ {t.aiAssistant}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {language === 'bn'
                ? 'খাদ্যের পুষ্টি, ফুড লেবেল, অপচয় রোধ, খাদ্য সংরক্ষণ এবং BFSA নিরাপত্তা তথ্য সম্পর্কে প্রশ্ন করুন।'
                : 'Ask grounded questions on local foods, macro & micronutrients, storage shelf-life, waste reduction, and BFSA lab guidance.'}
            </p>
          </div>

          {chatHistory.length > 0 && (
            <button
              type="button"
              onClick={clearChatHistory}
              className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors border border-white/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearChat}</span>
            </button>
          )}
        </div>
      </div>

      {/* Clinical / Lab Boundary Notice */}
      <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start space-x-2.5">
        <ShieldCheck className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
        <p className="leading-relaxed text-[11px] text-stone-700">
          <strong>{language === 'bn' ? 'সতর্কবার্তা:' : 'Important Boundary:'}</strong>{' '}
          {t.assistantDisclaimer}
        </p>
      </div>

      {/* Suggested Starter Prompts */}
      {chatHistory.length <= 1 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'bn' ? 'প্রস্তাবিত প্রশ্নসমূহ:' : 'Try Asking About:'}</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(language === 'bn' ? prompt.bn : prompt.en)}
                className="p-3 text-left bg-white hover:bg-emerald-50/60 rounded-2xl border border-stone-200 hover:border-emerald-300 text-xs font-medium text-stone-800 transition-all shadow-sm leading-relaxed"
              >
                "{language === 'bn' ? prompt.bn : prompt.en}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Log */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-emerald-950/10 shadow-sm min-h-[420px] max-h-[620px] overflow-y-auto space-y-4">
        {chatHistory.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  isUser
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-sm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#1B4332] text-white rounded-tr-none'
                    : 'bg-stone-50 text-stone-800 border border-stone-200/80 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {!isUser && msg.groundedSources && msg.groundedSources.length > 0 && (
                  <div className="pt-2 border-t border-stone-200/70 text-[11px] text-emerald-800 flex flex-wrap items-center gap-1.5">
                    <Database className="w-3 h-3 shrink-0" />
                    <span className="font-bold">
                      {language === 'bn' ? 'তথ্যসূত্র:' : 'Grounded in:'}
                    </span>
                    <span className="text-stone-600">{msg.groundedSources.join(' · ')}</span>
                  </div>
                )}

                <div
                  className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                    isUser
                      ? 'border-white/20 text-emerald-200/70'
                      : 'border-stone-200/60 text-stone-400'
                  }`}
                >
                  <span className="font-mono-num">{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="p-1 hover:text-stone-700"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500 flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{t.loading}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-2 bg-white rounded-2xl p-2 shadow-lg border border-emerald-950/10"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={t.askAssistantPrompt}
          className="flex-1 px-4 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 disabled:opacity-40"
        >
          <span>{t.send}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
