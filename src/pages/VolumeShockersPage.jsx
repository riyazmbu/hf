import { useState } from 'react';
import { MOCK_VOLUME_SHOCKERS } from '../mockData';
import './Pages.css';

export default function VolumeShockersPage() {
  const { summary, stocks } = MOCK_VOLUME_SHOCKERS;
  const [filterMode, setFilterMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterMode === 'all' ||
      (filterMode === 'bullish' && stock.priceChg > 0) ||
      (filterMode === 'bearish' && stock.priceChg < 0) ||
      (filterMode === 'delivery' && stock.deliveryPct >= 55);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="page-eyebrow">📢 Liquidity Surges</span>
          <h1 className="page-title">Volume Shockers & Delivery Hub</h1>
          <p className="page-subtitle">Identify stocks experiencing extraordinary volume expansion relative to their 10-day moving average.</p>
        </div>

        {/* Search Box */}
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search stock..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="greeks-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Top Volume Surge</span>
          <span className="kpi-value highlight">{summary.topSpikeStock}</span>
          <span className="kpi-subtext">Surge Multiple: <strong>{summary.topSpikeMultiple}</strong></span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Average Volume Expansion</span>
          <span className="kpi-value text-primary">{summary.avgSurge}</span>
          <span className="kpi-subtext">vs. 10-Day Avg Volume</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Active Volume Shockers</span>
          <span className="kpi-value text-success">{summary.totalShockers} Equities</span>
          <span className="kpi-subtext">Expansion &gt; 2.5x Avg</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${filterMode === 'all' ? 'active' : ''}`}
          onClick={() => setFilterMode('all')}
        >
          All Shockers ({stocks.length})
        </button>
        <button
          className={`tab-btn ${filterMode === 'bullish' ? 'active' : ''}`}
          onClick={() => setFilterMode('bullish')}
        >
          🟢 Bullish Surges
        </button>
        <button
          className={`tab-btn ${filterMode === 'bearish' ? 'active' : ''}`}
          onClick={() => setFilterMode('bearish')}
        >
          🔴 Bearish Surges
        </button>
        <button
          className={`tab-btn ${filterMode === 'delivery' ? 'active' : ''}`}
          onClick={() => setFilterMode('delivery')}
        >
          📦 High Delivery (&gt;55%)
        </button>
      </div>

      {/* Data Table */}
      <div className="data-card">
        <div className="card-header-row">
          <h3>Real-time Volume & Delivery Analytics</h3>
        </div>

        <div className="table-responsive">
          <table className="light-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>LTP (₹)</th>
                <th>Price Chg %</th>
                <th>Today's Volume</th>
                <th>10D Avg Vol</th>
                <th>Volume Spike</th>
                <th>Delivery %</th>
                <th>Signal Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.length > 0 ? (
                filteredStocks.map((row) => (
                  <tr key={row.symbol}>
                    <td className="symbol-cell">{row.symbol}</td>
                    <td className="font-mono fw-bold">₹{row.price.toLocaleString('en-IN')}</td>
                    <td className={`font-mono fw-bold ${row.priceChg >= 0 ? 'text-success' : 'text-danger'}`}>
                      {row.priceChg >= 0 ? `+${row.priceChg.toFixed(2)}%` : `${row.priceChg.toFixed(2)}%`}
                    </td>
                    <td className="font-mono fw-bold">{row.volume}</td>
                    <td className="font-mono text-muted">{row.avgVol}</td>
                    <td>
                      <span className="surge-badge">
                        🔥 {row.surgeMultiple}x
                      </span>
                    </td>
                    <td>
                      <div className="delivery-meter-container">
                        <span className="font-mono fw-bold">{row.deliveryPct}%</span>
                        <div className="delivery-bar">
                          <div
                            className={`delivery-fill ${row.deliveryPct >= 55 ? 'high' : 'normal'}`}
                            style={{ width: `${row.deliveryPct}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`pcr-badge ${row.priceChg >= 0 ? 'pcr-bullish' : 'pcr-bearish'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">No stocks match your filter query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}