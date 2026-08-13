import { useState } from 'react';
import { MOCK_OPTION_CHAIN } from '../mockData';
import './Pages.css';

export default function OptionChainPage() {
  const [selectedAsset, setSelectedAsset] = useState('BANKNIFTY');
  const [selectedExpiry, setSelectedExpiry] = useState(MOCK_OPTION_CHAIN.expiries[1]);

  const { spotPrice, pcr, maxPain, chain, expiries } = MOCK_OPTION_CHAIN;

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="page-eyebrow">🎯 Option Matrix</span>
          <h1 className="page-title">Live Option Chain</h1>
          <p className="page-subtitle">Real-time Call and Put option strike matrix with ITM/OTM highlights & IV analytics.</p>
        </div>

        {/* Control Dropdowns */}
        <div className="chain-controls">
          <div className="select-group">
            <label htmlFor="underlying-select">Underlying:</label>
            <select 
              id="underlying-select"
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
            <label htmlFor="expiry-select">Expiry Date:</label>
            <select 
              id="expiry-select"
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

      {/* Spot Price & KPI Badges */}
      <div className="chain-summary-bar">
        <div className="summary-pill">
          <span className="lbl">Spot Price:</span>
          <span className="val highlight">₹{spotPrice.toLocaleString('en-IN')}</span>
        </div>
        <div className="summary-pill">
          <span className="lbl">Max Pain:</span>
          <span className="val">₹{maxPain.toLocaleString('en-IN')}</span>
        </div>
        <div className="summary-pill">
          <span className="lbl">PCR:</span>
          <span className="val text-success">{pcr} (Bullish)</span>
        </div>
      </div>

      {/* Option Chain Card */}
      <div className="data-card">
        {/* Table Header Legend */}
        <div className="chain-legend">
          <span className="legend-item calls-header">CALLS (BULLISH)</span>
          <span className="legend-itm-box">🟨 Yellow Fill = In-The-Money (ITM)</span>
          <span className="legend-item puts-header">PUTS (BEARISH)</span>
        </div>

        <div className="table-responsive">
          <table className="option-chain-table">
            <thead>
              <tr>
                {/* CALLS */}
                <th>OI</th>
                <th>OI Chg %</th>
                <th>Volume</th>
                <th>IV</th>
                <th>LTP (₹)</th>
                
                {/* STRIKE */}
                <th className="strike-col-head">STRIKE</th>
                
                {/* PUTS */}
                <th>LTP (₹)</th>
                <th>IV</th>
                <th>Volume</th>
                <th>OI Chg %</th>
                <th>OI</th>
              </tr>
            </thead>
            <tbody>
              {chain.map((row) => {
                const isCallItm = row.strike < spotPrice;
                const isPutItm = row.strike > spotPrice;

                return (
                  <tr key={row.strike} className={row.isAtm ? 'atm-row' : ''}>
                    {/* CALLS SIDE */}
                    <td className={`font-mono ${isCallItm ? 'itm-cell' : ''}`}>{row.call.oi}</td>
                    <td className={`font-mono ${isCallItm ? 'itm-cell' : ''}`}>
                      <span className={row.call.oiChgPct >= 0 ? 'text-success' : 'text-danger'}>
                        {row.call.oiChgPct >= 0 ? `+${row.call.oiChgPct}%` : `${row.call.oiChgPct}%`}
                      </span>
                    </td>
                    <td className={`font-mono ${isCallItm ? 'itm-cell' : ''}`}>{row.call.vol}</td>
                    <td className={`font-mono text-muted ${isCallItm ? 'itm-cell' : ''}`}>{row.call.iv}%</td>
                    
                    {/* CALL LTP */}
                    <td className={`font-mono fw-bold ltp-cell ${isCallItm ? 'itm-cell' : ''}`}>
                      <div className="price-wrapper">
                        <span>₹{row.call.ltp.toFixed(2)}</span>
                        <span className={`micro-chg ${row.call.chg >= 0 ? 'pos' : 'neg'}`}>
                          {row.call.chg >= 0 ? `+${row.call.chg}` : row.call.chg}
                        </span>
                      </div>
                    </td>

                    {/* CENTER STRIKE */}
                    <td className="strike-cell">
                      <div className="strike-wrapper">
                        <span className="strike-num">{row.strike}</span>
                        {row.isAtm && <span className="atm-badge">ATM</span>}
                      </div>
                    </td>

                    {/* PUT LTP */}
                    <td className={`font-mono fw-bold ltp-cell ${isPutItm ? 'itm-cell' : ''}`}>
                      <div className="price-wrapper">
                        <span>₹{row.put.ltp.toFixed(2)}</span>
                        <span className={`micro-chg ${row.put.chg >= 0 ? 'pos' : 'neg'}`}>
                          {row.put.chg >= 0 ? `+${row.put.chg}` : row.put.chg}
                        </span>
                      </div>
                    </td>

                    {/* PUTS SIDE */}
                    <td className={`font-mono text-muted ${isPutItm ? 'itm-cell' : ''}`}>{row.put.iv}%</td>
                    <td className={`font-mono ${isPutItm ? 'itm-cell' : ''}`}>{row.put.vol}</td>
                    <td className={`font-mono ${isPutItm ? 'itm-cell' : ''}`}>
                      <span className={row.put.oiChgPct >= 0 ? 'text-success' : 'text-danger'}>
                        {row.put.oiChgPct >= 0 ? `+${row.put.oiChgPct}%` : `${row.put.oiChgPct}%`}
                      </span>
                    </td>
                    <td className={`font-mono ${isPutItm ? 'itm-cell' : ''}`}>{row.put.oi}</td>
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