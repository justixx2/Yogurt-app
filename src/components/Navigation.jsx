import { NavLink } from "react-router-dom";

export default function Navigation() {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="9" y="3" width="6" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Recipes</span>
      </NavLink>

      <NavLink
        to="/archive"
        className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
        </svg>
        <span>Archive</span>
      </NavLink>

      <NavLink
        to="/data"
        className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="7,10 12,15 17,10" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Data</span>
      </NavLink>
    </nav>
  );
}
