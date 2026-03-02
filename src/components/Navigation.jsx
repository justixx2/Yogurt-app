import { NavLink } from "react-router-dom";

export default function Navigation() {
  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <span className="nav-logo">Y</span>
        <span className="nav-title">Yogurt Lab</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Recipes
        </NavLink>
        <NavLink to="/archive" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Archive
        </NavLink>
        <NavLink to="/data" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Import / Export
        </NavLink>
      </div>
    </nav>
  );
}
