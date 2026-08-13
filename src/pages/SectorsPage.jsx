import { useState } from 'react';
import { MOCK_SECTOR_DATA } from '../mockData';
import './Pages.css';

export default function SectorsPage() {
  const [timeframe, setTimeframe] = useState('1D');
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap' | 'table'

  // Helper to compute heat tile background color based on percentage change
  const getHeatmapColor = (chg) => {
    if (chg >= 2.5) return { bg: '#dcfce7', text: '#15803d', border: '#86efac' }; // Strong Green
    if (chg > 0) return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };    // Soft Green
    if (chg <= -2.0) return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' }; // Strong Red
    return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };                 // Soft Red
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="page-eyebrow">🗺️ Capital Rotation</span>
          <h1 className="page-title">Sector Performance Heatmap</h1>
          <p className="page-subtitle">Track real-time sector strength, market breadth, and index constituent movers.</p>
        </div>

        {/* View Switcher & Timeframe */}
        <div className="sector-controls">
          <div className="timeframe-group">
            {['1D', '1W', '1M', 'YTD'].map((tf) => (
              <button
                key={tf}
                className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="toggle-group">
            <button
              className={`toggle-btn ${viewMode === 'heatmap' ? 'active' : ''}`}
              onClick={() => setViewMode('heatmap')}
            >
              🟩 Heatmap
            </button>
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              📋 Table
            </button>
          </div>
        </div>
      </div>

      {/* HEATMAP VIEW */}
      {viewMode === 'heatmap' && (
        <div className="sector-heatmap-grid">
          {MOCK_SECTOR_DATA.map((sector) => {
            const styles = getHeatmapColor(sector.change);
            const isPos = sector.change >= 0;

            return (
              <div
                key={sector.name}
                className="heatmap-tile"
                style={{
                  backgroundColor: styles.bg,
                  borderColor: styles.border,
                  color: styles.text
                }}
              >
                <div className="tile-top">
                  <span className="tile-title">{sector.name}</span>
                  <span className="tile-weight">Weight: {sector.weightage}</span>
                </div>

                <div className="tile-main-chg">
                  {isPos ? `+${sector.change.toFixed(2)}%` : `${sector.change.toFixed(2)}%`}
                </div>

                <div className="tile-breadth">
                  <span className="adv">▲ {sector.advances} Adv</span>
                  <span className="dec">▼ {sector.declines} Dec</span>
                </div>

                <div className="tile-movers">
                  <div><span className="lbl">Top Gainer:</span> {sector.topGainer}</div>
                  <div><span className="lbl">Top Loser:</span> {sector.topLoser}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="data-card">
          <div className="table-responsive">
            <table className="light-table">
              <thead>
                <tr>
                  <th>Sector Index</th>
                  <th>{timeframe} Return (%)</th>
                  <th>Index Weight</th>
                  <th>Advances</th>
                  <th>Declines</th>
                  <th>Top Sector Gainer</th>
                  <th>Top Sector Loser</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SECTOR_DATA.map((sector) => (
                  <tr key={sector.name}>
                    <td className="symbol-cell">{sector.name}</td>
                    <td className={`font-mono fw-bold ${sector.change >= 0 ? 'text-success' : 'text-danger'}`}>
                      {sector.change >= 0 ? `+${sector.change.toFixed(2)}%` : `${sector.change.toFixed(2)}%`}
                    </td>
                    <td className="font-mono text-muted">{sector.weightage}</td>
                    <td className="font-mono text-success fw-bold">{sector.advances}</td>
                    <td className="font-mono text-danger fw-bold">{sector.declines}</td>
                    <td className="font-mono text-success">{sector.topGainer}</td>
                    <td className="font-mono text-danger">{sector.topLoser}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}