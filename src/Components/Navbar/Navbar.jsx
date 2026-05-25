import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartCount } from '../slices/cartSlice';
import { selectIsDark, toggleTheme } from '../slices/themeSlice';
import { selectUser, logout } from '../slices/authSlice';
import { selectWishlistIds } from '../slices/wishlistSlice';
import { api } from '../../api';
import MyLogo from '../../assets/LOGO1.png';
import { FaRegUserCircle } from "react-icons/fa";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { IoMdCart } from "react-icons/io";
import { MdDarkMode, MdLightMode, MdMenu, MdClose, MdFavorite, MdNotifications, MdCheckCircle, MdDirectionsCar, MdShoppingCart } from "react-icons/md";
import LoginRequiredModal from '../LoginModal/LoginRequiredModal';

const NAV_LINKS = [
  { label: 'Home',      to: '/'        },
  { label: 'Shop Cars', to: '/shop'    },
  { label: 'Sell Car',  to: '/sell', requiresAuth: true },
  { label: 'Support',   to: '/support' },
  { label: 'About Us',  to: '/about'   },
];

function Navbar() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [query,       setQuery]       = useState('');

  const [userMenuOpen,    setUserMenuOpen]    = useState(false);
  const [showSellModal,   setShowSellModal]   = useState(false);
  const [sellModalReason, setSellModalReason] = useState('sell');
  const [notifOpen,       setNotifOpen]       = useState(false);
  const [notifs,          setNotifs]          = useState([]);
  const [unreadCount,     setUnreadCount]     = useState(0);
  const notifRef = useRef();

  const cartCount    = useSelector(selectCartCount);
  const isDark       = useSelector(selectIsDark);
  const user         = useSelector(selectUser);
  const wishCount    = useSelector(selectWishlistIds).length;
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  useEffect(() => {
    if (!user) { setNotifs([]); setUnreadCount(0); return; }
    const SEEN_KEY = 'carmart_notifs_seen';
    const load = async () => {
      try {
        const data = await api.getMyOrders();
        const orders = (data.orders || []).slice(0, 5);
        const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
        const built = orders.map(o => ({
          id: o._id,
          text: `Order #${o.orderId} — ${o.status}`,
          icon: 'order',
          read: seen.includes(o._id),
        }));
        setNotifs(built);
        setUnreadCount(built.filter(n => !n.read).length);
      } catch {}
    };
    load();
  }, [user]);

  const openNotif = () => {
    const SEEN_KEY = 'carmart_notifs_seen';
    const ids = notifs.map(n => n.id);
    localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
    setUnreadCount(0);
    setNotifs(p => p.map(n => ({ ...n, read: true })));
    setNotifOpen(o => !o);
  };

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    navigate(`/shop?q=${encodeURIComponent(q)}`);
    setQuery('');
    setSearchFocus(false);
  };

  const handleSellClick = useCallback((e) => {
    if (!user) {
      e.preventDefault();
      setSellModalReason('sell');
      setShowSellModal(true);
    } else if (user.role === 'customer') {
      e.preventDefault();
      setSellModalReason('seller-only');
      setShowSellModal(true);
    }
  }, [user]);

  return (
    <>
    {showSellModal && <LoginRequiredModal onClose={() => setShowSellModal(false)} reason={sellModalReason} />}
    <nav className='sticky top-0 z-50 shadow-xl transition-colors duration-300 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800'>
      <div className='max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-6'>

        {/* ── Logo ── */}
        <Link to='/' className='flex-shrink-0'>
          <img
            src={MyLogo}
            alt='Car Mart Logo'
            className='h-[60px] w-auto hover:opacity-90 transition-opacity duration-200'
          />
        </Link>

        {/* ── Desktop Nav Links ── */}
        <ul className='hidden lg:flex items-center gap-1 list-none m-0 p-0'>
          {NAV_LINKS.map(({ label, to, requiresAuth }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={requiresAuth ? handleSellClick : undefined}
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-amber-500 bg-amber-50 dark:bg-white/10'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <span className='absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full' />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── Right Section ── */}
        <div className='flex items-center gap-3'>

          {/* Search Bar */}
          <div className={`hidden md:flex relative items-center transition-all duration-300 ${
            searchFocus ? 'w-72' : 'w-52'
          }`}>
            <input
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder='Search cars...'
              className='w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm rounded-xl pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200'
            />
            <PiMagnifyingGlassBold
              onClick={handleSearch}
              className={`absolute right-3 text-lg transition-colors duration-200 ${
                searchFocus ? 'text-amber-400' : 'text-gray-500'
              } cursor-pointer hover:text-amber-400`}
            />
          </div>

          {/* Wishlist */}
          <Link to='/wishlist' className='relative group p-2'>
            <MdFavorite className='w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-red-500 transition-all duration-200 group-hover:scale-110' />
            {wishCount > 0 && (
              <span className='absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none'>
                {wishCount > 9 ? '9+' : wishCount}
              </span>
            )}
          </Link>

          {/* Notification Bell */}
          {user && (
            <div className='relative' ref={notifRef}>
              <button onClick={openNotif} className='relative group p-2'>
                <MdNotifications className='w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-amber-500 transition-all duration-200 group-hover:scale-110' />
                {unreadCount > 0 && (
                  <span className='anim-pop absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className='absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl shadow-2xl py-2 z-50'>
                  <div className='px-4 py-2 border-b border-gray-100 dark:border-zinc-700 flex items-center justify-between'>
                    <p className='text-xs font-black text-gray-800 dark:text-zinc-200'>Notifications</p>
                    <span className='text-[10px] text-gray-400'>Recent orders</span>
                  </div>
                  {notifs.length === 0 ? (
                    <div className='px-4 py-6 text-center text-xs text-gray-400 dark:text-zinc-500'>No notifications yet</div>
                  ) : (
                    notifs.map(n => (
                      <div key={n.id} className='flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors'>
                        <div className='w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <MdShoppingCart className='text-amber-600 dark:text-amber-400 text-sm' />
                        </div>
                        <p className='text-xs text-gray-700 dark:text-zinc-300 leading-relaxed'>{n.text}</p>
                      </div>
                    ))
                  )}
                  <div className='px-4 pt-2 border-t border-gray-100 dark:border-zinc-700 mt-1'>
                    <button onClick={() => { navigate('/orders'); setNotifOpen(false); }}
                      className='w-full text-center text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline py-1'>
                      View all Orders →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart */}
          <Link to='/cart' className='relative group p-2'>
            <IoMdCart className='w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-200 group-hover:scale-110' />
            {cartCount > 0 && (
              <span key={cartCount} className='anim-pop absolute -top-0.5 -right-0.5 bg-amber-400 text-amber-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none'>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          {user ? (
            <div className='relative'>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                className='flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
              >
                <div className='w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xs'>
                  {user.name[0].toUpperCase()}
                </div>
                <span className='hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[80px] truncate'>
                  {user.name.split(' ')[0]}
                </span>
              </button>
              {userMenuOpen && (
                <div className='absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl shadow-xl py-2 z-50'>
                  <div className='px-4 py-2 border-b border-gray-100 dark:border-zinc-700'>
                    <p className='text-xs font-bold text-gray-800 dark:text-zinc-200 truncate'>{user.name}</p>
                    <p className='text-xs text-gray-400 dark:text-zinc-500 truncate'>{user.email}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      user.role === 'admin'    ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                      user.role === 'seller'   ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                      'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {user.role ?? 'customer'}
                    </span>
                  </div>
                  <Link to='/profile' className='block px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors'>
                    My Profile
                  </Link>
                  <Link to='/orders' className='block px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors'>
                    My Orders
                  </Link>
                  <Link to='/wishlist' className='block px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors'>
                    My Wishlist {wishCount > 0 && <span className='ml-1 text-xs bg-red-100 dark:bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full font-bold'>{wishCount}</span>}
                  </Link>
                  <Link to='/emi' className='block px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors'>
                    EMI Calculator
                  </Link>
                  {user.role === 'admin' && (
                    <Link to='/admin' className='block px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors'>
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { dispatch(logout()); setUserMenuOpen(false); }}
                    className='w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors'
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to='/login' className='group p-2'>
              <FaRegUserCircle className='w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-200 group-hover:scale-110' />
            </Link>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className='p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200 group'
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark
              ? <MdLightMode className='w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-200' />
              : <MdDarkMode  className='w-5 h-5 text-gray-500 group-hover:text-gray-800 group-hover:rotate-12 transition-all duration-200' />
            }
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className='lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors duration-200'
          >
            {menuOpen
              ? <MdClose className='w-5 h-5 text-gray-800 dark:text-white' />
              : <MdMenu  className='w-5 h-5 text-gray-600 dark:text-gray-300' />
            }
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className='px-6 pb-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'>

          {/* Mobile Search */}
          <div className='relative mt-4 mb-3'>
            <input
              type='text'
              placeholder='Search cars...'
              className='w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm rounded-xl pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-amber-500'
            />
            <PiMagnifyingGlassBold className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg' />
          </div>

          {/* Mobile Links */}
          <ul className='space-y-1 list-none m-0 p-0'>
            {NAV_LINKS.map(({ label, to, requiresAuth }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={(e) => {
                    setMenuOpen(false);
                    if (requiresAuth) handleSellClick(e);
                  }}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? 'text-amber-500 bg-amber-50 dark:bg-white/10'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
    </>
  );
}

export default Navbar;
