import { useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export default function PageTransition({ children }) {
  const location = useLocation();
  const [display, setDisplay] = useState(children);
  const [fade, setFade] = useState(true);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;
    setFade(false);
    const t = setTimeout(() => {
      setDisplay(children);
      setFade(true);
    }, 120);
    return () => clearTimeout(t);
  }, [location.pathname, children]);

  return (
    <div style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.12s ease' }}>
      {display}
    </div>
  );
}
