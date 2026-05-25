import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectToasts, removeToast } from '../slices/toastSlice';
import { MdCheckCircle, MdError, MdInfo, MdWarning, MdClose } from 'react-icons/md';

const CONFIG = {
  success: { icon: MdCheckCircle, bg: 'bg-emerald-500', bar: 'bg-emerald-300' },
  error:   { icon: MdError,       bg: 'bg-red-500',     bar: 'bg-red-300'     },
  info:    { icon: MdInfo,        bg: 'bg-blue-500',    bar: 'bg-blue-300'    },
  warning: { icon: MdWarning,     bg: 'bg-amber-500',   bar: 'bg-amber-300'   },
};

const DURATION = 3500;

function ToastItem({ toast }) {
  const dispatch = useDispatch();
  const cfg = CONFIG[toast.type] || CONFIG.success;
  const Icon = cfg.icon;

  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToast(toast.id)), DURATION);
    return () => clearTimeout(t);
  }, [toast.id, dispatch]);

  return (
    <div className={`relative flex items-start gap-3 ${cfg.bg} text-white px-4 py-3 rounded-2xl shadow-xl min-w-[260px] max-w-[340px] overflow-hidden anim-slide-in`}>
      <Icon className='text-xl flex-shrink-0 mt-0.5' />
      <p className='text-sm font-semibold flex-1 leading-snug'>{toast.message}</p>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className='flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity'
      >
        <MdClose className='text-base' />
      </button>
      {/* Progress bar */}
      <span
        className={`absolute bottom-0 left-0 h-1 ${cfg.bar} rounded-b-2xl`}
        style={{ animation: `toast-bar ${DURATION}ms linear forwards` }}
      />
    </div>
  );
}

export default function Toast() {
  const toasts = useSelector(selectToasts);
  return (
    <div className='fixed top-20 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none'>
      {toasts.map(t => (
        <div key={t.id} className='pointer-events-auto'>
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
