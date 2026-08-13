import { useEffect, useState } from 'react'
import HorizontalBarList from './HorizontalBarList'
import './Dashboard.css'

const API_BASE_URL = 'http://localhost:5000'

const initialIndices = {
  nifty: { val: '--', change: '--', cls: 'up' },
  bank: { val: '--', change: '--', cls: 'up' },
  sensex: { val: '--', change: '--', cls: 'up' },
  vix: { val: '--', change: '--', cls: 'up' },
}

export default function HomeDashboard() {
  const [indices, setIndices] = useState(initialIndices)
  const [sectors, setSectors] = useState([])
  const [movers, setMovers] = useState({
    gainers: [],
    losers: [],
    intradayGainers: [],
    intradayLosers: [],
  })

  const formatIndex = (data) => {
    if (!data) return { val: '--', change: '--', cls: 'up' }
    const ltp = Number(data.ltp)
    const changePct = Number(data.changePct)

    return {
      val: Number.isFinite(ltp)
        ? ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '--',
      change: Number.isFinite(changePct)
        ? `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`
        : '--',
      cls: changePct < 0 ? 'down' : 'up',
    }
  }

  const processMarketData = (data) => {
    if (!data) return

    setIndices({
      nifty: formatIndex(data.indices?.NIFTY),
      bank: formatIndex(data.indices?.BANKNIFTY),
      sensex: formatIndex(data.indices?.SENSEX),
      vix: formatIndex(data.indices?.INDIAVIX),
    })

    const sectorData = data.sectors || {}
    setSectors(
      Object.entries(sectorData)
        .map(([name, value]) => ({
          name,
          pct: Number(value) || 0,
          change: `${Number(value) >= 0 ? '+' : ''}${Number(value).toFixed(2)}%`,
        }))
        .sort((a, b) => b.pct - a.pct)
    )

    const marketMovers = data.movers || {}

    const formatMovers = (items = [], keyName = 'changePct') => {
      if (!Array.isArray(items)) return []
      return items.map((item) => {
        const pct = Number(item[keyName])
        return {
          name: item.symbol || '--',
          pct: Number.isFinite(pct) ? pct : 0,
          change: Number.isFinite(pct)
            ? `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`
            : '0.00%',
        }
      })
    }

    setMovers({
      gainers: formatMovers(marketMovers.topGainers, 'changePct'),
      losers: formatMovers(marketMovers.topLosers, 'changePct'),
      intradayGainers: formatMovers(marketMovers.topIntradayGainers, 'intradayPct'),
      intradayLosers: formatMovers(marketMovers.topIntradayLosers, 'intradayPct'),
    })
  }

  useEffect(() => {
    let ws
    let reconnectTimer
    let mounted = true

    const fetchInitialData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/snapshot`)
        if (res.ok && mounted) {
          const data = await res.json()
          processMarketData(data)
        }
      } catch (err) {
        console.error('Snapshot fetch error:', err)
      }
    }

    const connectWebSocket = () => {
      if (!mounted) return
      ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws`)

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'snapshot' && mounted) {
            processMarketData(data)
          }
        } catch (err) {
          console.error('WS Parse Error:', err)
        }
      }

      ws.onclose = () => {
        if (mounted) reconnectTimer = setTimeout(connectWebSocket, 3000)
      }
    }

    fetchInitialData()
    connectWebSocket()

    return () => {
      mounted = false
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (ws) ws.close()
    }
  }, [])

  return (
    <div className="dashboard-grid">
      {/* INDICES */}
      <div className="card-panel">
        <div className="quad-indices-grid">
          <div className="index-mini-card">
            <div className="index-title">NIFTY</div>
            <div className={`index-val ${indices.nifty.cls}`}>
              {indices.nifty.cls === 'up' ? '▲' : '▼'} {indices.nifty.val}
            </div>
            <div className={`index-change ${indices.nifty.cls}`}>{indices.nifty.change}</div>
          </div>
          <div className="index-mini-card">
            <div className="index-title">BANKNIFTY</div>
            <div className={`index-val ${indices.bank.cls}`}>
              {indices.bank.cls === 'up' ? '▲' : '▼'} {indices.bank.val}
            </div>
            <div className={`index-change ${indices.bank.cls}`}>{indices.bank.change}</div>
          </div>
          <div className="index-mini-card">
            <div className="index-title">SENSEX</div>
            <div className={`index-val ${indices.sensex.cls}`}>
              {indices.sensex.cls === 'up' ? '▲' : '▼'} {indices.sensex.val}
            </div>
            <div className={`index-change ${indices.sensex.cls}`}>{indices.sensex.change}</div>
          </div>
          <div className="index-mini-card">
            <div className="index-title">INDIA VIX</div>
            <div className={`index-val ${indices.vix.cls}`}>
              {indices.vix.cls === 'up' ? '▲' : '▼'} {indices.vix.val}
            </div>
            <div className={`index-change ${indices.vix.cls}`}>{indices.vix.change}</div>
          </div>
        </div>
      </div>

      {/* SECTOR OVERVIEW */}
      <div className="card-panel">
        <div className="panel-header">
          <h3>Sector Overview</h3>
        </div>
        <HorizontalBarList items={sectors} isGainer />
      </div>

      {/* MARKET MOVERS */}
      <div className="bottom-movers-grid">
        <div className="card-panel">
          <div className="panel-header">
            <h3>Top Gainers</h3>
          </div>
          <HorizontalBarList items={movers.gainers} isGainer />
        </div>

        <div className="card-panel">
          <div className="panel-header">
            <h3>Top Losers</h3>
          </div>
          <HorizontalBarList items={movers.losers} isGainer={false} />
        </div>

        <div className="card-panel">
          <div className="panel-header">
            <h3>Top Intraday Gainers</h3>
          </div>
          <HorizontalBarList items={movers.intradayGainers} isGainer />
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