import { NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar" id="main-navbar">
      {/* Left — Tata Steel wordmark (inline SVG text) */}
      <div className="navbar-brand">
        <svg width="120" height="32" viewBox="0 0 120 32" aria-label="Tata Steel">
          <text
            x="0"
            y="20"
            fontFamily="'IBM Plex Sans', sans-serif"
            fontWeight="600"
            fontSize="16"
            fill="#ffffff"
            letterSpacing="0.06em"
          >
            TATA STEEL
          </text>
          <line x1="0" y1="26" x2="112" y2="26" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        </svg>
      </div>

      {/* Center — System name */}
      <div className="navbar-center">
        SURFACE DEFECT INSPECTION SYSTEM
      </div>

      {/* Right — Navigation + Status */}
      <div className="navbar-right">
        <NavLink
          to="/"
          className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
          id="nav-inspect"
        >
          Inspect
        </NavLink>
        <NavLink
          to="/metrics"
          className={`navbar-link ${location.pathname === '/metrics' ? 'active' : ''}`}
          id="nav-metrics"
        >
          Metrics
        </NavLink>

        <div className="navbar-status">
          <span className="status-dot" />
          <span className="status-text">System Online</span>
        </div>
      </div>
    </nav>
  );
}
