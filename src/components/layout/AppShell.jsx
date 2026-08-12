import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

export default function AppShell({ children, navOpen, onToggleNav, onCloseNav }) {
  const navigate = useNavigate()
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileExpanded, setMobileExpanded] = useState({
    market: false,
    options: false,
    research: false,
    more: false
  })

  const handleNavigate = (path) => {
    navigate(path)
    setActiveDropdown(null)
    onCloseNav()
  }

  const toggleMobileSubmenu = (key) => {
    setMobileExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Styles
  const navHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '68px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  }

  const baseLinkStyle = {
    textDecoration: 'none',
    color: '#334155',
    fontSize: '14px',
    fontWeight: 500,
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  }

  const dropdownCardStyle = (isOpen) => ({
    display: isOpen ? 'flex' : 'none',
    flexDirection: 'column',
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: '0',
    backgroundColor: '#ffffff',
    minWidth: '180px',
    padding: '6px',
    borderRadius: '8px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    zIndex: 1100
  })

  return (
    <>
      {/* Dynamic Mobile CSS Injection */}
      <style>{`
        .desktop-menu { display: flex; align-items: center; gap: 4px; }
        .mobile-menu-btn { display: none; background: transparent; border: none; cursor: pointer; padding: 6px; }
        .hover-item:hover { background-color: #f1f5f9; color: #1e293b; }
        .dropdown-link:hover { background-color: #f8fafc; color: #2563eb; }
        
        @media (max-width: 868px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>

      <header style={navHeaderStyle}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <img src="/logo.png" alt="HeyFund Logo" style={{ height: '42px', width: 'auto', display: 'block' }} />
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-menu">
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              ...baseLinkStyle,
              color: isActive ? '#2563eb' : '#334155',
              backgroundColor: isActive ? '#eff6ff' : 'transparent',
              fontWeight: isActive ? 600 : 500
            })}
          >
            Home
          </NavLink>

          {/* Market Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setActiveDropdown('market')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div style={{ ...baseLinkStyle, backgroundColor: activeDropdown === 'market' ? '#f8fafc' : 'transparent' }}>
              Market <span style={{ fontSize: '10px', color: '#94a3b8' }}>▼</span>
            </div>
            <div style={dropdownCardStyle(activeDropdown === 'market')}>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/market-data/ltp')}>Stocks</div>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/market-data/ohlc')}>Indices</div>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/market-data/historical')}>Market Overview</div>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/market-data/fii-dii')}>Gainers</div>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/market-data/fundamentals')}>Losers</div>
            </div>
          </div>

          {/* Options Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setActiveDropdown('options')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div style={{ ...baseLinkStyle, backgroundColor: activeDropdown === 'options' ? '#f8fafc' : 'transparent' }}>
              Options <span style={{ fontSize: '10px', color: '#94a3b8' }}>▼</span>
            </div>
            <div style={dropdownCardStyle(activeDropdown === 'options')}>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/optionchain')}>Option Chain</div>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/options-data/screener')}>Option Screener</div>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/options-data/oi')}>OI Analysis</div>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/options-data/pcr')}>PCR</div>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/options-data/max-pain')}>Max Pain</div>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/options-data/greeks')}>Greeks</div>
            </div>
          </div>

          {/* Screener Link */}
          <NavLink
            to="/screener"
            style={({ isActive }) => ({
              ...baseLinkStyle,
              color: isActive ? '#2563eb' : '#334155',
              backgroundColor: isActive ? '#eff6ff' : 'transparent',
              fontWeight: isActive ? 600 : 500
            })}
          >
            Screener
          </NavLink>

          {/* Research Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setActiveDropdown('research')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div style={{ ...baseLinkStyle, backgroundColor: activeDropdown === 'research' ? '#f8fafc' : 'transparent' }}>
              Research <span style={{ fontSize: '10px', color: '#94a3b8' }}>▼</span>
            </div>
            <div style={dropdownCardStyle(activeDropdown === 'research')}>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/sectors')}>Sector</div>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/news')}>Market News</div>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/blog')}>Blog</div>
            </div>
          </div>

          {/* More Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setActiveDropdown('more')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div style={{ ...baseLinkStyle, backgroundColor: activeDropdown === 'more' ? '#f8fafc' : 'transparent' }}>
              More <span style={{ fontSize: '10px', color: '#94a3b8' }}>▼</span>
            </div>
            <div style={dropdownCardStyle(activeDropdown === 'more')}>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/about')}>About</div>
              <div className="dropdown-link" style={{ padding: '8px 12px', fontSize: '13.5px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleNavigate('/contact')}>Contact</div>
            </div>
          </div>
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <button className="mobile-menu-btn" onClick={onToggleNav} aria-label="Toggle Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Mobile Slide-out Drawer */}
      {navOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1200,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={onCloseNav}
        >
          <div
            style={{
              width: '280px',
              height: '100%',
              backgroundColor: '#ffffff',
              padding: '20px 16px',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Navigation</span>
              <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }} onClick={onCloseNav}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '10px 12px', fontWeight: 500, color: '#334155', cursor: 'pointer' }} onClick={() => handleNavigate('/')}>Home</div>

              {/* Mobile Market Accordion */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', fontWeight: 500, color: '#334155', cursor: 'pointer' }} onClick={() => toggleMobileSubmenu('market')}>
                  Market <span>{mobileExpanded.market ? '▲' : '▼'}</span>
                </div>
                {mobileExpanded.market && (
                  <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/market-data/ltp')}>Stocks</div>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/market-data/ohlc')}>Indices</div>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/market-data/historical')}>Market Overview</div>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/market-data/fii-dii')}>Gainers</div>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/market-data/fundamentals')}>Losers</div>
                  </div>
                )}
              </div>

              {/* Mobile Options Accordion */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', fontWeight: 500, color: '#334155', cursor: 'pointer' }} onClick={() => toggleMobileSubmenu('options')}>
                  Options <span>{mobileExpanded.options ? '▲' : '▼'}</span>
                </div>
                {mobileExpanded.options && (
                  <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/optionchain')}>Option Chain</div>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/options-data/screener')}>Option Screener</div>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/options-data/oi')}>OI Analysis</div>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/options-data/pcr')}>PCR</div>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/options-data/max-pain')}>Max Pain</div>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/options-data/greeks')}>Greeks</div>
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 12px', fontWeight: 500, color: '#334155', cursor: 'pointer' }} onClick={() => handleNavigate('/screener')}>Screener</div>

              {/* Mobile Research Accordion */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', fontWeight: 500, color: '#334155', cursor: 'pointer' }} onClick={() => toggleMobileSubmenu('research')}>
                  Research <span>{mobileExpanded.research ? '▲' : '▼'}</span>
                </div>
                {mobileExpanded.research && (
                  <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/sectors')}>Sector</div>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/news')}>Market News</div>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/blog')}>Blog</div>
                  </div>
                )}
              </div>

              {/* Mobile More Accordion */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', fontWeight: 500, color: '#334155', cursor: 'pointer' }} onClick={() => toggleMobileSubmenu('more')}>
                  More <span>{mobileExpanded.more ? '▲' : '▼'}</span>
                </div>
                {mobileExpanded.more && (
                  <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/about')}>About</div>
                    <div style={{ fontSize: '13.5px', color: '#475569', cursor: 'pointer' }} onClick={() => handleNavigate('/contact')}>Contact</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        {children}
      </main>
    </>
  )
}