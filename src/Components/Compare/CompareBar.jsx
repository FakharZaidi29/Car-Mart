import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectCompareIds, clearCompare, toggleCompare } from '../slices/compareSlice';
import { fetchCars, selectCars } from '../slices/carsSlice';
import { MdClose, MdCompareArrows } from 'react-icons/md';

export default function CompareBar() {
  const dispatch = useDispatch();
  const ids      = useSelector(selectCompareIds);
  const allCars  = useSelector(selectCars);

  useEffect(() => {
    if (allCars.length === 0) dispatch(fetchCars());
  }, []);

  if (ids.length === 0) return null;

  const cars = ids.map(id => allCars.find(c => (c._id || c.id) === id)).filter(Boolean);

  return (
    <div className='fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 shadow-2xl px-4 py-3'>
      <div className='max-w-5xl mx-auto flex items-center gap-4'>

        <div className='flex items-center gap-2 flex-1 overflow-x-auto'>
          <MdCompareArrows className='text-amber-500 text-xl flex-shrink-0' />
          <span className='text-xs font-bold text-gray-500 dark:text-zinc-400 flex-shrink-0'>Compare:</span>

          {cars.map(car => {
            const carId = car._id || car.id;
            return (
              <div key={carId} className='flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-xl px-3 py-1.5 flex-shrink-0'>
                <img src={car.image} alt={car.model} className='w-10 h-7 object-cover rounded-lg' onError={e => { e.currentTarget.style.display='none'; }} />
                <span className='text-xs font-semibold text-gray-800 dark:text-zinc-200 whitespace-nowrap'>
                  {car.make} {car.model}
                </span>
                <button onClick={() => dispatch(toggleCompare(carId))} className='text-gray-400 hover:text-red-500 transition-colors'>
                  <MdClose className='text-sm' />
                </button>
              </div>
            );
          })}

          {ids.length < 3 && (
            <div className='flex-shrink-0 w-28 h-10 border-2 border-dashed border-gray-200 dark:border-zinc-600 rounded-xl flex items-center justify-center text-xs text-gray-400 dark:text-zinc-500'>
              + Add car
            </div>
          )}
        </div>

        <div className='flex items-center gap-2 flex-shrink-0'>
          <button
            onClick={() => dispatch(clearCompare())}
            className='text-xs text-gray-400 hover:text-red-500 transition-colors font-medium'
          >
            Clear
          </button>
          <Link
            to='/compare'
            className='bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all'
          >
            Compare Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
