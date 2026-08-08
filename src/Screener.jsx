import { useEffect, useRef, useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import BlogModule from './BlogModule'
import AdminLogin from './AdminLogin'
import About from './About'
import Contact from './Contact'


const SHEET_ID = '1aLKkL-nwJXtKoRCB3wKZMed0GMucP1p-S9eU2cEMqww'
const NEWS_SHEET_ID = '1X6amEBgzjwpbaSST_19z-6zAMbnA4yYpnrYO_faoh_g'
const NEWS_SHEET_TAB = 'BSE'
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

const INDEX_CARDS = [
  { key: 'nifty', label: 'NIFTY 50', searchKey: 'nifty_50' },
  { key: 'bank', label: 'BANK NIFTY', searchKey: 'nifty_bank' },
  { key: 'sensex', label: 'SENSEX', searchKey: 'sensex' },
  { key: 'vix', label: 'INDIA VIX', searchKey: 'india_vix' },
]

// Distinct color palette for up to 11+ sectors
const SECTOR_COLORS = [
  '#00E676', '#00B0FF', '#7C4DFF', '#FF4081', '#FF9100',
  '#FFD600', '#00E5FF', '#1DE9B6', '#C6FF00', '#FF3D00', '#E040FB'
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

// ---------- Animated Interactive Horizontal Bar Chart Component ----------
function SectorBarChart({ sectors }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [pinnedIndex, setPinnedIndex] = useState(null)

  if (!sectors || sectors.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>
        Loading sector performance metrics...
      </div>
    )
  }

  // Sort by performance, strongest to weakest
  const sorted = [...sectors]
    .map((s, originalIndex) => ({ ...s, originalIndex }))
    .sort((a, b) => b.pct - a.pct)

  const maxAbs = Math.max(...sorted.map((s) => Math.abs(s.pct)), 0.5)
  const activeIndex = hoveredIndex !== null ? hoveredIndex : pinnedIndex

  function toggleSector(idx) {
    setPinnedIndex((prev) => (prev === idx ? null : idx))
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {sorted.map((sec, i) => {
        const isPositive = sec.pct >= 0
        const barPct = Math.min((Math.abs(sec.pct) / maxAbs) * 100, 100)
        const isActive = activeIndex === sec.originalIndex
        const color = isPositive ? '#016b38' : '#FF3D00'
        const displayName = sec.name.length > 20 ? sec.name.slice(0, 19) + '…' : sec.name

        return (
          <div
            key={sec.originalIndex}
            onMouseEnter={() => setHoveredIndex(sec.originalIndex)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => toggleSector(sec.originalIndex)}
            style={{
              display: 'grid',
              gridTemplateColumns: '96px 1fr 68px',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: '6px',
              background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
              transition: 'background 0.2s ease',
            }}
          >
            <span
              title={sec.name}
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#0d0d0d' : '#000000',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayName}
            </span>

            <div
              style={{
                position: 'relative',
                height: '14px',
                borderRadius: '7px',
                background: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: isPositive ? '50%' : `${50 - barPct / 2}%`,
                  width: `${barPct / 2}%`,
                  background: color,
                  borderRadius: '7px',
                  boxShadow: isActive ? `0 0 10px ${color}88` : 'none',
                  transform: isActive ? 'scaleY(1.15)' : 'scaleY(1)',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              />
              {/* center zero-line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: '50%',
                  width: '1px',
                  background: 'rgba(255,255,255,0.15)',
                }}
              />
            </div>

            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                fontFamily: 'var(--mono)',
                color,
                textAlign: 'right',
              }}
            >
              {isPositive ? `▲ ${sec.changeStr}` : `▼ ${sec.changeStr}`}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function NewsFeed() {
  const [newsItems, setNewsItems] = useState(() => {
    try {
      const cached = localStorage.getItem('news_feed_bse_cache')
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [loading, setLoading] = useState(() => newsItems.length === 0)
  const [status, setStatus] = useState('Loading market news...')
  const isFetchingRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    let timerId = null

    function fetchNews() {
      if (isFetchingRef.current) return
      isFetchingRef.current = true

      const tq = encodeURIComponent('SELECT * LIMIT 6')
      const url = `https://docs.google.com/spreadsheets/d/${NEWS_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
        NEWS_SHEET_TAB
      )}&tq=${tq}&_=${Date.now()}`

      fetch(url)
        .then((r) => r.text())
        .then((text) => {
          if (cancelled) return

          const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/)
          if (!jsonMatch) throw new Error('Invalid response format')

          const data = JSON.parse(jsonMatch[1])
          if (data.status === 'error') throw new Error('Google Sheet Query Error')

          const table = data.table
          if (!table || !table.rows || table.rows.length === 0) {
            setStatus('No recent announcements found.')
            setLoading(false)
            return
          }

          const colMap = {}
          table.cols.forEach((col, idx) => {
            if (col && col.label) {
              colMap[col.label.trim().toUpperCase()] = idx
            }
          })

          const dtIdx = colMap['NEWS_DT'] ?? 0
          const nameIdx = colMap['SLONGNAME'] ?? 1
          const headlineIdx = colMap['HEADLINE'] ?? 2
          const subIdx = colMap['NEWSSUB'] ?? 3
          const pdfIdx = colMap['PDF'] ?? 4

          const getVal = (row, idx) => {
            const cell = row.c[idx]
            return cell && cell.v !== null && cell.v !== undefined ? String(cell.v).trim() : ''
          }

          const items = table.rows
            .map((r) => ({
              dt: getVal(r, dtIdx),
              name: getVal(r, nameIdx),
              headline: getVal(r, headlineIdx),
              sub: getVal(r, subIdx),
              pdf: getVal(r, pdfIdx),
            }))
            .filter((n) => n.headline || n.name)

          setNewsItems(items)
          setLoading(false)

          try {
            localStorage.setItem('news_feed_bse_cache', JSON.stringify(items))
          } catch (e) {
            console.warn('Unable to cache news items')
          }
        })
        .catch((err) => {
          if (cancelled) return
          console.error('Fetch error:', err.message)
          if (newsItems.length === 0) setStatus('Unable to load news feed.')
          setLoading(false)
        })
        .finally(() => {
          isFetchingRef.current = false
          if (!cancelled) {
            const ONE_MONTH_MS = 10 * 60 * 1000
            timerId = setTimeout(fetchNews, ONE_MONTH_MS)
          }
        })
    }

    fetchNews()

    return () => {
      cancelled = true
      isFetchingRef.current = false
      if (timerId) clearTimeout(timerId)
    }
  }, [])

  function formatDateTime(dtStr) {
    if (!dtStr) return '—'

    let d
    const gvizDateMatch = dtStr.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/)

    if (gvizDateMatch) {
      const [, year, month, day, hours = 0, minutes = 0, seconds = 0] = gvizDateMatch.map(Number)
      d = new Date(year, month, day, hours, minutes, seconds)
    } else {
      d = new Date(dtStr.replace(' ', 'T'))
    }

    if (isNaN(d.getTime())) return dtStr

    const dateFormatted = d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    const timeFormatted = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    return `${dateFormatted}, ${timeFormatted}`
  }

  return (
    <div className="news-table-container">
      <style>{`
        .news-table-container {
          background: #0d1117;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #30363d;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          color: #c9d1d9;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .news-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .news-table-title {
          margin: 0;
          font-size: 1.2rem;
          color: #f0f6fc;
          font-weight: 600;
        }

        .live-badge {
          background: rgba(46, 160, 67, 0.15);
          color: #3fb950;
          border: 1px solid rgba(46, 160, 67, 0.4);
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .news-table-wrapper {
          overflow-x: auto;
        }

        .news-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }

        .news-table th {
          background-color: #161b22;
          color: #8b949e;
          padding: 12px 14px;
          border-bottom: 1px solid #30363d;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
        }

        .news-table td {
          padding: 14px;
          border-bottom: 1px solid #21262d;
          transition: background-color 0.2s ease;
        }

        .news-table tbody tr:hover td {
          background-color: #161b22;
        }

        .col-time {
          color: #8b949e;
          white-space: nowrap;
        }

        .company-name {
          font-weight: 600;
          color: #58a6ff;
        }

        .headline-link {
          color: #f0f6fc;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .headline-link:hover {
          color: #58a6ff;
          text-decoration: underline;
        }

        .status-cell {
          text-align: center;
          padding: 40px 0 !important;
          color: #8b949e;
        }

        @media (max-width: 640px) {
          .news-table-container { padding: 14px; }
          .news-table th, .news-table td { padding: 10px; font-size: 0.8rem; }
          .news-table .col-sub { display: none; }
        }

        .spinner-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .spinner {
          animation: rotate 2s linear infinite;
          width: 28px;
          height: 28px;
        }

        .spinner .path {
          stroke: #58a6ff;
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }

        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }

        @keyframes dash {
          0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
          100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
        }
      `}</style>

      <div className="news-table-header">
        <h3 className="news-table-title">BSE Market News</h3>
        <span className="live-badge">LIVE</span>
      </div>

      <div className="news-table-wrapper">
        <table className="news-table">
          <thead>
            <tr>
              <th className="col-time">Date & Time</th>
              <th className="col-company">Company Name</th>
              <th className="col-headline">Headline</th>
              <th className="col-sub">News Sub</th>
            </tr>
          </thead>
          <tbody>
            {loading && newsItems.length === 0 ? (
              <tr>
                <td colSpan="4" className="status-cell">
                  <div className="spinner-wrapper">
                    <svg className="spinner" viewBox="0 0 50 50">
                      <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
                    </svg>
                    <span>Fetching BSE updates...</span>
                  </div>
                </td>
              </tr>
            ) : newsItems.length === 0 ? (
              <tr>
                <td colSpan="4" className="status-cell">
                  {status}
                </td>
              </tr>
            ) : (
              newsItems.map((n, i) => (
                <tr key={i}>
                  <td className="col-time">{formatDateTime(n.dt)}</td>
                  <td className="col-company">
                    <span className="company-name">{n.name || '—'}</span>
                  </td>
                  <td className="col-headline">
                    <span>{n.headline || '—'}</span>
                  </td>
                  <td className="col-sub">{n.sub || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// const DEFAULT_INDICES_DATA = [
//   {
//     indexId: 'nifty50',
//     indexName: 'NIFTY 50',
//     category: 'NSE Benchmark',
//     lastUpdated: '02 Aug 2026',
//     companies: [
//       { rank: 1, name: 'HDFC Bank Ltd.', symbol: 'HDFCBANK', sector: 'Financial Services', weightage: 11.25 },
//       { rank: 2, name: 'Reliance Industries Ltd.', symbol: 'RELIANCE', sector: 'Oil & Gas', weightage: 9.85 },
//       { rank: 3, name: 'ICICI Bank Ltd.', symbol: 'ICICIBANK', sector: 'Financial Services', weightage: 7.92 },
//       { rank: 4, name: 'Infosys Ltd.', symbol: 'INFY', sector: 'Information Technology', weightage: 5.84 },
//       { rank: 5, name: 'ITC Ltd.', symbol: 'ITC', sector: 'Consumer Goods', weightage: 4.35 },
//       { rank: 6, name: 'Larsen & Toubro Ltd.', symbol: 'LT', sector: 'Construction', weightage: 3.95 },
//     ],
//   },
//   {
//     indexId: 'bse_sensex',
//     indexName: 'BSE SENSEX',
//     category: 'BSE Benchmark',
//     lastUpdated: '02 Aug 2026',
//     companies: [
//       { rank: 1, name: 'HDFC Bank Ltd.', symbol: 'HDFCBANK', sector: 'Financial Services', weightage: 13.10 },
//       { rank: 2, name: 'Reliance Industries Ltd.', symbol: 'RELIANCE', sector: 'Oil & Gas', weightage: 11.40 },
//       { rank: 3, name: 'ICICI Bank Ltd.', symbol: 'ICICIBANK', sector: 'Financial Services', weightage: 9.15 },
//       { rank: 4, name: 'Infosys Ltd.', symbol: 'INFY', sector: 'Information Technology', weightage: 6.75 },
//       { rank: 5, name: 'Tata Consultancy Services', symbol: 'TCS', sector: 'Information Technology', weightage: 4.80 },
//     ],
//   },
//   {
//     indexId: 'nifty_bank',
//     indexName: 'NIFTY BANK',
//     category: 'Sectoral Index',
//     lastUpdated: '02 Aug 2026',
//     companies: [
//       { rank: 1, name: 'HDFC Bank Ltd.', symbol: 'HDFCBANK', sector: 'Private Bank', weightage: 27.80 },
//       { rank: 2, name: 'ICICI Bank Ltd.', symbol: 'ICICIBANK', sector: 'Private Bank', weightage: 23.40 },
//       { rank: 3, name: 'Axis Bank Ltd.', symbol: 'AXISBANK', sector: 'Private Bank', weightage: 14.15 },
//       { rank: 4, name: 'State Bank of India', symbol: 'SBIN', sector: 'Public Bank', weightage: 11.50 },
//       { rank: 5, name: 'Kotak Mahindra Bank', symbol: 'KOTAKBANK', sector: 'Private Bank', weightage: 9.80 },
//     ],
//   },
// ]

// export function IndexWeightages({ data = DEFAULT_INDICES_DATA }) {
//   const indicesData = data && data.length > 0 ? data : DEFAULT_INDICES_DATA
//   const [selectedIndexId, setSelectedIndexId] = useState(indicesData[0].indexId)

//   const selectedIndex =
//     indicesData.find((idx) => idx.indexId === selectedIndexId) || indicesData[0]

//   return (
//     <div className="weightages-card-container">
//       <style>{`
//         .weightages-card-container {
//           background: #0d1117;
//           border-radius: 14px;
//           padding: 24px;
//           border: 1px solid #30363d;
//           box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
//           color: #c9d1d9;
//           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//           max-width: 1200px;
//           margin: 0 auto;
//         }

//         .card-header {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 24px;
//           flex-wrap: wrap;
//           gap: 16px;
//         }

//         .card-title {
//           margin: 0;
//           font-size: 1.35rem;
//           color: #f0f6fc;
//           font-weight: 600;
//           letter-spacing: -0.3px;
//         }

//         .meta-tags-wrapper {
//           margin-top: 6px;
//           display: flex;
//           gap: 8px;
//         }

//         .meta-tag {
//           font-size: 0.8rem;
//           color: #8b949e;
//           background: #161b22;
//           padding: 4px 10px;
//           border-radius: 6px;
//           border: 1px solid #30363d;
//         }

//         .picklist-wrapper {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }

//         .picklist-label {
//           font-size: 0.85rem;
//           color: #8b949e;
//           font-weight: 500;
//         }

//         .custom-select {
//           background-color: #161b22;
//           color: #58a6ff;
//           border: 1px solid #30363d;
//           border-radius: 8px;
//           padding: 10px 18px;
//           font-size: 0.95rem;
//           font-weight: 600;
//           outline: none;
//           cursor: pointer;
//           transition: border-color 0.2s, box-shadow 0.2s;
//         }

//         .custom-select:hover, .custom-select:focus {
//           border-color: #58a6ff;
//           box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
//         }

//         .table-wrapper {
//           overflow-x: auto;
//         }

//         .custom-table {
//           width: 100%;
//           border-collapse: collapse;
//           text-align: left;
//           font-size: 0.9rem;
//         }

//         .custom-table th {
//           background-color: #161b22;
//           color: #8b949e;
//           padding: 14px;
//           border-bottom: 1px solid #30363d;
//           text-transform: uppercase;
//           font-size: 0.75rem;
//           letter-spacing: 0.5px;
//         }

//         .custom-table td {
//           padding: 14px;
//           border-bottom: 1px solid #21262d;
//           transition: background-color 0.2s ease;
//         }

//         .custom-table tbody tr:hover td {
//           background-color: #161b22;
//         }

//         .rank-badge {
//           display: inline-block;
//           width: 26px;
//           height: 26px;
//           line-height: 26px;
//           text-align: center;
//           background: #21262d;
//           color: #f0f6fc;
//           border-radius: 50%;
//           font-weight: 700;
//           font-size: 0.75rem;
//         }

//         .sector-pill {
//           background: rgba(110, 118, 129, 0.1);
//           color: #8b949e;
//           padding: 4px 10px;
//           border-radius: 6px;
//           font-size: 0.75rem;
//         }

//         .weight-container {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           width: 100%;
//           max-width: 280px;
//         }

//         .progress-bar-bg {
//           flex: 1;
//           height: 8px;
//           background: #21262d;
//           border-radius: 4px;
//           overflow: hidden;
//         }

//         .progress-bar-fill {
//           height: 100%;
//           background: linear-gradient(90deg, #1f6beb, #58a6ff);
//           border-radius: 4px;
//           transition: width 0.4s ease-in-out;
//         }

//         .weight-val {
//           font-weight: 700;
//           color: #f0f6fc;
//           min-width: 52px;
//           text-align: right;
//         }
//       `}</style>

//       {/* CARD HEADER & PICKLIST SELECTION */}
//       <div className="card-header">
//         <div>
//           <h3 className="card-title">Index Holdings & Weightages</h3>
//           <div className="meta-tags-wrapper">
//             {selectedIndex.category && (
//               <span className="meta-tag">{selectedIndex.category}</span>
//             )}
//             {selectedIndex.lastUpdated && (
//               <span className="meta-tag">
//                 Updated: {selectedIndex.lastUpdated}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* PICKLIST DROPDOWN */}
//         <div className="picklist-wrapper">
//           <label htmlFor="index-select" className="picklist-label">
//             Select Index:
//           </label>
//           <select
//             id="index-select"
//             className="custom-select"
//             value={selectedIndexId}
//             onChange={(e) => setSelectedIndexId(e.target.value)}
//           >
//             {indicesData.map((idx) => (
//               <option key={idx.indexId} value={idx.indexId}>
//                 {idx.indexName}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* COMPANY WEIGHTAGES TABLE */}
//       <div className="table-wrapper">
//         <table className="custom-table">
//           <thead>
//             <tr>
//               <th style={{ width: '70px', textAlign: 'center' }}>Rank</th>
//               <th>Company Name</th>
//               <th>Sector</th>
//               <th style={{ width: '320px' }}>Weightage (%)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {selectedIndex.companies && selectedIndex.companies.length > 0 ? (
//               selectedIndex.companies.map((comp, idx) => (
//                 <tr key={comp.symbol || idx}>
//                   <td style={{ textAlign: 'center' }}>
//                     <span className="rank-badge">{comp.rank || idx + 1}</span>
//                   </td>
//                   <td>
//                     <div style={{ fontWeight: '600', color: '#f0f6fc' }}>
//                       {comp.name}
//                     </div>
//                     {comp.symbol && (
//                       <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
//                         {comp.symbol}
//                       </div>
//                     )}
//                   </td>
//                   <td>
//                     <span className="sector-pill">
//                       {comp.sector || 'N/A'}
//                     </span>
//                   </td>
//                   <td>
//                     <div className="weight-container">
//                       <div className="progress-bar-bg">
//                         <div
//                           className="progress-bar-fill"
//                           style={{
//                             width: `${Math.min((comp.weightage || 0) * 3.2, 100)}%`,
//                           }}
//                         />
//                       </div>
//                       <span className="weight-val">
//                         {Number(comp.weightage || 0).toFixed(2)}%
//                       </span>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td
//                   colSpan="4"
//                   style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}
//                 >
//                   No company weightage data available.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }

// ---------- Home Dashboard View ----------
function HomeDashboard() {
  const navigate = useNavigate()
  const [sectors, setSectors] = useState([])
  const [activeTab, setActiveTab] = useState('Screener')
  const [searchQuery, setSearchQuery] = useState('')
  const [syncStatus, setSyncStatus] = useState('Pipeline Status: Initializing Link...')
  const [indices, setIndices] = useState({
    nifty: { val: '--', change: '--', cls: 'up' },
    bank: { val: '--', change: '--', cls: 'up' },
    sensex: { val: '--', change: '--', cls: 'up' },
    vix: { val: '--', change: '--', cls: 'up' },
  })
  const [movers, setMovers] = useState({
    longbuild: [],
    shortbuild: [],
    shortcovering: [],
    gainers: [],
    losers: [],
    intradayGainers: [],
    intradayLosers: [],
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
              const formattedPct = rawPct.includes('%') ? rawPct : `${rawPct}`
              changeText = rawChange ? `${rawChange}% (${formattedPct})` : formattedPct
            }

            const numericChange = parseChangePercent(rawPct || rawChange)
            const isNegative = numericChange < 0 || String(rawChange).startsWith('-') || String(rawPct).startsWith('-')
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
          const rawPct = String(r[7] !== undefined && r[7] !== '' ? r[7] : r[8] || r[3] || '').trim()
          const pctNum = parseChangePercent(rawPct)

          const displayName = String(nameCell)
            .replace(/^NIFTY\s*|_/gi, ' ')
            .trim()

          return {
            name: displayName,
            pct: pctNum,
            changeStr: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}`) : '0.00%',
            rawRow: r,
          }
        })
        .filter((s) => {
          if (!s.name || s.name.length < 2) return false
          const upper = s.name.toUpperCase()
          return (
            !upper.includes('NIFTY 50') &&
            !upper.includes('NIFTY BANK') &&
            !upper.includes('SENSEX') &&
            !upper.includes('VIX') &&
            !upper.includes('SYMBOL') &&
            !upper.includes('SEARCHKEY') &&
            !upper.includes('CMP') &&
            s.changeStr !== '0.00%'
          )
        })
        .slice(1, 12)

      setSectors(parsedSectors)
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
          const name = String(r[16] || '').trim()
          const price = r[17] !== undefined && r[17] !== '' ? r[17] : '--'
          const rawPct = String(r[18] || '').trim()

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
          const name = String(r[6] || '').trim()
          const price = r[7] !== undefined && r[7] !== '' ? r[7] : '--'
          const rawPct = String(r[8] || '').trim()

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
          const name = String(r[1] || '').trim()
          const price = r[2] !== undefined && r[2] !== '' ? r[2] : '--'
          const rawPct = String(r[3] || '').trim()

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
    const interval = setInterval(runSync, 5000)
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
  {/* Stacked Full-Width Hero Sections */}


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
          <Route
            path="/admin"
            element={
              <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
            }
          />
        </Routes>
      </div>

     
      {/* Floating Action Button */}
    

      {/* Modal Overlay */}
   
    </>
  )
}