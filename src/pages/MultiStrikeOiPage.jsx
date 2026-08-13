import { useState } from 'react';
import { MOCK_MULTI_STRIKE_OI } from '../mockData';
import './pages.css';

export default function MultiStrikeOiPage() {
  const [selectedAsset, setSelectedAsset] = useState('NIFTY 50');
  const [selectedExpiry, setSelectedExpiry] = useState(MOCK_MULTI_STRIKE_OI.expiries[0]);
  const [activeStrikes, setActiveStrikes] = useState([24200, 24300, 24400, 24500]);

  const { spotPrice, expiries, strikeData } = MOCK_MULTI_STRIKE_OI;

  const toggleStrike = (strike) => {
    if (activeStrikes.includes(strike)) {
      if (activeStrikes.length > 1) {
        setActiveStrikes(activeStrikes.filter((s) => s !== strike));
      }
    } else {
      setActiveStrikes([...activeStrikes, strike]);
    }
  };

  const filteredData = strikeData.filter((row) => activeStrikes.includes(row.strike));

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="page-eyebrow">📊 Strike Battlefront</span>
          <h1 className="page-title">Multi-Strike Open Interest</h1>
          <p className="page-subtitle">Analyze Call vs. Put OI concentration across active strikes to identify institutional support/resistance.</p>
        </div>

        {/* Controls */}
        <div className="chain-controls">
          <div className="select-group">
            <label htmlFor="multi-asset">Underlying:</label>
            <select
              id="multi-asset"
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
            >
              <option value="NIFTY 50">NIFTY 50</option>
              <option value="BANKNIFTY">BANKNIFTY</option>
              <option value="FINNIFTY">FINNIFTY</option>
            </select>
          </div>

          <div className="select-group">
            <label htmlFor="multi-expiry">Expiry Date:</label>
            <select
              id="multi-expiry"
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
            >
              {expiries.map((exp) => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Strike Selector Bar */}
      <div className="strike-picker-card">
        <span className="picker-label">Select Strikes to Compare:</span>
        <div className="picker-badges">
          {strikeData.map((s) => {
            const isChecked = activeStrikes.includes(s.strike);
            return (
              <button
                key={s.strike}
                className={`strike-chip ${isChecked ? 'active' : ''}`}
                onClick={() => toggleStrike(s.strike)}
              >
                {isChecked ? '✓' : '+'} {s.strike}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Call vs Put OI Battle Cards */}
      <div className="oi-battle-grid">
        {filteredData.map((row) => {
          const callOiNum = parseFloat(row.callOi);
          const putOiNum = parseFloat(row.putOi);
          const totalOi = callOiNum + putOiNum;
          const callPct = Math.round((callOiNum / totalOi) * 100);
          const putPct = 100 - callPct;

          return (
            <div key={row.strike} className="battle-card">
              <div className="battle-header">
                <span className="battle-strike">Strike ₹{row.strike}</span>
                <span className={`status-pill ${row.pcr >= 1 ? 'bull' : 'bear'}`}>{row.status}</span>
              </div>

              {/* Progress Bar Visual */}
              <div className="battle-bar-container">
                <div className="battle-bar-labels">
                  <span className="call-lbl">Call OI: {row.callOi} ({callPct}%)</span>
                  <span className="put-lbl">Put OI: {row.putOi} ({putPct}%)</span>
                </div>
                <div className="battle-progress-bar">
                  <div className="bar-calls" style={{ width: `${callPct}%` }}></div>
                  <div className="bar-puts" style={{ width: `${putPct}%` }}></div>
                </div>
              </div>

              <div className="battle-footer">
                <span>PCR: <strong>{row.pcr}</strong></span>
                <span>Call Chg: <strong className={row.callOiChg.startsWith('+') ? 'text-danger' : 'text-success'}>{row.callOiChg}</strong></span>
                <span>Put Chg: <strong className={row.putOiChg.startsWith('+') ? 'text-success' : 'text-danger'}>{row.putOiChg}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi Strike Table */}
      <div className="data-card">
        <div className="card-header-row">
          <h3>Strike-by-Strike Open Interest Breakdown</h3>
          <span className="spot-tag">Spot Price: <strong>₹{spotPrice.toLocaleString('en-IN')}</strong></span>
        </div>

        <div className="table-responsive">
          <table className="light-table">
            <thead>
              <tr>
                <th>Strike Price</th>
                <th>Call OI (Resistance)</th>
                <th>Call OI Chg %</th>
                <th>Put OI (Support)</th>
                <th>Put OI Chg %</th>
                <th>Strike PCR</th>
                <th>Dominant Bias</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.strike}>
                  <td className="symbol-cell">₹{row.strike}</td>
                  <td className="font-mono text-danger fw-bold">{row.callOi}</td>
                  <td className={`font-mono ${row.callOiChg.startsWith('+') ? 'text-danger' : 'text-success'}`}>{row.callOiChg}</td>
                  <td className="font-mono text-success fw-bold">{row.putOi}</td>
                  <td className={`font-mono ${row.putOiChg.startsWith('+') ? 'text-success' : 'text-danger'}`}>{row.putOiChg}</td>
                  <td className="font-mono fw-bold">{row.pcr}</td>
                  <td>
                    <span className={`pcr-badge ${row.pcr >= 1.1 ? 'pcr-bullish' : row.pcr <= 0.75 ? 'pcr-bearish' : 'pcr-neutral'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}