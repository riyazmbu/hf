import { useState, useEffect, useRef } from 'react'
import { NavLink, Link } from 'react-router-dom'
import '../../Navigation.css'

export default function AppShell({ children, navOpen, onToggleNav, onCloseNav }) {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const navRef = useRef(null)

  // Toggle dropdown on click
  const handleDropdownClick = (menuName, e) => {
    e.stopPropagation()
    setActiveDropdown((prev) => (prev === menuName ? null : menuName))
  }

  // Close everything when a menu link is clicked
  const handleMenuClose = () => {
    setActiveDropdown(null)
    if (onCloseNav) onCloseNav()
  }

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="app-layout">
      {/* Top Header */}
      <header className="main-header">
        <div className="header-container">
          
          {/* Brand Logo & Live Market Badge */}
          <div className="brand-group">
            <Link to="/" className="brand-logo-link" onClick={handleMenuClose}>
              <img src="/logo.png" alt="HeyFund Logo" className="header-logo" />
            </Link>
            <div className="live-status-pill">
              <span className="live-dot"></span>
              <span className="live-text">NSE LIVE</span>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className={`desktop-nav ${navOpen ? 'mobile-open' : ''}`} ref={navRef}>
            
            {/* Home */}
            <NavLink to="/" className="nav-tab" onClick={handleMenuClose}>
              Home
            </NavLink>

            {/* MARKET DROPDOWN */}
            <div className="nav-tab-dropdown">
              <button 
                type="button"
                className={`nav-tab dropdown-btn ${activeDropdown === 'market' ? 'active' : ''}`}
                onClick={(e) => handleDropdownClick('market', e)}
              >
                Market <span className="arrow-icon">▾</span>
              </button>

              <div className={`mega-menu-panel ${activeDropdown === 'market' ? 'visible' : ''}`}>
                <div className="mega-menu-grid">
                  
                  {/* Category 1: Price & Momentum */}
                  <div className="menu-col">
                    <div className="col-header">
                      <span className="col-icon">⚡</span>
                      <span>Price & Momentum</span>
                    </div>
                    
                    <Link to="/market-data/ltp" className="menu-item-card" onClick={handleMenuClose}>
                      <div className="item-title-row">
                        <span className="item-title">Gainers & Losers</span>
                        <span className="badge badge-hot">HOT</span>
                      </div>
                      <p className="item-desc">Top 10 intraday price movers by % change</p>
                    </Link>

                    {/* <Link to="/market-data/volume-shockers" className="menu-item-card" onClick={handleMenuClose}>
                      <div className="item-title-row">
                        <span className="item-title">Volume Shockers</span>
                        <span className="badge badge-live">LIVE</span>
                      </div>
                      <p className="item-desc">Stocks with 3x+ volume spike vs avg</p>
                    </Link> */}

                    <Link to="/market-data/historical" className="menu-item-card" onClick={handleMenuClose}>
                      <div className="item-title-row">
                        <span className="item-title">OHLC & Historical</span>
                      </div>
                      <p className="item-desc">Open, High, Low, Close & Candle charts</p>
                    </Link>
                  </div>

                  {/* Category 2: Market Intelligence */}
                  <div className="menu-col">
                    <div className="col-header">
                      <span className="col-icon">🧠</span>
                      <span>Market Intelligence</span>
                    </div>

                    <Link to="/sectors" className="menu-item-card" onClick={handleMenuClose}>
                      <div className="item-title-row">
                        <span className="item-title">Sector Performance</span>
                      </div>
                      <p className="item-desc">Realtime sector heatmaps & strength</p>
                    </Link>

                    {/* <Link to="/market-data/fii-dii" className="menu-item-card" onClick={handleMenuClose}>
                      <div className="item-title-row">
                        <span className="item-title">FII / DII Flow</span>
                        <span className="badge badge-new">NEW</span>
                      </div>
                      <p className="item-desc">Institutional net cash & F&O buy/sell data</p>
                    </Link> */}

                    {/* <Link to="/market-data/fundamentals" className="menu-item-card" onClick={handleMenuClose}>
                      <div className="item-title-row">
                        <span className="item-title">Fundamentals</span>
                      </div>
                      <p className="item-desc">Financial ratios, earnings & balance sheets</p>
                    </Link> */}
                  </div>

                </div>
              </div>
            </div>

            {/* OPTIONS DROPDOWN */}
            <div className="nav-tab-dropdown">
              <button 
                type="button"
                className={`nav-tab dropdown-btn ${activeDropdown === 'options' ? 'active' : ''}`}
                onClick={(e) => handleDropdownClick('options', e)}
              >
                Options <span className="arrow-icon">▾</span>
              </button>

              <div className={`mega-menu-panel ${activeDropdown === 'options' ? 'visible' : ''}`}>
                <div className="mega-menu-grid">
                  
                  {/* Category 1: Chain & Greeks */}
                  <div className="menu-col">
                    <div className="col-header">
                      <span className="col-icon">🎯</span>
                      <span>Chain & Greeks</span>
                    </div>

                    <Link to="/optionchain" className="menu-item-card" onClick={handleMenuClose}>
                      <div className="item-title-row">
                        <span className="item-title">Live Option Chain</span>
                        <span className="badge badge-live">LIVE</span>
                      </div>
                      <p className="item-desc">Realtime strike matrix, OI & volume bars</p>
                    </Link>

                    <Link to="/options-data/greeks" className="menu-item-card" onClick={handleMenuClose}>
                      <div className="item-title-row">
                        <span className="item-title">Option Greeks</span>
                      </div>
                      <p className="item-desc">Delta, Gamma, Theta, Vega & IV Rank</p>
                    </Link>
                  </div>

                  {/* Category 2: OI Analytics & Sentiment */}
                  <div className="menu-col">
                    <div className="col-header">
                      <span className="col-icon">📊</span>
                      <span>OI & Volatility</span>
                    </div>

                    <Link to="/options-data/oi" className="menu-item-card" onClick={handleMenuClose}>
                      <div className="item-title-row">
                        <span className="item-title">Derivatives Build-Up</span>
                        <span className="badge badge-hot">HOT</span>
                      </div>
                      <p className="item-desc">Long/Short Build-up & Short Covering</p>
                    </Link>

                    <Link to="/options-data/pcr" className="menu-item-card" onClick={handleMenuClose}>
                      <div className="item-title-row">
                        <span className="item-title">Put Call Ratio (PCR)</span>
                      </div>
                      <p className="item-desc">Market sentiment & sentiment trends</p>
                    </Link>

                    {/* <Link to="/options-data/max-pain" className="menu-item-card" onClick={handleMenuClose}>
                      <div className="item-title-row">
                        <span className="item-title">Max Pain & Straddles</span>
                      </div>
                      <p className="item-desc">Option writer loss levels & straddle pricing</p>
                    </Link> */}
                  </div>

                </div>
              </div>
            </div>

            {/* Direct Links */}
            <NavLink to="/screener" className="nav-tab" onClick={handleMenuClose}>
              Screener
            </NavLink>

            <NavLink to="/news" className="nav-tab" onClick={handleMenuClose}>
              News
            </NavLink>

            <NavLink to="/blog" className="nav-tab" onClick={handleMenuClose}>
              Blog
            </NavLink>

            <NavLink to="/about" className="nav-tab" onClick={handleMenuClose}>
              About
            </NavLink>
          </nav>

          {/* Actions & Mobile Toggle */}
          <div className="header-actions">
            <Link to="/screener" className="header-cta-btn" onClick={handleMenuClose}>
              ⚡ Open Screener
            </Link>

            <button 
              className={`hamburger-btn ${navOpen ? 'is-active' : ''}`}
              onClick={onToggleNav}
              aria-label="Toggle Navigation Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Viewport */}
      <main className="main-viewport">
        {children}
      </main>
    </div>
  )
}