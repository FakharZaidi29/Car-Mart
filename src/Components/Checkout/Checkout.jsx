import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCartItems, selectSubtotal, selectCoupon, selectTotal,
  clearCart,
} from '../slices/cartSlice';
import { selectUser } from '../slices/authSlice';
import { addToast } from '../slices/toastSlice';
import { api } from '../../api';
import {
  MdDirectionsCar, MdCheckCircle, MdPerson, MdEmail,
  MdPhone, MdLocationOn, MdCreditCard, MdLock,
  MdArrowBack, MdArrowForward,
} from 'react-icons/md';
import { FiShield, FiCheck, FiPackage } from 'react-icons/fi';

const fmt = (n) => 'PKR ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 });
const TAX_RATE = 0.08;

const STEPS = [
  { id: 1, label: 'Your Info',  icon: MdPerson     },
  { id: 2, label: 'Payment',    icon: MdCreditCard  },
  { id: 3, label: 'Confirmed',  icon: FiCheck       },
];

function StepBar({ current }) {
  return (
    <div className='flex items-center gap-0 mb-10'>
      {STEPS.map((s, i) => {
        const done    = current > s.id;
        const active  = current === s.id;
        return (
          <div key={s.id} className='flex items-center flex-1'>
            <div className='flex flex-col items-center gap-1'>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${
                done   ? 'bg-emerald-500 text-white' :
                active ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' :
                         'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500'
              }`}>
                {done ? <FiCheck className='text-base' /> : <s.icon className='text-base' />}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-zinc-500'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${done ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-zinc-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderSummary({ items, subtotal, coupon, compact = false }) {
  const discount   = coupon ? subtotal * coupon.discount : 0;
  const total      = subtotal - discount;
  const tax        = total * TAX_RATE;
  const grandTotal = total + tax;

  return (
    <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 p-5'>
      <h3 className='font-black text-gray-900 dark:text-zinc-100 mb-4 text-sm uppercase tracking-wider'>Order Summary</h3>

      {!compact && (
        <div className='space-y-3 mb-4 max-h-48 overflow-y-auto pr-1'>
          {items.map(item => (
            <div key={item.id} className='flex items-center gap-3'>
              <div className='w-12 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden'>
                {item.image
                  ? <img src={item.image} alt='' className='w-full h-full object-cover' onError={e => { e.currentTarget.style.display='none'; }} />
                  : <MdDirectionsCar className='text-gray-400' />
                }
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate'>{item.brand} {item.name}</p>
                <p className='text-xs text-gray-400 dark:text-zinc-500'>Qty: {item.qty}</p>
              </div>
              <p className='text-xs font-bold text-gray-800 dark:text-zinc-200 flex-shrink-0'>{fmt(item.price * item.qty)}</p>
            </div>
          ))}
        </div>
      )}

      <div className='space-y-2 text-sm border-t border-gray-100 dark:border-zinc-700 pt-4'>
        <div className='flex justify-between'>
          <span className='text-gray-500 dark:text-zinc-400'>Subtotal</span>
          <span className='text-gray-800 dark:text-zinc-200'>{fmt(subtotal)}</span>
        </div>
        {coupon && (
          <div className='flex justify-between text-emerald-600 dark:text-emerald-400'>
            <span>Discount ({coupon.code})</span>
            <span>- {fmt(discount)}</span>
          </div>
        )}
        <div className='flex justify-between'>
          <span className='text-gray-500 dark:text-zinc-400'>Tax (8%)</span>
          <span className='text-gray-800 dark:text-zinc-200'>{fmt(tax)}</span>
        </div>
        <div className='flex justify-between pt-2 border-t border-gray-100 dark:border-zinc-700 font-black'>
          <span className='text-gray-900 dark:text-zinc-100'>Total</span>
          <span className='text-amber-600 text-lg'>{fmt(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const items     = useSelector(selectCartItems);
  const subtotal  = useSelector(selectSubtotal);
  const coupon    = useSelector(selectCoupon);
  const total     = useSelector(selectTotal);
  const user      = useSelector(selectUser);
  const grandTotal = (total + total * TAX_RATE);

  const [step,      setStep]     = useState(1);
  const [orderId,   setOrderId]  = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [info, setInfo] = useState({
    name:    user?.name || '',
    email:   user?.email || '',
    phone:   '',
    address: '',
    city:    '',
  });

  const [payment, setPayment] = useState({
    card:  '',
    name:  '',
    expiry: '',
    cvv:   '',
  });

  const [errors, setErrors] = useState({});

  if (items.length === 0 && step !== 3) {
    return (
      <div className='min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4 text-center px-6'>
        <FiPackage className='text-7xl text-gray-300 dark:text-zinc-700' />
        <h2 className='text-2xl font-black text-gray-900 dark:text-zinc-100'>No items to checkout</h2>
        <Link to='/shop' className='bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl transition-colors'>
          Browse Cars
        </Link>
      </div>
    );
  }

  const validateInfo = () => {
    const e = {};
    if (!info.name.trim())    e.name    = 'Name required';
    if (!info.email.trim())   e.email   = 'Email required';
    if (!info.phone.trim())   e.phone   = 'Phone required';
    if (!info.address.trim()) e.address = 'Address required';
    if (!info.city.trim())    e.city    = 'City required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    const e = {};
    if (payment.card.replace(/\s/g,'').length < 16)  e.card   = 'Enter 16-digit card number';
    if (!payment.name.trim())                         e.name   = 'Cardholder name required';
    if (!payment.expiry.trim())                       e.expiry = 'Expiry required';
    if (payment.cvv.length < 3)                       e.cvv    = 'CVV required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (step === 1 && !validateInfo())    return;
    if (step === 2 && !validatePayment()) return;

    if (step === 2) {
      setSubmitting(true);
      try {
        const cardLast4 = payment.card.replace(/\s/g, '').slice(-4);
        const results = await Promise.all(
          items.map(item =>
            api.createOrder({
              car: item.id,
              customer: { name: info.name, email: info.email, phone: info.phone, address: info.address, city: info.city },
              payment:  { method: 'card', cardLast4 },
              totalAmount: Math.round(item.price * item.qty * (1 + TAX_RATE)),
            })
          )
        );
        const firstId = results[0]?.order?.orderId || 'CM-' + Math.floor(100000 + Math.random() * 900000);
        setOrderId(firstId);
        dispatch(clearCart());
        dispatch(addToast({ type: 'success', message: 'Order placed successfully!' }));
      } catch (err) {
        dispatch(addToast({ type: 'error', message: err.message || 'Order failed. Please try again.' }));
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
    }

    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fmtCard = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const fmtExp  = v => v.replace(/\D/g,'').slice(0,4).replace(/^(\d{2})(\d)/,'$1/$2');

  const Field = ({ label, name, state, setState, type='text', placeholder, format, maxLength, error }) => (
    <div>
      <label className='block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5'>{label}</label>
      <input
        type={type}
        value={state[name]}
        maxLength={maxLength}
        onChange={e => {
          const v = format ? format(e.target.value) : e.target.value;
          setState(prev => ({ ...prev, [name]: v }));
          if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        }}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border ${
          error ? 'border-red-400' : 'border-gray-200 dark:border-zinc-700'
        } text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all`}
      />
      {error && <p className='text-xs text-red-400 mt-1'>{error}</p>}
    </div>
  );

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950'>

      {/* Header */}
      <div className='bg-gradient-to-r from-slate-900 to-slate-800 py-8 px-4'>
        <div className='max-w-5xl mx-auto'>
          <nav className='flex items-center gap-2 text-xs text-slate-400 mb-3'>
            <Link to='/' className='hover:text-amber-400'>Home</Link>
            <span>›</span>
            <Link to='/cart' className='hover:text-amber-400'>Cart</Link>
            <span>›</span>
            <span className='text-slate-200'>Checkout</span>
          </nav>
          <h1 className='text-2xl font-black text-white'>Secure Checkout</h1>
        </div>
      </div>

      <div className='max-w-5xl mx-auto px-4 py-8'>
        <StepBar current={step} />

        {step < 3 ? (
          <div className='grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start'>

            {/* Form Panel */}
            <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 p-6 sm:p-8'>

              {/* Step 1 — Info */}
              {step === 1 && (
                <div className='anim-fade-up space-y-5'>
                  <div>
                    <h2 className='text-xl font-black text-gray-900 dark:text-zinc-100 mb-1'>Your Information</h2>
                    <p className='text-sm text-gray-400 dark:text-zinc-500'>Fill in your details to proceed</p>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <Field label='Full Name'    name='name'    state={info} setState={setInfo} placeholder='Ahmed Raza'          error={errors.name} />
                    <Field label='Email'        name='email'   state={info} setState={setInfo} placeholder='you@email.com' type='email' error={errors.email} />
                    <Field label='Phone'        name='phone'   state={info} setState={setInfo} placeholder='03xx-xxxxxxx'  type='tel'  error={errors.phone} />
                    <Field label='City'         name='city'    state={info} setState={setInfo} placeholder='Lahore, Karachi…'    error={errors.city} />
                  </div>
                  <Field label='Delivery Address' name='address' state={info} setState={setInfo} placeholder='House/Flat No, Street, Area' error={errors.address} />

                  <div className='flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20'>
                    <FiShield className='text-blue-500 text-lg flex-shrink-0' />
                    <p className='text-xs text-blue-700 dark:text-blue-300'>Your information is encrypted and never shared with third parties.</p>
                  </div>
                </div>
              )}

              {/* Step 2 — Payment */}
              {step === 2 && (
                <div className='anim-fade-up space-y-5'>
                  <div>
                    <h2 className='text-xl font-black text-gray-900 dark:text-zinc-100 mb-1'>Payment Details</h2>
                    <p className='text-sm text-gray-400 dark:text-zinc-500'>All transactions are secured with 256-bit SSL</p>
                  </div>

                  <div className='flex gap-2 mb-2'>
                    {['VISA', 'MC', 'AMEX', 'UBL'].map(b => (
                      <span key={b} className='px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400'>
                        {b}
                      </span>
                    ))}
                  </div>

                  <div className='space-y-4'>
                    <Field
                      label='Card Number' name='card' state={payment} setState={setPayment}
                      placeholder='1234 5678 9012 3456' format={fmtCard} maxLength={19}
                      error={errors.card}
                    />
                    <Field
                      label='Cardholder Name' name='name' state={payment} setState={setPayment}
                      placeholder='Name on card' error={errors.name}
                    />
                    <div className='grid grid-cols-2 gap-4'>
                      <Field
                        label='Expiry Date' name='expiry' state={payment} setState={setPayment}
                        placeholder='MM/YY' format={fmtExp} maxLength={5} error={errors.expiry}
                      />
                      <Field
                        label='CVV' name='cvv' state={payment} setState={setPayment}
                        placeholder='123' maxLength={4} error={errors.cvv}
                      />
                    </div>
                  </div>

                  <div className='flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20'>
                    <MdLock className='text-emerald-500 text-lg flex-shrink-0' />
                    <p className='text-xs text-emerald-700 dark:text-emerald-300'>
                      This is a demo checkout. No real payment will be processed.
                    </p>
                  </div>

                  {/* Info Review */}
                  <div className='bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 border border-gray-100 dark:border-zinc-700'>
                    <p className='text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase mb-2'>Delivering to</p>
                    <p className='text-sm font-semibold text-gray-800 dark:text-zinc-200'>{info.name}</p>
                    <p className='text-xs text-gray-500 dark:text-zinc-400'>{info.address}, {info.city}</p>
                    <p className='text-xs text-gray-500 dark:text-zinc-400'>{info.phone}</p>
                    <button onClick={() => setStep(1)} className='text-xs text-amber-500 hover:text-amber-400 mt-1 font-semibold'>Edit</button>
                  </div>
                </div>
              )}

              {/* Nav Buttons */}
              <div className='flex gap-3 mt-8'>
                {step > 1 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className='flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors'
                  >
                    <MdArrowBack /> Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className='flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-70 disabled:cursor-not-allowed'
                >
                  {submitting ? (
                    <><svg className='animate-spin h-4 w-4' viewBox='0 0 24 24' fill='none'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'/><path fill='currentColor' d='M4 12a8 8 0 018-8v8z' className='opacity-75'/></svg> Processing…</>
                  ) : (
                    <>{step === 1 ? 'Continue to Payment' : 'Place Order'}<MdArrowForward /></>
                  )}
                </button>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className='space-y-4'>
              <OrderSummary items={items} subtotal={subtotal} coupon={coupon} />
              <div className='flex items-center gap-2 text-xs text-gray-400 dark:text-zinc-500 justify-center'>
                <MdLock className='text-emerald-500' /> SSL Secured · 256-bit Encryption
              </div>
            </div>
          </div>
        ) : (
          /* Step 3 — Confirmation */
          <div className='anim-scale-in max-w-lg mx-auto text-center py-8'>
            <div className='w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30'>
              <MdCheckCircle className='text-5xl text-white' />
            </div>
            <h1 className='text-3xl font-black text-gray-900 dark:text-zinc-100 mb-2'>Order Placed!</h1>
            <p className='text-gray-500 dark:text-zinc-400 mb-6 text-sm leading-relaxed'>
              Your order has been received. Our team will contact you within 24 hours to confirm delivery details.
            </p>

            <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 p-6 mb-6 text-left'>
              <div className='flex justify-between items-center mb-4'>
                <p className='text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider'>Order ID</p>
                <span className='font-black text-amber-600 text-lg'>{orderId}</span>
              </div>
              <OrderSummary items={[]} subtotal={subtotal} coupon={coupon} compact />
              <div className='mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700 text-sm'>
                <p className='font-semibold text-gray-800 dark:text-zinc-200 mb-0.5'>{info.name}</p>
                <p className='text-gray-500 dark:text-zinc-400 text-xs'>{info.address}, {info.city}</p>
                <p className='text-gray-500 dark:text-zinc-400 text-xs'>{info.phone}</p>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <Link
                to='/'
                className='flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-8 py-3 rounded-xl hover:-translate-y-0.5 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/30'
              >
                Back to Home
              </Link>
              <Link
                to='/shop'
                className='flex items-center justify-center gap-2 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors'
              >
                Browse More Cars
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
