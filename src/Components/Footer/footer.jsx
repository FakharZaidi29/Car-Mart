import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { api } from '../../api/index.js';

const Footer = () => {
  const [email, setEmail]     = useState('');
  const [status, setStatus]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      await api.subscribeNewsletter(email.trim());
      setStatus({ ok: true, msg: 'Subscribed! Welcome aboard.' });
      setEmail('');
    } catch (err) {
      const msg = err.message === 'Already subscribed'
        ? 'This email is already subscribed.'
        : 'Something went wrong. Try again.';
      setStatus({ ok: false, msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#111827] text-white pt-16 pb-8 border-t border-gray-800 font-sans mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Main Footer Grid (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand & About */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-wide hover:scale-110 transition-transform duration-300">
              CAR <span className="text-blue-500">MART</span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Your ultimate destination for premium and luxury vehicles. We deliver excellence, performance, and dreams.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all cursor-pointer">
                <a href="https://www.facebook.com/login.php?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php">
                <FaFacebook /></a>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all cursor-pointer">
                <a href="https://www.instagram.com/?hl=en"><FaInstagramSquare /></a>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all cursor-pointer">
                <a href="https://x.com/"><FaXTwitter /></a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-blue-500 hover:pl-2 transition-all cursor-pointer">Home</Link></li>
              <li><Link to="/shop" className="text-gray-400 hover:text-blue-500 hover:pl-2 transition-all cursor-pointer">Shop Cars</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-blue-500 hover:pl-2 transition-all cursor-pointer">About Us</Link></li>
              <li><Link to="/admin" className="text-gray-400 hover:text-blue-500 hover:pl-2 transition-all cursor-pointer">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className='cursor-pointer'>
            <h3 className="text-xl font-semibold mb-6 ">Contact Us</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <span>123 Luxury Avenue, Car City, Auto State</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">📞</span>
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">✉️</span>
                <span>support@carmart.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Newsletter</h3>
            <p className="text-gray-400 mb-4 text-sm">Subscribe to get the latest updates and premium car offers.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                disabled={loading}
                className="bg-gray-800 text-white px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-700 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-md font-semibold hover:scale-105 transition-transform duration-300"
              >
                {loading ? 'Subscribing…' : 'Subscribe'}
              </button>
              {status && (
                <p className={`text-sm ${status.ok ? 'text-green-400' : 'text-red-400'}`}>
                  {status.msg}
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Bar (Copyright) */}
        <div className="pt-8 border-t border-gray-800 text-center md:flex md:justify-between md:items-center">
          <p className="text-gray-400 mb-4 md:mb-0 text-sm">
            &copy; {new Date().getFullYear()} Car Mart. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 text-gray-400 text-sm">
            <a href="https://en.wikipedia.org/wiki/Privacy_policy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="https://en.wikipedia.org/wiki/Terms_of_service" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;