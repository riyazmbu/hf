import { useState, useEffect } from 'react';
import './Pages.css';

const API_BASE_URL = 'http://localhost:5000'; // Adjust if your server uses a different host or port

export default function FiiDiiPage() {
  const [fiiDiiData, setFiiDiiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFiiDiiData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/market-data/fii-dii`);
        if (!response.ok) {
          throw new Error(`Server HTTP error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (isMounted && result.status === 'success') {
          setFiiDiiData(result.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching FII/DII flow tracker data:', err);
          setError('Failed to load institutional flow data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial Fetch
    fetchFiiDiiData();

    // Poll for updates every 60 seconds
    const intervalId = setInterval(fetchFiiDiiData, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
          Loading live FII / DII institutional flows...
        </div>
      </div>
    );
  }

  const summary = fiiDiiData?.summary || {};
  const asOfDate = fiiDiiData?.asOf || summary?.date || 'N/A';
  const historical = fiiDiiData?.breakdown || [];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="page-eyebrow">🧠 Institutional Activity</span>
          <h1 className="page-title">FII / DII Flow Tracker</h1>
          <p className="page-subtitle">Track Foreign & Domestic Institutional Investors net buying and selling in Cash and F&O.</p>
        </div>
        <div className="date-badge">As of {asOfDate}</div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner" style={{ color: '#f87171', padding: '10px 0', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Key Metric Summary Cards */}
      <div className="metric-cards-grid">
        <div className="metric-card">
          <span className="metric-label">FII Cash Net Flow</span>
          <div className={`metric-value ${summary.fiiCashNet >= 0 ? 'pos' : 'neg'}`}>
            {summary.fiiCashNet >= 0 ? `+₹${summary.fiiCashNet} Cr` : `-₹${Math.abs(summary.fiiCashNet)} Cr`}
          </div>
          <span className="metric-status">
            {summary.fiiCashNet >= 0 ? '🟢 Net Buyers' : '🔴 Net Sellers'}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">DII Cash Net Flow</span>
          <div className={`metric-value ${summary.diiCashNet >= 0 ? 'pos' : 'neg'}`}>
            {summary.diiCashNet >= 0 ? `+₹${summary.diiCashNet} Cr` : `-₹${Math.abs(summary.diiCashNet)} Cr`}
          </div>
          <span className="metric-status">
            {summary.diiCashNet >= 0 ? '🟢 Net Buyers' : '🔴 Net Sellers'}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">FII F&O Net Flow</span>
          <div className={`metric-value ${summary.fiiFnONet >= 0 ? 'pos' : 'neg'}`}>
            {summary.fiiFnONet >= 0 ? `+₹${summary.fiiFnONet} Cr` : `-₹${Math.abs(summary.fiiFnONet)} Cr`}
          </div>
          <span className="metric-status">
            {summary.fiiFnONet >= 0 ? '📈 Long Bias' : '📉 Short Bias'}
          </span>
        </div>
      </div>

      {/* Historical Breakdown Table */}
      <div className="data-card">
        <div className="card-header-row">
          <h3>Daywise Institutional Breakdown (₹ Crores)</h3>
        </div>
        <div className="table-responsive">
          <table className="light-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>FII Gross Buy</th>
                <th>FII Gross Sell</th>
                <th>FII Net</th>
                <th>DII Gross Buy</th>
                <th>DII Gross Sell</th>
                <th>DII Net</th>
              </tr>
            </thead>
            <tbody>
              {historical.length > 0 ? (
                historical.map((row) => {
                  const fiiBuy = row.fiiGrossBuy ?? row.fiiBuy ?? 0;
                  const fiiSell = row.fiiGrossSell ?? row.fiiSell ?? 0;
                  const diiBuy = row.diiGrossBuy ?? row.diiBuy ?? 0;
                  const diiSell = row.diiGrossSell ?? row.diiSell ?? 0;

                  return (
                    <tr key={row.date}>
                      <td className="fw-bold">{row.date}</td>
                      <td className="font-mono">₹{fiiBuy.toLocaleString('en-IN')}</td>
                      <td className="font-mono">₹{fiiSell.toLocaleString('en-IN')}</td>
                      <td className="font-mono">
                        <span className={`pill-badge ${row.fiiNet >= 0 ? 'pos' : 'neg'}`}>
                          {row.fiiNet >= 0 ? `+₹${row.fiiNet}` : `-₹${Math.abs(row.fiiNet)}`}
                        </span>
                      </td>
                      <td className="font-mono">₹{diiBuy.toLocaleString('en-IN')}</td>
                      <td className="font-mono">₹{diiSell.toLocaleString('en-IN')}</td>
                      <td className="font-mono">
                        <span className={`pill-badge ${row.diiNet >= 0 ? 'pos' : 'neg'}`}>
                          {row.diiNet >= 0 ? `+₹${row.diiNet}` : `-₹${Math.abs(row.diiNet)}`}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No historical institutional breakdown data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}