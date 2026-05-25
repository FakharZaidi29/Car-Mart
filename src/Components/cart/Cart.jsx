import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  selectCartItems, selectSubtotal, selectCoupon, selectTotal,
  removeFromCart, increaseQty, decreaseQty,
  clearCart, applyCoupon, removeCoupon,
} from '../slices/cartSlice';

const VALID_COUPONS = {
  SAVE10:   { code: 'SAVE10',   discount: 0.10, label: '10% off' },
  LUXURY20: { code: 'LUXURY20', discount: 0.20, label: '20% off' },
  DRIVE5:   { code: 'DRIVE5',   discount: 0.05, label: '5% off'  },
};

const fmt = (n) =>
  'PKR ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const CarThumb = ({ image, name }) => (
  <div className="w-28 h-20 rounded-xl flex-shrink-0 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center text-3xl">
    {image
      ? <img src={image} alt={name} className="w-full h-full object-cover"
          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerText = '🚗'; }} />
      : '🚗'
    }
  </div>
);

const CartItem = ({ item, onRemove, onIncrease, onDecrease }) => {
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(item.id), 260);
  };

  return (
    <div className={`flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-zinc-700 last:border-0 transition-all duration-300 ${removing ? 'opacity-0 translate-x-4' : 'opacity-100'}`}>
      <CarThumb image={item.image} name={`${item.brand || item.make} ${item.name || item.model}`} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
          {item.brand || item.make} {item.name || item.model}
        </p>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
          {item.year} · {item.category || item.type || 'Car'}
        </p>
        <p className="text-blue-600 dark:text-blue-400 font-bold mt-1.5 text-sm">{fmt(item.price)}</p>
      </div>

      {/* Qty stepper */}
      <div className="flex items-center border border-gray-300 dark:border-zinc-600 rounded-xl overflow-hidden">
        <button
          onClick={() => onDecrease(item.id)}
          disabled={item.qty <= 1}
          className="w-9 h-9 flex items-center justify-center text-xl text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white disabled:text-gray-300 dark:disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors"
        >−</button>
        <span className="w-9 text-center text-sm font-semibold text-gray-900 dark:text-zinc-100">{item.qty}</span>
        <button
          onClick={() => onIncrease(item.id)}
          className="w-9 h-9 flex items-center justify-center text-xl text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >+</button>
      </div>

      {/* Line total */}
      <div className="min-w-[90px] text-right hidden sm:block">
        <p className="font-bold text-gray-900 dark:text-zinc-100 text-sm">{fmt(item.price * item.qty)}</p>
        {item.qty > 1 && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{fmt(item.price)} ea.</p>}
      </div>

      {/* Remove */}
      <button
        onClick={handleRemove}
        className="w-8 h-8 border border-gray-300 dark:border-zinc-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:text-red-400 hover:border-red-400 transition-all duration-150 flex-shrink-0"
      >✕</button>
    </div>
  );
};

const CouponInput = ({ coupon, dispatch }) => {
  const [code, setCode]       = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleApply = () => {
    const found = VALID_COUPONS[code.trim().toUpperCase()];
    if (found) {
      dispatch(applyCoupon(found));
      setSuccess(`${found.label} applied!`);
      setError('');
    } else {
      setError('Invalid coupon code.');
      setSuccess('');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCode(''); setError(''); setSuccess('');
  };

  if (coupon) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-2">
          <span>🏷️</span>
          <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">{coupon.code} — {coupon.label}</span>
        </div>
        <button onClick={handleRemoveCoupon} className="text-xs text-gray-400 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-white transition-colors">Remove</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={e => { setCode(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          placeholder="Enter coupon code"
          className={`flex-1 px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm border ${error ? 'border-red-500' : 'border-gray-300 dark:border-zinc-600'} focus:outline-none focus:border-blue-500 transition-colors font-mono placeholder-gray-400 dark:placeholder-zinc-500`}
        />
        <button
          onClick={handleApply}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors whitespace-nowrap"
        >Apply</button>
      </div>
      {error   && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
      {success && <p className="text-xs text-green-500 dark:text-green-400 mt-1.5">{success}</p>}
      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-2">Try: SAVE10 · LUXURY20 · DRIVE5</p>
    </div>
  );
};

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-5xl mb-6">🛒</div>
    <h2 className="text-3xl font-black text-gray-900 dark:text-zinc-100 mb-3">Your cart is empty</h2>
    <p className="text-gray-500 dark:text-zinc-400 text-base mb-8 max-w-sm leading-relaxed">
      Looks like you haven't added any cars yet. Browse our collection and find your dream ride.
    </p>
    <Link
      to="/shop"
      className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-7 py-3 rounded-xl text-sm font-semibold transition-colors"
    >Browse Cars →</Link>
  </div>
);

export default function Cart() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const items      = useSelector(selectCartItems);
  const subtotal   = useSelector(selectSubtotal);
  const total      = useSelector(selectTotal);
  const coupon     = useSelector(selectCoupon);
  const discount   = coupon ? subtotal * coupon.discount : 0;
  const TAX_RATE   = 0.08;
  const tax        = total * TAX_RATE;
  const grandTotal = total + tax;

  const [clearing, setClearing] = useState(false);

  const handleClear = () => {
    setClearing(true);
    setTimeout(() => { dispatch(clearCart()); setClearing(false); }, 300);
  };

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen text-gray-800 dark:text-zinc-200">

      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-2">
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-5">
          <Link to="/" className="hover:text-blue-500 transition-colors">Home</Link>
          <span>›</span>
          <Link to="/shop" className="hover:text-blue-500 transition-colors">Shop Cars</Link>
          <span>›</span>
          <span className="text-gray-500 dark:text-zinc-400">Cart</span>
        </nav>
        <div className="flex items-baseline gap-4 mb-8">
          <h1 className="text-4xl font-black text-gray-900 dark:text-zinc-100">Your Cart</h1>
          {items.length > 0 && (
            <span className="text-sm text-gray-400 dark:text-zinc-500 font-mono">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          {/* Main grid */}
          <div className="max-w-5xl mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* ── Left: Cart Items ── */}
            <div className={`transition-opacity duration-300 ${clearing ? 'opacity-30' : 'opacity-100'}`}>
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl overflow-hidden">
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-700">
                  <span className="text-sm text-gray-500 dark:text-zinc-400">
                    {items.length} vehicle{items.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleClear}
                    className="text-xs text-gray-400 dark:text-zinc-500 hover:text-red-400 transition-colors px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900"
                  >Clear all</button>
                </div>

                {/* Items list */}
                {items.map((item, i) => (
                  <div key={item.id} className='anim-fade-right' style={{ animationDelay: `${i * 0.08}s` }}>
                    <CartItem
                      item={item}
                      onRemove={id => dispatch(removeFromCart(id))}
                      onIncrease={id => dispatch(increaseQty(id))}
                      onDecrease={id => dispatch(decreaseQty(id))}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Link to="/shop" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  ← Continue shopping
                </Link>
              </div>
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-5">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-5">
                <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Coupon code</p>
                <CouponInput coupon={coupon} dispatch={dispatch} />
              </div>

              <div className="h-px bg-gray-100 dark:bg-zinc-700 my-3" />

              {/* Price rows */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-zinc-400">Subtotal</span>
                  <span className="text-gray-800 dark:text-zinc-200 font-medium">{fmt(subtotal)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between">
                    <span className="text-green-600 dark:text-green-400">Discount ({coupon.code})</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">− {fmt(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-zinc-400">Tax (8%)</span>
                  <span className="text-gray-800 dark:text-zinc-200 font-medium">{fmt(tax)}</span>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-zinc-700 my-4" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-zinc-100 text-base">Total</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{fmt(grandTotal)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-5 bg-blue-700 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base"
              >
                Proceed to Checkout →
              </button>

              {/* Trust signals */}
              <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
                {[['🔒','Secure payment'],['🛡️','5-yr warranty'],['🚚','Free delivery']].map(([icon, label]) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <span className="text-lg">{icon}</span>
                    <span className="text-xs text-gray-400 dark:text-zinc-500 text-center">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* You may also like */}
          <div className="max-w-5xl mx-auto px-6 pb-16">
            <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-4">You may also like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'r1', brand: 'Tesla',    name: 'Model S',  year: 2024, price: 8500000 },
                { id: 'r2', brand: 'Porsche',  name: 'Cayenne',  year: 2024, price: 12000000 },
                { id: 'r3', brand: 'Mercedes', name: 'C-Class',  year: 2023, price: 9500000 },
                { id: 'r4', brand: 'Audi',     name: 'Q7',       year: 2024, price: 11000000 },
              ].map(car => (
                <Link
                  to="/shop"
                  key={car.id}
                  className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:border-blue-500 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 no-underline"
                >
                  <div className="w-full h-16 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-3xl mb-3">🏎️</div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{car.brand} {car.name}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 mb-2">{car.year}</p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{fmt(car.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
