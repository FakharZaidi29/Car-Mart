import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from './store';
import { selectIsDark } from './Components/slices/themeSlice';
import { selectUser } from './Components/slices/authSlice';
import './index.css'

import Home from './Components/Home/Home.jsx';
import Navbar from './Components/Navbar/Navbar.jsx';
import ShopCars from './Components/Shop Cars/ShopCars.jsx';
import About from './Components/About Us/AboutUs.jsx';
import AdminDashboard from './Components/Admin Dashboard/AdminDashboard.jsx';
import Login from './Components/Login/Signup/Login.jsx';
import Cart from './Components/cart/Cart.jsx';
import CarDetail from './Components/Car Detail/CarDetail.jsx';
import Checkout from './Components/Checkout/Checkout.jsx';
import SellYourCar from './Components/Sell/SellYourCar.jsx';
import Chatbot from './Components/Chatbot/Chatbot.jsx';
import Toast from './Components/Toast/Toast.jsx';
import CompareBar from './Components/Compare/CompareBar.jsx';
import NotFound from './Components/NotFound/NotFound.jsx';
import ComparePage from './Components/Compare/ComparePage.jsx';
import WishlistPage from './Components/Wishlist/WishlistPage.jsx';
import ProfilePage from './Components/Profile/ProfilePage.jsx';
import SupportPage from './Components/Support/SupportPage.jsx';
import AuthCallback from './Components/Login/AuthCallback.jsx';
import ResetPassword from './Components/Login/ResetPassword.jsx';
import PageTransition from './Components/PageTransition/PageTransition.jsx';
import OrdersPage from './Components/Orders/OrdersPage.jsx';
import EMIPage from './Components/EMI/EMIPage.jsx';

function ThemeRoot({ children }) {
  const isDark = useSelector(selectIsDark);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);
  return children;
}

function ProtectedRoute({ children }) {
  const user     = useSelector(selectUser);
  const location = useLocation();
  if (!user) return <Navigate to='/login' state={{ from: location.pathname }} replace />;
  return children;
}

function AdminRoute({ children }) {
  const user = useSelector(selectUser);
  if (!user) return <Navigate to='/login' replace />;
  if (user.role !== 'admin') return <Navigate to='/' replace />;
  return children;
}


const srObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); }),
  { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
);

const watchSR = () =>
  document.querySelectorAll('.sr,.sr-l,.sr-r,.sr-s').forEach((el) => srObserver.observe(el));
setTimeout(watchSR, 200);
new MutationObserver(watchSR).observe(document.getElementById('root'), { childList: true, subtree: true });



store.subscribe(() => {
  try {
    const s = store.getState();
    localStorage.setItem('carmart_cart', JSON.stringify(s.cart));
    localStorage.setItem('carmart_wishlist', JSON.stringify(s.wishlist.ids));
  } catch { }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeRoot>
        <BrowserRouter>
          <Navbar />
          <Toast />
          <CompareBar />
          <Chatbot />
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<ShopCars />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/car/:id" element={<CarDetail />} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/sell" element={<ProtectedRoute><SellYourCar /></ProtectedRoute>} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/emi" element={<EMIPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </BrowserRouter>
      </ThemeRoot>
    </Provider>
  </StrictMode>,
)