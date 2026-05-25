import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, clearError, selectAuthError, selectUser, selectAuthLoading } from '../../slices/authSlice';
import { api } from '../../../api';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import {
  MdDirectionsCar, MdEmail, MdLock, MdPerson,
  MdVisibility, MdVisibilityOff, MdVerified, MdPhone,
  MdShoppingCart, MdStorefront, MdClose, MdCheckCircle,
} from 'react-icons/md';
import { FiShield, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { BsStarFill } from 'react-icons/bs';

function ForgotPasswordModal({ onClose }) {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-2xl w-full max-w-sm p-8' onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-black text-gray-900 dark:text-white'>Forgot Password?</h3>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors'>
            <MdClose className='text-xl' />
          </button>
        </div>

        {sent ? (
          <div className='text-center py-4'>
            <div className='w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <MdCheckCircle className='text-3xl text-emerald-500' />
            </div>
            <p className='text-sm font-semibold text-gray-900 dark:text-white mb-1'>Check your inbox</p>
            <p className='text-xs text-gray-500 dark:text-zinc-400'>We sent a reset link to <strong>{email}</strong>. It expires in 15 minutes.</p>
            <button onClick={onClose} className='mt-6 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-sm transition-colors'>
              Done
            </button>
          </div>
        ) : (
          <>
            <p className='text-sm text-gray-500 dark:text-zinc-400 mb-6'>
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            {error && (
              <div className='mb-4 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium'>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='relative'>
                <MdEmail className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-xl pointer-events-none' />
                <input
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder='Your email address'
                  required
                  className='w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all'
                />
              </div>
              <button
                type='submit'
                disabled={loading}
                className='w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black rounded-xl text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2'
              >
                {loading ? (
                  <svg className='animate-spin w-4 h-4' viewBox='0 0 24 24' fill='none'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                  </svg>
                ) : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const TRUST = [
  { icon: MdVerified,    text: '500+ Verified Cars'       },
  { icon: FiShield,      text: 'Bank-grade Secure Payments' },
  { icon: FiCheckCircle, text: '10,000+ Happy Customers'  },
];

const REVIEWS = [
  { name: 'Ahmed R.', city: 'Lahore',    rating: 5, text: 'Found my dream KIA Sportage here. Totally smooth process!' },
  { name: 'Sara M.',  city: 'Karachi',   rating: 5, text: 'Best car buying experience in Pakistan. Highly recommend!' },
];

export default function Login() {
  const [tab,         setTab]         = useState('login');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [review,      setReview]      = useState(0);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [role,       setRole]       = useState('customer');
  const [localErr,   setLocalErr]   = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const location    = useLocation();
  const authError   = useSelector(selectAuthError);
  const authLoading = useSelector(selectAuthLoading);
  const user        = useSelector(selectUser);

  const from = location.state?.from || '/';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr('');
    dispatch(clearError());
    if (tab === 'login') {
      const result = await dispatch(login({ email, password }));
      if (login.fulfilled.match(result)) navigate(from, { replace: true });
    } else {
      if (!name.trim())         { setLocalErr('Name is required'); return; }
      if (password !== confirm) { setLocalErr('Passwords do not match'); return; }
      if (password.length < 6)  { setLocalErr('Password must be at least 6 characters'); return; }
      const result = await dispatch(register({ name, email, password, phone, role }));
      if (register.fulfilled.match(result)) navigate(from, { replace: true });
    }
  };

  return (
    <>
    {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center px-4 py-16'>

      <div className='anim-fade-up w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800'>

        {/* ══ LEFT PANEL ══════════════════════════════════════════════════ */}
        <div className='hidden lg:flex lg:w-[46%] relative flex-col justify-between overflow-hidden'>

          {/* Background image */}
          <img
            src='https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80'
            alt='Luxury Car'
            className='absolute inset-0 w-full h-full object-cover'
          />
          {/* Overlays */}
          <div className='absolute inset-0 bg-gradient-to-br from-zinc-950/90 via-zinc-950/70 to-zinc-900/80' />
          <div className='absolute inset-0 opacity-5'
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }}
          />
          {/* Amber glow */}
          <div className='absolute -top-20 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl' />
          <div className='absolute -bottom-20 -right-10 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl' />

          {/* Top — Logo */}
          <div className='relative z-10 p-9'>
            <Link to='/' className='inline-flex items-center gap-2'>
              <MdDirectionsCar className='text-amber-400 text-3xl' />
              <span className='text-white font-black text-2xl tracking-tight'>
                Car<span className='text-amber-400'>Mart</span>
              </span>
            </Link>
          </div>

          {/* Middle — Headline */}
          <div className='relative z-10 px-9'>
            <p className='text-amber-400 text-xs font-bold tracking-widest uppercase mb-3'>
              Pakistan&apos;s #1 Marketplace
            </p>
            <h2 className='text-4xl font-black text-white leading-tight mb-4'>
              Drive Your<br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500'>
                Dream Car
              </span><br />
              Home Today
            </h2>
            <p className='text-zinc-400 text-sm leading-relaxed mb-8'>
              Browse 500+ verified cars from trusted sellers across Pakistan with transparent pricing and secure payments.
            </p>

            {/* Trust badges */}
            <div className='space-y-3'>
              {TRUST.map(({ icon: Icon, text }) => (
                <div key={text} className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0'>
                    <Icon className='text-amber-400 text-sm' />
                  </div>
                  <span className='text-zinc-300 text-sm'>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — Review card */}
          <div className='relative z-10 p-9'>
            <div className='bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm'>
              <div className='flex gap-0.5 mb-2'>
                {[...Array(REVIEWS[review].rating)].map((_, i) => (
                  <BsStarFill key={i} className='text-amber-400 text-xs' />
                ))}
              </div>
              <p className='text-zinc-300 text-xs italic mb-3'>"{REVIEWS[review].text}"</p>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-black text-xs'>
                    {REVIEWS[review].name[0]}
                  </div>
                  <div>
                    <p className='text-white text-xs font-semibold'>{REVIEWS[review].name}</p>
                    <p className='text-zinc-500 text-xs'>{REVIEWS[review].city}</p>
                  </div>
                </div>
                <div className='flex gap-1'>
                  {REVIEWS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setReview(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === review ? 'bg-amber-400 w-4' : 'bg-zinc-600'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL — FORM ══════════════════════════════════════════ */}
        <div className='w-full lg:w-[54%] bg-white dark:bg-zinc-900 flex flex-col justify-center p-8 sm:p-10'>

          {/* Mobile logo */}
          <Link to='/' className='inline-flex items-center gap-2 mb-8 lg:hidden'>
            <MdDirectionsCar className='text-amber-400 text-2xl' />
            <span className='text-white font-black text-xl'>Car<span className='text-amber-400'>Mart</span></span>
          </Link>

          {/* Tab switcher */}
          <div className='flex bg-gray-100 dark:bg-zinc-800 rounded-2xl p-1 mb-8 gap-1'>
            {[['login', 'Sign In'], ['register', 'Create Account']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  tab === key
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className='mb-6'>
            <h2 className='text-2xl font-black text-gray-900 dark:text-white mb-1'>
              {tab === 'login' ? 'Welcome back 👋' : 'Join Car Mart 🚗'}
            </h2>
            <p className='text-gray-500 dark:text-zinc-500 text-sm'>
              {tab === 'login'
                ? 'Sign in to access your garage and saved listings'
                : 'Create a free account and start exploring today'}
            </p>
          </div>

          {/* Form */}
          <form className='space-y-4' onSubmit={handleSubmit}>

            {/* Error */}
            {(authError || localErr) && (
              <div className='px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium'>
                {authError || localErr}
              </div>
            )}

            {tab === 'register' && (
              <div className='relative'>
                <MdPerson className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-xl pointer-events-none' />
                <input
                  type='text'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder='Full Name'
                  required
                  className='w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all'
                />
              </div>
            )}

            <div className='relative'>
              <MdEmail className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-xl pointer-events-none' />
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='Email address'
                required
                className='w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all'
              />
            </div>

            {tab === 'register' && (
              <div className='relative'>
                <MdPhone className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-xl pointer-events-none' />
                <input
                  type='tel'
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder='Phone number (e.g. 03xx-xxxxxxx)'
                  className='w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all'
                />
              </div>
            )}

            {tab === 'register' && (
              <div>
                <p className='text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2'>I want to…</p>
                <div className='grid grid-cols-2 gap-3'>
                  {[
                    { value: 'customer', icon: MdShoppingCart, label: 'Buy a Car',   desc: 'Browse & purchase' },
                    { value: 'seller',   icon: MdStorefront,   label: 'Sell a Car',  desc: 'List your vehicle' },
                  ].map(({ value, icon: Icon, label, desc }) => (
                    <button
                      key={value}
                      type='button'
                      onClick={() => setRole(value)}
                      className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-200 ${
                        role === value
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
                          : 'border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      <Icon className={`text-2xl ${role === value ? 'text-amber-500' : 'text-gray-400 dark:text-zinc-500'}`} />
                      <span className={`text-sm font-bold ${role === value ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-zinc-300'}`}>{label}</span>
                      <span className='text-xs text-gray-400 dark:text-zinc-500'>{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className='relative'>
              <MdLock className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-xl pointer-events-none' />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='Password'
                required
                className='w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all'
              />
              <button
                type='button'
                onClick={() => setShowPass(!showPass)}
                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-amber-500 transition-colors'
              >
                {showPass ? <MdVisibilityOff className='text-xl' /> : <MdVisibility className='text-xl' />}
              </button>
            </div>

            {tab === 'register' && (
              <div className='relative'>
                <MdLock className='absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl pointer-events-none' />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder='Confirm Password'
                  className='w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirm(!showConfirm)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-amber-500 transition-colors'
                >
                  {showConfirm ? <MdVisibilityOff className='text-xl' /> : <MdVisibility className='text-xl' />}
                </button>
              </div>
            )}

            {tab === 'login' && (
              <div className='flex items-center justify-between pt-1'>
                <label className='flex items-center gap-2.5 cursor-pointer group'>
                  <div className='relative'>
                    <input type='checkbox' className='sr-only peer' id='remember' />
                    <div className='w-4 h-4 rounded border-2 border-zinc-600 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all' />
                  </div>
                  <span className='text-sm text-gray-500 dark:text-zinc-400 group-hover:text-gray-700 dark:group-hover:text-zinc-300 transition-colors' htmlFor='remember'>
                    Remember me
                  </span>
                </label>
                <button type='button' onClick={() => setShowForgot(true)} className='text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors'>
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type='submit'
              disabled={authLoading}
              className='w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-black py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed'
            >
              {authLoading ? (
                <svg className='animate-spin w-5 h-5' viewBox='0 0 24 24' fill='none'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                </svg>
              ) : (
                <>{tab === 'login' ? 'Sign In to Car Mart' : 'Create My Account'}<FiArrowRight className='text-base' /></>
              )}
            </button>

            {tab === 'register' && (
              <p className='text-xs text-gray-400 dark:text-zinc-600 text-center pt-1'>
                By signing up you agree to our{' '}
                <a href='#' className='text-amber-400 hover:underline'>Terms</a>
                {' '}&{' '}
                <a href='#' className='text-amber-400 hover:underline'>Privacy Policy</a>
              </p>
            )}
          </form>

          {/* Divider */}
          <div className='flex items-center gap-3 my-6'>
            <div className='flex-1 h-px bg-gray-200 dark:bg-zinc-800' />
            <span className='text-gray-400 dark:text-zinc-600 text-xs whitespace-nowrap'>or continue with</span>
            <div className='flex-1 h-px bg-gray-200 dark:bg-zinc-800' />
          </div>

          {/* Social */}
          <div className='grid grid-cols-2 gap-3'>
            <button
              onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
              className='flex items-center justify-center gap-2.5 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl hover:border-gray-400 dark:hover:border-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all duration-200 group'
            >
              <FcGoogle className='text-xl flex-shrink-0' />
              <span className='text-sm font-semibold text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors'>Google</span>
            </button>
            <button
              onClick={() => alert('Apple Sign In requires an Apple Developer account. Coming soon!')}
              className='flex items-center justify-center gap-2.5 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl hover:border-gray-400 dark:hover:border-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all duration-200 group'
            >
              <FaApple className='text-xl text-gray-800 dark:text-white flex-shrink-0' />
              <span className='text-sm font-semibold text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors'>Apple</span>
            </button>
          </div>

          {/* Switch tab */}
          <p className='mt-6 text-center text-sm text-gray-500 dark:text-zinc-500'>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
              className='text-amber-400 hover:text-amber-300 font-bold transition-colors'
            >
              {tab === 'login' ? 'Create one →' : 'Sign in →'}
            </button>
          </p>

        </div>
      </div>
    </div>
    </>
  );
}
