import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../slices/authSlice';

export default function AuthCallback() {
  const [params]  = useSearchParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const user  = params.get('user');
    const error = params.get('error');

    if (error || !token || !user) {
      navigate('/login?error=oauth_failed');
      return;
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(user));
      localStorage.setItem('carmart_token', token);
      localStorage.setItem('carmart_user',  JSON.stringify(parsed));
      dispatch(setCredentials({ user: parsed, token }));
      navigate('/');
    } catch {
      navigate('/login?error=oauth_failed');
    }
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950'>
      <div className='text-center'>
        <svg className='animate-spin h-10 w-10 text-amber-500 mx-auto mb-4' viewBox='0 0 24 24' fill='none'>
          <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'/>
          <path fill='currentColor' d='M4 12a8 8 0 018-8v8z' className='opacity-75'/>
        </svg>
        <p className='text-gray-500 dark:text-zinc-400 text-sm'>Signing you in...</p>
      </div>
    </div>
  );
}
