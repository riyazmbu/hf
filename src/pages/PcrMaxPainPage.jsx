import { useState } from 'react';
import { MOCK_PCR_MAXPAIN } from '../mockData';
import './pages.css';

export default function PcrMaxPainPage() {
  const { indices, stocks } = MOCK_PCR_MAXPAIN;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const getPcrBadge = (pcr, sentiment) => {
    if (pcr >= 1.1) {
      return <span className="pcr-badge pcr-bullish">🟢 Bullish ({pcr})</span>;
    } else if (pcr <= 0.75) {
      return <span className="pcr-badge pcr-bearish">🔴 Bearish ({pcr})</span>;
    } else {
      return <span className="pcr-badge pcr-neutral">🟡 Neutral ({pcr})</span>;
    }
  };

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'bullish' && stock.pcr >= 1.1) ||
      (activeFilter === 'bearish' && stock.pcr <= 0.75) ||
      (activeFilter === 'neutral' && stock.pcr > 0.75 && stock.pcr < 1.1);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="page-eyebrow">🎯 Sentiment Analytics</span>
          <h1 className="page-title">Put-Call Ratio (PCR) & Max Pain</h1>
          <p className="page-subtitle">Identify key market support/resistance and options seller pain points in real-time.</p>
        </div>

        {/* Search */}
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search stock (e.g. RELIANCE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Index Summary Widgets */}
      <div className="index-widgets-grid">
        {indices.map((idx) => {
          const diff = (idx.spotPrice - idx.maxPain).toFixed(2);
          const isSpotAbovePain = diff >= 0;

          return (
            <div key={idx.symbol} className="index-widget-card">
              <div className="widget-header">
                <span className="widget-title">{idx.symbol}</span>
                {getPcrBadge(idx.pcr, idx.sentiment)}
              </div>

              <div className="widget-body">
                <div className="widget-metric">
                  <span className="w-label">Spot Price</span>
                  <span className="w-value">₹{idx.spotPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="widget-metric">
                  <span className="w-label">Max Pain Strike</span>
                  <span className="w-value highlight">₹{idx.maxPain.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="widget-footer">
                <span>Spot vs. Max Pain:</span>
                <span className={`diff-pill ${isSpotAbovePain ? 'pos' : 'neg'}`}>
                  {isSpotAbovePain ? `+₹${diff} above` : `-₹${Math.abs(diff)} below`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Filter Bar */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Equities ({stocks.length})
        </button>
        <button
          className={`tab-btn ${activeFilter === 'bullish' ? 'active' : ''}`}
          onClick={() => setActiveFilter('bullish')}
        >
          🟢 Bullish PCR (&gt;1.10)
        </button>
        <button
          className={`tab-btn ${activeFilter === 'neutral' ? 'active' : ''}`}
          onClick={() => setActiveFilter('neutral')}
        >
          🟡 Neutral PCR (0.75 - 1.10)
        </button>
        <button
          className={`tab-btn ${activeFilter === 'bearish' ? 'active' : ''}`}
          onClick={() => setActiveFilter('bearish')}
        >
          🔴 Bearish PCR (&lt;0.75)
        </button>
      </div>

      {/* Stock Options Data Table */}
      <div className="data-card">
        <div className="card-header-row">
          <h3>F&O Stock Option Analytics</h3>
        </div>
        <div className="table-responsive">
          <table className="light-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Spot Price (₹)</th>
                <th>Max Pain Strike</th>
                <th>Put Call Ratio (PCR)</th>
                <th>Total Put OI</th>
                <th>Total Call OI</th>
                <th>Sentiment Signal</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.length > 0 ? (
                filteredStocks.map((row) => (
                  <tr key={row.symbol}>
                    <td className="symbol-cell">{row.symbol}</td>
                    <td className="font-mono fw-bold">₹{row.spotPrice.toLocaleString('en-IN')}</td>
                    <td className="font-mono text-primary fw-bold">₹{row.maxPain.toLocaleString('en-IN')}</td>
                    <td className="font-mono fw-bold">{row.pcr}</td>
                    <td className="font-mono text-success">{row.totalPutOi}</td>
                    <td className="font-mono text-danger">{row.totalCallOi}</td>
                    <td>{getPcrBadge(row.pcr, row.sentiment)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">No stocks match your current filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}