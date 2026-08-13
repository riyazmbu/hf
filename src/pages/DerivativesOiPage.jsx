import { useState } from 'react';
import { MOCK_OI_BUILDUP } from '../mockData';
import './Pages.css';

export default function DerivativesOiPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Count summaries
  const counts = {
    all: MOCK_OI_BUILDUP.length,
    long_buildup: MOCK_OI_BUILDUP.filter(i => i.buildup === 'long_buildup').length,
    short_buildup: MOCK_OI_BUILDUP.filter(i => i.buildup === 'short_buildup').length,
    short_covering: MOCK_OI_BUILDUP.filter(i => i.buildup === 'short_covering').length,
    long_unwinding: MOCK_OI_BUILDUP.filter(i => i.buildup === 'long_unwinding').length,
  };

  const filteredData = MOCK_OI_BUILDUP.filter((item) => {
    const matchesTab = activeFilter === 'all' || item.buildup === activeFilter;
    const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getBuildupBadge = (type) => {
    switch (type) {
      case 'long_buildup':
        return <span className="buildup-pill long-buildup">▲ Long Build-up</span>;
      case 'short_buildup':
        return <span className="buildup-pill short-buildup">▼ Short Build-up</span>;
      case 'short_covering':
        return <span className="buildup-pill short-covering">⚡ Short Covering</span>;
      case 'long_unwinding':
        return <span className="buildup-pill long-unwinding">⚠️ Long Unwinding</span>;
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="page-eyebrow">📊 Options Analytics</span>
          <h1 className="page-title">Derivatives Open Interest (OI) Build-up</h1>
          <p className="page-subtitle">Track price vs. Open Interest movements to detect institutional long & short positions.</p>
        </div>

        {/* Search */}
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search symbol (e.g. SBIN)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="metric-cards-grid">
        <div 
          className={`metric-card interactive ${activeFilter === 'long_buildup' ? 'active-card' : ''}`}
          onClick={() => setActiveFilter('long_buildup')}
        >
          <span className="metric-label">Long Build-up</span>
          <div className="metric-value pos">{counts.long_buildup} Stocks</div>
          <span className="metric-status">Price ↑ | OI ↑ (Bullish)</span>
        </div>

        <div 
          className={`metric-card interactive ${activeFilter === 'short_buildup' ? 'active-card' : ''}`}
          onClick={() => setActiveFilter('short_buildup')}
        >
          <span className="metric-label">Short Build-up</span>
          <div className="metric-value neg">{counts.short_buildup} Stocks</div>
          <span className="metric-status">Price ↓ | OI ↑ (Bearish)</span>
        </div>

        <div 
          className={`metric-card interactive ${activeFilter === 'short_covering' ? 'active-card' : ''}`}
          onClick={() => setActiveFilter('short_covering')}
        >
          <span className="metric-label">Short Covering</span>
          <div className="metric-value info">{counts.short_covering} Stocks</div>
          <span className="metric-status">Price ↑ | OI ↓ (Shorts Exit)</span>
        </div>

        <div 
          className={`metric-card interactive ${activeFilter === 'long_unwinding' ? 'active-card' : ''}`}
          onClick={() => setActiveFilter('long_unwinding')}
        >
          <span className="metric-label">Long Unwinding</span>
          <div className="metric-value warning">{counts.long_unwinding} Stocks</div>
          <span className="metric-status">Price ↓ | OI ↓ (Longs Exit)</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All ({counts.all})
        </button>
        <button
          className={`tab-btn ${activeFilter === 'long_buildup' ? 'active' : ''}`}
          onClick={() => setActiveFilter('long_buildup')}
        >
          🟢 Long Build-up ({counts.long_buildup})
        </button>
        <button
          className={`tab-btn ${activeFilter === 'short_buildup' ? 'active' : ''}`}
          onClick={() => setActiveFilter('short_buildup')}
        >
          🔴 Short Build-up ({counts.short_buildup})
        </button>
        <button
          className={`tab-btn ${activeFilter === 'short_covering' ? 'active' : ''}`}
          onClick={() => setActiveFilter('short_covering')}
        >
          ⚡ Short Covering ({counts.short_covering})
        </button>
        <button
          className={`tab-btn ${activeFilter === 'long_unwinding' ? 'active' : ''}`}
          onClick={() => setActiveFilter('long_unwinding')}
        >
          ⚠️ Long Unwinding ({counts.long_unwinding})
        </button>
      </div>

      {/* Main Data Table */}
      <div className="data-card">
        <div className="table-responsive">
          <table className="light-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Sector</th>
                <th>LTP (₹)</th>
                <th>Price Change (%)</th>
                <th>Total Open Interest</th>
                <th>OI Change (%)</th>
                <th>Build-up Signal</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.symbol}>
                    <td className="symbol-cell">{row.symbol}</td>
                    <td><span className="sector-tag">{row.sector}</span></td>
                    <td className="font-mono fw-bold">₹{row.ltp.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`change-badge ${row.changePct >= 0 ? 'pos' : 'neg'}`}>
                        {row.changePct >= 0 ? `+${row.changePct}%` : `${row.changePct}%`}
                      </span>
                    </td>
                    <td className="font-mono">{row.oi}</td>
                    <td>
                      <span className={`pill-badge ${row.oiChangePct >= 0 ? 'pos' : 'neg'}`}>
                        {row.oiChangePct >= 0 ? `+${row.oiChangePct}%` : `${row.oiChangePct}%`}
                      </span>
                    </td>
                    <td>{getBuildupBadge(row.buildup)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">No contracts match your current filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}