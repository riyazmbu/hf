import './Dashboard.css'

export default function HorizontalBarList({ items, isGainer = true }) {
  if (!items || items.length === 0) {
    return <div className="sector-loading-state">Loading metrics...</div>
  }

  const maxPct = Math.max(...items.map((item) => Math.abs(item.pct || 0)), 1)

  return (
    <div className="horizontal-bar-list">
      {items.map((item, idx) => {
        const val = item.pct || 0
        const isPositive = isGainer ? val >= 0 : val <= 0
        const fillWidth = Math.min((Math.abs(val) / maxPct) * 50, 50)

        return (
          <div className="bar-item-row" key={`${item.name}-${idx}`}>
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
