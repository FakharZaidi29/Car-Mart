import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api';
import { MdDirectionsCar, MdLock, MdVisibility, MdVisibilityOff, MdCheckCircle } from 'react-icons/md';
import { FiArrowRight } from 'react-icons/fi';

export default function ResetPassword() {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Link expired or invalid. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center px-4 py-16'>
      <div className='w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-8'>

        <Link to='/' className='inline-flex items-center gap-2 mb-8'>
          <MdDirectionsCar className='text-amber-400 text-3xl' />
          <span className='font-black text-2xl text-gray-900 dark:text-white'>Car<span className='text-amber-400'>Mart</span></span>
        </Link>

        {success ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <MdCheckCircle className='text-4xl text-emerald-500' />
            </div>
            <h2 className='text-xl font-black text-gray-900 dark:text-white mb-2'>Password Reset!</h2>
            <p className='text-gray-500 dark:text-zinc-400 text-sm'>Your password has been updated. Redirecting to sign in…</p>
          </div>
        ) : (
          <>
            <h2 className='text-2xl font-black text-gray-900 dark:text-white mb-1'>Set New Password</h2>
            <p className='text-gray-500 dark:text-zinc-400 text-sm mb-8'>Choose a strong password for your account.</p>

            {error && (
              <div className='mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium'>
                {error}
              </div>
            )}

            <form className='space-y-4' onSubmit={handleSubmit}>
              <div className='relative'>
                <MdLock className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-xl pointer-events-none' />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='New password'
                  required
                  className='w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all'
                />
                <button type='button' onClick={() => setShowPass(!showPass)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors'>
                  {showPass ? <MdVisibilityOff className='text-xl' /> : <MdVisibility className='text-xl' />}
                </button>
              </div>

              <div className='relative'>
                <MdLock className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-xl pointer-events-none' />
                <input
                  type={showConf ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder='Confirm new password'
                  required
                  className='w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all'
                />
                <button type='button' onClick={() => setShowConf(!showConf)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors'>
                  {showConf ? <MdVisibilityOff className='text-xl' /> : <MdVisibility className='text-xl' />}
                </button>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-black py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-2 text-sm disabled:opacity-70'
              >
                {loading ? (
                  <svg className='animate-spin w-5 h-5' viewBox='0 0 24 24' fill='none'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                  </svg>
                ) : (
                  <>Reset Password <FiArrowRight /></>
                )}
              </button>
            </form>

            <p className='mt-6 text-center text-sm text-gray-500 dark:text-zinc-500'>
              Remember it?{' '}
              <Link to='/login' className='text-amber-400 hover:text-amber-300 font-bold transition-colors'>Sign in →</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
