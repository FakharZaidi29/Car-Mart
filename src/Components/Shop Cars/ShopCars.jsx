import { useState, useMemo, useEffect, useRef, useCallback } from 'react';

function useTilt(maxDeg = 14) {
  const ref = useRef();
  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width  - 0.5;
    const y = (e.clientY - top)  / height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg) translateZ(10px) scale(1.02)`;
    el.style.boxShadow = `${-x * 18}px ${y * 18}px 36px rgba(0,0,0,0.15)`;
  }, [maxDeg]);
  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s ease';
    el.style.transform  = 'perspective(700px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)';
    el.style.boxShadow  = '';
    setTimeout(() => { if (el) el.style.transition = ''; }, 520);
  }, []);
  return { ref, onMouseMove, onMouseLeave };
}
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, selectCartItems } from '../slices/cartSlice';
import { toggleWishlist, selectIsWishlisted } from '../slices/wishlistSlice';
import { toggleCompare, selectIsCompared } from '../slices/compareSlice';
import { addToast } from '../slices/toastSlice';
import { fetchCars, selectCars, selectCarsLoading } from '../slices/carsSlice';
import { selectUser } from '../slices/authSlice';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoginRequiredModal from '../LoginModal/LoginRequiredModal';
import { CarGridSkeleton } from '../Skeleton/CarCardSkeleton';
import {
  MdDirectionsCar, MdLocalGasStation, MdSpeed,
  MdFilterList, MdClose, MdGridView, MdViewList,
  MdFavorite, MdFavoriteBorder, MdCompareArrows,
  MdPerson, MdPhone, MdLocationOn, MdSell,
} from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi2';
import {
  FiChevronDown, FiCheckCircle, FiSliders,
  FiShoppingCart, FiEye,
} from 'react-icons/fi';
import { BsWhatsapp } from 'react-icons/bs';

const MAKES        = ['All', 'Toyota', 'Honda', 'Suzuki', 'KIA', 'Hyundai', 'MG'];
const TYPES        = ['All', 'Sedan', 'SUV', 'Hatchback', 'MPV'];
const FUELS        = ['All', 'Petrol', 'Diesel', 'Hybrid'];
const TRANSMISSIONS = ['All', 'Auto', 'Manual'];
const SORT_OPTIONS = [
  { label: 'Newest First',       value: 'newest'     },
  { label: 'Oldest First',       value: 'oldest'     },
  { label: 'Price: Low to High', value: 'price_asc'  },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Mileage: Low First', value: 'mileage'    },
];

const BADGE_STYLES = {
  'Popular':     'bg-amber-100 text-amber-700 border-amber-200',
  'New Arrival': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Featured':    'bg-blue-100 text-blue-700 border-blue-200',
  'Best Value':  'bg-rose-100 text-rose-700 border-rose-200',
  'Hybrid':      'bg-teal-100 text-teal-700 border-teal-200',
  'Budget Pick': 'bg-purple-100 text-purple-700 border-purple-200',
  'Premium':     'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const fmt       = (p) => p >= 1_000_000 ? `PKR ${(p / 1_000_000).toFixed(1)}M` : `PKR ${p.toLocaleString()}`;
const fmtMiles  = (m) => `${m.toLocaleString()} km`;

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className='border-b border-gray-100 dark:border-zinc-700 pb-4 mb-4 last:border-0'>
      <button
        onClick={() => setOpen(!open)}
        className='flex items-center justify-between w-full text-sm font-bold text-gray-800 dark:text-zinc-200 mb-3 hover:text-amber-600 transition-colors'
      >
        {title}
        <FiChevronDown className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && children}
    </div>
  );
}

function CheckGroup({ options, selected, onChange }) {
  return (
    <div className='space-y-2'>
      {options.map((opt) => (
        <label key={opt} className='flex items-center gap-2.5 cursor-pointer group'>
          <div
            onClick={() => onChange(opt)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150 flex-shrink-0 ${
              selected === opt
                ? 'bg-amber-500 border-amber-500'
                : 'border-gray-300 group-hover:border-amber-400'
            }`}
          >
            {selected === opt && <div className='w-2 h-2 bg-white rounded-sm' />}
          </div>
          <span className={`text-sm transition-colors ${selected === opt ? 'text-amber-600 font-semibold' : 'text-gray-600 dark:text-zinc-400 group-hover:text-gray-900 dark:group-hover:text-zinc-100'}`}>
            {opt}
          </span>
        </label>
      ))}
    </div>
  );
}

function Sidebar({ filters, setFilter, onReset, priceCap, mileageCap }) {
  const activeCount = [
    filters.make !== 'All', filters.type !== 'All', filters.fuel !== 'All',
    filters.transmission !== 'All',
    filters.maxPrice  < priceCap,
    filters.maxMileage < mileageCap,
  ].filter(Boolean).length;

  return (
    <aside className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm p-5 h-fit sticky top-24'>
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-2'>
          <FiSliders className='text-amber-500 text-lg' />
          <h2 className='font-black text-gray-900 dark:text-zinc-100 text-base'>Filters</h2>
          {activeCount > 0 && (
            <span className='bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full'>
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className='text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1'
          >
            <MdClose className='text-sm' /> Reset
          </button>
        )}
      </div>

      <FilterSection title='Make'>
        <CheckGroup options={MAKES} selected={filters.make} onChange={(v) => setFilter('make', v)} />
      </FilterSection>

      <FilterSection title='Body Type'>
        <CheckGroup options={TYPES} selected={filters.type} onChange={(v) => setFilter('type', v)} />
      </FilterSection>

      <FilterSection title='Fuel Type'>
        <CheckGroup options={FUELS} selected={filters.fuel} onChange={(v) => setFilter('fuel', v)} />
      </FilterSection>

      <FilterSection title='Transmission'>
        <CheckGroup options={TRANSMISSIONS} selected={filters.transmission} onChange={(v) => setFilter('transmission', v)} />
      </FilterSection>

      <FilterSection title='Max Price'>
        <div className='space-y-2'>
          <input
            type='range'
            min={0} max={priceCap} step={Math.ceil(priceCap / 100)}
            value={filters.maxPrice}
            onChange={(e) => setFilter('maxPrice', Number(e.target.value))}
            className='w-full accent-amber-500'
          />
          <div className='flex justify-between text-xs text-gray-500 dark:text-zinc-500'>
            <span>PKR 0</span>
            <span className='font-bold text-amber-600'>{fmt(filters.maxPrice)}</span>
            <span>{fmt(priceCap)}</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title='Max Mileage' defaultOpen={false}>
        <div className='space-y-2'>
          <input
            type='range'
            min={0} max={mileageCap} step={Math.ceil(mileageCap / 100)}
            value={filters.maxMileage}
            onChange={(e) => setFilter('maxMileage', Number(e.target.value))}
            className='w-full accent-amber-500'
          />
          <div className='flex justify-between text-xs text-gray-500 dark:text-zinc-500'>
            <span>0 km</span>
            <span className='font-bold text-amber-600'>{fmtMiles(filters.maxMileage)}</span>
            <span>{fmtMiles(mileageCap)}</span>
          </div>
        </div>
      </FilterSection>
    </aside>
  );
}

function CarCardGrid({ car, onAddToCart, inCart }) {
  const carId        = car._id || car.id;
  const dispatch     = useDispatch();
  const isWishlisted = useSelector(selectIsWishlisted(carId));
  const isCompared   = useSelector(selectIsCompared(carId));
  const [flash, setFlash] = useState(false);
  const tilt = useTilt(12);

  const handleAdd = () => {
    onAddToCart(car);
    if (!inCart) { setFlash(true); setTimeout(() => setFlash(false), 1500); }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist(carId));
    dispatch(addToast({ type: isWishlisted ? 'info' : 'success', message: isWishlisted ? 'Removed from wishlist' : `${car.make} ${car.model} saved ❤️` }));
  };

  const handleCompare = (e) => {
    e.preventDefault();
    dispatch(toggleCompare(carId));
    dispatch(addToast({ type: isCompared ? 'info' : 'success', message: isCompared ? 'Removed from comparison' : 'Added to compare bar' }));
  };

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className={`card-shine bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border flex flex-col group ${car.featured ? 'border-amber-400/60 shadow-amber-400/20 shadow-md ring-1 ring-amber-400/30' : 'border-gray-100 dark:border-zinc-700'}`}
      style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
    >
      {/* Image */}
      <div className='relative bg-gradient-to-br from-slate-900 to-slate-700 h-44 overflow-hidden'>
        <div className='absolute inset-0 flex items-center justify-center'>
          <MdDirectionsCar className='text-white/10 text-[130px]' />
        </div>
        {(car.images?.[0] || car.image) && (
          <img
            src={car.images?.[0] || car.image}
            alt={`${car.make} ${car.model}`}
            className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
        {(car.badge || car.featured) && (
          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full border ${BADGE_STYLES[car.badge] ?? 'bg-amber-400 text-amber-900 border-amber-300'}`}>
            {car.badge || '⭐ Featured'}
          </span>
        )}
        <div className='absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
          <Link
            to={`/car/${carId}`}
            className='w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-amber-400 transition-colors'
            title='View Details'
          >
            <FiEye className='text-gray-700 text-sm' />
          </Link>
          <button
            onClick={handleWishlist}
            className='w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors'
            title='Wishlist'
          >
            {isWishlisted
              ? <MdFavorite className='text-red-500 text-sm' />
              : <MdFavoriteBorder className='text-gray-600 text-sm' />
            }
          </button>
          <button
            onClick={handleCompare}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors ${isCompared ? 'bg-amber-400' : 'bg-white/90 hover:bg-amber-50'}`}
            title='Compare'
          >
            <MdCompareArrows className={`text-sm ${isCompared ? 'text-white' : 'text-gray-600'}`} />
          </button>
        </div>
        <span className='absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg'>
          {car.year}
        </span>
      </div>

      {/* Info */}
      <div className='p-4 flex flex-col flex-1'>
        <div className='flex justify-between items-start mb-1'>
          <h3 className='font-bold text-gray-900 dark:text-zinc-100 text-base'>{car.make} {car.model}</h3>
          <span className='text-amber-600 font-black text-sm whitespace-nowrap ml-2'>{fmt(car.price)}</span>
        </div>
        <p className='text-gray-400 dark:text-zinc-500 text-xs mb-3'>{car.color} • {car.transmission}</p>

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
            className='flex-1 text-center text-sm py-2.5 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium transition-colors'
          >
            Details
          </Link>
          <button
            onClick={handleAdd}
            className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              inCart ? 'bg-red-500 text-white hover:bg-red-400' :
              flash  ? 'bg-emerald-500 text-white scale-95' :
              'bg-slate-900 text-white hover:bg-amber-500'
            }`}
          >
            {inCart ? <><MdClose className='text-base' /> Remove</>
            : flash  ? <><FiCheckCircle /> Added!</>
            : <><FiShoppingCart className='text-sm' /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function CarCardList({ car, onAddToCart, inCart }) {
  const carId = car._id || car.id;
  const [flash, setFlash] = useState(false);
  const handleAdd = () => {
    onAddToCart(car);
    if (!inCart) { setFlash(true); setTimeout(() => setFlash(false), 1500); }
  };

  return (
    <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 hover:shadow-lg transition-all duration-200 flex overflow-hidden group'>
      {/* Thumbnail */}
      <div className='w-48 flex-shrink-0 bg-gradient-to-br from-slate-900 to-slate-700 relative overflow-hidden'>
        <div className='absolute inset-0 flex items-center justify-center'>
          <MdDirectionsCar className='text-white/10 text-7xl' />
        </div>
        {(car.images?.[0] || car.image) && (
          <img
            src={car.images?.[0] || car.image}
            alt={`${car.make} ${car.model}`}
            className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div className='absolute inset-0 bg-gradient-to-r from-transparent to-black/20' />
        {car.badge && (
          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full border ${BADGE_STYLES[car.badge] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {car.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className='flex-1 p-4 flex items-center gap-6'>
        <div className='flex-1'>
          <div className='flex items-center gap-3 mb-1'>
            <h3 className='font-bold text-gray-900 dark:text-zinc-100 text-lg'>{car.make} {car.model}</h3>
            <span className='text-gray-400 dark:text-zinc-500 text-sm'>{car.year}</span>
          </div>
          <p className='text-gray-400 dark:text-zinc-500 text-sm mb-3'>{car.color} • {car.transmission}</p>
          <div className='flex gap-3 flex-wrap'>
            <span className='flex items-center gap-1 text-xs text-gray-600 dark:text-zinc-400'><MdLocalGasStation className='text-amber-500' /> {car.fuel}</span>
            <span className='flex items-center gap-1 text-xs text-gray-600 dark:text-zinc-400'><MdSpeed className='text-amber-500' /> {fmtMiles(car.mileage)}</span>
            <span className='flex items-center gap-1 text-xs text-gray-600 dark:text-zinc-400'><MdDirectionsCar className='text-amber-500' /> {car.type}</span>
          </div>
        </div>

        <div className='flex flex-col items-end gap-3 flex-shrink-0'>
          <span className='text-amber-600 font-black text-xl'>{fmt(car.price)}</span>
          <div className='flex gap-2'>
            <Link
              to={`/car/${carId}`}
              className='text-sm px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium transition-colors'
            >
              View Details
            </Link>
            <button
              onClick={handleAdd}
              className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                inCart ? 'bg-red-500 text-white hover:bg-red-400' :
                flash  ? 'bg-emerald-500 text-white scale-95' :
                'bg-slate-900 text-white hover:bg-amber-500'
              }`}
            >
              {inCart ? <><MdClose /> Remove</>
              : flash  ? <><FiCheckCircle /> Added!</>
              : <><FiShoppingCart /> Add to Cart</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_FILTERS = {
  make: 'All', type: 'All', fuel: 'All',
  transmission: 'All', maxPrice: Infinity, maxMileage: Infinity,
};

export default function ShopCars() {
  const location = useLocation();
  const dispatch   = useDispatch();
  const cartItems  = useSelector(selectCartItems);
  const apiCars    = useSelector(selectCars);
  const loading    = useSelector(selectCarsLoading);

  const user         = useSelector(selectUser);
  const navigate     = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSellClick = (e) => {
    e.preventDefault();
    if (!user) { setShowLoginModal(true); return; }
    navigate('/sell');
  };
  const [listingTab,    setListingTab]   = useState('dealer');
  const [filters,       setFilters]      = useState(DEFAULT_FILTERS);
  const [sortBy,        setSortBy]       = useState('newest');
  const [viewMode,      setViewMode]     = useState('grid');
  const [sidebarOpen,   setSidebarOpen]  = useState(false);
  const [searchQuery,   setSearchQuery]  = useState('');

  const dealerCars = useMemo(() => apiCars.filter(c => !c.listingType || c.listingType === 'dealer'), [apiCars]);
  const usedCars   = useMemo(() => apiCars.filter(c => c.listingType === 'used'), [apiCars]);

  const cartIds = useMemo(() => new Set(cartItems.map((c) => c.id)), [cartItems]);

  const priceCap   = useMemo(() => dealerCars.length ? Math.max(...dealerCars.map(c => c.price))   : 50_000_000, [dealerCars]);
  const mileageCap = useMemo(() => dealerCars.length ? Math.max(...dealerCars.map(c => c.mileage)) : 500_000,    [dealerCars]);

  useEffect(() => { dispatch(fetchCars()); }, [dispatch]);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const q    = p.get('q')    || '';
    const type = p.get('type') || '';
    const make = p.get('make') || '';
    const fuel = p.get('fuel') || '';

    setSearchQuery(q);
    setFilters({
      ...DEFAULT_FILTERS,
      ...(type && TYPES.includes(type) ? { type } : {}),
      ...(make && MAKES.includes(make) ? { make } : {}),
      ...(fuel && FUELS.includes(fuel) ? { fuel } : {}),
    });
  }, [location.search]);

  const handleAddToCart = (car) => {
    if (!user) { setShowLoginModal(true); return; }
    const id = car._id || car.id;
    if (cartIds.has(id)) {
      dispatch(removeFromCart(id));
      dispatch(addToast({ type: 'info', message: `${car.make} ${car.model} removed from cart` }));
    } else {
      dispatch(addToCart({ id, brand: car.make, name: car.model, year: car.year, price: car.price, image: car.images?.[0] || car.image || null, category: car.type }));
      dispatch(addToast({ type: 'success', message: `${car.make} ${car.model} added to cart!` }));
    }
  };

  const setFilter = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));
  const resetFilters = () => setFilters({ ...DEFAULT_FILTERS, maxPrice: priceCap, maxMileage: mileageCap });

  const filtered = useMemo(() => {
    let list = [...dealerCars];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) =>
        c.make.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        `${c.make} ${c.model}`.toLowerCase().includes(q)
      );
    }
    if (filters.make         !== 'All') list = list.filter((c) => c.make         === filters.make);
    if (filters.type         !== 'All') list = list.filter((c) => c.type         === filters.type);
    if (filters.fuel         !== 'All') list = list.filter((c) => c.fuel         === filters.fuel);
    if (filters.transmission !== 'All') list = list.filter((c) => c.transmission === filters.transmission);
    list = list.filter((c) => c.price   <= filters.maxPrice);
    list = list.filter((c) => c.mileage <= filters.maxMileage);
    if (sortBy === 'newest')     list.sort((a, b) => b.year    - a.year);
    if (sortBy === 'oldest')     list.sort((a, b) => a.year    - b.year);
    if (sortBy === 'price_asc')  list.sort((a, b) => a.price   - b.price);
    if (sortBy === 'price_desc') list.sort((a, b) => b.price   - a.price);
    if (sortBy === 'mileage')    list.sort((a, b) => a.mileage - b.mileage);
    return list;
  }, [dealerCars, filters, sortBy, searchQuery]);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-zinc-950'>
      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} reason='cart' />}

      {/* ── Page Header ── */}
      <div className='bg-gradient-to-r from-slate-900 to-slate-800 text-white py-10 px-4'>
        <div className='max-w-[1400px] mx-auto'>
          <p className='text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2'>Browse Inventory</p>
          <h1 className='text-3xl md:text-4xl font-black mb-1'>Shop Cars</h1>
          <p className='text-slate-400 text-sm mb-6'>
            {dealerCars.length} dealer cars · {usedCars.length} used cars from private sellers
          </p>

          {/* ── AI Find Button ── */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-carmart-ai', { detail: { message: 'Mujhe apni perfect car dhundhne mein help karo. Budget, fuel type, aur family size batao aur main recommend karunga.' } }))}
            className='flex items-center gap-2 mb-4 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-sm font-semibold hover:bg-amber-500/30 transition-colors'
          >
            <HiSparkles className='text-base' />
            AI se perfect car dhundwao
          </button>

          {/* ── Listing Type Tabs ── */}
          <div className='flex gap-2'>
            <button
              onClick={() => setListingTab('dealer')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                listingTab === 'dealer'
                  ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/30'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <MdDirectionsCar className='text-base' />
              Dealer Cars
              <span className={`text-xs px-2 py-0.5 rounded-full font-black ${listingTab === 'dealer' ? 'bg-zinc-900/20' : 'bg-white/10'}`}>
                {dealerCars.length}
              </span>
            </button>
            <button
              onClick={() => setListingTab('used')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                listingTab === 'used'
                  ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/30'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <MdSell className='text-base' />
              Used Cars
              <span className={`text-xs px-2 py-0.5 rounded-full font-black ${listingTab === 'used' ? 'bg-zinc-900/20' : 'bg-white/10'}`}>
                {usedCars.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className='max-w-[1400px] mx-auto px-4 py-8'>

        {/* ══ USED CARS TAB ══════════════════════════════════════════════════════ */}
        {listingTab === 'used' && (
          <div>
            {/* Banner */}
            <div className='bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl px-6 py-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
              <div>
                <h2 className='text-white font-black text-xl mb-1'>Used Cars by Private Sellers</h2>
                <p className='text-emerald-100 text-sm'>Contact sellers directly — negotiate price, inspect car, and close the deal.</p>
              </div>
              <button
                onClick={handleSellClick}
                className='flex-shrink-0 flex items-center gap-2 bg-white text-emerald-700 font-black px-5 py-2.5 rounded-xl text-sm hover:bg-emerald-50 transition-colors'
              >
                <MdSell /> List Your Car
              </button>
            </div>

            {loading ? (
              <CarGridSkeleton count={6} />
            ) : usedCars.length === 0 ? (
              <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 py-24 text-center shadow-sm'>
                <MdSell className='text-7xl mx-auto mb-4 text-gray-200 dark:text-zinc-700' />
                <p className='text-lg font-bold text-gray-800 dark:text-zinc-200 mb-2'>No Used Cars Listed Yet</p>
                <p className='text-sm text-gray-400 dark:text-zinc-500 mb-6'>Be the first to list your car for sale!</p>
                <button
                  onClick={handleSellClick}
                  className='inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-8 py-3 rounded-xl hover:-translate-y-0.5 transition-all hover:shadow-lg hover:shadow-amber-500/30'
                >
                  Sell Your Car
                </button>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
                {usedCars.map((car, i) => (
                  <UsedCarCard key={car._id || car.id} car={car} idx={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ DEALER CARS TAB ════════════════════════════════════════════════════ */}
        {listingTab === 'dealer' && <div className='flex gap-6'>

          {/* ── Sidebar Desktop ── */}
          <div className='hidden lg:block w-64 flex-shrink-0'>
            <Sidebar filters={filters} setFilter={setFilter} onReset={resetFilters} priceCap={priceCap} mileageCap={mileageCap} />
          </div>

          {/* ── Mobile Sidebar Overlay ── */}
          {sidebarOpen && (
            <div className='fixed inset-0 z-50 flex lg:hidden'>
              <div className='absolute inset-0 bg-black/50' onClick={() => setSidebarOpen(false)} />
              <div className='relative bg-white w-72 h-full overflow-y-auto p-5 shadow-2xl'>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='font-black text-gray-900'>Filters</h2>
                  <button onClick={() => setSidebarOpen(false)}>
                    <MdClose className='text-2xl text-gray-500' />
                  </button>
                </div>
                <Sidebar filters={filters} setFilter={setFilter} onReset={resetFilters} priceCap={priceCap} mileageCap={mileageCap} />
              </div>
            </div>
          )}

          {/* ── Main Content ── */}
          <div className='flex-1 min-w-0'>

            {/* Toolbar */}
            <div className='flex items-center justify-between gap-3 mb-6 flex-wrap'>
              <div className='flex items-center gap-3'>
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className='lg:hidden flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-sm'
                >
                  <MdFilterList className='text-amber-500 text-lg' /> Filters
                </button>
                <span className='text-sm text-gray-500 dark:text-zinc-400'>
                  <span className='font-bold text-gray-800 dark:text-zinc-200'>{filtered.length}</span> cars found
                </span>
              </div>

              <div className='flex items-center gap-3'>
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className='bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-amber-500 shadow-sm'
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                {/* View Toggle */}
                <div className='flex bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm'>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-gray-400 hover:text-gray-700'}`}
                    title='Grid View'
                  >
                    <MdGridView className='text-lg' />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-gray-400 hover:text-gray-700'}`}
                    title='List View'
                  >
                    <MdViewList className='text-lg' />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {(searchQuery.trim() || Object.entries(filters).some(([k, v]) =>
              k !== 'maxPrice' && k !== 'maxMileage' ? v !== 'All' :
              k === 'maxPrice' ? v < 9_000_000 : v < 40_000
            )) && (
              <div className='flex flex-wrap gap-2 mb-5'>
                {searchQuery.trim()   &&               <FilterTag label={`Search: "${searchQuery}"`}  onRemove={() => setSearchQuery('')} />}
                {filters.make         !== 'All'       && <FilterTag label={`Make: ${filters.make}`}         onRemove={() => setFilter('make', 'All')} />}
                {filters.type         !== 'All'       && <FilterTag label={`Type: ${filters.type}`}         onRemove={() => setFilter('type', 'All')} />}
                {filters.fuel         !== 'All'       && <FilterTag label={`Fuel: ${filters.fuel}`}         onRemove={() => setFilter('fuel', 'All')} />}
                {filters.transmission !== 'All'       && <FilterTag label={`Transmission: ${filters.transmission}`} onRemove={() => setFilter('transmission', 'All')} />}
                {filters.maxPrice     <  9_000_000    && <FilterTag label={`Max: ${fmt(filters.maxPrice)}`} onRemove={() => setFilter('maxPrice', 9_000_000)} />}
                {filters.maxMileage   <  40_000       && <FilterTag label={`Mileage: ${fmtMiles(filters.maxMileage)}`} onRemove={() => setFilter('maxMileage', 40_000)} />}
                <button onClick={resetFilters} className='text-xs text-red-400 hover:text-red-600 font-medium px-2 transition-colors'>
                  Clear all
                </button>
              </div>
            )}

            {/* Car Listings */}
            {loading ? (
              <CarGridSkeleton count={6} />
            ) : filtered.length === 0 ? (
              <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 py-24 text-center text-gray-400 dark:text-zinc-500 shadow-sm'>
                <MdDirectionsCar className='text-7xl mx-auto mb-4 opacity-10' />
                <p className='text-lg font-semibold'>No cars found</p>
                <p className='text-sm mt-1 mb-5'>Try adjusting your filters</p>
                <button
                  onClick={resetFilters}
                  className='bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-amber-500 transition-colors'
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
                {filtered.map((car, i) => {
                  const carId = car._id || car.id;
                  return (
                    <div key={carId} className='anim-fade-up' style={{ animationDelay: `${i * 0.07}s` }}>
                      <CarCardGrid car={car} onAddToCart={handleAddToCart} inCart={cartIds.has(carId)} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='space-y-4'>
                {filtered.map((car, i) => {
                  const carId = car._id || car.id;
                  return (
                    <div key={carId} className='anim-fade-up' style={{ animationDelay: `${i * 0.06}s` }}>
                      <CarCardList car={car} onAddToCart={handleAddToCart} inCart={cartIds.has(carId)} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>}
      </div>
    </div>
  );
}

function FilterTag({ label, onRemove }) {
  return (
    <span className='flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 font-medium px-3 py-1 rounded-full'>
      {label}
      <button onClick={onRemove} className='hover:text-red-500 transition-colors'>
        <MdClose className='text-sm' />
      </button>
    </span>
  );
}

function UsedCarCard({ car, idx }) {
  const carId   = car._id || car.id;
  const phone   = car.seller?.phone || '';
  const waPhone = phone.replace(/\D/g, '');
  const user    = useSelector(selectUser);
  const canSeeSellerContact = user?.role === 'seller' || user?.role === 'admin';

  return (
    <div
      className='anim-fade-up bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group'
      style={{ animationDelay: `${idx * 0.07}s` }}
    >
      {/* Image */}
      <div className='relative h-48 bg-gradient-to-br from-slate-800 to-slate-700 overflow-hidden flex-shrink-0'>
        {(car.images?.[0] || car.image) ? (
          <img
            src={car.images?.[0] || car.image}
            alt={`${car.make} ${car.model}`}
            className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
          />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center'>
            <MdDirectionsCar className='text-7xl text-slate-600' />
          </div>
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />

        {/* Used badge */}
        <span className='absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider'>
          Used · Private Seller
        </span>
        <span className='absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg'>
          {car.year}
        </span>
      </div>

      {/* Info */}
      <div className='p-4 flex flex-col flex-1'>
        <div className='flex justify-between items-start mb-1'>
          <h3 className='font-black text-gray-900 dark:text-zinc-100 text-base leading-tight'>
            {car.make} {car.model}
          </h3>
          <span className='text-amber-600 dark:text-amber-400 font-black text-sm whitespace-nowrap ml-2'>
            {fmt(car.price)}
          </span>
        </div>

        {/* Specs row */}
        <div className='flex flex-wrap gap-2 my-3'>
          <span className='flex items-center gap-1 text-xs bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-100 dark:border-zinc-700 px-2 py-1 rounded-lg'>
            <MdLocalGasStation className='text-amber-500' /> {car.fuel}
          </span>
          <span className='flex items-center gap-1 text-xs bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-100 dark:border-zinc-700 px-2 py-1 rounded-lg'>
            <MdSpeed className='text-amber-500' /> {fmtMiles(car.mileage)}
          </span>
          <span className='flex items-center gap-1 text-xs bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-100 dark:border-zinc-700 px-2 py-1 rounded-lg'>
            <MdDirectionsCar className='text-amber-500' /> {car.type}
          </span>
        </div>

        {/* Seller info box */}
        <div className='bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-xl px-3.5 py-3 mb-4'>
          <p className='text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2'>Seller Info</p>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2 text-sm text-gray-800 dark:text-zinc-200'>
              <MdPerson className='text-amber-500 flex-shrink-0' />
              {canSeeSellerContact
                ? <span className='font-semibold truncate'>{car.seller?.name || 'Private Seller'}</span>
                : <span className='font-semibold text-gray-400 dark:text-zinc-500 tracking-widest'>••••••••••</span>
              }
            </div>
            {car.seller?.city && (
              <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400'>
                <MdLocationOn className='text-amber-500 flex-shrink-0' />
                <span>{car.seller.city}</span>
              </div>
            )}
            {canSeeSellerContact && phone && (
              <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400'>
                <MdPhone className='text-amber-500 flex-shrink-0' />
                <span className='font-mono'>{phone}</span>
              </div>
            )}
            {!canSeeSellerContact && (
              <p className='text-[10px] text-gray-400 dark:text-zinc-500 flex items-center gap-1'>
                <MdClose className='text-xs' /> Seller ka contact sirf sellers ko dikhai deta hai
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className='flex gap-2 mt-auto'>
          <Link
            to={`/car/${carId}`}
            className='flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-semibold transition-colors'
          >
            <FiEye /> View
          </Link>
          {canSeeSellerContact && phone && (
            <a
              href={`https://wa.me/92${waPhone.replace(/^0/, '')}?text=${encodeURIComponent(`Hi, I'm interested in your ${car.make} ${car.model} (${car.year}) listed on Car Mart.`)}`}
              target='_blank'
              rel='noreferrer'
              className='flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-colors'
            >
              <BsWhatsapp /> WhatsApp
            </a>
          )}
          {!canSeeSellerContact && (
            <div className='flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500 font-bold cursor-not-allowed select-none'>
              <MdClose className='text-sm' /> Hidden
            </div>
          )}
        </div>
      </div>
    </div>
  );
}