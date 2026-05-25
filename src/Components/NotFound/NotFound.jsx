import { Link } from 'react-router-dom';
import { MdDirectionsCar, MdHome, MdSearch } from 'react-icons/md';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center px-4'>
      <div className='text-center max-w-md'>

        {/* Big 404 */}
        <div className='relative mb-6'>
          <p className='text-[120px] font-black text-gray-100 dark:text-zinc-800 leading-none select-none'>
            404
          </p>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30'>
              <MdDirectionsCar className='text-white text-5xl' />
            </div>
          </div>
        </div>

        <h1 className='text-2xl font-black text-gray-900 dark:text-zinc-100 mb-2'>
          Page Not Found
        </h1>
        <p className='text-gray-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed'>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on the road.
        </p>

        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Link
            to='/'
            className='flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-6 py-3 rounded-xl hover:-translate-y-0.5 transition-all hover:shadow-lg hover:shadow-amber-500/30'
          >
            <MdHome className='text-lg' /> Go Home
          </Link>
          <Link
            to='/shop'
            className='flex items-center justify-center gap-2 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors'
          >
            <MdSearch className='text-lg' /> Browse Cars
          </Link>
        </div>
      </div>
    </div>
  );
}
