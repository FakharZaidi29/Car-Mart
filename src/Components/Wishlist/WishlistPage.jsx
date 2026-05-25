import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectWishlistIds, toggleWishlist } from '../slices/wishlistSlice';
import { addToCart, selectCartItems } from '../slices/cartSlice';
import { addToast } from '../slices/toastSlice';
import { fetchCars, selectCars } from '../slices/carsSlice';
import { fmt, fmtMiles } from '../../data/cars';
import { MdFavorite, MdLocalGasStation, MdSpeed, MdDirectionsCar, MdDelete } from 'react-icons/md';
import { FiShoppingCart, FiCheckCircle, FiEye } from 'react-icons/fi';
import { BsHeartbreakFill } from 'react-icons/bs';

export default function WishlistPage() {
  const dispatch    = useDispatch();
  const ids         = useSelector(selectWishlistIds);
  const cartItems   = useSelector(selectCartItems);
  const allCars     = useSelector(selectCars);
  const cartIds     = new Set(cartItems.map(c => c.id));
  const wishlisted  = allCars.filter(c => ids.includes(c._id || c.id));

  useEffect(() => {
    if (allCars.length === 0) dispatch(fetchCars());
  }, []);

  const handleRemove = (car) => {
    const carId = car._id || car.id;
    dispatch(toggleWishlist(carId));
    dispatch(addToast({ type: 'info', message: `${car.make} ${car.model} removed from wishlist` }));
  };

  const handleAddToCart = (car) => {
    const carId = car._id || car.id;
    dispatch(addToCart({ id: carId, brand: car.make, name: car.model, year: car.year, price: car.price, image: car.image, category: car.type }));
    dispatch(addToast({ type: 'success', message: `${car.make} ${car.model} added to cart!` }));
  };

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950'>
      <div className='max-w-5xl mx-auto px-4 py-10'>

        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-black text-gray-900 dark:text-zinc-100 flex items-center gap-3'>
              <MdFavorite className='text-red-500' /> My Wishlist
            </h1>
            <p className='text-gray-500 dark:text-zinc-400 text-sm mt-1'>
              {wishlisted.length} saved car{wishlisted.length !== 1 ? 's' : ''}
            </p>
          </div>
          {wishlisted.length > 0 && (
            <Link to='/shop' className='text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline'>
              + Add more cars
            </Link>
          )}
        </div>

        {/* Empty state */}
        {wishlisted.length === 0 ? (
          <div className='text-center py-24'>
            <BsHeartbreakFill className='text-7xl text-gray-200 dark:text-zinc-700 mx-auto mb-5' />
            <h2 className='text-xl font-black text-gray-800 dark:text-zinc-200 mb-2'>Your wishlist is empty</h2>
            <p className='text-gray-400 dark:text-zinc-500 text-sm mb-6'>
              Browse cars and tap ❤️ to save your favourites here.
            </p>
            <Link
              to='/shop'
              className='inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-7 py-3 rounded-xl hover:-translate-y-0.5 transition-all hover:shadow-lg hover:shadow-amber-500/30'
            >
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {wishlisted.map(car => {
              const carId = car._id || car.id;
              const inCart = cartIds.has(carId);
              return (
                <div key={carId} className='anim-fade-up bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group'>

                  {/* Image */}
                  <div className='relative h-44 bg-gradient-to-br from-slate-900 to-slate-700 overflow-hidden'>
                    <img
                      src={car.image}
                      alt={`${car.make} ${car.model}`}
                      className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
                    <span className='absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg'>{car.year}</span>
                    <button
                      onClick={() => handleRemove(car)}
                      className='absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center shadow transition-colors'
                      title='Remove from wishlist'
                    >
                      <MdDelete className='text-white text-sm' />
                    </button>
                  </div>

                  {/* Info */}
                  <div className='p-4 flex flex-col flex-1'>
                    <div className='flex justify-between items-start mb-1'>
                      <h3 className='font-bold text-gray-900 dark:text-zinc-100'>{car.make} {car.model}</h3>
                      <span className='text-amber-600 font-black text-sm whitespace-nowrap ml-2'>{fmt(car.price)}</span>
                    </div>
                    <p className='text-gray-400 dark:text-zinc-500 text-xs mb-3'>{car.color} · {car.transmission}</p>

                    <div className='flex gap-2 mb-4 flex-wrap'>
                      <span className='flex items-center gap-1 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-100 dark:border-zinc-700 px-2 py-1 rounded-lg'>
                        <MdLocalGasStation className='text-amber-500' /> {car.fuel}
                      </span>
                      <span className='flex items-center gap-1 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-100 dark:border-zinc-700 px-2 py-1 rounded-lg'>
                        <MdSpeed className='text-amber-500' /> {fmtMiles(car.mileage)}
                      </span>
                      <span className='flex items-center gap-1 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-100 dark:border-zinc-700 px-2 py-1 rounded-lg'>
                        <MdDirectionsCar className='text-amber-500' /> {car.type}
                      </span>
                    </div>

                    <div className='flex gap-2 mt-auto'>
                      <Link
                        to={`/car/${carId}`}
                        className='flex items-center justify-center gap-1 flex-1 text-sm py-2.5 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium transition-colors'
                      >
                        <FiEye className='text-base' /> View
                      </Link>
                      <button
                        onClick={() => handleAddToCart(car)}
                        disabled={inCart}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                          inCart
                            ? 'bg-emerald-500 text-white cursor-default'
                            : 'bg-slate-900 dark:bg-amber-500 text-white hover:bg-amber-500 dark:hover:bg-amber-400'
                        }`}
                      >
                        {inCart
                          ? <><FiCheckCircle /> In Cart</>
                          : <><FiShoppingCart className='text-sm' /> Add</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
