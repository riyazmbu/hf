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
        .filter((s) => s.name && s.name.length >= 2 && !s.name.toUpperCase().includes('INDIAVIX'))
        .slice(2, 13) // Skip the first row which is usually a header or total

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
    

      {/* 2. Top News */}
      {/* <TopNewsFeed /> */}

      {/* 3. Sector Overview */}
      <div className="card-panel">
        <div className="panel-header">
          <h3>Sector Overview</h3>
        </div>
        <HorizontalBarList
          items={sectors.map((s) => ({ ...s, pct: s.pct }))}
          isGainer={true}
        />
      </div>

      {/* BOTTOM ROW: Market Movers */}
   
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

    

      {/* Floating Action Button */}
  

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