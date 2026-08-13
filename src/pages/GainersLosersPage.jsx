import { useState, useEffect } from 'react';
import './Pages.css';

const API_BASE_URL = 'http://localhost:5000'; // Adjust if your backend uses a different host/port

export default function GainersLosersPage() {
  const [activeTab, setActiveTab] = useState('gainers');
  const [searchQuery, setSearchQuery] = useState('');
  const [moversData, setMoversData] = useState({
    topGainers: [],
    topLosers: [],
    volumeShockers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMoversData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/market-data/movers`);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (isMounted && result.status === 'success') {
          setMoversData(result.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching market movers:', err);
          setError('Failed to connect to real-time market data feed.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchMoversData();

    // Poll live data every 3 seconds
    const intervalId = setInterval(fetchMoversData, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const getActiveData = () => {
    if (activeTab === 'gainers') return moversData.topGainers || [];
    if (activeTab === 'losers') return moversData.topLosers || [];
    return moversData.volumeShockers || [];
  };

  const filteredData = getActiveData().filter((item) =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="page-eyebrow">⚡ Intraday Scanners</span>
          <h1 className="page-title">Price & Momentum Movers</h1>
          <p className="page-subtitle">Track intraday gainers, losers, and abnormal volume spikes in real-time.</p>
        </div>

        {/* Search Bar */}
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search symbol (e.g. RELIANCE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'gainers' ? 'active' : ''}`}
          onClick={() => setActiveTab('gainers')}
        >
          🔥 Top Gainers
        </button>
        <button
          className={`tab-btn ${activeTab === 'losers' ? 'active' : ''}`}
          onClick={() => setActiveTab('losers')}
        >
          🔻 Top Losers
        </button>
        <button
          className={`tab-btn ${activeTab === 'volume' ? 'active' : ''}`}
          onClick={() => setActiveTab('volume')}
        >
          ⚡ Volume Shockers
        </button>
      </div>

      {/* Connection / Error Banner */}
      {error && (
        <div className="error-banner" style={{ color: '#f87171', padding: '10px 0', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Table */}
      <div className="data-card">
        <div className="table-responsive">
          <table className="light-table">
            <thead>
              <tr>
                <th>Symbol</th>
                {/* <th>Sector</th> */}
                <th>LTP (₹)</th>
                <th>Change (%)</th>
                {activeTab === 'volume' ? (
                  <>
                    <th>Live Volume</th>
                    <th>Intraday %</th>
                    <th>Close (₹)</th>
                  </>
                ) : (
                  <>
                    <th>Open</th>
                    <th>High</th>
                    <th>Low</th>
                    <th>Volume</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="no-data">Loading live market data...</td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.symbol}>
                    <td className="symbol-cell">
                      <span className="sym-name">{row.symbol}</span>
                    </td>
                    {/* <td><span className="sector-tag">{row.sector || 'Equities'}</span></td> */}
                    <td className="font-mono fw-bold">₹{row.ltp?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`change-badge ${row.changePct >= 0 ? 'pos' : 'neg'}`}>
                        {row.changePct >= 0 ? `+${row.changePct}%` : `${row.changePct}%`}
                      </span>
                    </td>
                    {activeTab === 'volume' ? (
                      <>
                        <td className="font-mono fw-bold">{row.volume}</td>
                        <td className="font-mono">
                          <span className={`change-badge ${row.intradayPct >= 0 ? 'pos' : 'neg'}`}>
                            {row.intradayPct >= 0 ? `+${row.intradayPct}%` : `${row.intradayPct}%`}
                          </span>
                        </td>
                        <td className="font-mono text-muted">₹{row.close}</td>
                      </>
                    ) : (
                      <>
                        <td className="font-mono text-muted">₹{row.open}</td>
                        <td className="font-mono text-muted">₹{row.high}</td>
                        <td className="font-mono text-muted">₹{row.low}</td>
                        <td className="font-mono">{row.volume}</td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">No stocks matching "{searchQuery}"</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}