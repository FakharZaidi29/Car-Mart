import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, selectCartItems } from '../slices/cartSlice';
import { selectUser } from '../slices/authSlice';
import LoginRequiredModal from '../LoginModal/LoginRequiredModal';
import { toggleWishlist, selectIsWishlisted } from '../slices/wishlistSlice';
import { toggleCompare, selectIsCompared } from '../slices/compareSlice';
import { addToast } from '../slices/toastSlice';
import { viewCar, selectRecentlyViewed } from '../slices/recentlyViewedSlice';
import { fetchCar, fetchCars, selectCar, selectCars, selectCarsLoading, clearCurrent } from '../slices/carsSlice';
import { fmt, fmtMiles } from '../../data/cars';
import { api } from '../../api';
import EMICalculator from '../EMI/EMICalculator';
import {
  MdLocalGasStation, MdSpeed, MdDirectionsCar, MdVerified,
  MdStar, MdShare, MdFavorite, MdFavoriteBorder,
  MdPayment, MdSupportAgent, MdCheckCircle, MdCalculate,
  MdCompareArrows, MdPhone, MdClose, MdEdit, MdDelete,
  MdSend, MdPerson, MdLock,
} from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi2';
import { FiShoppingCart, FiCheckCircle, FiShield, FiAward } from 'react-icons/fi';
import { BsSpeedometer2, BsStarFill, BsCarFront, BsWhatsapp } from 'react-icons/bs';
import { TbManualGearbox as TbGear, TbEngine as TbEng } from 'react-icons/tb';

function StarSelector({ value, onChange }) {
  return (
    <div className='flex gap-1'>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type='button'
          onClick={() => onChange(n)}
          className={`text-2xl transition-colors ${n <= value ? 'text-amber-400' : 'text-gray-300 dark:text-zinc-600'} hover:text-amber-400`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewsSection({ carId, user }) {
  const [reviews,     setReviews]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [newRating,   setNewRating]   = useState(5);
  const [newComment,  setNewComment]  = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [editId,      setEditId]      = useState(null);
  const [editRating,  setEditRating]  = useState(5);
  const [editComment, setEditComment] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getReviews(carId);
      setReviews(data.reviews || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (carId) load(); }, [carId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await api.createReview(carId, { rating: newRating, comment: newComment.trim() });
      setNewComment('');
      setNewRating(5);
      await load();
    } catch (err) {
      alert(err.message || 'Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (r) => {
    setEditId(r._id);
    setEditRating(r.rating);
    setEditComment(r.comment);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editComment.trim()) return;
    try {
      await api.updateReview(editId, { rating: editRating, comment: editComment.trim() });
      setEditId(null);
      await load();
    } catch (err) {
      alert(err.message || 'Failed to update review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.deleteReview(reviewId);
      await load();
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const alreadyReviewed = user && reviews.some(r => r.user === user._id || r.user?._id === user._id);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className='mt-12'>
      <div className='flex items-center gap-3 mb-6'>
        <h2 className='text-2xl font-black text-gray-900 dark:text-zinc-100'>Reviews</h2>
        {avg && (
          <span className='flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-bold'>
            ★ {avg} <span className='text-gray-400 dark:text-zinc-500 font-normal'>({reviews.length})</span>
          </span>
        )}
      </div>

      {/* Post form — logged-in users who haven't reviewed yet */}
      {user && !alreadyReviewed && (
        <form onSubmit={handleSubmit} className='bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-700 mb-6'>
          <p className='font-bold text-gray-900 dark:text-zinc-100 text-sm mb-3'>Write a Review</p>
          <div className='mb-3'>
            <StarSelector value={newRating} onChange={setNewRating} />
          </div>
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder='Share your experience with this car...'
            rows={3}
            maxLength={1000}
            className='w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none mb-3'
          />
          <button
            type='submit'
            disabled={submitting || !newComment.trim()}
            className='flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors'
          >
            <MdSend className='text-base' />
            {submitting ? 'Posting…' : 'Post Review'}
          </button>
        </form>
      )}

      {user && alreadyReviewed && (
        <p className='text-sm text-gray-500 dark:text-zinc-500 mb-6 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 rounded-xl px-4 py-3'>
          You have already reviewed this car. You can edit or delete your review below.
        </p>
      )}

      {!user && (
        <p className='text-sm text-gray-500 dark:text-zinc-500 mb-6 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 rounded-xl px-4 py-3'>
          <Link to='/login' className='text-amber-500 font-semibold hover:underline'>Sign in</Link> to write a review.
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className='space-y-3'>
          {[1,2].map(i => (
            <div key={i} className='bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-700 animate-pulse'>
              <div className='h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/4 mb-3' />
              <div className='h-3 bg-gray-200 dark:bg-zinc-700 rounded w-3/4' />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className='text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700'>
          <p className='text-4xl mb-3'>💬</p>
          <p className='text-gray-500 dark:text-zinc-500 text-sm'>No reviews yet. Be the first to review this car!</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {reviews.map(r => {
            const isOwner = user && (r.user === user._id || r.user?._id === user._id);
            const isEditing = editId === r._id;
            return (
              <div key={r._id} className='bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-700'>
                <div className='flex items-start justify-between mb-2'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0'>
                      {r.userName?.[0]?.toUpperCase() ?? <MdPerson />}
                    </div>
                    <div>
                      <p className='font-bold text-gray-900 dark:text-zinc-100 text-sm'>{r.userName}</p>
                      <div className='flex items-center gap-1'>
                        {[1,2,3,4,5].map(n => (
                          <span key={n} className={`text-sm ${n <= r.rating ? 'text-amber-400' : 'text-gray-200 dark:text-zinc-700'}`}>★</span>
                        ))}
                        <span className='text-xs text-gray-400 dark:text-zinc-500 ml-1'>
                          {new Date(r.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isOwner && !isEditing && (
                    <div className='flex gap-2'>
                      <button onClick={() => startEdit(r)} className='p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors'>
                        <MdEdit className='text-base' />
                      </button>
                      <button onClick={() => handleDelete(r._id)} className='p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors'>
                        <MdDelete className='text-base' />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdate} className='mt-3'>
                    <StarSelector value={editRating} onChange={setEditRating} />
                    <textarea
                      value={editComment}
                      onChange={e => setEditComment(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      className='w-full mt-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500 resize-none mb-3'
                    />
                    <div className='flex gap-2'>
                      <button type='submit' className='px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm rounded-xl transition-colors'>Save</button>
                      <button type='button' onClick={() => setEditId(null)} className='px-4 py-2 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 font-semibold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors'>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <p className='text-sm text-gray-700 dark:text-zinc-300 leading-relaxed mt-2'>{r.comment}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const BADGE_STYLES = {
  'Popular':     'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  'New Arrival': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
  'Featured':    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
  'Best Value':  'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30',
  'Hybrid':      'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/30',
  'Budget Pick': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
  'Premium':     'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30',
};

function DetailSkeleton() {
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950 animate-pulse'>
      <div className='max-w-6xl mx-auto px-4 pt-6 pb-16'>
        <div className='grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8'>
          <div>
            <div className='rounded-3xl bg-slate-200 dark:bg-zinc-800 aspect-[16/9] mb-6' />
            <div className='h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl w-2/3 mb-4' />
            <div className='grid grid-cols-3 gap-3 mb-6'>
              {[...Array(6)].map((_, i) => (
                <div key={i} className='h-20 bg-slate-200 dark:bg-zinc-800 rounded-2xl' />
              ))}
            </div>
            <div className='h-32 bg-slate-200 dark:bg-zinc-800 rounded-2xl mb-6' />
          </div>
          <div>
            <div className='h-80 bg-slate-200 dark:bg-zinc-800 rounded-2xl' />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarDetail() {
  const { id }    = useParams();
  const dispatch  = useDispatch();
  const nav       = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const car       = useSelector(selectCar);
  const allCars   = useSelector(selectCars);
  const loading   = useSelector(selectCarsLoading);
  const recentIds = useSelector(selectRecentlyViewed);

  const carId      = car?._id || car?.id;
  const isWishlisted = useSelector(selectIsWishlisted(carId));
  const isCompared   = useSelector(selectIsCompared(carId));

  const user      = useSelector(selectUser);
  const [flash,          setFlash]          = useState(false);
  const [showEMI,        setShowEMI]        = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeImg,      setActiveImg]      = useState(0);

  useEffect(() => {
    dispatch(fetchCar(id));
    if (allCars.length === 0) dispatch(fetchCars());
    return () => { dispatch(clearCurrent()); };
  }, [id]);

  useEffect(() => {
    if (carId) dispatch(viewCar(carId));
  }, [carId]);

  const inCart = cartItems.some(c => (c._id || c.id) === carId);
  const canSeeSellerContact = true;

  const handleAddToCart = () => {
    if (!car) return;
    if (!user) { setShowLoginModal(true); return; }
    if (inCart) {
      dispatch(removeFromCart(carId));
      dispatch(addToast({ type: 'info', message: `${car.make} ${car.model} removed from cart` }));
    } else {
      dispatch(addToCart({ id: carId, brand: car.make, name: car.model, year: car.year, price: car.price, image: car.image, category: car.type }));
      dispatch(addToast({ type: 'success', message: `${car.make} ${car.model} added to cart!` }));
      setFlash(true);
      setTimeout(() => setFlash(false), 2000);
    }
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(carId));
    dispatch(addToast({
      type: isWishlisted ? 'info' : 'success',
      message: isWishlisted ? 'Removed from wishlist' : `${car.make} ${car.model} saved to wishlist ❤️`,
    }));
  };

  const handleCompare = () => {
    dispatch(toggleCompare(carId));
    dispatch(addToast({
      type: isCompared ? 'info' : 'success',
      message: isCompared ? 'Removed from comparison' : 'Added to comparison bar below',
    }));
  };

  const handleWhatsApp = () => {
    const msg   = encodeURIComponent(`Hi, I'm interested in your ${car.make} ${car.model} (${car.year}) listed for ${fmt(car.price)} on CarMart. Is it still available?`);
    const phone = car.seller?.phone ? car.seller.phone.replace(/\D/g, '') : '';
    const wa    = phone ? `https://wa.me/${phone.startsWith('0') ? '92' + phone.slice(1) : phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(wa, '_blank');
  };

  const handleAskAI = (question) => {
    const msg = question || `Is PKR ${car?.price?.toLocaleString()} a fair price for a ${car?.year} ${car?.make} ${car?.model} with ${car?.mileage?.toLocaleString()} km? Give me an honest opinion.`;
    window.dispatchEvent(new CustomEvent('open-carmart-ai', { detail: { message: msg } }));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${car.make} ${car.model}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      dispatch(addToast({ type: 'info', message: 'Link copied to clipboard!' }));
    }
  };

  if (loading && !car) return <DetailSkeleton />;

  if (!car && !loading) return (
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4 text-center px-6'>
      <BsCarFront className='text-8xl text-gray-200 dark:text-zinc-700' />
      <h1 className='text-3xl font-black text-gray-900 dark:text-zinc-100'>Car Not Found</h1>
      <p className='text-gray-500 dark:text-zinc-400'>This listing may have been removed or the ID is invalid.</p>
      <Link to='/shop' className='mt-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl transition-colors'>
        Browse All Cars
      </Link>
    </div>
  );

  if (!car) return <DetailSkeleton />;

  const related = allCars
    .filter(c => (c._id || c.id) !== carId && c.make === car.make)
    .slice(0, 3);

  const recent = recentIds
    .filter(i => i !== carId)
    .map(i => allCars.find(c => (c._id || c.id) === i))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950'>
      {showEMI && <EMICalculator price={car.price} onClose={() => setShowEMI(false)} />}
      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} reason='cart' />}

      {/* ── Breadcrumb ── */}
      <div className='max-w-6xl mx-auto px-4 pt-6'>
        <nav className='flex items-center gap-2 text-xs text-gray-400 dark:text-zinc-500 mb-4'>
          <Link to='/' className='hover:text-amber-500 transition-colors'>Home</Link>
          <span>›</span>
          <Link to='/shop' className='hover:text-amber-500 transition-colors'>Shop Cars</Link>
          <span>›</span>
          <span className='text-gray-700 dark:text-zinc-300'>{car.make} {car.model}</span>
        </nav>
      </div>

      {/* ── Main Content ── */}
      <div className='max-w-6xl mx-auto px-4 pb-16'>
        <div className='grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8'>

          {/* LEFT — Image + Details */}
          <div>
            {/* Image Gallery */}
            {(() => {
              const allImgs = car.images?.length > 0 ? car.images : car.image ? [car.image] : [];
              const current = allImgs[activeImg] || car.image;
              return (
                <div className='anim-fade-up mb-6'>
                  {/* Main Image */}
                  <div className='relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-700 aspect-[16/9] shadow-xl'>
                    {current && <img src={current} alt={`${car.make} ${car.model}`} className='absolute inset-0 w-full h-full object-cover transition-opacity duration-300' />}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent' />

                    {/* Nav arrows */}
                    {allImgs.length > 1 && (
                      <>
                        <button onClick={() => setActiveImg(i => (i - 1 + allImgs.length) % allImgs.length)}
                          className='absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-lg transition-colors'>‹</button>
                        <button onClick={() => setActiveImg(i => (i + 1) % allImgs.length)}
                          className='absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-lg transition-colors'>›</button>
                        <span className='absolute bottom-14 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm'>
                          {activeImg + 1} / {allImgs.length}
                        </span>
                      </>
                    )}

                    {/* Top row */}
                    <div className='absolute top-4 left-4 right-4 flex items-start justify-between'>
                      <div className='flex flex-col gap-2'>
                        {car.badge && <span className={`text-xs font-bold px-3 py-1 rounded-full border ${BADGE_STYLES[car.badge] ?? ''}`}>{car.badge}</span>}
                        <span className='bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full'>{car.year}</span>
                      </div>
                      <div className='flex gap-2'>
                        <button onClick={handleWishlist} className='w-10 h-10 bg-white/90 dark:bg-zinc-800/90 rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform'>
                          {isWishlisted ? <MdFavorite className='text-red-500 text-lg' /> : <MdFavoriteBorder className='text-gray-600 text-lg' />}
                        </button>
                        <button onClick={handleShare} className='w-10 h-10 bg-white/90 dark:bg-zinc-800/90 rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform'>
                          <MdShare className='text-gray-600 text-lg' />
                        </button>
                      </div>
                    </div>
                    <div className='absolute bottom-4 left-4'>
                      <p className='text-white/70 text-xs mb-1'>Listed price</p>
                      <p className='text-3xl font-black text-white'>{fmt(car.price)}</p>
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {allImgs.length > 1 && (
                    <div className='flex gap-2 mt-3 overflow-x-auto pb-1'>
                      {allImgs.map((url, i) => (
                        <button key={i} onClick={() => setActiveImg(i)}
                          className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-amber-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                          <img src={url} alt='' className='w-full h-full object-cover' />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Title + action row */}
            <div className='anim-fade-up mb-5 flex items-start justify-between gap-4 flex-wrap'>
              <h1 className='text-3xl font-black text-gray-900 dark:text-zinc-100'>
                {car.make} {car.model}
                {car.seller?.verified && (
                  <MdVerified className='inline ml-2 text-blue-500 text-2xl align-middle' />
                )}
              </h1>
              <div className='flex gap-2 flex-shrink-0'>
                <button
                  onClick={handleCompare}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                    isCompared
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-amber-400 hover:text-amber-600'
                  }`}
                >
                  <MdCompareArrows className='text-base' />
                  {isCompared ? 'Added' : 'Compare'}
                </button>
                <button
                  onClick={() => setShowEMI(true)}
                  className='flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-amber-400 hover:text-amber-600 transition-all'
                >
                  <MdCalculate className='text-base' /> EMI
                </button>
                <button
                  onClick={() => handleAskAI()}
                  className='flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all'
                >
                  <HiSparkles className='text-base' /> Ask AI
                </button>
              </div>
            </div>

            {/* Specs Grid */}
            <div className='anim-fade-up grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6'>
              {[
                { icon: MdLocalGasStation, label: 'Fuel',         value: car.fuel           },
                { icon: BsSpeedometer2,   label: 'Mileage',      value: fmtMiles(car.mileage) },
                { icon: TbGear,           label: 'Transmission', value: car.transmission    },
                { icon: MdDirectionsCar,  label: 'Body Type',    value: car.type            },
                { icon: TbEng,            label: 'Color',        value: car.color           },
                { icon: MdStar,           label: 'Year',         value: String(car.year)    },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className='bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-700'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Icon className='text-amber-500 text-lg flex-shrink-0' />
                    <span className='text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wide'>{label}</span>
                  </div>
                  <p className='font-bold text-gray-900 dark:text-zinc-100 text-sm'>{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {car.description && (
              <div className='anim-fade-up bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-700 mb-6'>
                <h2 className='font-black text-gray-900 dark:text-zinc-100 text-base mb-3'>About this Car</h2>
                <p className='text-gray-600 dark:text-zinc-400 text-sm leading-relaxed'>{car.description}</p>
              </div>
            )}

            {/* Features */}
            {car.features?.length > 0 && (
              <div className='anim-fade-up bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-700 mb-6'>
                <h2 className='font-black text-gray-900 dark:text-zinc-100 text-base mb-4'>Key Features</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
                  {car.features.map(f => (
                    <div key={f} className='flex items-center gap-2.5'>
                      <FiCheckCircle className='text-emerald-500 text-base flex-shrink-0' />
                      <span className='text-sm text-gray-700 dark:text-zinc-300'>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Card */}
            {car.seller && (
              <div className='anim-fade-up bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-700'>
                <h2 className='font-black text-gray-900 dark:text-zinc-100 text-base mb-4'>Seller Information</h2>
                <div className='flex items-center gap-4'>
                  <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xl flex-shrink-0'>
                    {canSeeSellerContact ? (car.seller.name?.[0] ?? '?') : <MdClose className='text-2xl' />}
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-0.5'>
                      {canSeeSellerContact ? (
                        <>
                          <p className='font-bold text-gray-900 dark:text-zinc-100'>{car.seller.name}</p>
                          {car.seller.verified && (
                            <span className='flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold'>
                              <MdVerified className='text-sm' /> Verified
                            </span>
                          )}
                        </>
                      ) : (
                        <p className='font-bold text-gray-400 dark:text-zinc-500 tracking-widest text-sm'>••••••••••</p>
                      )}
                    </div>
                    <p className='text-xs text-gray-400 dark:text-zinc-500'>{car.seller.city}</p>
                    <div className='flex items-center gap-1 mt-1'>
                      <BsStarFill className='text-amber-400 text-xs' />
                      <span className='text-sm font-semibold text-gray-700 dark:text-zinc-300'>{car.seller.rating}</span>
                      <span className='text-xs text-gray-400 dark:text-zinc-500'>({car.seller.reviews} reviews)</span>
                    </div>
                  </div>
                  {canSeeSellerContact ? (
                    <button
                      onClick={handleWhatsApp}
                      className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-colors shadow-md shadow-green-500/20'
                    >
                      <BsWhatsapp className='text-base' /> WhatsApp
                    </button>
                  ) : (
                    <Link to='/login' className='flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-amber-400 transition-colors'>
                      <MdLock className='text-gray-400 dark:text-zinc-500 text-lg' />
                      <span className='text-[10px] text-gray-400 dark:text-zinc-500 font-semibold text-center leading-tight'>Sign<br/>in</span>
                    </Link>
                  )}
                </div>
                {!canSeeSellerContact && (
                  <p className='mt-3 text-xs text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-800 rounded-xl px-3 py-2'>
                    🔒 <Link to='/login' className='text-amber-500 font-semibold hover:underline'>Sign in</Link> to view seller contact details.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — Sticky Purchase Card */}
          <div className='lg:sticky lg:top-24 h-fit space-y-4'>

            {/* Price Card */}
            <div className='anim-fade-right bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-700 shadow-sm'>
              <p className='text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1'>Asking Price</p>
              <p className='text-4xl font-black text-amber-600 mb-1'>{fmt(car.price)}</p>
              <p className='text-xs text-gray-400 dark:text-zinc-500 mb-4'>Price is negotiable · No hidden charges</p>

              <button
                onClick={() => setShowEMI(true)}
                className='w-full mb-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-300 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 text-sm font-bold hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors'
              >
                <MdCalculate /> Calculate EMI / Monthly Payment
              </button>

              <button
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base transition-all duration-300 mb-3 ${
                  inCart
                    ? 'bg-red-500 hover:bg-red-400 text-white'
                    : flash
                    ? 'bg-emerald-500 text-white scale-[0.98]'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30'
                }`}
              >
                {inCart ? (
                  <><MdClose className='text-xl' /> Remove from Cart</>
                ) : flash ? (
                  <><FiCheckCircle className='text-xl' /> Added to Cart!</>
                ) : (
                  <><FiShoppingCart className='text-xl' /> Add to Cart</>
                )}
              </button>

              {canSeeSellerContact ? (
                <button
                  onClick={handleWhatsApp}
                  className='w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-green-500 hover:bg-green-400 text-white font-bold text-sm transition-colors shadow-md shadow-green-500/20 mb-3'
                >
                  <BsWhatsapp className='text-base' /> Chat with Seller on WhatsApp
                </button>
              ) : (
                <div className='w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-zinc-500 font-bold text-sm mb-3 cursor-not-allowed select-none'>
                  <MdLock className='text-base' /> Seller Contact Hidden
                </div>
              )}

              <button
                onClick={() => nav('/cart')}
                className='w-full py-3.5 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors'
              >
                View Cart
              </button>

              {/* AI Analysis CTA */}
              <button
                onClick={() => handleAskAI()}
                className='w-full mt-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 font-semibold text-sm hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-500/20 dark:hover:to-orange-500/20 transition-colors'
              >
                <HiSparkles className='text-amber-500 text-base' />
                AI se poochho — good deal hai?
              </button>

              <div className='mt-5 pt-5 border-t border-gray-100 dark:border-zinc-700 space-y-3'>
                {[
                  { icon: FiShield,       text: 'Verified listing — documents checked'  },
                  { icon: MdPayment,      text: 'Secure escrow payment system'          },
                  { icon: MdSupportAgent, text: '24/7 support throughout purchase'      },
                  { icon: FiAward,        text: '5-year extended warranty available'    },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className='flex items-start gap-2.5'>
                    <Icon className='text-amber-500 text-base flex-shrink-0 mt-0.5' />
                    <span className='text-xs text-gray-600 dark:text-zinc-400 leading-relaxed'>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Specs */}
            <div className='bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700'>
              <p className='text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3'>Quick Overview</p>
              {[
                ['Make',         car.make],
                ['Model',        car.model],
                ['Year',         car.year],
                ['Mileage',      fmtMiles(car.mileage)],
                ['Transmission', car.transmission],
                ['Fuel',         car.fuel],
                ['Color',        car.color],
              ].map(([k, v]) => (
                <div key={k} className='flex justify-between py-2 border-b border-gray-50 dark:border-zinc-800 last:border-0'>
                  <span className='text-xs text-gray-500 dark:text-zinc-500'>{k}</span>
                  <span className='text-xs font-semibold text-gray-800 dark:text-zinc-200'>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <ReviewsSection carId={carId} user={user} />

        {/* ── Recently Viewed ── */}
        {recent.length > 0 && (
          <div className='mt-12'>
            <h2 className='text-2xl font-black text-gray-900 dark:text-zinc-100 mb-6'>Recently Viewed</h2>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {recent.map(r => {
                const rId = r._id || r.id;
                return (
                  <Link key={rId} to={`/car/${rId}`} className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group'>
                    <div className='relative h-28 bg-gradient-to-br from-slate-800 to-slate-700 overflow-hidden'>
                      <img src={r.image} alt={r.model} className='absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' />
                    </div>
                    <div className='p-3'>
                      <p className='font-bold text-gray-900 dark:text-zinc-100 text-xs truncate'>{r.make} {r.model}</p>
                      <p className='text-amber-600 font-black text-xs mt-0.5'>{fmt(r.price)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Related Cars ── */}
        {related.length > 0 && (
          <div className='mt-12'>
            <h2 className='text-2xl font-black text-gray-900 dark:text-zinc-100 mb-6'>
              More {car.make} Cars
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
              {related.map(r => {
                const rId = r._id || r.id;
                return (
                  <Link
                    key={rId}
                    to={`/car/${rId}`}
                    className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group'
                  >
                    <div className='relative bg-gradient-to-br from-slate-900 to-slate-700 h-40 overflow-hidden'>
                      {r.image && (
                        <img
                          src={r.image}
                          alt={`${r.make} ${r.model}`}
                          className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                        />
                      )}
                      <span className='absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg'>
                        {r.year}
                      </span>
                    </div>
                    <div className='p-4'>
                      <p className='font-bold text-gray-900 dark:text-zinc-100 text-sm mb-0.5'>{r.make} {r.model}</p>
                      <p className='text-xs text-gray-400 dark:text-zinc-500 mb-2'>{r.fuel} · {fmtMiles(r.mileage)}</p>
                      <p className='font-black text-amber-600 text-sm'>{fmt(r.price)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
