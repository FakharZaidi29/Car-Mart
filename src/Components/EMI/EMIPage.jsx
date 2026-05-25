import { useState } from 'react';
import { MdCalculate } from 'react-icons/md';

function calcEMI(price, down, years, rate) {
    const P = price - down;
    if (P <= 0 || years <= 0 || rate <= 0) return 0;
    const r = rate / 100 / 12;
    const n = years * 12;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const fmt = (n) => `PKR ${Math.round(n).toLocaleString()}`;

export default function EMIPage() {
    const [price, setPrice] = useState(3000000);
    const [down,  setDown]  = useState(600000);
    const [years, setYears] = useState(3);
    const [rate,  setRate]  = useState(20);

    const monthly  = calcEMI(price, down, years, rate);
    const total    = monthly * years * 12;
    const interest = total - (price - down);

    const maxDown = Math.round(price * 0.7);

    const handlePrice = (val) => {
        const p = Number(val);
        setPrice(p);
        setDown(Math.min(down, Math.round(p * 0.7)));
    };

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-zinc-950 py-10 px-4'>
            <div className='max-w-xl mx-auto'>

                {/* Header */}
                <div className='flex items-center gap-3 mb-8'>
                    <div className='w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30'>
                        <MdCalculate className='text-white text-2xl' />
                    </div>
                    <div>
                        <h1 className='text-2xl font-black text-gray-900 dark:text-zinc-100'>EMI Calculator</h1>
                        <p className='text-sm text-gray-500 dark:text-zinc-400'>Estimate your monthly car payments</p>
                    </div>
                </div>

                <div className='bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-700 shadow-sm p-6 space-y-6'>

                    {/* Car Price */}
                    <div>
                        <div className='flex justify-between mb-2'>
                            <label className='text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider'>Car Price</label>
                            <span className='text-xs font-bold text-amber-600'>{fmt(price)}</span>
                        </div>
                        <input type='range' min={500000} max={20000000} step={100000}
                            value={price} onChange={e => handlePrice(e.target.value)}
                            className='w-full accent-amber-500 mb-1' />
                        <div className='flex justify-between text-xs text-gray-400 dark:text-zinc-500'>
                            <span>PKR 5L</span><span>PKR 2Cr</span>
                        </div>
                    </div>

                    {/* Down Payment */}
                    <div>
                        <div className='flex justify-between mb-2'>
                            <label className='text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider'>Down Payment</label>
                            <span className='text-xs font-bold text-amber-600'>{Math.round((down / price) * 100)}% — {fmt(down)}</span>
                        </div>
                        <input type='range' min={0} max={maxDown} step={50000}
                            value={down} onChange={e => setDown(Number(e.target.value))}
                            className='w-full accent-amber-500 mb-1' />
                        <div className='flex justify-between text-xs text-gray-400 dark:text-zinc-500'>
                            <span>PKR 0</span><span>{fmt(maxDown)}</span>
                        </div>
                    </div>

                    {/* Loan Term */}
                    <div>
                        <div className='flex justify-between mb-3'>
                            <label className='text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider'>Loan Term</label>
                            <span className='text-xs font-bold text-amber-600'>{years} year{years > 1 ? 's' : ''}</span>
                        </div>
                        <div className='flex gap-2'>
                            {[1, 2, 3, 4, 5].map(y => (
                                <button key={y} onClick={() => setYears(y)}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        years === y
                                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                                    }`}
                                >{y}yr</button>
                            ))}
                        </div>
                    </div>

                    {/* Interest Rate */}
                    <div>
                        <div className='flex justify-between mb-2'>
                            <label className='text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider'>Interest Rate</label>
                            <span className='text-xs font-bold text-amber-600'>{rate}% p.a.</span>
                        </div>
                        <input type='range' min={10} max={30} step={0.5}
                            value={rate} onChange={e => setRate(Number(e.target.value))}
                            className='w-full accent-amber-500' />
                        <div className='flex justify-between text-xs text-gray-400 dark:text-zinc-500 mt-1'>
                            <span>10%</span><span>30%</span>
                        </div>
                    </div>

                    {/* Result */}
                    <div className='bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-2xl p-5 border border-amber-200 dark:border-amber-500/30'>
                        <p className='text-xs text-amber-700 dark:text-amber-400 uppercase font-bold tracking-wider mb-2'>Monthly Payment</p>
                        <p className='text-5xl font-black text-amber-600 mb-5'>{fmt(monthly)}</p>
                        <div className='grid grid-cols-2 gap-3 text-xs'>
                            <div className='bg-white dark:bg-zinc-800 rounded-xl p-3'>
                                <p className='text-gray-400 dark:text-zinc-500 mb-0.5'>Loan Amount</p>
                                <p className='font-bold text-gray-800 dark:text-zinc-100'>{fmt(price - down)}</p>
                            </div>
                            <div className='bg-white dark:bg-zinc-800 rounded-xl p-3'>
                                <p className='text-gray-400 dark:text-zinc-500 mb-0.5'>Total Interest</p>
                                <p className='font-bold text-red-500'>{fmt(interest)}</p>
                            </div>
                            <div className='bg-white dark:bg-zinc-800 rounded-xl p-3'>
                                <p className='text-gray-400 dark:text-zinc-500 mb-0.5'>Down Payment</p>
                                <p className='font-bold text-gray-800 dark:text-zinc-100'>{fmt(down)}</p>
                            </div>
                            <div className='bg-white dark:bg-zinc-800 rounded-xl p-3'>
                                <p className='text-gray-400 dark:text-zinc-500 mb-0.5'>Total Payable</p>
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
