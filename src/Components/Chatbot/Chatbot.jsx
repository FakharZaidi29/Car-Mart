import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCar } from '../slices/carsSlice';
import { selectCartItems } from '../slices/cartSlice';
import { selectUser } from '../slices/authSlice';
import { MdClose, MdSend } from 'react-icons/md';
import { BsRobot } from 'react-icons/bs';
import { HiSparkles } from 'react-icons/hi2';
import { api } from '../../api';

const INITIAL_MESSAGE = {
  id: 1,
  role: 'assistant',
  text: "Salam! 👋 Main CarMart AI hoon — aapki madad ke liye yahan hoon. Koi bhi car dhundhna ho, price check karni ho, ya buying process samajhni ho — poochh lijiye!",
  time: getTime(),
};

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function TypingDots() {
  return (
    <div className='flex items-center gap-1.5 px-4 py-3.5'>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className='w-2 h-2 rounded-full bg-amber-400 animate-bounce'
          style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.7s' }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  // Render line breaks
  const lines = msg.text.split('\n');
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {!isUser && (
        <div className='w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-sm'>
          <BsRobot className='text-white text-xs' />
        </div>
      )}
      <div className={`max-w-[80%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-sm'
            : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 rounded-tl-sm'
        }`}>
          {lines.map((line, i) => (
            <span key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </div>
        <span className='text-[10px] text-gray-400 dark:text-zinc-600 px-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          {msg.time}
        </span>
      </div>
    </div>
  );
}

export default function Chatbot() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input,    setInput]    = useState('');
  const [typing,   setTyping]   = useState(false);
  const [unread,   setUnread]   = useState(0);
  const [error,    setError]    = useState('');

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const sendRef   = useRef(null);

  const location   = useLocation();
  const currentCar = useSelector(selectCar);
  const cartItems  = useSelector(selectCartItems);
  const user       = useSelector(selectUser);

  // Context to pass to AI
  const pageContext = useMemo(() => ({
    page: location.pathname,
    car: currentCar
      ? `${currentCar.year} ${currentCar.make} ${currentCar.model} — PKR ${Number(currentCar.price).toLocaleString()}, ${currentCar.fuel}, ${currentCar.transmission}${currentCar.mileage ? `, ${Number(currentCar.mileage).toLocaleString()} km` : ''}${currentCar.seller?.city ? `, ${currentCar.seller.city}` : ''}`
      : null,
    cartCount: cartItems.length || null,
    user: user ? `${user.name} (${user.role})` : 'Guest',
  }), [location.pathname, currentCar, cartItems.length, user]);

  // Context-aware quick suggestions
  const suggestions = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/car/') && currentCar) return [
      `Is PKR ${Number(currentCar.price).toLocaleString()} fair for this car? 💰`,
      `${currentCar.make} ${currentCar.model} ke pros & cons? 📋`,
      'Similar cars show karo 🔍',
    ];
    if (p.startsWith('/shop')) return [
      'Budget 25 lakh family car 👨‍👩‍👧',
      'Fuel efficient options 🌿',
      'Honda vs Toyota comparison 🔄',
    ];
    if (p === '/cart') return [
      'Kya yeh good deal hai? 🤔',
      'EMI calculate karo 📊',
      'Better alternatives? 🔄',
    ];
    if (p === '/sell') return [
      'Apni car ki sahi price kya? 💡',
      'Selling tips Pakistan mein 📈',
      'Documents ki list 📋',
    ];
    return [
      'Mujhe car dhundhne mein help karo 🚗',
      'Under 30 lakh best options 💰',
      'CarMart kaise kaam karta hai? 📋',
    ];
  }, [location.pathname, currentCar]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setError('');
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const send = useCallback(async (prefillText) => {
    const text = (prefillText ?? input).trim();
    if (!text || typing) return;
    if (!prefillText) setInput('');
    setError('');

    const userMsg = { id: Date.now(), role: 'user', text, time: getTime() };

    // Build API history from current messages BEFORE adding new one
    const apiHistory = messages
      .filter((m, i) => i > 0) // skip initial greeting
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
    apiHistory.push({ role: 'user', content: text });

    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const data = await api.aiChat(apiHistory, pageContext);
      const botMsg = { id: Date.now() + 1, role: 'assistant', text: data.reply, time: getTime() };
      setMessages(prev => [...prev, botMsg]);
      if (!open) setUnread(u => u + 1);
    } catch (err) {
      setError(err.message?.includes('API key') ? 'AI key not configured — add GROQ_API_KEY in backend .env' : 'AI unavailable. Please try again.');
    } finally {
      setTyping(false);
    }
  }, [messages, input, typing, open, pageContext]);

  // Keep ref fresh so event listener can call latest send
  useEffect(() => { sendRef.current = send; }, [send]);

  // Listen for "Ask AI about this car" from other pages
  useEffect(() => {
    const handler = (e) => {
      setOpen(true);
      if (e.detail?.message) {
        setTimeout(() => sendRef.current(e.detail.message), 400);
      }
    };
    window.addEventListener('open-carmart-ai', handler);
    return () => window.removeEventListener('open-carmart-ai', handler);
  }, []);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => setMessages([INITIAL_MESSAGE]);

  return (
    <>
      {/* ── Chat Window ── */}
      <div className={`fixed bottom-24 right-5 sm:right-6 w-[calc(100vw-40px)] sm:w-[390px] z-50 transition-all duration-300 origin-bottom-right ${
        open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
      }`}>
        <div className='flex flex-col h-[540px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden'>

          {/* Header */}
          <div className='bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 flex items-center justify-between flex-shrink-0'>
            <div className='flex items-center gap-3'>
              <div className='relative'>
                <div className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center'>
                  <BsRobot className='text-white text-xl' />
                </div>
                <span className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-amber-500 rounded-full' />
              </div>
              <div>
                <p className='text-white font-black text-sm leading-tight flex items-center gap-1.5'>
                  CarMart AI <HiSparkles className='text-yellow-200 text-xs' />
                </p>
                <p className='text-white/75 text-xs'>Powered by Claude · Always online</p>
              </div>
            </div>
            <div className='flex gap-1.5'>
              <button
                onClick={clearChat}
                title='Clear chat'
                className='w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors text-white/80 text-xs font-bold'
              >
                ↺
              </button>
              <button
                onClick={() => setOpen(false)}
                className='w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors'
              >
                <MdClose className='text-white text-lg' />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700'>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

            {typing && (
              <div className='flex justify-start'>
                <div className='w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mr-2 mt-1'>
                  <BsRobot className='text-white text-xs' />
                </div>
                <div className='bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm'>
                  <TypingDots />
                </div>
              </div>
            )}

            {error && (
              <div className='text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl px-3 py-2'>
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestions */}
          <div className='px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0'>
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => { setInput(s); inputRef.current?.focus(); }}
                className='flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-amber-300 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors whitespace-nowrap'
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className='px-4 pb-4 pt-2 flex-shrink-0'>
            <div className='flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-2xl px-4 py-2.5 border border-gray-200 dark:border-zinc-700 focus-within:border-amber-400 dark:focus-within:border-amber-500 transition-colors'>
              <input
                ref={inputRef}
                type='text'
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder='Kuch bhi poochein...'
                className='flex-1 bg-transparent text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none'
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || typing}
                className='w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center disabled:opacity-40 hover:scale-105 active:scale-95 transition-all flex-shrink-0 shadow-sm'
              >
                <MdSend className='text-white text-sm' />
              </button>
            </div>
            <p className='text-center text-[10px] text-gray-300 dark:text-zinc-700 mt-1.5'>
              Powered by Claude AI · CarMart Assistant
            </p>
          </div>
        </div>
      </div>

      {/* ── FAB Button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-5 right-5 sm:right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-50 transition-all duration-300 hover:scale-110 active:scale-95 ${
          open
            ? 'bg-gray-200 dark:bg-zinc-700'
            : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/40'
        }`}
        title='Chat with CarMart AI'
      >
        {open
          ? <MdClose className='text-gray-700 dark:text-white text-2xl' />
          : <HiSparkles className='text-white text-2xl' />
        }
        {!open && unread > 0 && (
          <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce'>
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
