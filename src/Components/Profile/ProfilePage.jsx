import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { selectUser, logout, setUser } from '../slices/authSlice';
import { selectWishlistIds } from '../slices/wishlistSlice';
import { selectCartCount } from '../slices/cartSlice';
import { addToast } from '../slices/toastSlice';
import { fetchCars, selectCars } from '../slices/carsSlice';
import { fmt } from '../../data/cars';
import { api } from '../../api';
import {
  MdPerson, MdEmail, MdPhone, MdEdit, MdLogout, MdVerified,
  MdFavorite, MdShoppingCart, MdDirectionsCar, MdStar,
  MdHistory, MdSettings, MdCheckCircle, MdCamera, MdList,
} from 'react-icons/md';
import { FiPackage, FiShield } from 'react-icons/fi';
import { BsCarFront } from 'react-icons/bs';

const STATUS = {
  delivered:  { label: 'Delivered',  cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'             },
  pending:    { label: 'Pending',     cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'        },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'                },
};

const LISTING_STATUS = {
  available: { label: 'Live',     cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  pending:   { label: 'Pending',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'        },
  rejected:  { label: 'Rejected', cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'                },
  sold:      { label: 'Sold',     cls: 'bg-gray-100 text-gray-600 dark:bg-zinc-700 dark:text-zinc-400'               },
};

export default function ProfilePage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const user       = useSelector(selectUser);
  const wishIds    = useSelector(selectWishlistIds);
  const cartCount  = useSelector(selectCartCount);
  const allCars    = useSelector(selectCars);
  const avatarRef  = useRef();

  const isSeller = user?.role === 'seller' || user?.role === 'admin';
  const tabs = [
    { key: 'overview',  label: 'Overview',    icon: MdPerson   },
    { key: 'orders',    label: 'My Orders',   icon: FiPackage  },
    ...(isSeller ? [{ key: 'listings', label: 'My Listings', icon: MdList }] : []),
    { key: 'settings',  label: 'Settings',    icon: MdSettings },
  ];

  const [tab, setTab]                   = useState('overview');
  const [editing, setEditing]           = useState(false);
  const [name,  setName]                = useState(user?.name  || '');
  const [phone, setPhone]               = useState(user?.phone || '');
  const [orders, setOrders]             = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [listings, setListings]         = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    if (allCars.length === 0) dispatch(fetchCars());
  }, []);

  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    api.getMyOrders()
      .then(data => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || !isSeller) return;
    setListingsLoading(true);
    api.getMyListings()
      .then(data => setListings(data.cars || []))
      .catch(() => setListings([]))
      .finally(() => setListingsLoading(false));
  }, [user]);

  if (!user) return (
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4 px-4 text-center'>
      <MdPerson className='text-8xl text-gray-200 dark:text-zinc-700' />
      <h1 className='text-2xl font-black text-gray-900 dark:text-zinc-100'>Not Logged In</h1>
      <p className='text-gray-500 dark:text-zinc-400 text-sm'>Please sign in to view your profile.</p>
      <Link to='/login' className='bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all'>
        Sign In
      </Link>
    </div>
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateMe({ name, phone });
      const updated = { ...user, name, phone };
      dispatch(setUser(updated));
      localStorage.setItem('carmart_user', JSON.stringify(updated));
      dispatch(addToast({ type: 'success', message: 'Profile updated!' }));
      setEditing(false);
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to update profile.' }));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const uploadRes = await api.uploadImage(fd);
      const avatarUrl = `http://localhost:5000${uploadRes.url}`;
      await api.updateAvatar(avatarUrl);
      const updated = { ...user, avatar: avatarUrl };
      dispatch(setUser(updated));
      localStorage.setItem('carmart_user', JSON.stringify(updated));
      dispatch(addToast({ type: 'success', message: 'Profile photo updated!' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: 'Upload failed: ' + err.message }));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(addToast({ type: 'info', message: 'Signed out. See you again!' }));
    navigate('/');
  };

  const wishlistedCars = allCars.filter(c => wishIds.includes(c._id || c.id)).slice(0, 3);

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950'>

      {/* Hero Banner */}
      <div className='bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 pt-10 pb-20 px-4 relative overflow-hidden'>
        <div className='absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl' />
        <div className='max-w-4xl mx-auto flex items-center gap-6'>

          {/* Avatar with upload */}
          <div className='relative flex-shrink-0'>
            <div className='w-20 h-20 rounded-2xl overflow-hidden shadow-xl shadow-amber-500/30 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center'>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
              ) : (
                <span className='text-white font-black text-3xl'>{user.name[0].toUpperCase()}</span>
              )}
            </div>
            <button
              onClick={() => avatarRef.current?.click()}
              disabled={avatarUploading}
              className='absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 hover:bg-amber-400 rounded-lg flex items-center justify-center shadow-lg transition-colors'
              title='Change photo'
            >
              {avatarUploading
                ? <svg className='animate-spin w-3.5 h-3.5 text-white' viewBox='0 0 24 24' fill='none'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z'/></svg>
                : <MdCamera className='text-white text-sm' />
              }
            </button>
            <input ref={avatarRef} type='file' accept='image/*' className='hidden' onChange={handleAvatarUpload} />
          </div>

          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-black text-white'>{user.name}</h1>
              {user.role === 'admin' && (
                <span className='flex items-center gap-1 text-xs bg-amber-500/20 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full font-bold'>
                  <MdVerified className='text-sm' /> Admin
                </span>
              )}
              {user.role === 'seller' && (
                <span className='flex items-center gap-1 text-xs bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2.5 py-1 rounded-full font-bold'>
                  <MdVerified className='text-sm' /> Seller
                </span>
              )}
            </div>
            <p className='text-slate-400 text-sm mt-0.5'>{user.email}</p>
            <p className='text-slate-500 text-xs mt-1 capitalize'>{user.role ?? 'customer'} account</p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className='max-w-4xl mx-auto px-4 -mt-8 mb-6'>
        <div className='grid grid-cols-3 gap-3'>
          {[
            { icon: FiPackage,       label: 'Orders',   value: orders.length,      to: null        },
            { icon: MdFavorite,      label: 'Wishlist', value: wishIds.length,     to: '/wishlist' },
            { icon: MdShoppingCart,  label: 'In Cart',  value: cartCount,          to: '/cart'     },
          ].map(({ icon: Icon, label, value, to }) => {
            const El = to ? Link : 'div';
            return (
              <El key={label} to={to}
                className='bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-700 shadow-sm text-center hover:border-amber-400 transition-colors'
              >
                <Icon className='text-amber-500 text-xl mx-auto mb-1' />
                <p className='text-2xl font-black text-gray-900 dark:text-zinc-100'>{value}</p>
                <p className='text-xs text-gray-400 dark:text-zinc-500'>{label}</p>
              </El>
            );
          })}
        </div>
      </div>

      {/* Tabs + Content */}
      <div className='max-w-4xl mx-auto px-4 pb-16'>
        {/* Tab Bar */}
        <div className='flex gap-1 bg-gray-100 dark:bg-zinc-800 rounded-2xl p-1 mb-6 overflow-x-auto'>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                tab === key
                  ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-sm'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className='text-base' />
              <span className='hidden sm:block'>{label}</span>
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className='space-y-5'>
            <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 p-6'>
              <div className='flex items-center justify-between mb-5'>
                <h2 className='font-black text-gray-900 dark:text-zinc-100 flex items-center gap-2'>
                  <MdPerson className='text-amber-500' /> Personal Info
                </h2>
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={saving}
                  className='flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors disabled:opacity-60'
                >
                  {saving ? (
                    <svg className='animate-spin w-3.5 h-3.5' viewBox='0 0 24 24' fill='none'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z'/></svg>
                  ) : editing ? <><MdCheckCircle /> Save</> : <><MdEdit /> Edit</>}
                </button>
              </div>
              <div className='space-y-4'>
                {[
                  { icon: MdPerson, label: 'Full Name',     value: name,  setter: setName  },
                  { icon: MdPhone,  label: 'Phone Number',  value: phone, setter: setPhone },
                ].map(({ icon: Icon, label, value, setter }) => (
                  <div key={label} className='flex items-center gap-4'>
                    <div className='w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0'>
                      <Icon className='text-amber-500 text-base' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-xs text-gray-400 dark:text-zinc-500 mb-0.5'>{label}</p>
                      {editing ? (
                        <input
                          value={value}
                          onChange={e => setter(e.target.value)}
                          className='w-full text-sm font-semibold text-gray-900 dark:text-zinc-100 bg-gray-50 dark:bg-zinc-800 border border-amber-400 rounded-lg px-3 py-1.5 focus:outline-none'
                        />
                      ) : (
                        <p className='text-sm font-semibold text-gray-900 dark:text-zinc-100'>{value || '—'}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div className='flex items-center gap-4'>
                  <div className='w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0'>
                    <MdEmail className='text-amber-500 text-base' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-xs text-gray-400 dark:text-zinc-500 mb-0.5'>Email</p>
                    <p className='text-sm font-semibold text-gray-900 dark:text-zinc-100'>{user.email}</p>
                  </div>
                  <span className='text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1'>
                    <MdVerified /> Verified
                  </span>
                </div>
              </div>
            </div>

            {wishlistedCars.length > 0 && (
              <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='font-black text-gray-900 dark:text-zinc-100 flex items-center gap-2'>
                    <MdFavorite className='text-red-500' /> Saved Cars
                  </h2>
                  <Link to='/wishlist' className='text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline'>
                    View all →
                  </Link>
                </div>
                <div className='grid grid-cols-3 gap-3'>
                  {wishlistedCars.map(car => {
                    const carId = car._id || car.id;
                    return (
                      <Link key={carId} to={`/car/${carId}`} className='group'>
                        <div className='relative h-20 rounded-xl overflow-hidden bg-slate-800 mb-2'>
                          <img src={car.image} alt={car.model} className='absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300' />
                        </div>
                        <p className='text-xs font-bold text-gray-800 dark:text-zinc-200 truncate'>{car.make} {car.model}</p>
                        <p className='text-xs text-amber-600 font-black'>{fmt(car.price)}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Orders ── */}
        {tab === 'orders' && (
          <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-100 dark:border-zinc-700'>
              <h2 className='font-black text-gray-900 dark:text-zinc-100 flex items-center gap-2'>
                <MdHistory className='text-amber-500' /> Order History
              </h2>
            </div>
            {ordersLoading ? (
              <div className='py-12 text-center'>
                <svg className='animate-spin h-8 w-8 text-amber-500 mx-auto' viewBox='0 0 24 24' fill='none'>
                  <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'/>
                  <path fill='currentColor' d='M4 12a8 8 0 018-8v8z' className='opacity-75'/>
                </svg>
              </div>
            ) : orders.length === 0 ? (
              <div className='py-16 text-center'>
                <BsCarFront className='text-6xl text-gray-200 dark:text-zinc-700 mx-auto mb-3' />
                <p className='text-gray-500 dark:text-zinc-400 text-sm'>No orders yet</p>
              </div>
            ) : (
              <div className='divide-y divide-gray-50 dark:divide-zinc-800'>
                {orders.map(order => {
                  const s = STATUS[order.status] || STATUS.pending;
                  const carName = order.carSnapshot
                    ? `${order.carSnapshot.make} ${order.carSnapshot.model} ${order.carSnapshot.year}`
                    : 'Car';
                  const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  return (
                    <div key={order._id} className='flex items-center gap-4 px-6 py-4'>
                      <div className='w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0'>
                        {order.carSnapshot?.image
                          ? <img src={order.carSnapshot.image} alt='' className='w-10 h-10 rounded-xl object-cover' />
                          : <MdDirectionsCar className='text-amber-500 text-xl' />
                        }
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-bold text-gray-900 dark:text-zinc-100 truncate'>{carName}</p>
                        <p className='text-xs text-gray-400 dark:text-zinc-500'>{order.orderId} · {date}</p>
                      </div>
                      <div className='text-right flex-shrink-0'>
                        <p className='text-sm font-black text-amber-600 mb-1'>{fmt(order.totalAmount)}</p>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── My Listings ── */}
        {tab === 'listings' && (
          <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-100 dark:border-zinc-700 flex items-center justify-between'>
              <h2 className='font-black text-gray-900 dark:text-zinc-100 flex items-center gap-2'>
                <MdDirectionsCar className='text-amber-500' /> My Listings
              </h2>
              <Link to='/sell' className='text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline'>
                + Submit New
              </Link>
            </div>
            {listingsLoading ? (
              <div className='py-12 text-center'>
                <svg className='animate-spin h-8 w-8 text-amber-500 mx-auto' viewBox='0 0 24 24' fill='none'>
                  <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'/>
                  <path fill='currentColor' d='M4 12a8 8 0 018-8v8z' className='opacity-75'/>
                </svg>
              </div>
            ) : listings.length === 0 ? (
              <div className='py-16 text-center'>
                <BsCarFront className='text-6xl text-gray-200 dark:text-zinc-700 mx-auto mb-3' />
                <p className='text-gray-500 dark:text-zinc-400 text-sm mb-4'>No listings yet</p>
                <Link to='/sell' className='inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors'>
                  Submit Your Car
                </Link>
              </div>
            ) : (
              <div className='divide-y divide-gray-50 dark:divide-zinc-800'>
                {listings.map(car => {
                  const s = LISTING_STATUS[car.status] || LISTING_STATUS.pending;
                  const img = car.images?.[0] || car.image;
                  return (
                    <div key={car._id} className='flex items-center gap-4 px-6 py-4'>
                      <div className='w-16 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 flex-shrink-0'>
                        {img
                          ? <img src={img} alt={car.model} className='w-full h-full object-cover' />
                          : <MdDirectionsCar className='text-amber-500 text-2xl m-auto mt-2' />
                        }
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-bold text-gray-900 dark:text-zinc-100 truncate'>
                          {car.year} {car.make} {car.model}
                        </p>
                        <p className='text-xs text-gray-400 dark:text-zinc-500'>
                          {fmt(car.price)} · {car.mileage?.toLocaleString()} km
                        </p>
                      </div>
                      <div className='flex flex-col items-end gap-1.5 flex-shrink-0'>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                        {car.status === 'available' && (
                          <Link to={`/car/${car._id}`} className='text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium'>
                            View →
                          </Link>
                        )}
                        {car.status === 'pending' && (
                          <span className='text-xs text-gray-400 dark:text-zinc-500'>Under review</span>
                        )}
                        {car.status === 'rejected' && (
                          <span className='text-xs text-red-500'>Contact support</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Settings ── */}
        {tab === 'settings' && (
          <div className='space-y-4'>
            <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 divide-y divide-gray-50 dark:divide-zinc-800'>
              {[
                { icon: FiShield, label: 'Privacy & Security',    desc: 'Manage password and security settings'  },
                { icon: MdStar,   label: 'Notifications',         desc: 'Email and push preferences'             },
                { icon: MdEmail,  label: 'Email Preferences',     desc: 'Newsletters and deal alerts'            },
              ].map(({ icon: Icon, label, desc }) => (
                <button key={label} className='w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left'>
                  <div className='w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0'>
                    <Icon className='text-gray-500 dark:text-zinc-400 text-base' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-gray-900 dark:text-zinc-100'>{label}</p>
                    <p className='text-xs text-gray-400 dark:text-zinc-500'>{desc}</p>
                  </div>
                  <span className='text-gray-300 dark:text-zinc-600'>›</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className='w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors'
            >
              <MdLogout className='text-lg' /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
