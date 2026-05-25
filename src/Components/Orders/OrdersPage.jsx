import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import {
    MdDirectionsCar, MdShoppingBag, MdCheckCircle,
    MdLocalShipping, MdPending, MdCancel, MdArrowForward,
} from 'react-icons/md';
import { FiClock } from 'react-icons/fi';

const fmt = (p) => `PKR ${Number(p).toLocaleString()}`;

const STATUS = {
    pending:    { label: 'Pending',    icon: MdPending,       color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-500/10',  border: 'border-amber-200 dark:border-amber-500/30'  },
    processing: { label: 'Processing', icon: FiClock,         color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-500/10',    border: 'border-blue-200 dark:border-blue-500/30'    },
    delivered:  { label: 'Delivered',  icon: MdCheckCircle,   color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-500/10',border:'border-emerald-200 dark:border-emerald-500/30'},
    cancelled:  { label: 'Cancelled',  icon: MdCancel,        color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-500/10',      border: 'border-red-200 dark:border-red-500/30'      },
};

const PAY_STATUS = {
    paid:    { label: 'Paid',    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
    pending: { label: 'Pending', color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' },
    failed:  { label: 'Failed',  color: 'text-red-600 bg-red-50 dark:bg-red-500/10' },
};

function OrderCard({ order }) {
    const snap   = order.carSnapshot || {};
    const status = STATUS[order.status] || STATUS.pending;
    const pay    = PAY_STATUS[order.payment?.status] || PAY_STATUS.pending;
    const Icon   = status.icon;
    const date   = new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className='bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200'>
            <div className='flex flex-col sm:flex-row'>
                {/* Car image */}
                <div className='w-full sm:w-40 h-36 sm:h-auto flex-shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 relative'>
                    {snap.image ? (
                        <img src={snap.image} alt={`${snap.make} ${snap.model}`}
                            className='w-full h-full object-cover' />
                    ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                            <MdDirectionsCar className='text-white/10 text-6xl' />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className='flex-1 p-5'>
                    <div className='flex flex-wrap items-start justify-between gap-3 mb-3'>
                        <div>
                            <p className='text-xs text-gray-400 dark:text-zinc-500 mb-0.5'>Order ID</p>
                            <p className='font-black text-gray-900 dark:text-zinc-100 text-sm'>{order.orderId}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${status.bg} ${status.border} ${status.color}`}>
                            <Icon className='text-sm' /> {status.label}
                        </div>
                    </div>

                    <h3 className='text-base font-black text-gray-900 dark:text-zinc-100 mb-1'>
                        {snap.make} {snap.model} {snap.year && `(${snap.year})`}
                    </h3>

                    <div className='flex flex-wrap gap-4 mt-3 text-xs text-gray-500 dark:text-zinc-400'>
                        <span className='flex items-center gap-1'><FiClock className='text-amber-500' /> {date}</span>
                        <span className='flex items-center gap-1'>
                            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${pay.color}`}>{pay.label}</span>
                            via {order.payment?.method || 'card'}
                        </span>
                    </div>
                </div>

                {/* Price + action */}
                <div className='flex sm:flex-col items-center sm:items-end justify-between sm:justify-between p-5 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-zinc-700 sm:min-w-[140px]'>
                    <div className='text-right'>
                        <p className='text-xs text-gray-400 dark:text-zinc-500 mb-0.5'>Total</p>
                        <p className='text-lg font-black text-amber-600'>{fmt(order.totalAmount)}</p>
                    </div>
                    {snap && order.car && (
                        <Link to={`/car/${order.car}`}
                            className='flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors mt-3'>
                            View Car <MdArrowForward />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function OrdersPage() {
    const [orders,  setOrders]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        api.getMyOrders()
            .then(data => setOrders(data.orders || []))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-zinc-950 py-10 px-4'>
            <div className='max-w-3xl mx-auto'>

                {/* Header */}
                <div className='flex items-center gap-3 mb-8'>
                    <div className='w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30'>
                        <MdShoppingBag className='text-white text-2xl' />
                    </div>
                    <div>
                        <h1 className='text-2xl font-black text-gray-900 dark:text-zinc-100'>My Orders</h1>
                        <p className='text-sm text-gray-500 dark:text-zinc-400'>Track your car purchases</p>
                    </div>
                </div>

                {loading ? (
                    <div className='space-y-4'>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className='bg-white dark:bg-zinc-800 rounded-2xl h-36 animate-pulse border border-gray-100 dark:border-zinc-700' />
                        ))}
                    </div>
                ) : error ? (
                    <div className='text-center py-16'>
                        <p className='text-red-500 text-sm mb-3'>{error}</p>
                        <button onClick={() => window.location.reload()}
                            className='text-amber-600 font-semibold text-sm hover:underline'>Try again</button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className='text-center py-20'>
                        <MdShoppingBag className='text-gray-200 dark:text-zinc-700 text-8xl mx-auto mb-4' />
                        <h2 className='text-xl font-black text-gray-700 dark:text-zinc-300 mb-2'>No orders yet</h2>
                        <p className='text-gray-400 dark:text-zinc-500 text-sm mb-6'>You haven&apos;t placed any orders. Browse cars and find your dream ride!</p>
                        <Link to='/shop'
                            className='inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-amber-500/30'>
                            Browse Cars <MdArrowForward />
                        </Link>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        <p className='text-sm text-gray-400 dark:text-zinc-500 mb-2'>{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
                        {orders.map(order => <OrderCard key={order._id} order={order} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
