import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import vid1 from '../../assets/BlackCarOnRoad.mp4';
import vid2 from '../../assets/BlackLambohdVideo.mp4';
import vid3 from '../../assets/Porche.mp4';
import vid4 from '../../assets/RedCarVideo.mp4';
import vid5 from '../../assets/blackey.mp4';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, selectCartItems } from '../slices/cartSlice';
import { selectUser } from '../slices/authSlice';
import { addToast } from '../slices/toastSlice';
import LoginRequiredModal from '../LoginModal/LoginRequiredModal';
import {
    MdDirectionsCar, MdLocalGasStation, MdSpeed,
    MdVerified, MdStar, MdPayment, MdSupportAgent,
    MdArrowForward, MdSearch, MdLocalOffer, MdClose,
} from 'react-icons/md';
import {
    FiShoppingCart, FiCheckCircle, FiArrowRight,
    FiShield, FiAward, FiTrendingUp,
} from 'react-icons/fi';
import {
    BsFuelPumpFill, BsSpeedometer2, BsCarFront,
    BsStarFill, BsChevronRight,
} from 'react-icons/bs';
import { IoCarSportOutline } from 'react-icons/io5';
import { TbManualGearbox, TbEngine } from 'react-icons/tb';
import TestimonialsSlider from '../Testimonials/TestimonialsSlider';
import { api } from '../../api/index.js';

const CATEGORIES = [
    { label: 'Sedans',     icon: BsCarFront,       count: 45, bg: 'from-blue-500 to-blue-700',     paramKey: 'type', query: 'Sedan'    },
    { label: 'SUVs',       icon: IoCarSportOutline, count: 87, bg: 'from-amber-500 to-orange-600',  paramKey: 'type', query: 'SUV'      },
    { label: 'Hatchbacks', icon: MdDirectionsCar,   count: 32, bg: 'from-emerald-500 to-teal-600',  paramKey: 'type', query: 'Hatchback'},
    { label: 'Hybrid',     icon: TbEngine,          count: 18, bg: 'from-teal-500 to-cyan-600',     paramKey: 'fuel', query: 'Hybrid'   },
    { label: 'MPVs',       icon: BsSpeedometer2,    count: 24, bg: 'from-purple-500 to-violet-700', paramKey: 'type', query: 'MPV'      },
    { label: 'Diesel',     icon: BsFuelPumpFill,    count: 29, bg: 'from-rose-500 to-red-700',      paramKey: 'fuel', query: 'Diesel'   },
];

const STATS_FALLBACK = [
    { raw: 500,  suffix: '+', label: 'Cars Available',   icon: MdDirectionsCar },
    { raw: 1200, suffix: '+', label: 'Happy Customers',  icon: MdStar          },
    { raw: 50,   suffix: '+', label: 'Verified Sellers', icon: MdVerified      },
    { raw: 99,   suffix: '%', label: 'Satisfaction Rate',icon: FiAward         },
];

const WHY_US = [
    { icon: MdVerified,    title: 'Verified Listings', desc: 'Every car is physically inspected and documents verified. Zero fraud guarantee.', color: 'text-amber-500',   bg: 'bg-amber-50',   dark: 'dark:bg-amber-500/10'  },
    { icon: FiShield,      title: 'Secure Payments',   desc: 'Bank-grade encryption protects every transaction. Safe payments every time.',    color: 'text-emerald-500', bg: 'bg-emerald-50', dark: 'dark:bg-emerald-500/10' },
    { icon: MdSupportAgent,title: '24/7 Support',      desc: 'Our team is available round the clock to guide you through your purchase.',       color: 'text-blue-500',    bg: 'bg-blue-50',    dark: 'dark:bg-blue-500/10'    },
    { icon: FiTrendingUp,  title: 'Best Market Price',  desc: 'We compare thousands of listings so you always get the most competitive price.',  color: 'text-purple-500',  bg: 'bg-purple-50',  dark: 'dark:bg-purple-500/10'  },
];

const BADGE_STYLES = {
    'Featured':    'bg-blue-100 text-blue-700 border-blue-200',
    'Premium':     'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Hybrid':      'bg-teal-100 text-teal-700 border-teal-200',
    'Popular':     'bg-amber-100 text-amber-700 border-amber-200',
    'New Arrival': 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const fmt      = (p) => p >= 1_000_000 ? `PKR ${(p / 1_000_000).toFixed(1)}M` : `PKR ${p.toLocaleString()}`;
const fmtMiles = (m) => `${m.toLocaleString()} km`;

function useTilt(maxDeg = 15) {
    const ref = useRef();
    const onMouseMove = useCallback((e) => {
        const el = ref.current;
        if (!el) return;
        const { left, top, width, height } = el.getBoundingClientRect();
        const x = (e.clientX - left) / width  - 0.5;
        const y = (e.clientY - top)  / height - 0.5;
        el.style.transform = `perspective(700px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg) translateZ(12px) scale(1.02)`;
        el.style.boxShadow = `${-x * 20}px ${y * 20}px 40px rgba(0,0,0,0.18)`;
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

function useCountUp(target, duration = 1800) {
    const [count, setCount] = useState(0);
    const elRef  = useRef();
    const started = useRef(false);
    useEffect(() => {
        const el = elRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                let startTime;
                const step = (ts) => {
                    if (!startTime) startTime = ts;
                    const p = Math.min((ts - startTime) / duration, 1);
                    const ease = 1 - Math.pow(1 - p, 3);
                    setCount(Math.floor(ease * target));
                    if (p < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
                obs.disconnect();
            }
        }, { threshold: 0.5 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [target, duration]);
    return { elRef, count };
}

const VIDEOS = [vid1, vid2, vid3, vid4, vid5];

const SPOKES = [0, 60, 120, 180, 240, 300];

function Wheel({ cx, cy, r = 36 }) {
    return (
        <g>
            {/* Tire */}
            <circle cx={cx} cy={cy} r={r + 2} fill='#080808' />
            {/* Tire tread texture */}
            <circle cx={cx} cy={cy} r={r + 2} fill='none' stroke='rgba(255,255,255,0.04)' strokeWidth={4} />
            {/* Rim */}
            <g style={{ animation: 'spinSlow 1.4s linear infinite', transformOrigin: `${cx}px ${cy}px` }}>
                <circle cx={cx} cy={cy} r={r - 4} fill='#111118' />
                {SPOKES.map((deg) => (
                    <line key={deg}
                        x1={cx} y1={cy}
                        x2={cx + (r - 8) * Math.cos(deg * Math.PI / 180)}
                        y2={cy + (r - 8) * Math.sin(deg * Math.PI / 180)}
                        stroke='#2e2e42' strokeWidth={3} strokeLinecap='round'
                    />
                ))}
                {/* Inner spoke ring */}
                {SPOKES.map((deg) => (
                    <line key={`i${deg}`}
                        x1={cx + 6 * Math.cos(deg * Math.PI / 180)}
                        y1={cy + 6 * Math.sin(deg * Math.PI / 180)}
                        x2={cx + (r - 10) * Math.cos(deg * Math.PI / 180)}
                        y2={cy + (r - 10) * Math.sin(deg * Math.PI / 180)}
                        stroke='#3a3a52' strokeWidth={1.5} strokeLinecap='round'
                    />
                ))}
                {/* Center hub */}
                <circle cx={cx} cy={cy} r={9} fill='#fbbf24' />
                <circle cx={cx} cy={cy} r={5} fill='#111118' />
                <circle cx={cx} cy={cy} r={2} fill='#fbbf24' />
            </g>
            {/* Brake caliper hint */}
            <path d={`M ${cx - 8} ${cy - r + 6} Q ${cx} ${cy - r - 2} ${cx + 8} ${cy - r + 6}`}
                fill='#e53e3e' opacity={0.7} />
        </g>
    );
}

function AnimatedCar() {
    return (
        <svg viewBox='0 0 600 230' xmlns='http://www.w3.org/2000/svg'
            style={{ width: '100%', filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.85))' }}>
            <defs>
                <linearGradient id='bodyTop' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='#2c2c42' />
                    <stop offset='45%' stopColor='#1a1a2e' />
                    <stop offset='100%' stopColor='#0d0d18' />
                </linearGradient>
                <linearGradient id='bodySide' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='#222238' />
                    <stop offset='100%' stopColor='#0a0a14' />
                </linearGradient>
                <linearGradient id='glassGrad' x1='0' y1='0' x2='1' y2='1'>
                    <stop offset='0%' stopColor='#1a3a6e' stopOpacity='0.95' />
                    <stop offset='100%' stopColor='#091828' stopOpacity='0.8' />
                </linearGradient>
                <linearGradient id='glassShine' x1='0' y1='0' x2='1' y2='1'>
                    <stop offset='0%' stopColor='rgba(255,255,255,0.18)' />
                    <stop offset='100%' stopColor='rgba(255,255,255,0)' />
                </linearGradient>
                <radialGradient id='hlGlow' cx='40%' cy='50%' r='60%'>
                    <stop offset='0%' stopColor='#fff9e0' stopOpacity='1' />
                    <stop offset='35%' stopColor='#fbbf24' stopOpacity='0.85' />
                    <stop offset='100%' stopColor='#fbbf24' stopOpacity='0' />
                </radialGradient>
                <radialGradient id='tlGlow' cx='60%' cy='50%' r='60%'>
                    <stop offset='0%' stopColor='#ff8888' stopOpacity='1' />
                    <stop offset='100%' stopColor='#ff2222' stopOpacity='0' />
                </radialGradient>
                <radialGradient id='underglow' cx='50%' cy='0%' r='60%'>
                    <stop offset='0%' stopColor='#fbbf24' stopOpacity='0.55' />
                    <stop offset='100%' stopColor='#fbbf24' stopOpacity='0' />
                </radialGradient>
                <radialGradient id='groundShadow' cx='50%' cy='50%' r='50%'>
                    <stop offset='0%' stopColor='rgba(0,0,0,0.65)' />
                    <stop offset='100%' stopColor='rgba(0,0,0,0)' />
                </radialGradient>
                <filter id='glow'>
                    <feGaussianBlur stdDeviation='3' result='blur' />
                    <feMerge><feMergeNode in='blur' /><feMergeNode in='SourceGraphic' /></feMerge>
                </filter>
            </defs>

            {/* ── Ground elements ── */}
            {/* Shadow ellipse */}
            <ellipse cx='295' cy='218' rx='235' ry='9' fill='url(#groundShadow)' />
            {/* Amber underglow */}
            <ellipse cx='295' cy='197' rx='185' ry='13'
                fill='url(#underglow)'
                style={{ animation: 'roadGlow 2.2s ease-in-out infinite' }} />

            {/* ── Car body — lower sill ── */}
            <path d='M 82,170 L 512,170 L 512,180 Q 480,188 455,182 L 175,182 Q 148,188 118,180 Z'
                fill='#0a0a12' />
            {/* Amber sill strip */}
            <path d='M 120,176 L 454,176' stroke='#fbbf24' strokeWidth='1.5' strokeLinecap='round'
                opacity='0.6' style={{ animation: 'roadGlow 2s ease-in-out infinite' }} />

            {/* ── Main car body ── */}
            <path d='M 80,170 L 62,158 L 56,142 L 60,126 L 88,108 L 170,80 L 210,60 L 340,57 L 390,60 L 432,82 L 472,112 L 498,136 L 512,155 L 512,170 L 80,170 Z'
                fill='url(#bodyTop)' />

            {/* Body side panel highlight */}
            <path d='M 82,170 L 62,158 L 56,142 L 60,128 L 88,110 L 130,96'
                stroke='rgba(255,255,255,0.07)' strokeWidth='1' fill='none' />
            <path d='M 430,84 L 470,114 L 496,138 L 510,155 L 512,170'
                stroke='rgba(255,255,255,0.07)' strokeWidth='1' fill='none' />

            {/* Top surface shine line */}
            <path d='M 172,80 L 210,61 L 340,58 L 390,61 L 428,82'
                stroke='rgba(255,255,255,0.22)' strokeWidth='2' fill='none' strokeLinecap='round' />

            {/* ── Windshield (front, left) ── */}
            <path d='M 172,80 L 210,60 L 278,57 L 278,100 L 195,104 Z'
                fill='url(#glassGrad)' />
            <path d='M 175,78 L 212,60 L 268,57 L 268,65 L 220,70 Z'
                fill='url(#glassShine)' opacity='0.6' />

            {/* ── Rear window ── */}
            <path d='M 284,57 L 390,61 L 428,82 L 400,100 L 284,100 Z'
                fill='url(#glassGrad)' />
            <path d='M 286,58 L 370,61 L 380,68 L 310,66 L 286,64 Z'
                fill='url(#glassShine)' opacity='0.5' />

            {/* Window pillar (B-pillar) */}
            <rect x='280' y='57' width='3' height='43' fill='#0a0a12' rx='1' />

            {/* ── Window frame chrome ── */}
            <path d='M 172,80 L 210,60 L 390,61 L 428,82 L 400,100 L 195,104 Z'
                fill='none' stroke='rgba(255,255,255,0.18)' strokeWidth='1.5' />

            {/* ── Door line ── */}
            <line x1='282' y1='100' x2='282' y2='170' stroke='rgba(255,255,255,0.08)' strokeWidth='1.2' />
            <line x1='160' y1='100' x2='160' y2='170' stroke='rgba(255,255,255,0.05)' strokeWidth='1' />
            <line x1='400' y1='100' x2='400' y2='170' stroke='rgba(255,255,255,0.05)' strokeWidth='1' />

            {/* ── Door handles ── */}
            <rect x='222' y='138' width='28' height='6' rx='3' fill='rgba(255,255,255,0.18)' />
            <rect x='342' y='138' width='28' height='6' rx='3' fill='rgba(255,255,255,0.18)' />

            {/* ── Headlights (left/front) ── */}
            {/* Housing */}
            <path d='M 58,141 L 60,126 L 84,110 L 96,120 L 88,148 Z' fill='#fbbf24' opacity='0.15' />
            {/* DRL strip */}
            <path d='M 62,130 L 84,116' stroke='#fff5cc' strokeWidth='3' strokeLinecap='round'
                filter='url(#glow)' style={{ animation: 'headlight 1.8s ease-in-out infinite' }} />
            <path d='M 64,138 L 87,125' stroke='#fbbf24' strokeWidth='2' strokeLinecap='round'
                opacity='0.7' style={{ animation: 'headlight 1.8s 0.2s ease-in-out infinite' }} />
            {/* Glow ellipse */}
            <ellipse cx='70' cy='132' rx='20' ry='14'
                fill='url(#hlGlow)'
                style={{ animation: 'headlight 1.8s ease-in-out infinite' }} />

            {/* ── Tail lights (right/rear) ── */}
            <path d='M 498,137 L 512,155 L 512,168 L 498,168 Z' fill='#cc2222' opacity='0.9' />
            {/* LED strip */}
            <line x1='497' y1='140' x2='497' y2='167'
                stroke='#ff5555' strokeWidth='2.5' strokeLinecap='round'
                filter='url(#glow)' style={{ animation: 'headlight 1.8s 0.5s ease-in-out infinite' }} />
            <ellipse cx='505' cy='152' rx='15' ry='11'
                fill='url(#tlGlow)'
                style={{ animation: 'headlight 1.8s 0.5s ease-in-out infinite' }} />

            {/* ── Front bumper detail ── */}
            <path d='M 58,143 L 56,155 L 60,165 L 82,170' fill='#0e0e1c' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
            {/* Lower intake grille lines */}
            {[0, 1, 2].map(i => (
                <line key={i} x1='60' y1={149 + i * 5} x2='75' y2={145 + i * 5}
                    stroke='rgba(251,191,36,0.25)' strokeWidth='1' />
            ))}

            {/* ── Rear bumper ── */}
            <path d='M 498,138 L 512,155 L 512,170' fill='none' stroke='rgba(255,255,255,0.07)' strokeWidth='1' />
            {/* Exhaust pipe */}
            <ellipse cx='505' cy='172' rx='6' ry='3' fill='#1a1a28' stroke='rgba(255,255,255,0.15)' strokeWidth='1' />

            {/* ── Exhaust smoke puffs ── */}
            {[
                { r: 5, dx: 14, dy: -3, delay: '0s',   dur: '2.2s' },
                { r: 4, dx: 22, dy: -6, delay: '0.5s',  dur: '2.8s' },
                { r: 3, dx: 10, dy: -2, delay: '1.1s',  dur: '2s'   },
                { r: 6, dx: 28, dy: -9, delay: '0.8s',  dur: '3.2s' },
            ].map((s, i) => (
                <circle key={i} cx={505 + s.dx} cy={172 + s.dy} r={s.r}
                    fill='rgba(190,190,210,0.15)'
                    style={{ animation: `particleDrift ${s.dur} ${s.delay} ease-out infinite` }} />
            ))}

            {/* ── Wheels ── */}
            <Wheel cx={148} cy={184} r={34} />
            <Wheel cx={428} cy={184} r={34} />

            {/* ── Wheel arch details ── */}
            <path d='M 108,184 Q 148,208 188,184' fill='none' stroke='rgba(255,255,255,0.1)' strokeWidth='1.5' />
            <path d='M 392,184 Q 428,208 464,184' fill='none' stroke='rgba(255,255,255,0.1)' strokeWidth='1.5' />

            {/* ── Roof antenna ── */}
            <line x1='298' y1='57' x2='302' y2='38' stroke='rgba(255,255,255,0.3)' strokeWidth='1.5' strokeLinecap='round' />
            <circle cx='302' cy='36' r='2' fill='rgba(255,255,255,0.4)' />
        </svg>
    );
}

const SPEED_LINES = [
    { top: '30%', w: 320, h: 1.5, delay: '0s',    dur: '1.4s', opacity: 0.6, color: 'rgba(251,191,36,0.7)'   },
    { top: '38%', w: 200, h: 1,   delay: '0.3s',  dur: '1.1s', opacity: 0.4, color: 'rgba(255,255,255,0.3)'  },
    { top: '44%', w: 380, h: 2,   delay: '0.1s',  dur: '1.6s', opacity: 0.5, color: 'rgba(251,191,36,0.5)'   },
    { top: '50%', w: 150, h: 1,   delay: '0.7s',  dur: '1.0s', opacity: 0.3, color: 'rgba(255,200,100,0.4)'  },
    { top: '56%', w: 280, h: 1.5, delay: '0.4s',  dur: '1.3s', opacity: 0.5, color: 'rgba(251,191,36,0.6)'   },
    { top: '62%', w: 220, h: 1,   delay: '0.9s',  dur: '1.2s', opacity: 0.3, color: 'rgba(255,255,255,0.25)' },
    { top: '24%', w: 180, h: 1,   delay: '1.1s',  dur: '0.9s', opacity: 0.3, color: 'rgba(251,191,36,0.4)'   },
    { top: '68%', w: 260, h: 1,   delay: '0.6s',  dur: '1.5s', opacity: 0.4, color: 'rgba(251,191,36,0.5)'   },
];

const BLDGS = [
    [0,160,55,160],[60,100,35,220],[100,140,70,180],[175,80,45,240],
    [225,120,60,200],[290,160,40,160],[335,90,50,230],[390,130,65,190],
    [460,70,40,250],[505,110,55,210],[565,150,45,170],[615,95,70,225],
    [690,135,50,185],[745,75,42,245],[792,125,60,195],[857,165,35,155],
    [897,105,55,215],[957,85,48,235],[1010,140,65,180],[1080,115,50,205],
    [1135,155,45,165],
];

const WIN_OFFSETS = [[8,12],[22,12],[8,30],[22,30],[8,48],[22,48],[8,66],[22,66]];

function CityBackground() {
    const strip = (offsetX = 0) => BLDGS.map(([x, y, w, h], i) => (
        <g key={`${offsetX}-${i}`}>
            <rect x={x + offsetX} y={y} width={w} height={320 - y} fill='#0a0a12' />
            {WIN_OFFSETS.slice(0, Math.floor(h / 30)).map(([wx, wy], j) =>
                (i * 7 + j) % 3 !== 0 ? null : (
                    <rect key={j} x={x + offsetX + wx} y={y + wy} width={6} height={4}
                        fill={`rgba(251,191,36,${0.15 + (i % 3) * 0.08})`} />
                )
            )}
        </g>
    ));

    return (
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
            {/* Scrolling city strips */}
            <div style={{ position: 'absolute', bottom: '28%', left: 0, right: 0, height: '42%', overflow: 'hidden' }}>
                <div style={{ display: 'flex', width: '200%', height: '100%', animation: 'cityScroll 22s linear infinite' }}>
                    <svg viewBox='0 0 1200 320' style={{ flex: '0 0 50%', height: '100%' }} preserveAspectRatio='none'>
                        <defs>
                            <linearGradient id='skyFade' x1='0' y1='0' x2='0' y2='1'>
                                <stop offset='0%' stopColor='transparent' />
                                <stop offset='100%' stopColor='rgba(5,5,15,0.9)' />
                            </linearGradient>
                        </defs>
                        {strip(0)}
                        <rect x='0' y='0' width='1200' height='320' fill='url(#skyFade)' />
                    </svg>
                    <svg viewBox='0 0 1200 320' style={{ flex: '0 0 50%', height: '100%' }} preserveAspectRatio='none'>
                        {strip(0)}
                        <rect x='0' y='0' width='1200' height='320' fill='url(#skyFade)' />
                    </svg>
                </div>
            </div>

            {/* Horizon amber glow line */}
            <div style={{
                position: 'absolute', bottom: '28%', left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.6) 20%, rgba(251,120,36,0.8) 50%, rgba(251,191,36,0.6) 80%, transparent 100%)',
                animation: 'roadGlow 3s ease-in-out infinite',
            }} />

            {/* Horizon glow blur */}
            <div style={{
                position: 'absolute', bottom: '24%', left: '10%', right: '10%', height: '80px',
                background: 'radial-gradient(ellipse at center, rgba(251,120,36,0.18) 0%, transparent 70%)',
                animation: 'roadGlow 3s ease-in-out infinite',
            }} />
        </div>
    );
}

function Road() {
    return (
        <div className='absolute bottom-0 left-0 right-0 pointer-events-none' style={{ height: '30%' }}>
            {/* Road surface with perspective */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, #0d0d16 0%, #111120 60%, #16161f 100%)',
                borderTop: '2px solid rgba(251,191,36,0.12)',
            }} />

            {/* Moving center dashes */}
            <div style={{
                position: 'absolute', left: '50%', top: 0, bottom: 0, width: '4px',
                backgroundImage: 'repeating-linear-gradient(to bottom, rgba(251,191,36,0.5) 0px, rgba(251,191,36,0.5) 30px, transparent 30px, transparent 60px)',
                backgroundSize: '4px 60px',
                animation: 'roadDash 0.5s linear infinite',
                transform: 'translateX(-50%)',
            }} />

            {/* Left lane dash */}
            <div style={{
                position: 'absolute', left: '25%', top: 0, bottom: 0, width: '2px',
                backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 20px, transparent 20px, transparent 50px)',
                backgroundSize: '2px 50px',
                animation: 'roadDash 0.5s linear infinite',
            }} />

            {/* Right lane dash */}
            <div style={{
                position: 'absolute', right: '25%', top: 0, bottom: 0, width: '2px',
                backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 20px, transparent 20px, transparent 50px)',
                backgroundSize: '2px 50px',
                animation: 'roadDash 0.5s linear infinite',
            }} />

            {/* Road edge lines */}
            <div style={{ position: 'absolute', left: '5%', top: 0, bottom: 0, width: '3px', background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ position: 'absolute', right: '5%', top: 0, bottom: 0, width: '3px', background: 'rgba(255,255,255,0.2)' }} />

            {/* Road ground reflection under car */}
            <div style={{
                position: 'absolute', top: 0, left: '30%', right: '10%', height: '30px',
                background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.2) 0%, transparent 70%)',
                animation: 'roadGlow 2.5s ease-in-out infinite',
            }} />
        </div>
    );
}

function Hero() {
    const [current, setCurrent] = useState(0);
    const [fading,  setFading]  = useState(false);
    const [ready,   setReady]   = useState(false);
    const [query,   setQuery]   = useState('');
    const [type,    setType]    = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const id = setInterval(() => {
            setFading(true);
            setTimeout(() => {
                setCurrent(c => (c + 1) % VIDEOS.length);
                setFading(false);
            }, 800);
        }, 10000);
        return () => clearInterval(id);
    }, []);

    const switchTo = (idx) => {
        if (idx === current) return;
        setFading(true);
        setTimeout(() => { setCurrent(idx); setFading(false); }, 800);
    };

    const handleSearch = () => navigate(`/shop?q=${query}&type=${type}`);

    return (
        <section className='relative text-white overflow-hidden' style={{ minHeight: '100vh' }}>

            {/* ── Video layer ── */}
            <video
                key={current}
                src={VIDEOS[current]}
                autoPlay muted loop playsInline
                className='absolute inset-0 w-full h-full object-cover'
                style={{
                    transition: 'opacity 0.8s ease',
                    opacity: fading ? 0 : 1,
                }}
            />

            {/* ── Dark overlays for text readability ── */}
            {/* Left-side gradient so text pops */}
            <div className='absolute inset-0 pointer-events-none'
                style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.2) 100%)' }} />
            {/* Bottom fade */}
            <div className='absolute inset-0 pointer-events-none'
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
            {/* Top fade */}
            <div className='absolute inset-0 pointer-events-none'
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 30%)' }} />

            {/* ── Main content ── */}
            <div className='relative z-10 max-w-[1400px] mx-auto px-6 flex flex-col justify-center min-h-screen py-24'>

                {/* Tag pill */}
                <div style={{ animation: ready ? 'textReveal 0.7s 0.1s cubic-bezier(0.22,1,0.36,1) both' : 'none', opacity: 0 }}
                    className='inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold px-4 py-2 rounded-full mb-6 self-start'>
                    <MdLocalOffer className='text-sm' /> Pakistan&apos;s Most Trusted Car Marketplace
                </div>

                {/* Headline */}
                <h1 className='text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 max-w-3xl'
                    style={{ animation: ready ? 'textReveal 0.9s 0.2s cubic-bezier(0.22,1,0.36,1) both' : 'none', opacity: 0 }}>
                    Drive Your<br />
                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-300 anim-gradient'>
                        Dream Car
                    </span><br />
                    Home Today
                </h1>

                {/* Sub text */}
                <p className='text-slate-300 text-base lg:text-lg max-w-xl mb-10 leading-relaxed'
                    style={{ animation: ready ? 'textReveal 0.8s 0.35s cubic-bezier(0.22,1,0.36,1) both' : 'none', opacity: 0 }}>
                    Browse 500+ verified cars from trusted sellers across Pakistan.
                    Transparent pricing, secure payments, and doorstep delivery.
                </p>

                {/* Search Box */}
                <div className='bg-white/95 backdrop-blur-md rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl shadow-black/50 max-w-2xl'
                    style={{ animation: ready ? 'textReveal 0.8s 0.45s cubic-bezier(0.22,1,0.36,1) both' : 'none', opacity: 0 }}>
                    <div className='relative flex-1'>
                        <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl' />
                        <input
                            type='text'
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder='Search make, model, year...'
                            className='w-full pl-9 pr-4 py-3.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none rounded-xl'
                        />
                    </div>
                    <select value={type} onChange={e => setType(e.target.value)}
                        className='text-gray-700 text-sm px-4 py-3.5 border-l border-gray-100 focus:outline-none bg-transparent rounded-xl'>
                        {['All', 'Sedan', 'SUV', 'Hatchback', 'MPV'].map(t => <option key={t}>{t}</option>)}
                    </select>
                    <button onClick={handleSearch}
                        className='bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-7 py-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-amber-500/40 hover:-translate-y-0.5'>
                        <MdSearch className='text-lg' /> Search
                    </button>
                </div>

                {/* Quick links */}
                <div className='flex flex-wrap gap-3 mt-5'
                    style={{ animation: ready ? 'textReveal 0.7s 0.6s cubic-bezier(0.22,1,0.36,1) both' : 'none', opacity: 0 }}>
                    <span className='text-slate-400 text-xs self-center'>Popular:</span>
                    {['Toyota Corolla', 'Honda Civic', 'KIA Sportage', 'Suzuki Swift'].map(label => (
                        <Link key={label} to={`/shop?q=${label}`}
                            className='text-xs text-slate-200 hover:text-amber-400 border border-white/20 hover:border-amber-500/60 bg-white/5 hover:bg-amber-500/10 px-3 py-1.5 rounded-full transition-all duration-200 backdrop-blur-sm'>
                            {label}
                        </Link>
                    ))}
                </div>

            </div>

            {/* ── Video dot indicators (bottom-right) ── */}
            <div className='absolute bottom-16 right-8 z-20 flex flex-col gap-2'>
                {VIDEOS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => switchTo(i)}
                        className='transition-all duration-300'
                        style={{
                            width: i === current ? '6px' : '6px',
                            height: i === current ? '24px' : '6px',
                            borderRadius: '999px',
                            background: i === current ? '#f59e0b' : 'rgba(255,255,255,0.35)',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    />
                ))}
            </div>

            {/* ── Bottom wave into next section ── */}
            <div className='absolute bottom-0 left-0 right-0 h-10 bg-white dark:bg-zinc-900'
                style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
        </section>
    );
}

function StatItem({ raw, suffix, label, icon: Icon }) {
    const { elRef, count } = useCountUp(raw);
    return (
        <div ref={elRef} className='sr flex items-center gap-4'>
            <div className='w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'>
                <Icon className='text-amber-500 text-2xl icon-spin3d' />
            </div>
            <div>
                <p className='text-2xl font-black text-gray-900 dark:text-zinc-100 leading-none tabular-nums'>
                    {count.toLocaleString()}{suffix}
                </p>
                <p className='text-sm text-gray-500 dark:text-zinc-400 mt-0.5'>{label}</p>
            </div>
        </div>
    );
}

function StatsBar() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.getStats()
            .then(data => setStats(data))
            .catch(() => setStats(null));
    }, []);

    const items = stats ? [
        { raw: stats.totalCars,    suffix: '+', label: 'Cars Available',   icon: MdDirectionsCar },
        { raw: stats.totalOrders,  suffix: '+', label: 'Happy Customers',  icon: MdStar          },
        { raw: stats.totalSellers, suffix: '+', label: 'Verified Sellers', icon: MdVerified      },
        { raw: 99,                 suffix: '%', label: 'Satisfaction Rate', icon: FiAward         },
    ] : STATS_FALLBACK;

    return (
        <section className='bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800'>
            <div className='sr-group group max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6'>
                {items.map((s) => <StatItem key={s.label} {...s} />)}
            </div>
        </section>
    );
}

function CategoryCard({ label, icon: Icon, count, bg, paramKey, query }) {
    const tilt = useTilt(18);
    return (
        <Link
            to={`/shop?${paramKey}=${query}`}
            ref={tilt.ref}
            onMouseMove={tilt.onMouseMove}
            onMouseLeave={tilt.onMouseLeave}
            className='sr-s card-shine group bg-white dark:bg-zinc-800 rounded-2xl p-5 text-center border border-gray-100 dark:border-zinc-700 hover:shadow-xl cursor-pointer block'
            style={{ willChange: 'transform' }}
        >
            <div className={`tilt-card-icon w-14 h-14 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                style={{ boxShadow: `0 8px 24px -4px var(--tw-shadow-color, rgba(0,0,0,0.3))` }}>
                <Icon className='text-white text-2xl icon-spin3d' />
            </div>
            <p className='font-bold text-gray-800 dark:text-zinc-200 text-sm mt-1'>{label}</p>
            <p className='text-gray-400 dark:text-zinc-500 text-xs mt-0.5'>{count} cars</p>
        </Link>
    );
}

function BrowseByCategory() {
    const [countMap, setCountMap] = useState({});

    useEffect(() => {
        api.getStats()
            .then(data => setCountMap(data.carsByType || {}))
            .catch(() => {});
    }, []);

    const cats = CATEGORIES.map(c => ({
        ...c,
        count: countMap[c.query] ?? c.count,
    }));

    return (
        <section className='bg-gray-50 dark:bg-zinc-950 py-16 px-6'>
            <div className='max-w-[1400px] mx-auto'>
                <SectionHeading tag='Explore by Type' title='Browse by Category' sub='Find exactly what you are looking for — filtered by the body style you prefer' />
                <div className='sr-group grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-10'>
                    {cats.map((c) => <CategoryCard key={c.label} {...c} />)}
                </div>
            </div>
        </section>
    );
}

function FeaturedCars() {
    const dispatch  = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const user      = useSelector(selectUser);
    const cartIds   = new Set(cartItems.map((c) => c.id));
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [cars,    setCars]    = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getCars({ featured: true, status: 'available', limit: 6 })
            .then(data => setCars(Array.isArray(data) ? data : data.cars || []))
            .catch(() => setCars([]))
            .finally(() => setLoading(false));
    }, []);

    const handleAddToCart = (car) => {
        if (!user) { setShowLoginModal(true); return; }
        dispatch(addToCart({ id: car._id, brand: car.make, name: car.model, year: car.year, price: car.price, image: car.images?.[0] || null, category: car.fuel }));
        dispatch(addToast({ type: 'success', message: `${car.make} ${car.model} added to cart!` }));
    };

    const handleRemoveFromCart = (car) => {
        dispatch(removeFromCart(car._id));
        dispatch(addToast({ type: 'info', message: `${car.make} ${car.model} removed from cart` }));
    };

    return (
        <section className='bg-white dark:bg-zinc-900 py-16 px-6'>
            {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} reason='cart' />}
            <div className='max-w-[1400px] mx-auto'>
                <div className='flex items-end justify-between mb-10'>
                    <SectionHeading tag='Top Picks' title='Featured Cars' sub='Handpicked by our team for quality, value, and condition' align='left' />
                    <Link to='/shop' className='hidden md:flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-500 transition-colors'>
                        View All Cars <FiArrowRight />
                    </Link>
                </div>

                {loading ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className='bg-gray-100 dark:bg-zinc-800 rounded-3xl h-80 animate-pulse' />
                        ))}
                    </div>
                ) : cars.length === 0 ? (
                    <div className='text-center py-16'>
                        <MdDirectionsCar className='text-gray-200 dark:text-zinc-700 text-7xl mx-auto mb-4' />
                        <p className='text-gray-400 dark:text-zinc-500 text-sm'>No featured cars available yet.</p>
                        <Link to='/shop' className='inline-flex items-center gap-2 mt-4 text-amber-600 font-semibold text-sm hover:text-amber-500'>
                            Browse all cars <FiArrowRight />
                        </Link>
                    </div>
                ) : (
                    <div className='sr-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {cars.map((car) => (
                            <FeaturedCard
                                key={car._id}
                                car={car}
                                onAdd={handleAddToCart}
                                onRemove={handleRemoveFromCart}
                                inCart={cartIds.has(car._id)}
                            />
                        ))}
                    </div>
                )}

                <div className='text-center mt-10'>
                    <Link to='/shop' className='inline-flex items-center gap-2 bg-slate-900 hover:bg-amber-500 text-white font-bold px-8 py-3.5 rounded-2xl transition-all duration-200 shadow-lg hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/20'>
                        Browse All Cars <MdArrowForward className='text-xl' />
                    </Link>
                </div>
            </div>
        </section>
    );
}

function FeaturedCard({ car, onAdd, onRemove, inCart }) {
    const [flash, setFlash] = useState(false);
    const tilt = useTilt(12);

    const image = car.images?.[0] || null;
    const badge = car.badge || (car.featured ? 'Featured' : null);

    const handleClick = () => {
        if (inCart) { onRemove(car); return; }
        onAdd(car);
        setFlash(true);
        setTimeout(() => setFlash(false), 1500);
    };

    return (
        <div
            ref={tilt.ref}
            onMouseMove={tilt.onMouseMove}
            onMouseLeave={tilt.onMouseLeave}
            className='sr card-shine group bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-zinc-700 flex flex-col'
            style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
        >
            {/* Car image area */}
            <div className='relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 h-52 overflow-hidden'>
                {image ? (
                    <img
                        src={image}
                        alt={`${car.make} ${car.model}`}
                        className='absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : (
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <MdDirectionsCar className='text-white/10 text-[160px]' />
                    </div>
                )}
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />

                {badge && (
                    <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full border ${BADGE_STYLES[badge] ?? 'bg-amber-100 text-amber-700 border-amber-200'}`}
                        style={{ transform: 'translateZ(16px)' }}>
                        {badge}
                    </span>
                )}
                <span className='absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full font-semibold'
                    style={{ transform: 'translateZ(16px)' }}>
                    {car.year}
                </span>
            </div>

            {/* Info */}
            <div className='p-5 flex flex-col flex-1'>
                <h3 className='text-lg font-black text-gray-900 dark:text-zinc-100 mb-1'>{car.make} {car.model}</h3>
                <div className='flex gap-3 mb-4'>
                    <span className='flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400'>
                        <MdLocalGasStation className='text-amber-500' /> {car.fuel}
                    </span>
                    {car.mileage != null && (
                        <span className='flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400'>
                            <MdSpeed className='text-amber-500' /> {fmtMiles(car.mileage)}
                        </span>
                    )}
                    {car.transmission && (
                        <span className='flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400'>
                            <TbManualGearbox className='text-amber-500' /> {car.transmission}
                        </span>
                    )}
                </div>

                <div className='flex items-center justify-between mt-auto'>
                    <div>
                        <p className='text-xs text-gray-400 dark:text-zinc-500 mb-0.5'>Price</p>
                        <p className='text-xl font-black text-amber-600'>{fmt(car.price)}</p>
                    </div>
                    <div className='flex gap-2'>
                        <Link
                            to={`/car/${car._id}`}
                            className='text-sm px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 font-medium transition-all hover:-translate-y-0.5'
                        >
                            Details
                        </Link>
                        <button
                            onClick={handleClick}
                            className={`flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                                inCart ? 'bg-red-500 text-white hover:bg-red-400 shadow-lg shadow-red-500/30' :
                                flash  ? 'bg-emerald-500 text-white scale-95 shadow-lg shadow-emerald-500/30' :
                                'bg-slate-900 text-white hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-500/30'
                            }`}
                        >
                            {inCart ? <MdClose className='text-base' /> : flash ? <FiCheckCircle /> : <FiShoppingCart />}
                            {inCart ? 'Remove' : flash ? 'Added!' : 'Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MakeCard({ name, cars }) {
    const tilt = useTilt(20);
    return (
        <Link
            to={`/shop?make=${name}`}
            ref={tilt.ref}
            onMouseMove={tilt.onMouseMove}
            onMouseLeave={tilt.onMouseLeave}
            className='sr card-shine group bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 rounded-2xl p-5 text-center transition-colors duration-200 block'
            style={{ willChange: 'transform' }}
        >
            <div className='tilt-card-icon w-14 h-14 bg-white/10 group-hover:bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/20'>
                <MdDirectionsCar className='text-white/50 group-hover:text-amber-400 text-2xl icon-spin3d transition-colors' />
            </div>
            <p className='font-bold text-white text-sm'>{name}</p>
            <p className='text-white/40 text-xs mt-0.5'>{cars} cars</p>
        </Link>
    );
}

function PopularMakes() {
    const [makes, setMakes] = useState([]);

    useEffect(() => {
        api.getStats()
            .then(data => setMakes(data.carsByMake || []))
            .catch(() => setMakes([]));
    }, []);

    if (makes.length === 0) return null;

    return (
        <section className='bg-slate-900 py-16 px-6'>
            <div className='max-w-[1400px] mx-auto'>
                <SectionHeading tag='Top Brands' title='Browse by Make' sub='Explore our wide inventory from the most trusted car brands in Pakistan' light />
                <div className='sr-group grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-10'>
                    {makes.map((m) => <MakeCard key={m.name} {...m} />)}
                </div>
            </div>
        </section>
    );
}

function WhyCard({ icon: Icon, title, desc, color, bg, dark }) {
    const tilt = useTilt(14);
    return (
        <div
            ref={tilt.ref}
            onMouseMove={tilt.onMouseMove}
            onMouseLeave={tilt.onMouseLeave}
            className='bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-100 dark:border-zinc-700 hover:shadow-xl transition-shadow duration-300 cursor-default'
            style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
        >
            <div className={`tilt-card-icon w-14 h-14 ${bg} ${dark} rounded-2xl flex items-center justify-center mb-4 group`}
                style={{ transform: 'translateZ(16px)', boxShadow: '0 8px 20px -4px rgba(0,0,0,0.12)' }}>
                <Icon className={`${color} text-2xl icon-spin3d`} />
            </div>
            <h3 className='font-bold text-gray-900 dark:text-zinc-100 text-base mb-2' style={{ transform: 'translateZ(8px)' }}>{title}</h3>
            <p className='text-gray-500 dark:text-zinc-400 text-sm leading-relaxed'>{desc}</p>
        </div>
    );
}

function WhyUs() {
    return (
        <section className='bg-gray-50 dark:bg-zinc-950 py-16 px-6'>
            <div className='max-w-[1400px] mx-auto'>
                <SectionHeading tag='Why Car Mart' title='Your Trust is Our Priority' sub='We have built every feature of Car Mart around making car buying safe, simple, and satisfying' />
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10'>
                    {WHY_US.map((w) => <WhyCard key={w.title} {...w} />)}
                </div>
            </div>
        </section>
    );
}

function HowItWorks() {
    const steps = [
        { step: '01', icon: MdSearch,       title: 'Search & Filter',   desc: 'Browse hundreds of verified listings. Use smart filters to narrow down by make, type, price, and mileage.' },
        { step: '02', icon: MdDirectionsCar, title: 'Inspect & Choose',  desc: 'View detailed car specs, photos, and history. Book a physical inspection or video call with the seller.' },
        { step: '03', icon: MdPayment,       title: 'Secure Payment',    desc: 'Pay securely through our escrow system. Your money is only released to the seller after you confirm receipt.' },
        { step: '04', icon: FiCheckCircle,   title: 'Drive Home!',       desc: 'Get your car delivered to your doorstep or pick it up yourself. We handle all the paperwork.' },
    ];

    return (
        <section className='bg-white dark:bg-zinc-900 py-16 px-6'>
            <div className='max-w-[1400px] mx-auto'>
                <SectionHeading tag='Simple Process' title='How It Works' sub='Buying a car through Car Mart takes just 4 easy steps' />
                <div className='relative mt-12'>
                    <div className='hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200' />
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                        {steps.map(({ step, icon: Icon, title, desc }, idx) => (
                            <div key={step} className='text-center relative group'>
                                <div
                                    className='w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex flex-col items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/30 relative z-10 transition-all duration-300 group-hover:-translate-y-3 group-hover:shadow-2xl group-hover:shadow-amber-500/40'
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <Icon className='text-white text-2xl icon-spin3d' />
                                    <span className='text-white/70 text-[10px] font-bold mt-0.5'>{step}</span>
                                    {/* 3D shadow layer */}
                                    <div className='absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-600 to-orange-700 opacity-0 group-hover:opacity-30 transition-opacity'
                                        style={{ transform: 'translateZ(-8px)', borderRadius: 'inherit' }} />
                                </div>
                                <h3 className='font-bold text-gray-900 dark:text-zinc-100 text-base mb-2'>{title}</h3>
                                <p className='text-gray-500 dark:text-zinc-400 text-sm leading-relaxed'>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function CTABanner() {
    return (
        <section className='relative bg-gradient-to-r from-amber-500 to-orange-500 py-16 px-6 overflow-hidden'>
            {/* 3D floating shapes */}
            <div className='absolute -top-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-2xl anim-float3d' />
            <div className='absolute -bottom-8 -right-8 w-48 h-48 bg-black/10 rounded-full blur-2xl anim-float3d' style={{ animationDelay: '2s' }} />
            <div className='absolute top-4 right-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl anim-float3d' style={{ animationDelay: '1s' }} />

            <div className='relative max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left z-10'>
                <div>
                    <h2 className='text-2xl md:text-3xl font-black text-white mb-2'>Ready to Find Your Perfect Car?</h2>
                    <p className='text-amber-100 text-sm md:text-base'>Join 1,200+ satisfied customers who found their dream car on Car Mart.</p>
                </div>
                <div className='flex gap-3 flex-shrink-0'>
                    <Link to='/shop'
                        className='bg-white text-amber-600 hover:bg-amber-50 font-black px-6 py-3 rounded-2xl transition-all flex items-center gap-2 shadow-lg hover:-translate-y-1 hover:shadow-xl'>
                        Browse Cars <MdArrowForward />
                    </Link>
                    <Link to='/sell'
                        className='bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-2xl transition-all border border-amber-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-700/30'>
                        Sell Your Car
                    </Link>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className='bg-gray-950 text-gray-400 py-12 px-6'>
            <div className='max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                <div>
                    <div className='flex items-center gap-2 mb-4'>
                        <MdDirectionsCar className='text-amber-400 text-2xl' />
                        <span className='font-black text-white text-lg'>Car<span className='text-amber-400'>Mart</span></span>
                    </div>
                    <p className='text-sm leading-relaxed text-gray-500'>
                        Pakistan&apos;s most trusted online car marketplace. Verified listings, secure payments, and the best deals.
                    </p>
                </div>
                {[
                    {
                        title: 'Quick Links',
                        links: [
                            { label: 'Home',      to: '/'        },
                            { label: 'Shop Cars', to: '/shop'    },
                            { label: 'Sell Car',  to: '/sell'    },
                            { label: 'Support',   to: '/support' },
                            { label: 'About Us',  to: '/about'   },
                        ],
                    },
                    {
                        title: 'Car Types',
                        links: [
                            { label: 'Sedans',     to: '/shop?type=Sedan'     },
                            { label: 'SUVs',       to: '/shop?type=SUV'       },
                            { label: 'Hatchbacks', to: '/shop?type=Hatchback' },
                            { label: 'Hybrids',    to: '/shop?fuel=Hybrid'    },
                            { label: 'MPVs',       to: '/shop?type=MPV'       },
                        ],
                    },
                    {
                        title: 'Company',
                        links: [
                            { label: 'About Us', to: '/about'   },
                            { label: 'Contact',  to: '/support' },
                            { label: 'Shop',     to: '/shop'    },
                            { label: 'Sell Car', to: '/sell'    },
                        ],
                    },
                ].map(({ title, links }) => (
                    <div key={title}>
                        <h4 className='text-white font-bold mb-4 text-sm'>{title}</h4>
                        <ul className='space-y-2'>
                            {links.map(({ label, to }) => (
                                <li key={label}>
                                    <Link to={to} className='text-sm text-gray-500 hover:text-amber-400 transition-colors flex items-center gap-1.5'>
                                        <BsChevronRight className='text-xs' /> {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className='max-w-[1400px] mx-auto mt-10 pt-6 border-t border-white/5 text-center text-xs text-gray-600'>
                &copy; {new Date().getFullYear()} CarMart Pakistan. All rights reserved.
            </div>
        </footer>
    );
}

function SectionHeading({ tag, title, sub, light = false, align = 'center' }) {
    const center = align === 'center';
    return (
        <div className={center ? 'text-center' : 'text-left'}>
            <span className={`inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3 ${light ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                {tag}
            </span>
            <h2 className={`text-3xl md:text-4xl font-black mb-3 ${light ? 'text-white' : 'text-gray-900 dark:text-zinc-100'}`}>
                {title}
            </h2>
            {sub && (
                <p className={`text-sm md:text-base max-w-xl ${center ? 'mx-auto' : ''} ${light ? 'text-slate-400' : 'text-gray-500 dark:text-zinc-400'}`}>
                    {sub}
                </p>
            )}
        </div>
    );
}

export default function Home() {
    return (
        <div className='min-h-screen'>
            <Hero />
            <StatsBar />
            <BrowseByCategory />
            <FeaturedCars />
            <PopularMakes />
            <WhyUs />
            <HowItWorks />
            <TestimonialsSlider />
            <CTABanner />
            <Footer />
        </div>
    );
}
