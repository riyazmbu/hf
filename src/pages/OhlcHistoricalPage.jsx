import { useState, useEffect } from 'react';
import './pages.css';

// Base API URL - Adjust port if running on a separate host/port
const API_BASE_URL =  'http://localhost:5000';

export default function OhlcHistoricalPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY 50');
  const [timeframe, setTimeframe] = useState('Daily');
  const [searchQuery, setSearchQuery] = useState('');

  // API Data State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map frontend interval selections to backend Upstox interval parameters
  const getBackendInterval = (tf) => {
    switch (tf) {
    //   case '15m':
    //     return '15minute';
    //   case '1H':
    //     return '60minute';
      case 'Weekly':
        return 'week';
      case 'Daily':
      default:
        return 'day';
    }
  };

  // Fetch OHLC Historical Data on symbol or timeframe change
  useEffect(() => {
    let isMounted = true;
    const fetchHistoricalData = async () => {
      setLoading(true);
      setError(null);

      try {
        const intervalParam = getBackendInterval(timeframe);
        // Clean symbol for API query
        const cleanSymbol = encodeURIComponent(selectedSymbol);

        const response = await fetch(
          `${API_BASE_URL}/api/market-data/historical?symbol=${cleanSymbol}&interval=${intervalParam}`
        );

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();

        if (json.status === 'success' && json.data) {
          if (isMounted) {
            setData(json.data);
          }
        } else {
          throw new Error(json.message || 'Failed to fetch historical data.');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching OHLC history:', err);
          setError(err.message || 'Failed to load historical data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistoricalData();

    return () => {
      isMounted = false;
    };
  }, [selectedSymbol, timeframe]);

  // Extract Summary & History Records safely
  const summary = data?.summary || {};
  const history = data?.records || [];

  const spotPrice = summary.close || 0;
  const open = summary.open || 0;
  const high = summary.high || 0;
  const low = summary.low || 0;
  const prevClose = summary.prevClose || 0;
  const week52High = summary.yearHigh || high || 1;
  const week52Low = summary.yearLow || low || 1;

  // Day Range Calculation (% Position of LTP between Day's Low and High)
  const dayRangeDenom = high - low;
  const dayRangePct =
    dayRangeDenom > 0
      ? Math.min(Math.max(((spotPrice - low) / dayRangeDenom) * 100, 0), 100)
      : 50;

  // 52-Week Range Calculation (% Position of LTP between 52W Low and High)
  const week52RangeDenom = week52High - week52Low;
  const week52RangePct =
    week52RangeDenom > 0
      ? Math.min(Math.max(((spotPrice - week52Low) / week52RangeDenom) * 100, 0), 100)
      : 50;

  // Filter History Table Records
  const filteredHistory = history.filter(
    (row) =>
      row.date?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.patternSignal?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="page-eyebrow">📈 Price Action & History</span>
          <h1 className="page-title">OHLC & Historical Data</h1>
          <p className="page-subtitle">
            Track Open, High, Low, Close price action, intraday ranges, and historical candlestick patterns.
          </p>
        </div>

        {/* Symbol & Timeframe Selectors */}
        <div className="chain-controls">
          <div className="select-group">
            <label htmlFor="ohlc-symbol">Symbol:</label>
            <select
              id="ohlc-symbol"
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
            >
              <option value="NIFTY 50">NIFTY 50</option>
              <option value="BANKNIFTY">BANKNIFTY</option>
              <option value="RELIANCE">RELIANCE</option>
              <option value="TCS">TCS</option>
            </select>
          </div>

          <div className="select-group">
            <label htmlFor="ohlc-tf">Interval:</label>
            <select
              id="ohlc-tf"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              {/* <option value="15m">15 Minutes</option>
              <option value="1H">1 Hour</option> */}
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading & Error Indicators */}
      {loading && (
        <div className="loading-container" style={{ padding: '2rem', textAlign: 'center' }}>
          <p className="text-muted">Loading live OHLC candlestick data...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-container" style={{ padding: '1rem', color: '#ef4444' }}>
          <p>⚠️ Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Today's OHLC Cards & Range Meters */}
          <div className="ohlc-summary-grid">
            {/* Core Price Metrics */}
            <div className="ohlc-metrics-card">
              <div className="metric-box">
                <span className="m-label">Open</span>
                <span className="m-value">₹{open.toLocaleString('en-IN')}</span>
              </div>
              <div className="metric-box">
                <span className="m-label">High</span>
                <span className="m-value text-success">₹{high.toLocaleString('en-IN')}</span>
              </div>
              <div className="metric-box">
                <span className="m-label">Low</span>
                <span className="m-value text-danger">₹{low.toLocaleString('en-IN')}</span>
              </div>
              <div className="metric-box">
                <span className="m-label">Prev Close</span>
                <span className="m-value text-muted">₹{prevClose.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Intraday & 52-Week Range Meters */}
            <div className="range-meters-card">
              {/* Today's Range Meter */}
              <div className="range-group">
                <div className="range-header">
                  <span>Day's Low: <strong>₹{low.toLocaleString('en-IN')}</strong></span>
                  <span className="range-title">Day's Range</span>
                  <span>Day's High: <strong>₹{high.toLocaleString('en-IN')}</strong></span>
                </div>
                <div className="range-track">
                  <div className="range-fill" style={{ width: `${dayRangePct}%` }}></div>
                  <div className="range-pointer" style={{ left: `${dayRangePct}%` }}>
                    <span className="pointer-label">₹{spotPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* 52-Week Range Meter */}
              <div className="range-group">
                <div className="range-header">
                  <span>52W Low: <strong>₹{week52Low.toLocaleString('en-IN')}</strong></span>
                  <span className="range-title">52-Week Range</span>
                  <span>52W High: <strong>₹{week52High.toLocaleString('en-IN')}</strong></span>
                </div>
                <div className="range-track">
                  <div className="range-fill week52" style={{ width: `${week52RangePct}%` }}></div>
                  <div className="range-pointer week52" style={{ left: `${week52RangePct}%` }}>
                    <span className="pointer-label">₹{spotPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Data Table */}
          <div className="data-card">
            <div className="card-header-row">
              <h3>Historical OHLC Records ({timeframe})</h3>
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search date or pattern..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="light-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Open (₹)</th>
                    <th>High (₹)</th>
                    <th>Low (₹)</th>
                    <th>Close (₹)</th>
                    <th>Change (₹)</th>
                    <th>Volume</th>
                    <th>Pattern Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((row) => (
                      <tr key={row.rawTimestamp || row.date}>
                        <td className="symbol-cell">{row.date}</td>
                        <td className="font-mono">₹{row.open.toLocaleString('en-IN')}</td>
                        <td className="font-mono text-success">₹{row.high.toLocaleString('en-IN')}</td>
                        <td className="font-mono text-danger">₹{row.low.toLocaleString('en-IN')}</td>
                        <td className="font-mono fw-bold">₹{row.close.toLocaleString('en-IN')}</td>
                        <td
                          className={`font-mono fw-bold ${
                            row.change >= 0 ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {row.change >= 0
                            ? `+${row.change.toFixed(2)} (+${row.changePct}%)`
                            : `${row.change.toFixed(2)} (${row.changePct}%)`}
                        </td>
                        <td className="font-mono text-muted">{row.volumeFormatted || row.volume}</td>
                        <td>
                          <span
                            className={`pcr-badge ${
                              row.change >= 0 ? 'pcr-bullish' : 'pcr-bearish'
                            }`}
                          >
                            {row.patternSignal}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">
                        No records match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}