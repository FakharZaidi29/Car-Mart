import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Tesla from '../../assets/Tesla.avif';
import Footer from '../Footer/footer';

const Counter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(current));
          }, duration / steps);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

export default function About() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Outfit:wght@300;400;500;600&display=swap');

        .about-root * { box-sizing: border-box; }

        .about-root {
          font-family: 'Outfit', sans-serif;
          background: #09090b;
          color: #e4e4e7;
          overflow-x: hidden;
        }

        /* ── Light mode overrides ── */
        html:not(.dark) .about-root {
          background: #f8fafc;
          color: #0f172a;
        }
        html:not(.dark) .hero h1 { color: #0f172a; }
        html:not(.dark) .hero p { color: #475569; }
        html:not(.dark) .hero-tag { color: #3b82f6; background: rgba(59,130,246,0.06); }
        html:not(.dark) .story h2 { color: #0f172a; }
        html:not(.dark) .story p { color: #475569; }
        html:not(.dark) .stats-row { background: transparent; }
        html:not(.dark) .hero-grid {
          background-image: linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
        }

        /* ── Hero ── */
        .hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 6rem 1.5rem 4rem;
          overflow: hidden;
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
        }

        .hero-glow {
          position: absolute;
          top: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 500px;
          background: radial-gradient(ellipse at center, rgba(59,130,246,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(59,130,246,0.4);
          border-radius: 99px;
          padding: 6px 18px;
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #93c5fd;
          margin-bottom: 2rem;
          background: rgba(59,130,246,0.08);
        }

        .hero-tag::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #3b82f6;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }

        .hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 8vw, 6.5rem);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #f4f4f5;
          margin: 0 0 1.5rem;
        }

        .hero h1 em {
          font-style: normal;
          color: transparent;
          -webkit-text-stroke: 2px #3b82f6;
        }

        .hero p {
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: #71717a;
          max-width: 560px;
          line-height: 1.7;
          margin: 0 auto 3rem;
          font-weight: 300;
        }

        .hero-scroll {
          position: absolute;
          bottom: 2.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: #52525b;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .hero-scroll::after {
          content: '';
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, #3b82f6, transparent);
          animation: scrollLine 1.6s ease-in-out infinite;
        }

        @keyframes scrollLine {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }

        /* ── Story Section ── */
        .story {
          max-width: 1200px;
          margin: 0 auto;
          padding: 7rem 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          align-items: center;
        }

        @media (max-width: 900px) {
          .story { grid-template-columns: 1fr; gap: 3rem; }
        }

        .story-label {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #3b82f6;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .story h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          line-height: 1.2;
          color: #f4f4f5;
          margin: 0 0 1.5rem;
        }

        .story p {
          color: #a1a1aa;
          line-height: 1.85;
          font-size: 15px;
          font-weight: 300;
          margin-bottom: 1.25rem;
        }

        .divider {
          width: 48px;
          height: 2px;
          background: #3b82f6;
          margin: 1.75rem 0;
          border-radius: 2px;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          padding-top: 2rem;
          border-top: 1px solid #27272a;
        }

        .stat-item h3 {
          font-family: 'Playfair Display', serif;
          font-size: 2.25rem;
          font-weight: 900;
          color: #3b82f6;
          margin: 0 0 4px;
          line-height: 1;
        }

        .stat-item p {
          font-size: 13px;
          color: #71717a;
          margin: 0;
          font-weight: 400;
        }

        /* ── Image block ── */
        .image-wrap {
          position: relative;
        }

        .image-wrap::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 20px;
          background: linear-gradient(135deg, #3b82f6 0%, transparent 60%);
          z-index: 0;
        }

        .image-wrap img {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 520px;
          object-fit: cover;
          border-radius: 18px;
          display: block;
          filter: brightness(0.9) saturate(1.1);
        }

        .image-badge {
          position: absolute;
          bottom: 24px;
          left: -24px;
          z-index: 2;
          background: #09090b;
          border: 1px solid #27272a;
          border-radius: 14px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .image-badge-icon {
          width: 44px; height: 44px;
          border-radius: 10px;
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(59,130,246,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }

        .image-badge-text p:first-child {
          font-size: 18px;
          font-weight: 700;
          color: #f4f4f5;
          margin: 0 0 2px;
          font-family: 'Playfair Display', serif;
        }
        .image-badge-text p:last-child {
          font-size: 11px;
          color: #71717a;
          margin: 0;
          letter-spacing: 0.05em;
        }

        /* ── Features ── */
        .features-section {
          padding: 6rem 2rem;
          background: #0d0d0f;
          border-top: 1px solid #18181b;
          border-bottom: 1px solid #18181b;
        }

        .features-inner {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-header .label {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #3b82f6;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .section-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 4vw, 2.75rem);
          font-weight: 700;
          color: #f4f4f5;
          margin: 0;
          line-height: 1.2;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr; }
        }

        .feature-card {
          background: #111113;
          border: 1px solid #1f1f23;
          border-radius: 16px;
          padding: 2rem 1.75rem;
          position: relative;
          overflow: hidden;
          transition: border-color 0.25s, transform 0.25s;
          cursor: default;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .feature-card:hover {
          border-color: #3b82f6;
          transform: translateY(-4px);
        }

        .feature-card:hover::before { opacity: 1; }

        .feature-icon {
          width: 52px; height: 52px;
          border-radius: 12px;
          background: rgba(59,130,246,0.12);
          border: 1px solid rgba(59,130,246,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          margin-bottom: 1.5rem;
        }

        .feature-card h3 {
          font-size: 17px;
          font-weight: 600;
          color: #f4f4f5;
          margin: 0 0 0.75rem;
        }

        .feature-card p {
          font-size: 14px;
          color: #71717a;
          line-height: 1.75;
          margin: 0;
          font-weight: 300;
        }

        /* ── Timeline ── */
        .timeline-section {
          max-width: 720px;
          margin: 0 auto;
          padding: 7rem 2rem;
        }

        .timeline-section .section-header { text-align: left; margin-bottom: 3rem; }

        .timeline-item {
          display: flex;
          gap: 2rem;
          padding-bottom: 2.5rem;
          position: relative;
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 32px;
          bottom: 0;
          width: 1px;
          background: #27272a;
        }

        .timeline-item:last-child::before { display: none; }

        .timeline-dot {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: #09090b;
          border: 2px solid #3b82f6;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 12px;
          color: #3b82f6;
          font-weight: 700;
          z-index: 1;
        }

        .timeline-content h4 {
          font-size: 15px;
          font-weight: 600;
          color: #f4f4f5;
          margin: 0 0 6px;
          padding-top: 4px;
        }

        .timeline-content p {
          font-size: 13px;
          color: #71717a;
          line-height: 1.7;
          margin: 0;
          font-weight: 300;
        }

        .timeline-year {
          font-size: 11px;
          letter-spacing: 0.1em;
          color: #3b82f6;
          font-weight: 600;
          margin-bottom: 4px;
        }

        /* ── CTA ── */
        .cta-section {
          padding: 6rem 2rem;
          text-align: center;
          background: #0d0d0f;
          border-top: 1px solid #18181b;
        }

        .cta-section h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          color: #f4f4f5;
          margin: 0 0 1rem;
          line-height: 1.15;
        }

        .cta-section p {
          font-size: 15px;
          color: #71717a;
          margin: 0 auto 2.5rem;
          max-width: 480px;
          font-weight: 300;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 14px 32px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          text-decoration: none;
        }

        .cta-btn:hover { background: #2563eb; transform: translateY(-2px); }
      `}</style>

      <div className="about-root">

        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-grid" />
          <div className="hero-glow" />
          <div className="hero-tag">Est. 2010 · Lahore, Pakistan</div>
          <h1>
            We Don't Sell Cars.<br />
            We Deliver <em>Dreams.</em>
          </h1>
          <p>
            Car Mart is Pakistan's premium automotive marketplace — where luxury meets trust,
            and every purchase is an experience.
          </p>
          <div className="hero-scroll">Scroll</div>
        </section>

        {/* ── Story ── */}
        <section style={{ background: "#09090b" }}>
          <div className="story">
            <div>
              <p className="story-label">Our story</p>
              <h2>Driving Excellence<br />Since 2010</h2>
              <p>
                Welcome to Car Mart — where automotive excellence meets uncompromising luxury.
                Since 2010, we have curated a pristine collection of the world's most prestigious
                vehicles for those who demand nothing but the absolute best.
              </p>
              <p>
                Every car in our showroom is more than a machine; it's a masterpiece of engineering.
                We pride ourselves on offering a seamless, bespoke purchasing experience tailored
                to the elite standards of our distinguished clientele.
              </p>
              <div className="divider" />
              <div className="stats-row">
                <div className="stat-item">
                  <h3><Counter target={5000} suffix="+" /></h3>
                  <p>Cars Sold</p>
                </div>
                <div className="stat-item">
                  <h3><Counter target={10000} suffix="+" /></h3>
                  <p>Happy Clients</p>
                </div>
                <div className="stat-item">
                  <h3><Counter target={15} suffix="+" /></h3>
                  <p>Premium Brands</p>
                </div>
              </div>
            </div>

            <div className="image-wrap">
              <img src={Tesla} alt="Luxury Car Showroom" />
              <div className="image-badge">
                <div className="image-badge-icon">🏆</div>
                <div className="image-badge-text">
                  <p>#1 Rated</p>
                  <p>Premium car platform in Pakistan</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="features-section">
          <div className="features-inner">
            <div className="section-header">
              <p className="label">Why us</p>
              <h2>Built on Trust.<br />Driven by Excellence.</h2>
            </div>
            <div className="features-grid">
              {[
                { icon: "🛡️", title: "Verified Quality", desc: "Every vehicle undergoes a strict 150-point inspection before it reaches our showroom floor. Zero compromises." },
                { icon: "💳", title: "Easy Financing", desc: "Flexible, low-interest financing plans tailored to your income and lifestyle. Drive today, pay comfortably." },
                { icon: "🛠️", title: "5-Year Warranty", desc: "Drive with complete peace of mind. Every purchase is covered by our industry-leading comprehensive warranty." },
                { icon: "🚀", title: "Instant Delivery", desc: "Streamlined logistics ensure your car reaches your door within days of purchase — anywhere in Pakistan." },
                { icon: "🤝", title: "White-Glove Service", desc: "A dedicated account manager walks you through every step — from selection to registration and beyond." },
                { icon: "🔄", title: "Trade-In Program", desc: "Get a fair, transparent valuation for your existing vehicle and put it toward your dream car instantly." },
              ].map((f, i) => (
                <div className="feature-card" key={i}>
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section style={{ background: "#09090b" }}>
          <div className="timeline-section">
            <div className="section-header">
              <p className="label">Our journey</p>
              <h2>Milestones That<br />Shaped Us</h2>
            </div>
            {[
              { year: "2010", title: "Founded in Lahore", desc: "Car Mart opened its first showroom in Model Town with a curated selection of 20 luxury vehicles." },
              { year: "2014", title: "Expanded to 5 cities", desc: "Rapid growth saw us open branches in Karachi, Islamabad, Faisalabad, and Multan." },
              { year: "2018", title: "Launched online platform", desc: "Our digital storefront went live — enabling browsing, financing applications, and test drive bookings online." },
              { year: "2022", title: "Introduced EV lineup", desc: "Car Mart became one of the first platforms in Pakistan to offer certified electric vehicles at scale." },
              { year: "2024", title: "10,000+ happy clients", desc: "A proud milestone — surpassing 10,000 satisfied customers across the country." },
            ].map((item, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-dot">{i + 1}</div>
                <div className="timeline-content">
                  <p className="timeline-year">{item.year}</p>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <h2>Ready to Find<br />Your Dream Car?</h2>
          <p>Browse our curated collection of premium vehicles or speak to a specialist today.</p>
          <Link to="/shop" className="cta-btn">
            Explore our inventory
            <span style={{ fontSize: 18 }}>→</span>
          </Link>
        </section>

        <Footer />
      </div>
    </>
  );
}