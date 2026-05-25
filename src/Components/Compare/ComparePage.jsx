import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectCompareIds, clearCompare, toggleCompare } from '../slices/compareSlice';
import { selectCars } from '../slices/carsSlice';
import { fmt, fmtMiles } from '../../data/cars';
import { MdClose, MdDirectionsCar } from 'react-icons/md';

const ROWS = [
  { label: 'Price',        key: 'price',        fmt: fmt      },
  { label: 'Year',         key: 'year',         fmt: String   },
  { label: 'Mileage',      key: 'mileage',      fmt: fmtMiles },
  { label: 'Fuel Type',    key: 'fuel',         fmt: String   },
  { label: 'Transmission', key: 'transmission', fmt: String   },
  { label: 'Body Type',    key: 'type',         fmt: String   },
  { label: 'Color',        key: 'color',        fmt: String   },
];

export default function ComparePage() {
  const dispatch = useDispatch();
  const ids      = useSelector(selectCompareIds);
  const allCars  = useSelector(selectCars);
  const cars     = ids.map(id => allCars.find(c => (c._id || c.id) === id)).filter(Boolean);

  if (cars.length === 0) return (
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4 text-center px-6'>
      <MdDirectionsCar className='text-8xl text-gray-200 dark:text-zinc-700' />
      <h1 className='text-2xl font-black text-gray-900 dark:text-zinc-100'>No Cars to Compare</h1>
      <p className='text-gray-500 dark:text-zinc-400 text-sm'>Go to Shop Cars and click "Compare" on any car card.</p>
      <Link to='/shop' className='bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl transition-colors'>
        Browse Cars
      </Link>
    </div>
  );

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20'>
      <div className='max-w-5xl mx-auto px-4 py-10'>

        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-black text-gray-900 dark:text-zinc-100'>Compare Cars</h1>
            <p className='text-gray-500 dark:text-zinc-400 text-sm mt-1'>Comparing {cars.length} car{cars.length > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => dispatch(clearCompare())}
            className='text-sm text-red-500 hover:text-red-400 font-semibold border border-red-200 dark:border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors'
          >
            Clear All
          </button>
        </div>

        {/* Car Cards Row */}
        <div className='grid gap-4 mb-6' style={{ gridTemplateColumns: `repeat(${cars.length}, 1fr)` }}>
          {cars.map(car => {
            const carId = car._id || car.id;
            return (
              <div key={carId} className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden'>
                <div className='relative h-40 bg-gradient-to-br from-slate-800 to-slate-700'>
                  <img src={car.image} alt={`${car.make} ${car.model}`} className='absolute inset-0 w-full h-full object-cover' onError={e => { e.currentTarget.style.display='none'; }} />
                  <button
                    onClick={() => dispatch(toggleCompare(carId))}
                    className='absolute top-2 right-2 w-7 h-7 bg-white/80 dark:bg-zinc-800/80 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors'
                  >
                    <MdClose className='text-gray-600 dark:text-zinc-300 text-sm' />
                  </button>
                </div>
                <div className='p-4 text-center'>
                  <p className='font-black text-gray-900 dark:text-zinc-100 text-sm'>{car.make} {car.model}</p>
                  <p className='text-amber-600 font-black mt-1'>{fmt(car.price)}</p>
                  <Link
                    to={`/car/${carId}`}
                    className='mt-3 block text-xs text-center py-2 rounded-xl border border-amber-400 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors font-semibold'
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden'>
          {ROWS.map((row, i) => {
            const vals = cars.map(c => row.fmt(c[row.key]));
            const best = row.key === 'price'   ? Math.min(...cars.map(c => c.price))
                       : row.key === 'mileage' ? Math.min(...cars.map(c => c.mileage))
                       : null;
            return (
              <div key={row.label} className={`grid gap-0 ${i % 2 === 0 ? 'bg-gray-50 dark:bg-zinc-800/50' : ''}`}
                style={{ gridTemplateColumns: `160px repeat(${cars.length}, 1fr)` }}>
                <div className='px-5 py-4 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center'>
                  {row.label}
                </div>
                {cars.map((car, ci) => {
                  const carId = car._id || car.id;
                  const isBest = best !== null && car[row.key] === best;
                  return (
                    <div key={carId} className={`px-5 py-4 text-sm font-semibold text-center border-l border-gray-100 dark:border-zinc-700 ${
                      isBest ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-zinc-200'
                    }`}>
                      {vals[ci]}
                      {isBest && <span className='ml-1 text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold'>Best</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
