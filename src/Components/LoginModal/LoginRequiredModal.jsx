import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdClose, MdLock, MdDirectionsCar, MdStorefront } from 'react-icons/md';
import { FiArrowRight } from 'react-icons/fi';

const COPY = {
  cart:         { title: 'Login to Add to Cart',    sub: 'Sign in to save cars to your cart, track orders, and enjoy a seamless buying experience.' },
  sell:         { title: 'Login to List Your Car',  sub: 'Create a free account to list your car and reach 50,000+ buyers across Pakistan.' },
  'seller-only':{ title: 'Seller Account Required', sub: 'You\'re logged in as a Customer. Only Seller accounts can list cars. Create a new account and choose the Seller role.' },
};

export default function LoginRequiredModal({ onClose, reason = 'cart' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from     = location.pathname;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const copy        = COPY[reason] ?? COPY.cart;
  const isSellerOnly = reason === 'seller-only';

  return (
    <div
      className='fixed inset-0 z-[999] flex items-center justify-center px-4'
      onClick={onClose}
    >
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' />

      <div
        className='anim-scale-in relative bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden'
        onClick={e => e.stopPropagation()}
      >
        <div className='h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-500' />

        <button
          onClick={onClose}
          className='absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors'
        >
          <MdClose className='text-base' />
        </button>

        <div className='px-7 pt-8 pb-7'>
          <div className='relative w-20 h-20 mx-auto mb-5'>
            <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30'>
              {isSellerOnly
                ? <MdStorefront className='text-white text-4xl' />
                : <MdDirectionsCar className='text-white text-4xl' />
              }
            </div>
            <div className='absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-red-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center'>
              <MdLock className='text-white text-sm' />
            </div>
          </div>

          <h2 className='text-xl font-black text-gray-900 dark:text-zinc-100 text-center mb-2'>
            {copy.title}
          </h2>
          <p className='text-sm text-gray-500 dark:text-zinc-400 text-center leading-relaxed mb-7'>
            {copy.sub}
          </p>

          {isSellerOnly ? (
            <>
              <button
                onClick={() => { onClose(); navigate('/login', { state: { from } }); }}
                className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 mb-3'
              >
                Create Seller Account <FiArrowRight />
              </button>
              <p onClick={onClose} className='text-center text-xs text-gray-400 dark:text-zinc-500 mt-2 cursor-pointer hover:text-gray-600 dark:hover:text-zinc-300 transition-colors'>
                Cancel
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => { onClose(); navigate('/login', { state: { from } }); }}
                className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 mb-3'
              >
                Sign In <FiArrowRight />
              </button>
              <button
                onClick={() => { onClose(); navigate('/login', { state: { from } }); }}
                className='w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm'
              >
                Create Free Account
              </button>
              <p onClick={onClose} className='text-center text-xs text-gray-400 dark:text-zinc-500 mt-4 cursor-pointer hover:text-gray-600 dark:hover:text-zinc-300 transition-colors'>
                Continue browsing
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
