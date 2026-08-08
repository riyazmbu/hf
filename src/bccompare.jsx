import { useEffect, useRef, useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import BlogModule from './BlogModule'
import AdminLogin from './AdminLogin'

const SHEET_ID = '1aLKkL-nwJXtKoRCB3wKZMed0GMucP1p-S9eU2cEMqww'
const PROMO_DISMISS_KEY = 'heyfund_promo_dismissed_until'

const TABS = [
  'Screener',
  'Intraday Levels',
  'NF/BNF Trading',
  'BTST/STBT',
  'Indices',
  'ORB Timelogs',
  'Hot Deals',
  'Top10',
]

// Matched against column index 1 (the full code, e.g. NIFTY_IT) in the Indices sheet
const INDEX_CARDS = [
  { key: 'nifty', label: 'NIFTY 50', searchKey: 'nifty_50' },
  { key: 'bank', label: 'BANK NIFTY', searchKey: 'nifty_bank' },
  { key: 'sensex', label: 'SENSEX', searchKey: 'sensex' },
  { key: 'vix', label: 'INDIA VIX', searchKey: 'india_vix' },
]

const SECTOR_CARDS = [
  { key: 'nifty',      label: 'NIFTY',       searchKey: 'nifty_50' },
  { key: 'niftybank',  label: 'NIFTY BANK',  searchKey: 'nifty_bank' },
  { key: 'infra',      label: 'INFRA',       searchKey: 'nifty_infra' },
  { key: 'it',         label: 'IT',          searchKey: 'nifty_it' },
  { key: 'pharma',     label: 'PHARMA',      searchKey: 'nifty_pharma' },
  { key: 'psubank',    label: 'PSU BANK',    searchKey: 'nifty_psu_bank' },
  { key: 'realty',     label: 'REALTY',      searchKey: 'nifty_realty' },
  { key: 'fmcg',       label: 'FMCG',        searchKey: 'nifty_fmcg' },
  { key: 'indiavix',   label: 'INDIA VIX',   searchKey: 'india_vix' },
  { key: 'auto',       label: 'AUTO',        searchKey: 'nifty_auto' },
  { key: 'finservice', label: 'FIN SERVICE', searchKey: 'nifty_fin_service' },
  { key: 'media',      label: 'MEDIA',       searchKey: 'nifty_media' },
  { key: 'metal',      label: 'METAL',       searchKey: 'nifty_metal' },
  { key: 'pvtbank',    label: 'PVT BANK',    searchKey: 'nifty_pvt_bank' },
]

const VIDEOS = [
  { img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&auto=format&fit=crop&q=60', title: 'OPTIONS TRADING BASICS', duration: '12:45', desc: 'Options Trading Basics for Beginners' },
  { img: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=300&auto=format&fit=crop&q=60', title: 'NIFTY & BANKNIFTY', duration: '15:20', desc: 'Nifty & BankNifty Daily Market Analysis' },
  { img: 'https://images.unsplash.com/photo-1642390061910-0f71228030d3?w=300&auto=format&fit=crop&q=60', title: 'PRICE ACTION STRATEGY', duration: '18:30', desc: 'Price Action Trading Strategy Course' },
  { img: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=300&auto=format&fit=crop&q=60', title: 'RISK MANAGEMENT', duration: '11:10', desc: 'Risk Management in Dynamic Active Trading' },
  { img: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=300&auto=format&fit=crop&q=60', title: 'LIVE ANALYSIS', duration: '11:10', desc: 'Live Market Analysis & Strategy Levels' },
]

// ---------- Data Helpers ----------
function parseRows(tableData) {
  if (!tableData || !tableData.rows) return []
  return tableData.rows.map((row) =>
    (row.c || []).map((cell) => {
      if (!cell) return ''
      return cell.f ? cell.f : cell.v !== null && cell.v !== undefined ? cell.v : ''
    })
  )
}

// Exact match against a specific column (default: col 1, the full code like NIFTY_IT)
function findRowByExactKey(rows, key, colIndex = 1) {
  const target = key.toLowerCase().replace(/[^a-z0-9]/g, '')
  return rows.find((r) => {
    const cellNorm = String(r[colIndex] || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    return cellNorm === target
  }) || []
}

function parseChangePercent(changeStr) {
  const cleaned = String(changeStr || '').replace(/[^0-9.-]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

// Builds { key: { val, change, pct, cls } } from Indices sheet rows.
// Column layout: 0=short name, 1=full code, 2=OPEN, 3=HIGH, 4=LOW, 5=CMP, 6=PR CLOSE, 7=CHNG%, 8=CHANGE
function buildCardData(rows, cardsList) {
  const result = {}
  cardsList.forEach((item) => {
    const matchingRow = findRowByExactKey(rows, item.searchKey)
    if (matchingRow.length >= 9) {
      const cmpVal = matchingRow[5] !== undefined && matchingRow[5] !== '' ? matchingRow[5] : '--'
      const rawPct = matchingRow[7] !== undefined ? String(matchingRow[7]).trim() : ''
      const rawChange = matchingRow[8] !== undefined ? String(matchingRow[8]).trim() : ''

      let changeText = '--'
      if (rawChange || rawPct) {
        const formattedPct = rawPct.includes('%') ? rawPct : `${rawPct}%`
        changeText = rawChange ? `${rawChange} (${formattedPct})` : formattedPct
      }

      const numericChange = parseChangePercent(rawPct || rawChange)
      const isNegative = numericChange < 0 || String(rawChange).startsWith('-') || String(rawPct).startsWith('-')

      const formattedCmp = typeof cmpVal === 'number'
        ? cmpVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : cmpVal

      result[item.key] = { val: formattedCmp, change: changeText, pct: numericChange, cls: isNegative ? 'down' : 'up' }
    }
  })
  return result
}

function badgeClass(cellText) {
  const cleanTxt = String(cellText).toUpperCase().trim()
  if (cleanTxt === 'OPEN=HIGH' || cleanTxt === 'SELL' || cleanTxt.startsWith('-') || cleanTxt === 'MUST SELL') {
    return 'badge-bearish'
  }
  if (
    cleanTxt === 'BUY' ||
    cleanTxt.startsWith('+') ||
    (cleanTxt.includes('%') && !cleanTxt.startsWith('-')) ||
    cleanTxt === 'MUST BUY' ||
    cleanTxt === 'OPEN=LOW'
  ) {
    return 'badge-bullish'
  }
  return ''
}

function AssetPanel({ items, showPrice }) {
  if (!items || items.length === 0) {
    return <div className="status-message" style={{ padding: 20 }}>No explicit metrics.</div>
  }
  return items.map((a, i) => (
    <div className="asset-row" key={i}>
      <span className="asset-identity">{a.name}</span>
      {showPrice && (
        <span
          className="asset-price"
          style={{ marginLeft: 'auto', marginRight: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}
        >
          {a.price}
        </span>
      )}
      <span className={`asset-value-metric ${a.pct < 0 ? 'down' : 'up'}`}>{a.change}</span>
    </div>
  ))
}

function SectorBar({ label, change, pct }) {
  const maxPct = 3 // scale cap; tweak based on typical daily sector swings
  const clamped = Math.max(-maxPct, Math.min(maxPct, pct))
  const widthPct = (Math.abs(clamped) / maxPct) * 50
  const isNeg = clamped < 0
  return (
    <div className="sector-bar-row">
      <span className="sector-bar-label">{label}</span>
      <div className="sector-bar-track">
        <div className="sector-bar-center-line" />
        <div
          className={`sector-bar-fill ${isNeg ? 'neg' : 'pos'}`}
          style={{ width: `${widthPct}%`, left: isNeg ? `${50 - widthPct}%` : '50%' }}
        />
      </div>
      <span className={`sector-bar-change ${isNeg ? 'down' : 'up'}`}>{change}</span>
    </div>
  )
}

// ---------- Home Dashboard View ----------
function HomeDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Screener')
  const [searchQuery, setSearchQuery] = useState('')
  const [syncStatus, setSyncStatus] = useState('Pipeline Status: Initializing Link...')
  const [indices, setIndices] = useState({
    nifty: { val: '--', change: '--', cls: 'up' },
    bank: { val: '--', change: '--', cls: 'up' },
    sensex: { val: '--', change: '--', cls: 'up' },
    vix: { val: '--', change: '--', cls: 'up' },
  })
  const [sectors, setSectors] = useState(
    SECTOR_CARDS.reduce((acc, c) => {
      acc[c.key] = { val: '--', change: '--', pct: 0, cls: 'up' }
      return acc
    }, {})
  )
  const [movers, setMovers] = useState({
    longbuild: [],
    shortbuild: [],
    shortcovering: [],
    gainers: [],
    losers: [],
    intradayGainers: [],
    yearlyHigh: [],
  })

  const [screenerStatus, setScreenerStatus] = useState('Initializing live multi-sheet data framework stream...')
  const [tableCols, setTableCols] = useState([])
  const [tableRows, setTableRows] = useState([])
  const searchDebounceRef = useRef(null)

  // ---------- Indices & Movers Polling (15s) ----------
  useEffect(() => {
    window.processIndices = function (data) {
      const rows = parseRows(data.table)
      setIndices((prev) => ({ ...prev, ...buildCardData(rows, INDEX_CARDS) }))
      setSectors((prev) => ({ ...prev, ...buildCardData(rows, SECTOR_CARDS) }))
    }

    window.processMovers = function (data) {
      const rows = parseRows(data.table)
      const intradayGainers = rows
        .map((r) => {
          const name = String(r[11] || '').trim()
          const price = r[12] !== undefined && r[12] !== '' ? r[12] : '--'
          const rawPct = String(r[13] || '').trim()
          return {
            name,
            price: typeof price === 'number' ? price.toLocaleString('en-IN') : price,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `+${rawPct}%`) : '0.00%',
            pct: parseChangePercent(rawPct),
          }
        })
        .filter((a) => a.name && a.name.toUpperCase() !== 'TOP 10 INTRADAY GAINERS SYMBOL')
        .slice(0, 10)

      const intradayLosers = rows
        .map((r) => {
          const name = String(r[16] || '').trim()      // Q
          const price = r[17] !== undefined && r[17] !== '' ? r[17] : '--' // R
          const rawPct = String(r[18] || '').trim()    // S
          return {
            name,
            price: typeof price === 'number' ? price.toLocaleString('en-IN') : price,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}%`) : '0.00%',
            pct: parseChangePercent(rawPct),
          }
        })
        .filter(
          (a) =>
            a.name &&
            a.name.toUpperCase() !== 'TOP 10 INTRADAY LOSERS SYMBOL' &&
            a.name.toUpperCase() !== 'SYMBOL'
        )
        .slice(0, 10)

      const losers = rows
        .map((r) => {
          const name = String(r[6] || '').trim()      // G
          const price = r[7] !== undefined && r[7] !== '' ? r[7] : '--' // H
          const rawPct = String(r[8] || '').trim()    // I
          return {
            name,
            price: typeof price === 'number' ? price.toLocaleString('en-IN') : price,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}%`) : '0.00%',
            pct: parseChangePercent(rawPct),
          }
        })
        .filter(
          (a) =>
            a.name &&
            a.name.toUpperCase() !== 'TOP 10 GAP DOWN' &&
            a.name.toUpperCase() !== 'SYMBOL'
        )
        .slice(0, 10)

      const gainers = rows
        .map((r) => {
          const name = String(r[1] || '').trim()      // B
          const price = r[2] !== undefined && r[2] !== '' ? r[2] : '--' // C
          const rawPct = String(r[3] || '').trim()    // D
          return {
            name,
            price: typeof price === 'number' ? price.toLocaleString('en-IN') : price,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}%`) : '0.00%',
            pct: parseChangePercent(rawPct),
          }
        })
        .filter(
          (a) =>
            a.name &&
            a.name.toUpperCase() !== 'TOP 10 GAP UP' &&
            a.name.toUpperCase() !== 'SYMBOL'
        )
        .slice(0, 10)

      setMovers((prev) => ({ ...prev, gainers, losers, intradayGainers, intradayLosers, yearlyHigh: gainers }))

      const now = new Date()
      setSyncStatus(
        `Pipeline Status: Live · Updated ${now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}`
      )
    }

    function dispatchPipelineRequest(tab, handler) {
      const nonceUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(
        tab
      )}&tqx=responseHandler:${handler}&cb=${Date.now()}`
      const targetScript = document.createElement('script')
      targetScript.src = nonceUrl
      targetScript.onload = () => targetScript.remove()
      targetScript.onerror = () => {
        targetScript.remove()
        setSyncStatus('Pipeline Status: Connection issue — retrying...')
      }
      const residual = document.getElementById(`scr_${handler}`)
      if (residual) residual.remove()
      targetScript.id = `scr_${handler}`
      document.body.appendChild(targetScript)
    }

    function runSync() {
      dispatchPipelineRequest('Indices', 'processIndices')
      dispatchPipelineRequest('Top10', 'processMovers')
    }

    runSync()
    const interval = setInterval(runSync, 15000)
    return () => {
      clearInterval(interval)
      delete window.processIndices
      delete window.processMovers
    }
  }, [])

  // ---------- Screener Polling (10s) ----------
  useEffect(() => {
    let cancelled = false
    function fetchTabSheetData() {
      fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(activeTab)}&tqx=out:json&cb=${Date.now()}`)
        .then((response) => response.text())
        .then((txt) => {
          if (cancelled) return
          const baseJson = JSON.parse(txt.substring(txt.indexOf('{'), txt.lastIndexOf('}') + 1))
          const tableData = baseJson.table

          if (!tableData || !tableData.rows || tableData.rows.length === 0) {
            setScreenerStatus(`No structural records found inside "${activeTab}".`)
            return
          }

          const cols = tableData.cols.map((col) => (col.label ? col.label.trim() : ''))
          const rows = tableData.rows
            .filter((row) => row.c && !row.c.every((cell) => !cell))
            .map((row) =>
              row.c.map((cell) => {
                if (!cell) return { text: '', style: '', cls: '' }
                const cellText = cell.f ? cell.f : cell.v !== null ? cell.v : ''
                const style = cell.p && cell.p.style ? cell.p.style : ''
                return { text: cellText, style, cls: badgeClass(cellText) }
              })
            )

          setTableCols(cols)
          setTableRows(rows)
        })
        .catch((error) => {
          if (cancelled) return
          console.error(error)
          setScreenerStatus('STREAM_ERROR // Failed to parse array stream template data block.')
        })
    }

    setScreenerStatus(`Fetching fresh data for ${activeTab}...`)
    fetchTabSheetData()
    const tabInterval = setInterval(fetchTabSheetData, 10000)

    return () => {
      cancelled = true
      clearInterval(tabInterval)
    }
  }, [activeTab])

  function switchTab(tab) {
    if (tab !== activeTab) {
      setSearchQuery('')
      setLiveQuery('')
      setTableCols([])
      setTableRows([])
      setActiveTab(tab)
    }
  }

  const [liveQuery, setLiveQuery] = useState('')
  function findInSheet(value) {
    setLiveQuery(value)
    clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => setSearchQuery(value.toLowerCase()), 150)
  }

  const visibleRows = tableRows.filter(
    (row) => !searchQuery || row.some((cell) => String(cell.text).toLowerCase().includes(searchQuery))
  )
  const matchCount = visibleRows.length

  return (
    <>
      <section className="hero-block">
        <div className="hero-left">
          <h1>Trade Smarter with<br /><span>Live Market</span> Intelligence</h1>
          <p>Real-time data streams, multi-sheet analytical matrices, and structural data breakdowns tailored for professional market analysis.</p>

          <div className="quick-features-row">
            <div className="feature-tag">📊 Live Screener</div>
            <div className="feature-tag">📈 Market Movers</div>
            <div className="feature-tag">📉 Intraday Levels</div>
            <div className="feature-tag">🎯 AI Insights</div>
          </div>

          <div className="cta-group">
            <button
              className="btn-green"
              onClick={() => document.getElementById('screener-section').scrollIntoView({ behavior: 'smooth' })}
            >
              Open Screener Workspace
            </button>
            <button className="btn-outline" onClick={() => navigate('/blog')}>
              Read Market Blog
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-right-hud">
            <div className="hud-sentiment-title">
              <span>Sector Performance</span>
              <span className="sentiment-percentage">{syncStatus.includes('Live') ? '● LIVE' : 'Loading…'}</span>
            </div>
            <div className="sector-bars-list">
              {SECTOR_CARDS.map((c) => (
                <SectorBar key={c.key} label={c.label} change={sectors[c.key].change} pct={sectors[c.key].pct} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Realtime Indices Card Grid */}
      <section className="indices-grid">
        {INDEX_CARDS.map((c) => (
          <div className="index-card" key={c.key}>
            <div className="label">{c.label}</div>
            <div className="val">{indices[c.key].val}</div>
            <div className={`change ${indices[c.key].cls}`}>{indices[c.key].change}</div>
          </div>
        ))}
      </section>

      {/* Secondary Lower Movers */}
      <div className="section-title-wrapper">
        <div className="section-title">Real-Time Performance Ranks</div>
      </div>

      <section className="sub-movers-grid">
        <div className="mover-deck-panel">
          <div className="mover-deck-title" style={{ color: 'var(--bullish-green)' }}>Top Gap Up</div>
          <div id="gap-up"><AssetPanel items={movers.gainers} showPrice /></div>
        </div>

        <div className="mover-deck-panel">
          <div className="mover-deck-title" style={{ color: 'var(--bearish-red)' }}>Top Gap Down</div>
          <div id="gap-down"><AssetPanel items={movers.losers} showPrice /></div>
        </div>

        <div className="mover-deck-panel">
          <div className="mover-deck-title" style={{ color: 'var(--bullish-green)' }}>Top Intraday Gainers</div>
          <div id="intraday-gainers"><AssetPanel items={movers.intradayGainers} showPrice /></div>
        </div>

        <div className="mover-deck-panel">
          <div className="mover-deck-title" style={{ color: 'var(--bearish-red)' }}>Top Intraday Losers</div>
          <div id="intraday-losers"><AssetPanel items={movers.intradayLosers} showPrice /></div>
        </div>
      </section>

      {/* Multi-Tab Live Interactive Datagrid Workspace */}
      <div className="section-title-wrapper" id="screener-section">
        <div className="section-title">Live Market Screener Dashboard</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{syncStatus}</div>
      </div>

      <section className="workspace-wrapper">
        <div className="workspace-control-hud">
          <div className="tab-strip" id="tabs-bar">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => switchTab(tab)}
              >
                {tab === 'Top10' ? 'Top 10' : tab}
              </button>
            ))}
          </div>
          <div className="search-wrapper">
            <input
              type="text"
              id="sheet-finder"
              className="search-input-box"
              placeholder="Filter layout records..."
              value={liveQuery}
              onChange={(e) => findInSheet(e.target.value)}
            />
            {liveQuery.length > 0 && (
              <span className="match-badge-counter" id="match-counter">{matchCount} matches</span>
            )}
          </div>
        </div>

        <div className="table-viewport">
          <div id="screener-dashboard">
            {tableRows.length === 0 ? (
              <div className="status-message">{screenerStatus}</div>
            ) : (
              <table className="trading-table" id="data-table">
                <thead>
                  <tr>
                    {tableCols.map((col, i) => (
                      <th key={i}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci}>
                          <span className={cell.cls}>{cell.text}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Operational Workspace Engine */}
      <div className="section-title-wrapper">
        <div className="section-title">Operational Workspace Engine</div>
      </div>
      <div className="iframe-container">
        <iframe
          title="Operational Workspace Engine"
          src="https://script.google.com/macros/s/AKfycbz2CiWP2Sw2oyHE2L2AFWKAsdr-MPAwiF-SqS81v3HMpko6o6Yres81rZq69hl39ZVqAQ/exec"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </>
  )
}

export default function App() {
  const [navOpen, setNavOpen] = useState(false)
  const [promoVisible, setPromoVisible] = useState(false)
  const [promoDismissChecked, setPromoDismissChecked] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  function handleAdminLoginSuccess() {
    setIsAdminAuthenticated(true)
  }

  function handleAdminLogout() {
    setIsAdminAuthenticated(false)
  }

  function toggleMobileNav() {
    setNavOpen((open) => !open)
  }
  function closeMobileNav() {
    setNavOpen(false)
  }

  function openPromoModal() {
    setPromoVisible(true)
  }
  function closePromoModal(persist) {
    setPromoVisible(false)
    if (persist || promoDismissChecked) {
      const expiry = Date.now() + 24 * 60 * 60 * 1000
      try {
        localStorage.setItem(PROMO_DISMISS_KEY, String(expiry))
      } catch (e) {
        /* storage unavailable */
      }
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
    try {
      dismissedUntil = parseInt(localStorage.getItem(PROMO_DISMISS_KEY) || '0', 10)
    } catch (e) {
      /* storage unavailable */
    }
    if (Date.now() > dismissedUntil) {
      const t = setTimeout(openPromoModal, 2200)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <>
      <header className="main-navbar">
        <div className="nav-brand">🐂 Hey<span>Fund</span></div>
        <nav className={`nav-links ${navOpen ? 'open' : ''}`} id="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMobileNav} end>
            Home
          </NavLink>
          <a href="/#screener-section" onClick={closeMobileNav}>Screener</a>
          <a href="#" onClick={closeMobileNav}>Market</a>
          <NavLink to="/blog" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMobileNav}>
            Blog
          </NavLink>
          <a href="#" onClick={closeMobileNav}>About</a>
          <a href="#" onClick={closeMobileNav}>Contact</a>
        </nav>
        <button
          className={`nav-toggle-btn ${navOpen ? 'open' : ''}`}
          id="nav-toggle-btn"
          aria-label="Toggle navigation menu"
          aria-expanded={navOpen}
          aria-controls="nav-links"
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
          <Route
            path="/admin"
            element={<AdminLogin onLoginSuccess={handleAdminLoginSuccess} />}
          />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="platform-footer">
        <div className="footer-columns">
          <div className="footer-col">
            <div className="footer-brand-summary">🐂 Hey<span>Fund</span></div>
            <p className="footer-brand-summary-p">Your trusted partner in stock market research and analysis. Invest Smart, Trade Fast, Grow Future.</p>
          </div>
          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><NavLink to="/">Home</NavLink></li>
              <li><a href="/#screener-section">Screener</a></li>
              <li><a href="#">Market Movers</a></li>
              <li><NavLink to="/blog">Blog</NavLink></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms &amp; Conditions</a></li>
              <li><a href="#">Disclaimer</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Resources</h5>
            <ul>
              <li><a href="#">YouTube Channel</a></li>
              <li><a href="#">Telegram Group</a></li>
              <li><a href="#">Help Center</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <ul>
              <li>support@heyfund.in</li>
              <li>+91 83419 38001 </li>
              <li>India</li>
            </ul>
          </div>
        </div>

        <div className="bottom-copyright-strip">
          <div>© 2026 HeyFund. All rights reserved.</div>
          <div>Made with ❤️ for Traders</div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      
        className="whatsapp-float"
        id="whatsapp-btn"
        href="https://wa.me/918341938001?text=Hi%20HeyFund%2C%20I%27d%20like%20to%20know%20more%20about%20live%20market%20alerts."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with HeyFund on WhatsApp"
      >
        <span className="wa-ping"></span>
        <svg viewBox="0 0 32 32" fill="#ffffff" style={{ position: 'relative' }}>
          <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.61 1.91 6.478L4 29l7.72-1.865A11.93 11.93 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3zm6.997 16.99c-.303.85-1.5 1.556-2.457 1.76-.653.14-1.507.25-4.383-.942-3.68-1.523-6.05-5.24-6.234-5.48-.176-.24-1.487-1.98-1.487-3.78 0-1.8.94-2.685 1.28-3.05.29-.31.63-.39.85-.39.213 0 .427.002.614.012.196.01.46-.075.72.548.27.65.917 2.245.996 2.408.08.16.132.35.026.56-.107.21-.16.34-.32.523-.16.184-.336.41-.48.55-.16.16-.326.334-.14.654.186.32.827 1.365 1.775 2.21 1.22 1.088 2.25 1.425 2.57 1.585.32.16.507.134.694-.08.186-.213.8-.933 1.014-1.253.213-.32.427-.267.72-.16.293.107 1.858.876 2.177 1.036.32.16.533.24.613.373.08.134.08.774-.223 1.624z" />
        </svg>
      </a>

      {/* Modal */}
      <div
        className={`modal-overlay ${promoVisible ? 'visible' : ''}`}
        id="promo-modal-overlay"
        onClick={(e) => {
          if (e.target.id === 'promo-modal-overlay') closePromoModal(false)
        }}
      >
        <div className="promo-modal-card" role="dialog" aria-modal="true" aria-labelledby="promo-modal-title">
          <div className="promo-modal-banner">
            <button className="modal-close-btn" onClick={() => closePromoModal(true)} aria-label="Close popup">✕</button>
            <div className="promo-modal-eyebrow">🔥 Limited Time Offer</div>
            <h4 id="promo-modal-title">Get Free Live Trade Alerts on Telegram</h4>
          </div>
          <div className="promo-modal-body">
            <p>Join thousands of active traders receiving real-time long/short build-up signals, intraday levels, and breakout alerts — straight to your phone, before the crowd sees them.</p>
            <div className="promo-modal-actions">
              <a href="#" className="btn-green" style={{ display: 'inline-block' }}>Join Telegram Free</a>
              <button className="btn-outline" onClick={() => closePromoModal(false)}>Maybe Later</button>
            </div>
            <label className="modal-dismiss-note">
              <input
                type="checkbox"
                id="promo-dismiss-check"
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