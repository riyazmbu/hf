import { useEffect, useState } from 'react'
import { SHEET_ID, INDEX_CARDS } from '../../constants/market'
import { dispatchGoogleSheetRequest } from '../../services/googleSheets'
import { findRowByKeyword, parseChangePercent, parseRows } from '../../utils/marketData'
import HorizontalBarList from './HorizontalBarList'
import TopNewsFeed from './TopNewsFeed'
import './Dashboard.css'

export default function HomeDashboard() {
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
        .map((row) => {
          const nameCell = row.find((cell) => cell && typeof cell === 'string' && cell.trim().length > 0) || ''
          const rawPct = String(row[8] !== undefined && row[8] !== '' ? row[8] : row[7] || row[3] || '').trim()
          const pctNum = parseChangePercent(rawPct)
          const displayName = String(nameCell).replace(/^NIFTY\s*|_/gi, ' ').trim()

          return {
            name: displayName,
            pct: pctNum,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}%`) : '0.00%',
          }
        })
        .filter((sector) => sector.name && sector.name.length >= 2 && sector.change !== '0.00%')
        .slice(2, 10)

      setSectors(parsedSectors)
    }

    window.processMovers = function (data) {
      const rows = parseRows(data.table)

      const intradayGainers = rows
        .map((row) => {
          const name = String(row[11] || '').trim()
          const rawPct = String(row[13] || '').trim()
          return {
            name,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}%`) : '0.00%',
            pct: parseChangePercent(rawPct),
          }
        })
        .filter((item) => item.name && !item.name.toUpperCase().includes('SYMBOL'))
        .slice(0, 5)

      const intradayLosers = rows
        .map((row) => {
          const name = String(row[16] || '').trim()
          const rawPct = String(row[18] || '').trim()
          return {
            name,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}%`) : '0.00%',
            pct: parseChangePercent(rawPct),
          }
        })
        .filter((item) => item.name && !item.name.toUpperCase().includes('SYMBOL'))
        .slice(0, 5)

      const losers = rows
        .map((row) => {
          const name = String(row[6] || '').trim()
          const rawPct = String(row[8] || '').trim()
          return {
            name,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}%`) : '0.00%',
            pct: parseChangePercent(rawPct),
          }
        })
        .filter((item) => item.name && !item.name.toUpperCase().includes('SYMBOL'))
        .slice(0, 5)

      const gainers = rows
        .map((row) => {
          const name = String(row[1] || '').trim()
          const rawPct = String(row[3] || '').trim()
          return {
            name,
            change: rawPct ? (rawPct.includes('%') ? rawPct : `${rawPct}%`) : '0.00%',
            pct: parseChangePercent(rawPct),
          }
        })
        .filter((item) => item.name && !item.name.toUpperCase().includes('SYMBOL'))
        .slice(0, 5)

      setMovers({ gainers, losers, intradayGainers, intradayLosers })
    }

    dispatchGoogleSheetRequest({ spreadsheetId: SHEET_ID, sheet: 'Indices', handler: 'processIndices' })
    dispatchGoogleSheetRequest({ spreadsheetId: SHEET_ID, sheet: 'Top10', handler: 'processMovers' })

    const interval = setInterval(() => {
      dispatchGoogleSheetRequest({ spreadsheetId: SHEET_ID, sheet: 'Indices', handler: 'processIndices' })
      dispatchGoogleSheetRequest({ spreadsheetId: SHEET_ID, sheet: 'Top10', handler: 'processMovers' })
    }, 15000)

    return () => {
      clearInterval(interval)
      delete window.processIndices
      delete window.processMovers
    }
  }, [])

  return (
    <div className="dashboard-grid">
      <div className="card-panel">
        <div className="quad-indices-grid">
          <div className="index-mini-card">
            <div className="index-title">NIFTY</div>
            <div className={`index-val ${indices.nifty.cls}`}>
              {indices.nifty.cls === 'up' ? '▲' : '▼'} {indices.nifty.val}
            </div>
            <a href="/optionchain" className="option-chain-link">Option Chain &rsaquo;</a>
          </div>

          <div className="index-mini-card">
            <div className="index-title">BANKNIFTY</div>
            <div className={`index-val ${indices.bank.cls}`}>
              {indices.bank.cls === 'up' ? '▲' : '▼'} {indices.bank.val}
            </div>
            <a href="/optionchain" className="option-chain-link">Option Chain &rsaquo;</a>
          </div>

          <div className="index-mini-card">
            <div className="index-title">SENSEX</div>
            <div className={`index-val ${indices.sensex.cls}`}>
              {indices.sensex.cls === 'up' ? '▲' : '▼'} {indices.sensex.val}
            </div>
            <a href="/optionchain" className="option-chain-link">Option Chain &rsaquo;</a>
          </div>

          <div className="index-mini-card">
            <div className="index-title">INDIA VIX</div>
            <div className={`index-val ${indices.vix.cls}`}>
              {indices.vix.cls === 'up' ? '▲' : '▼'} {indices.vix.val}
            </div>
            {/* <a href="/optionchain" className="option-chain-link">Option Chain &rsaquo;</a> */}
          </div>
        </div>
      </div>

      

      <div className="card-panel">
        <div className="panel-header">
          <h3>Sector Overview</h3>
          <a href="/sectors" className="view-all-link">View All</a>
        </div>
        <HorizontalBarList items={sectors.map((sector) => ({ ...sector, pct: sector.pct }))} isGainer />
      </div>

      <div className="bottom-movers-grid">
        <div className="card-panel">
          <div className="panel-header">
            <h3>Top GAP UP</h3>
          </div>
          <HorizontalBarList items={movers.gainers} isGainer />
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
