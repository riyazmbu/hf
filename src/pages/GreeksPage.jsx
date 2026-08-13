import { useState } from 'react';
import { MOCK_GREEKS_DATA } from '../mockData';
import './Pages.css';

export default function GreeksPage() {
  const [selectedAsset, setSelectedAsset] = useState('NIFTY 50');
  const [selectedExpiry, setSelectedExpiry] = useState(MOCK_GREEKS_DATA.expiries[0]);

  const { spotPrice, ivRank, ivPercentile, currentIv, hv30, expiries, rows } = MOCK_GREEKS_DATA;

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="page-eyebrow">⚡ Pricing Models</span>
          <h1 className="page-title">Option Greeks & Volatility Hub</h1>
          <p className="page-subtitle">Evaluate Delta ($\Delta$), Gamma ($\Gamma$), Theta ($\Theta$), Vega ($\nu$), and IV surface across contract strikes.</p>
        </div>

        {/* Controls */}
        <div className="chain-controls">
          <div className="select-group">
            <label htmlFor="greeks-asset">Underlying:</label>
            <select
              id="greeks-asset"
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
            >
              <option value="NIFTY 50">NIFTY 50</option>
              <option value="BANKNIFTY">BANKNIFTY</option>
              <option value="FINNIFTY">FINNIFTY</option>
              <option value="RELIANCE">RELIANCE</option>
            </select>
          </div>

          <div className="select-group">
            <label htmlFor="greeks-expiry">Expiry Date:</label>
            <select
              id="greeks-expiry"
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

      {/* Volatility & KPI Bar */}
      <div className="greeks-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Spot Price</span>
          <span className="kpi-value highlight">₹{spotPrice.toLocaleString('en-IN')}</span>
          <span className="kpi-subtext">Current Market Price</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Implied Volatility (IV)</span>
          <span className="kpi-value">{currentIv}%</span>
          <span className="kpi-subtext">30-Day HV: {hv30}%</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">IV Rank (IVR)</span>
          <span className="kpi-value text-primary">{ivRank}</span>
          <span className="kpi-subtext">52-Week Range Position</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">IV Percentile (IVP)</span>
          <span className="kpi-value text-success">{ivPercentile}%</span>
          <span className="kpi-subtext">Days IV was lower</span>
        </div>
      </div>

      {/* Option Greeks Matrix */}
      <div className="data-card">
        <div className="chain-legend">
          <span className="legend-item calls-header">CALL GREEKS (BULLISH)</span>
          <span className="legend-itm-box">🟨 ITM = In-The-Money Contracts</span>
          <span className="legend-item puts-header">PUT GREEKS (BEARISH)</span>
        </div>

        <div className="table-responsive">
          <table className="option-chain-table greeks-table">
            <thead>
              <tr>
                {/* CALL GREEKS */}
                <th>Vega (ν)</th>
                <th>Theta (Θ)</th>
                <th>Gamma (Γ)</th>
                <th>Delta (Δ)</th>
                <th>IV %</th>
                <th>LTP (₹)</th>

                {/* STRIKE */}
                <th className="strike-col-head">STRIKE</th>

                {/* PUT GREEKS */}
                <th>LTP (₹)</th>
                <th>IV %</th>
                <th>Delta (Δ)</th>
                <th>Gamma (Γ)</th>
                <th>Theta (Θ)</th>
                <th>Vega (ν)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isCallItm = row.strike < spotPrice;
                const isPutItm = row.strike > spotPrice;

                return (
                  <tr key={row.strike} className={row.isAtm ? 'atm-row' : ''}>
                    {/* CALL SIDE */}
                    <td className={`font-mono ${isCallItm ? 'itm-cell' : ''}`}>{row.call.vega.toFixed(2)}</td>
                    <td className={`font-mono text-danger ${isCallItm ? 'itm-cell' : ''}`}>{row.call.theta.toFixed(2)}</td>
                    <td className={`font-mono ${isCallItm ? 'itm-cell' : ''}`}>{row.call.gamma.toFixed(4)}</td>
                    <td className={`font-mono fw-bold text-success ${isCallItm ? 'itm-cell' : ''}`}>{row.call.delta.toFixed(2)}</td>
                    <td className={`font-mono text-muted ${isCallItm ? 'itm-cell' : ''}`}>{row.call.iv}%</td>
                    <td className={`font-mono fw-bold ${isCallItm ? 'itm-cell' : ''}`}>₹{row.call.ltp.toFixed(2)}</td>

                    {/* CENTER STRIKE */}
                    <td className="strike-cell">
                      <div className="strike-wrapper">
                        <span className="strike-num">{row.strike}</span>
                        {row.isAtm && <span className="atm-badge">ATM</span>}
                      </div>
                    </td>

                    {/* PUT SIDE */}
                    <td className={`font-mono fw-bold ${isPutItm ? 'itm-cell' : ''}`}>₹{row.put.ltp.toFixed(2)}</td>
                    <td className={`font-mono text-muted ${isPutItm ? 'itm-cell' : ''}`}>{row.put.iv}%</td>
                    <td className={`font-mono fw-bold text-danger ${isPutItm ? 'itm-cell' : ''}`}>{row.put.delta.toFixed(2)}</td>
                    <td className={`font-mono ${isPutItm ? 'itm-cell' : ''}`}>{row.put.gamma.toFixed(4)}</td>
                    <td className={`font-mono text-danger ${isPutItm ? 'itm-cell' : ''}`}>{row.put.theta.toFixed(2)}</td>
                    <td className={`font-mono ${isPutItm ? 'itm-cell' : ''}`}>{row.put.vega.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}