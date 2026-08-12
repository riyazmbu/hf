import React from 'react'
import './HorizontalBarList.css'

export default function HorizontalBarList({ items = [], isGainer }) {
  if (!items || items.length === 0) {
    return <div className="empty-list-state">No data available</div>
  }

  // Find max absolute percentage to normalize bar fill width
  const maxPct = Math.max(...items.map((item) => Math.abs(item.pct || 0)), 1)

  return (
    <div className="horizontal-bar-list">
      {items.map((item, index) => {
        const pct = item.pct || 0
        
        // Stock is negative if percentage is < 0 OR explicitly set via isGainer prop
        const isNegative = pct < 0 || isGainer === false
        const colorClass = isNegative ? 'is-red' : 'is-green'
        
        // Calculate relative width percentage (capped between 0% and 100%)
        const barWidth = Math.min((Math.abs(pct) / maxPct) * 100, 100)

        return (
          <div key={item.name || index} className="bar-row">
            <span className="stock-name">{item.name}</span>

            <div className="bar-track">
              <div
                className={`bar-fill ${colorClass}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>

            <span className={`stock-change-text ${colorClass}`}>
              {isNegative ? '▼' : '▲'} {item.change || `${pct.toFixed(2)}%`}
            </span>
          </div>
        )
      })}
    </div>
  )
}