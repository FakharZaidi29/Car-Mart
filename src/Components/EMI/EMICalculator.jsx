import { useState, useEffect } from 'react';
import { MdClose, MdCalculate } from 'react-icons/md';
import { FiDollarSign } from 'react-icons/fi';

function calc(price, down, years, rate) {
  const P = price - down;
  if (P <= 0 || years <= 0 || rate <= 0) return 0;
  const r = rate / 100 / 12;
  const n = years * 12;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const fmt = (n) => `PKR ${Math.round(n).toLocaleString()}`;

export default function EMICalculator({ price, onClose }) {
  const [down,  setDown]  = useState(Math.round(price * 0.2));
  const [years, setYears] = useState(3);
  const [rate,  setRate]  = useState(20);

  const monthly  = calc(price, down, years, rate);
  const total    = monthly * years * 12;
  const interest = total - (price - down);

  return (
    <div className='fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm' onClick={onClose}>
      <div
        className='anim-scale-in w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <MdCalculate className='text-white text-2xl' />
            <div>
              <p className='text-white font-black text-base'>EMI Calculator</p>
              <p className='text-white/70 text-xs'>Estimate your monthly payments</p>
            </div>
          </div>
          <button onClick={onClose} className='w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors'>
            <MdClose className='text-white' />
          </button>
        </div>

        <div className='p-6 space-y-5'>
          {/* Car Price (read-only) */}
          <div>
            <label className='block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2'>Car Price</label>
            <div className='px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 font-bold text-sm'>
              {fmt(price)}
            </div>
          </div>

          {/* Down Payment */}
          <div>
            <div className='flex justify-between mb-2'>
              <label className='text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider'>Down Payment</label>
              <span className='text-xs font-bold text-amber-600'>{Math.round((down / price) * 100)}%</span>
            </div>
            <input
              type='range' min={0} max={price * 0.7} step={50000}
              value={down} onChange={e => setDown(Number(e.target.value))}
              className='w-full accent-amber-500 mb-1'
            />
            <div className='flex justify-between text-xs text-gray-400 dark:text-zinc-500'>
              <span>PKR 0</span>
              <span className='font-semibold text-gray-700 dark:text-zinc-200'>{fmt(down)}</span>
              <span>{fmt(price * 0.7)}</span>
            </div>
          </div>

          {/* Loan Term */}
          <div>
            <div className='flex justify-between mb-2'>
              <label className='text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider'>Loan Term</label>
              <span className='text-xs font-bold text-amber-600'>{years} year{years > 1 ? 's' : ''}</span>
            </div>
            <div className='flex gap-2'>
              {[1, 2, 3, 4, 5].map(y => (
                <button key={y} onClick={() => setYears(y)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    years === y
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                  }`}
                >
                  {y}yr
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className='flex justify-between mb-2'>
              <label className='text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider'>Interest Rate</label>
              <span className='text-xs font-bold text-amber-600'>{rate}% p.a.</span>
            </div>
            <input
              type='range' min={10} max={30} step={0.5}
              value={rate} onChange={e => setRate(Number(e.target.value))}
              className='w-full accent-amber-500'
            />
            <div className='flex justify-between text-xs text-gray-400 dark:text-zinc-500 mt-1'>
              <span>10%</span><span>30%</span>
            </div>
          </div>

          {/* Result */}
          <div className='bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-2xl p-5 border border-amber-200 dark:border-amber-500/30'>
            <p className='text-xs text-amber-700 dark:text-amber-400 uppercase font-bold tracking-wider mb-2'>Monthly Payment</p>
            <p className='text-4xl font-black text-amber-600 mb-4'>{fmt(monthly)}</p>
            <div className='grid grid-cols-2 gap-3 text-xs'>
              <div className='bg-white dark:bg-zinc-800 rounded-xl p-3'>
                <p className='text-gray-400 dark:text-zinc-500 mb-0.5'>Principal</p>
                <p className='font-bold text-gray-800 dark:text-zinc-100'>{fmt(price - down)}</p>
              </div>
              <div className='bg-white dark:bg-zinc-800 rounded-xl p-3'>
                <p className='text-gray-400 dark:text-zinc-500 mb-0.5'>Total Interest</p>
                <p className='font-bold text-red-500'>{fmt(interest)}</p>
              </div>
              <div className='bg-white dark:bg-zinc-800 rounded-xl p-3 col-span-2'>
                <p className='text-gray-400 dark:text-zinc-500 mb-0.5'>Total Amount Payable</p>
                <p className='font-bold text-gray-800 dark:text-zinc-100'>{fmt(down + total)}</p>
              </div>
            </div>
          </div>

          <p className='text-xs text-gray-400 dark:text-zinc-600 text-center'>
            * Estimate only. Actual rates vary by bank and credit profile.
          </p>
        </div>
      </div>
    </div>
  );
}
