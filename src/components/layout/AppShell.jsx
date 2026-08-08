import { NavLink } from 'react-router-dom'

export default function AppShell({ children, navOpen, onToggleNav, onCloseNav, isAdminAuthenticated, onLogoutAdmin }) {
  return (
    <>
      <header className="main-navbar">
        <div className="nav-brand">
          <a href="/">
            <img src="/logo.png" alt="HeyFund Logo" style={{ height: '95px', width: 'auto' }} />
          </a>
        </div>
        <nav className={`nav-links ${navOpen ? 'open' : ''}`} id="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onCloseNav} end>
            Home
          </NavLink>
          <NavLink to="/screener" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onCloseNav}>
            Screener
          </NavLink>
          <NavLink to="/optionchain" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onCloseNav}>
            Option Chain
          </NavLink>
          <NavLink to="/blog" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onCloseNav}>
            Blog
          </NavLink>
          <NavLink to="/news" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onCloseNav}>
            News
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onCloseNav}>
            About
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')} onClick={onCloseNav}>
            Contact
          </NavLink>
        </nav>
        <button
          className={`nav-toggle-btn ${navOpen ? 'open' : ''}`}
          id="nav-toggle-btn"
          aria-label="Toggle navigation menu"
          onClick={onToggleNav}
        >
          <span></span>
        </button>
      </header>

      <div className="container">{children}</div>
    </>
  )
}
