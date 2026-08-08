import { useEffect, useRef, useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import BlogModule from './BlogModule'
import NewsModule from './NewsModule'
import AdminLogin from './AdminLogin'
import OptionChain from './OptionChain'
import Screener from './Screener'
import About from './About'
import Contact from './Contact'
import Sector from './Sector'

const SHEET_ID = '1aLKkL-nwJXtKoRCB3wKZMed0GMucP1p-S9eU2cEMqww'
const NEWS_SHEET_ID = '1X6amEBgzjwpbaSST_19z-6zAMbnA4yYpnrYO_faoh_g'
const NEWS_SHEET_TAB = 'BSE'
const PROMO_DISMISS_KEY = 'heyfund_promo_dismissed_until'

const INDEX_CARDS = [
  { key: 'nifty', label: 'NIFTY', searchKey: 'nifty_50' },
  { key: 'bank', label: 'BANKNIFTY', searchKey: 'nifty_bank' },
  { key: 'sensex', label: 'SENSEX', searchKey: 'sensex' },
  { key: 'vix', label: 'INDIA VIX', searchKey: 'india_vix' },  
]

function parseRows(tableData) {
  if (!tableData || !tableData.rows) return []
  return tableData.rows.map((row) =>
    (row.c || []).map((cell) => {
      if (!cell) return ''
      return cell.f ? cell.f : cell.v !== null && cell.v !== undefined ? cell.v : ''
    })
  )
}

function findRowByKeyword(rows, phrase) {
  const target = phrase.toLowerCase().replace(/[^a-z0-9]/g, '')
  return rows.find((r) =>
    r.some((c) => String(c).toLowerCase().replace(/[^a-z0-9]/g, '').includes(target))
  ) || []
}

function parseChangePercent(changeStr) {
  const cleaned = String(changeStr || '').replace(/[^0-9.-]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

/* Horizontal Bar List component matching the image layout */

function HorizontalBarList({ items }) {
  if (!items || items.length === 0) {
    return <div className="sector-loading-state">Loading metrics...</div>
  }

  const maxPct = Math.max(...items.map((i) => Math.abs(i.pct || 0)), 1)

  return (
    <div className="horizontal-bar-list">
      {items.map((item, idx) => {
        const val = item.pct || 0
        const isPositive = val >= 0
        // Scaled length up to 50% max for each side
        const fillWidth = Math.min((Math.abs(val) / maxPct) * 50, 50)

        return (
          <div className="bar-item-row" key={idx}>
            <span className="bar-item-label" title={item.name}>
              {item.name}
            </span>
            <div className="bar-item-track">
              <div className="center-line" />
              <div
                className={`bar-item-fill ${isPositive ? 'up' : 'down'}`}
                style={{ width: `${fillWidth}%` }}
              >
                <span className={`bar-item-text ${isPositive ? 'text-right' : 'text-left'}`}>
                  {item.change}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* Top News Section */
export function TopNewsFeed() {
  const [newsItems, setNewsItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const tq = encodeURIComponent('SELECT * LIMIT 4')
    const url = `https://docs.google.com/spreadsheets/d/${NEWS_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
      NEWS_SHEET_TAB
    )}&tq=${tq}&_=${Date.now()}`

    fetch(url)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/)
        if (!jsonMatch) return

        const data = JSON.parse(jsonMatch[1])
        const table = data.table
        if (!table || !table.rows) return

        const getVal = (row, idx) => {
          const cell = row.c[idx]
          return cell && cell.v !== null && cell.v !== undefined ? String(cell.v).trim() : ''
        }

        const items = table.rows.map((r) => ({
          dt: getVal(r, 0),
          name: getVal(r, 1),
          headline: getVal(r, 2),
        })).filter((n) => n.headline)

        setNewsItems(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    return () => { cancelled = true }
  }, [])

  return (
    <div className="card-panel">
      <div className="panel-header">
        <h3>Top News</h3>
        <a href="/blog" className="view-all-link">View All</a>
      </div>
      <div className="news-list-container">
        {loading ? (
          <div style={{ color: '#64748b', fontSize: '13px', padding: '20px 0' }}>Loading news...</div>
        ) : (
          newsItems.map((n, i) => (
            <div className="news-card-item" key={i}>
              <a href="#news-link" className="news-card-headline">&raquo; {n.headline}</a>
              <div className="news-card-meta">{n.dt || 'Today'} — {n.name || 'BSE'}</div>
            </div>
          ))
        )}
      </div>
      <div className="pagination-btns">
        <button className="page-btn">Previous</button>
        <button className="page-btn">Next</button>
      </div>
    </div>
  )
}

function HomeDashboard() {
  const [sectors, setSectors] = useState([])
  const [indices, setIndices] = useState({
    nifty: { val: '--', change: '--', cls: 'up' },
    bank: { val: '--', change: '--', cls: 'up' },
    sensex: { val: '--', change: '--', cls: 'up' },
    vix: { val: '--', change: '--', cls: 'up' },
  })
  const [movers, setMovers] = useState({
    gainers: [],
    losers: [],
    intradayGainers: [],
    intradayLosers: [],
  })

  useEffect(() => {
    window.processIndices = function (data) {
      const rows = parseRows(data.table)

      setIndices((prev) => {
        const next = { ...prev }
        INDEX_CARDS.forEach((item) => {
          const matchingRow = findRowByKeyword(rows, item.searchKey)
          if (matchingRow.length >= 9) {
            const cmpVal = matchingRow[6] !== undefined && matchingRow[6] !== '' ? matchingRow[6] : '--'
            const rawPct = matchingRow[7] !== undefined ? String(matchingRow[7]).trim() : ''
            const rawChange = matchingRow[8] !== undefined ? String(matchingRow[8]).trim() : ''

            let changeText = '--'
            if (rawChange || rawPct) {
              const formattedPct = rawPct.includes('%') ? rawPct : `${rawPct}%`
              changeText = `${formattedPct}`
            }

            const numericChange = parseChangePercent(rawPct || rawChange)
            const isNegative = numericChange < 0
            const finalCls = isNegative ? 'down' : 'up'

            const formattedCmp = typeof cmpVal === 'number'
              ? cmpVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : cmpVal

            next[item.key] = { val: formattedCmp, change: changeText, cls: finalCls }
          }
        })
        return next
      })

      const parsedSectors = rows
        .map((r) => {
          const nameCell = r.find((cell) => cell && typeof cell === 'string' && cell.trim().length > 0) || ''
          const rawPct = String(r[8] !== undefined && r[8] !== '' ? r[8] : r[7] || r[3] || '').trim()
          const pctNum = parseChangePercent(rawPct)
          const displayName = String(nameCell).replace(/^NIFTY\s*|_/gi, ' ').trim()

          return {
            name: displayName,
            pct: pctNum,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}%`) : '0.00%',
          }
        })
        .filter((s) => s.name && s.name.length >= 2 && s.change !== '0.00%')
        .slice(2, 10)

      setSectors(parsedSectors)
    }

    window.processMovers = function (data) {
      const rows = parseRows(data.table)

      const intradayGainers = rows
        .map((r) => {
          const name = String(r[11] || '').trim()
          const rawPct = String(r[13] || '').trim()
          return {
            name,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}%`) : '0.00%',
            pct: parseChangePercent(rawPct),
          }
        })
        .filter((a) => a.name && !a.name.toUpperCase().includes('SYMBOL'))
        .slice(0, 5)

      const intradayLosers = rows
        .map((r) => {
          const name = String(r[16] || '').trim()
          const rawPct = String(r[18] || '').trim()
          return {
            name,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}%`) : '0.00%',
            pct: parseChangePercent(rawPct),
          }
        })
        .filter((a) => a.name && !a.name.toUpperCase().includes('SYMBOL'))
        .slice(0, 5)

      const losers = rows
        .map((r) => {
          const name = String(r[6] || '').trim()
          const rawPct = String(r[8] || '').trim()
          return {
            name,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}%`) : '0.00%',
            pct: parseChangePercent(rawPct),
          }
        })
        .filter((a) => a.name && !a.name.toUpperCase().includes('SYMBOL'))
        .slice(0, 5)

      const gainers = rows
        .map((r) => {
          const name = String(r[1] || '').trim()
          const rawPct = String(r[3] || '').trim()
          return {
            name,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}%`) : '0.00%',
            pct: parseChangePercent(rawPct),
          }
        })
        .filter((a) => a.name && !a.name.toUpperCase().includes('SYMBOL'))
        .slice(0, 5)

      setMovers({ gainers, losers, intradayGainers, intradayLosers })
    }

    function dispatchPipelineRequest(tab, handler) {
      const nonceUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(
        tab
      )}&tqx=responseHandler:${handler}&cb=${Date.now()}`
      const targetScript = document.createElement('script')
      targetScript.src = nonceUrl
      targetScript.onload = () => targetScript.remove()
      const residual = document.getElementById(`scr_${handler}`)
      if (residual) residual.remove()
      targetScript.id = `scr_${handler}`
      document.body.appendChild(targetScript)
    }

    dispatchPipelineRequest('Indices', 'processIndices')
    dispatchPipelineRequest('Top10', 'processMovers')

    const interval = setInterval(() => {
      dispatchPipelineRequest('Indices', 'processIndices')
      dispatchPipelineRequest('Top10', 'processMovers')
    }, 15000)

    return () => {
      clearInterval(interval)
      delete window.processIndices
      delete window.processMovers
    }
  }, [])

  return (
    <div className="dashboard-grid">
      {/* Dynamic CSS Scope */}
      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 16px;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .card-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
        }

        .view-all-link {
          font-size: 12px;
          color: #0066cc;
          text-decoration: none;
          font-weight: 600;
        }

        .view-all-link:hover { text-decoration: underline; }

        .quad-indices-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          height: 100%;
        }

        .index-mini-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .index-title { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .index-val { font-size: 14px; font-weight: 700; margin-top: 6px; }
        .index-val.up { color: #00bfa5; }
        .index-val.down { color: #ff5252; }

        .option-chain-link {
          font-size: 11px;
          color: #0066cc;
          text-decoration: none;
          margin-top: 8px;
        }

        .advances-declines-val { font-size: 16px; font-weight: 700; margin-top: 6px; }
        .adv-green { color: #00bfa5; }
        .dec-red { color: #ff5252; }

        .news-list-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-grow: 1;
        }

        .news-card-item {
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 8px;
        }

        .news-card-item:last-child { border-bottom: none; }

        .news-card-headline {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          text-decoration: none;
          line-height: 1.4;
          display: block;
        }

        .news-card-headline:hover { color: #0066cc; }
        .news-card-meta { font-size: 11px; color: #94a3b8; margin-top: 4px; }

        .pagination-btns {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
        }

        .page-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          color: #475569;
        }

        .horizontal-bar-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bar-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
        }

        .bar-item-label {
          width: 35%;
          font-weight: 600;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

       .bar-item-track {
  width: 63%;
  height: 20px;
  background: #f8fafc;
  border-radius: 4px;
  position: relative;
  overflow: visible;
}

/* 0% center */
.center-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #cbd5e1;
  z-index: 1;
}

/* Bar */
.bar-item-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  transition: width 0.3s ease;
  z-index: 2;
  min-width: 2px;
}

/* POSITIVE: center → right */
.bar-item-fill.up {
  left: 50%;
  right: auto;
  background: #00bfa5;
  border-radius: 0 4px 4px 0;
}

/* NEGATIVE: center → left */
.bar-item-fill.down {
  right: 50%;
  left: auto;
  background: #ff5252;
  border-radius: 4px 0 0 4px;
}

/* Percentage */
.bar-item-text {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

/* Positive text */
.bar-item-text.text-right {
  left: 6px;
  color: #033100;
}

/* Negative text */
.bar-item-text.text-left {
  right: 6px;
  color: #770000;
}
        .bottom-movers-grid {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .bottom-movers-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
          .bottom-movers-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* TOP ROW */}
      {/* 1. Market Overview Quad */}
      <div className="card-panel">
        <div className="quad-indices-grid">
          <div className="index-mini-card">
            <div className="index-title">NIFTY</div>
            <div className={`index-val ${indices.nifty.cls}`}>
              {indices.nifty.cls === 'up' ? '▲' : '▼'} {indices.nifty.val} 
              {/* ({indices.nifty.change}) */}
            </div>
            <a href="/optionchain" className="option-chain-link">Option Chain &rsaquo;</a>
          </div>

          <div className="index-mini-card">
            <div className="index-title">BANKNIFTY</div>
            <div className={`index-val ${indices.bank.cls}`}>
              {indices.bank.cls === 'up' ? '▲' : '▼'} {indices.bank.val} 
              {/* ({indices.bank.change}) */}
            </div>

            <a href="/optionchain" className="option-chain-link">Option Chain &rsaquo;</a>
          </div>

          <div className="index-mini-card">
            <div className="index-title">SENSEX</div>
            <div className={`index-val ${indices.sensex.cls}`}>
              {indices.sensex.cls === 'up' ? '▲' : '▼'} {indices.sensex.val} 
              {/* ({indices.sensex.change}) */}
            </div>

            <a href="/optionchain" className="option-chain-link">Option Chain &rsaquo;</a>
          </div>

          <div className="index-mini-card">
            <div className="index-title">INDIA VIX</div>
            <div className={`index-val ${indices.vix.cls}`}>
              {indices.vix.cls === 'up' ? '▲' : '▼'} {indices.vix.val} 
              {/* ({indices.vix.change}) */}
            </div>

            <a href="/optionchain" className="option-chain-link">Option Chain &rsaquo;</a>
          </div>
        </div>
      </div>

      {/* 2. Top News */}
      {/* <TopNewsFeed /> */}

      {/* 3. Sector Overview */}
      <div className="card-panel">
        <div className="panel-header">
          <h3>Sector Overview</h3>
          <a href="/sectors" className="view-all-link">View All</a>
        </div>
        <HorizontalBarList
          items={sectors.map((s) => ({ ...s, pct: s.pct }))}
          isGainer={true}
        />
      </div>

      {/* BOTTOM ROW: Market Movers */}
      <div className="bottom-movers-grid">
        <div className="card-panel">
          <div className="panel-header">
            <h3>Top GAP UP</h3>
          </div>
          <HorizontalBarList items={movers.gainers} isGainer={true} />
        </div>

        <div className="card-panel">
          <div className="panel-header">
            <h3>Top GAP DOWN</h3>
          </div>
          <HorizontalBarList items={movers.losers} isGainer={false} />
        </div>

        <div className="card-panel">
          <div className="panel-header">
            <h3>Top Intraday Gainers</h3>
          </div>
          <HorizontalBarList items={movers.intradayGainers} isGainer={true} />
        </div>

        <div className="card-panel">
          <div className="panel-header">
            <h3>Top Intraday Losers</h3>
          </div>
          <HorizontalBarList items={movers.intradayLosers} isGainer={false} />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [navOpen, setNavOpen] = useState(false)
  const [promoVisible, setPromoVisible] = useState(false)
  const [promoDismissChecked, setPromoDismissChecked] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  function handleAdminLoginSuccess() { setIsAdminAuthenticated(true) }
  function handleAdminLogout() { setIsAdminAuthenticated(false) }
  function toggleMobileNav() { setNavOpen((open) => !open) }
  function closeMobileNav() { setNavOpen(false) }
  function openPromoModal() { setPromoVisible(true) }

  function closePromoModal(persist) {
    setPromoVisible(false)
    if (persist || promoDismissChecked) {
      const expiry = Date.now() + 24 * 60 * 60 * 1000
      try { localStorage.setItem(PROMO_DISMISS_KEY, String(expiry)) } catch (e) {}
    }
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') closePromoModal(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [promoDismissChecked])

  useEffect(() => {
    let dismissedUntil = 0
    try { dismissedUntil = parseInt(localStorage.getItem(PROMO_DISMISS_KEY) || '0', 10) } catch (e) {}
    if (Date.now() > dismissedUntil) {
      const t = setTimeout(openPromoModal, 2200)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <>
      <header className="main-navbar">
        <div className="nav-brand">
          <a href="/">
            <img src="/logo.png" alt="HeyFund Logo" style={{ height: '95px', width: 'auto' }} />
          </a>
        </div>
        <nav className={`nav-links ${navOpen ? 'open' : ''}`} id="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMobileNav} end>
            Home
          </NavLink>
          <NavLink to="/screener" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMobileNav}>
            Screener
          </NavLink>
          <NavLink to="/optionchain" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMobileNav}>
            Option Chain
          </NavLink>
          <NavLink to="/blog" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMobileNav}>
            Blog
          </NavLink>
          <NavLink to="/news" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMobileNav}>
            News
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMobileNav}>
            About
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMobileNav}>
            Contact
          </NavLink>
        </nav>
        <button
          className={`nav-toggle-btn ${navOpen ? 'open' : ''}`}
          id="nav-toggle-btn"
          aria-label="Toggle navigation menu"
          onClick={toggleMobileNav}
        >
          <span></span>
        </button>
      </header>

      <div className="container">
        <Routes>
          <Route path="/" element={<HomeDashboard />} />
          <Route
            path="/blog/:slug?"
            element={
              <BlogModule
                isAdminAuthenticated={isAdminAuthenticated}
                onLogoutAdmin={handleAdminLogout}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/optionchain" element={<OptionChain />} />
          <Route path="/sectors" element={<Sector />} />
          <Route
            path="/admin"
            element={<AdminLogin onLoginSuccess={handleAdminLoginSuccess} />}
          />
          <Route path="/news" element={<NewsModule />} />
          <Route path = "/screener" element={<Screener />} />
        </Routes>
      </div>

      <footer className="platform-footer">
        <div className="footer-columns">
          <div className="footer-col">
            <div className="footer-brand-summary">
              <a href="/">
                <img src="/logo.png" alt="HeyFund Logo" style={{ height: '95px', width: 'auto', marginBottom: '8px' }} />
              </a>
            </div>
            <p className="footer-brand-summary-p">Your trusted partner in stock market research and analysis. Invest Smart, Trade Fast, Grow Future.</p>
          </div>
          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><NavLink to="/">Home</NavLink></li>
              <li><a href="/screener">Screener</a></li>
              <li><NavLink to="/blog">Blog</NavLink></li>
              <li><NavLink to="/news" onClick={closeMobileNav}>News</NavLink></li>
              <li><NavLink to="/optionchain" onClick={closeMobileNav}>Option Chain</NavLink></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><NavLink to="/about" onClick={closeMobileNav}>About</NavLink></li>
              <li><NavLink to="/contact" onClick={closeMobileNav}>Contact</NavLink></li>
              <li><NavLink to="/admin" onClick={closeMobileNav}>Admin</NavLink></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Resources</h5>
            <ul>
              <li><a href="https://www.youtube.com/@heyfund_official">YouTube Channel</a></li>
              <li><a href="https://t.me/heyfund">Telegram Group</a></li>
                            <li><a href="https://www.instagram.com/donimrantrader">Instagram Channel</a></li>

            </ul>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <ul>
              <li>askheyfund@gmail.com</li>
              <li>+91 89855 35534 </li>
              <li>India</li>
            </ul>
          </div>
        </div>

        <div className="bottom-copyright-strip">
          <div>We are not a SEBI-registered Investment Adviser or Research Analyst. All content is for educational purposes only.</div>
          <div>© 2026 HeyFund. All rights reserved.</div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <a
        className="whatsapp-float"
        id="whatsapp-btn"
        href="https://wa.me/918985535534?text=Hi%20HeyFund%2C%20I%27d%20like%20to%20know%20more%20about%20live%20market%20alerts."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with HeyFund on WhatsApp"
      >
        <span className="wa-ping"></span>
        <svg viewBox="0 0 32 32" fill="#ffffff" style={{ position: 'relative' }}>
          <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.61 1.91 6.478L4 29l7.72-1.865A11.93 11.93 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3zm6.997 16.99c-.303.85-1.5 1.556-2.457 1.76-.653.14-1.507.25-4.383-.942-3.68-1.523-6.05-5.24-6.234-5.48-.176-.24-1.487-1.98-1.487-3.78 0-1.8.94-2.685 1.28-3.05.29-.31.63-.39.85-.39.213 0 .427.002.614.012.196.01.46-.075.72.548.27.65.917 2.245.996 2.408.08.16.132.35.026.56-.107.21-.16.34-.32.523-.16.184-.336.41-.48.55-.16.16-.326.334-.14.654.186.32.827 1.365 1.775 2.21 1.22 1.088 2.25 1.425 2.57 1.585.32.16.507.134.694-.08.186-.213.8-.933 1.014-1.253.213-.32.427-.267.72-.16.293.107 1.858.876 2.177 1.036.32.16.533.24.613.373.08.134.08.774-.223 1.624z" />
        </svg>
      </a>

      {/* Promo Modal */}
      <div
        className={`modal-overlay ${promoVisible ? 'visible' : ''}`}
        id="promo-modal-overlay"
        onClick={(e) => {
          if (e.target.id === 'promo-modal-overlay') closePromoModal(false)
        }}
      >
        <div className="promo-modal-card" role="dialog" aria-modal="true">
          <div className="promo-modal-banner">
            <button className="modal-close-btn" onClick={() => closePromoModal(true)}>✕</button>
            <div className="promo-modal-eyebrow">🔥 Limited Time Offer</div>
            <h4>Get Free Live Trade Alerts on Telegram</h4>
          </div>
          <div className="promo-modal-body">
            <p>Join thousands of active traders receiving real-time long/short build-up signals, intraday levels, and breakout alerts.</p>
            <div className="promo-modal-actions">
              <a href="https://t.me/heyfund" className="btn-green" style={{ display: 'inline-block' }}>Join Telegram Free</a>
              <button className="btn-outline" onClick={() => closePromoModal(false)}>Maybe Later</button>
            </div>
            <label className="modal-dismiss-note">
              <input
                type="checkbox"
                checked={promoDismissChecked}
                onChange={(e) => setPromoDismissChecked(e.target.checked)}
              />
              Don't show this again
            </label>
          </div>
        </div>
      </div>
    </>
  )
}