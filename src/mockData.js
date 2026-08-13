// src/mockData.js

export const MOCK_GAINERS = [
  { symbol: 'TATAMOTORS', ltp: 985.40, change: 42.10, changePct: 4.46, open: 945.00, high: 991.00, low: 942.50, volume: '12.4M', sector: 'Auto' },
  { symbol: 'RELIANCE', ltp: 2940.15, change: 84.50, changePct: 2.96, open: 2860.00, high: 2955.00, low: 2855.00, volume: '8.2M', sector: 'Energy' },
  { symbol: 'INFY', ltp: 1780.00, change: 48.20, changePct: 2.78, open: 1735.00, high: 1788.00, low: 1730.00, volume: '6.7M', sector: 'IT' },
  { symbol: 'ICICIBANK', ltp: 1210.50, change: 28.30, changePct: 2.39, open: 1185.00, high: 1215.00, low: 1182.00, volume: '9.1M', sector: 'Banking' },
  { symbol: 'BHARTIARTL', ltp: 1450.80, change: 31.40, changePct: 2.21, open: 1422.00, high: 1458.00, low: 1420.00, volume: '4.3M', sector: 'Telecom' },
  { symbol: 'LT', ltp: 3620.00, change: 71.00, changePct: 2.00, open: 3555.00, high: 3635.00, low: 3550.00, volume: '3.1M', sector: 'Capital Goods' },
];

export const MOCK_LOSERS = [
  { symbol: 'HDFCBANK', ltp: 1610.20, change: -38.50, changePct: -2.33, open: 1645.00, high: 1648.00, low: 1605.00, volume: '14.2M', sector: 'Banking' },
  { symbol: 'TCS', ltp: 4120.00, change: -82.00, changePct: -1.95, open: 4195.00, high: 4200.00, low: 4110.00, volume: '3.8M', sector: 'IT' },
  { symbol: 'AXISBANK', ltp: 1145.00, change: -21.40, changePct: -1.83, open: 1165.00, high: 1168.00, low: 1140.00, volume: '5.9M', sector: 'Banking' },
  { symbol: 'SUNPHARMA', ltp: 1680.50, change: -24.10, changePct: -1.41, open: 1702.00, high: 1708.00, low: 1675.00, volume: '2.4M', sector: 'Pharma' },
  { symbol: 'MARUTI', ltp: 12350.00, change: -150.00, changePct: -1.20, open: 12480.00, high: 12510.00, low: 12300.00, volume: '1.1M', sector: 'Auto' },
];

export const MOCK_VOLUME_SHOCKERS = [
  { symbol: 'BEL', ltp: 295.40, changePct: 5.80, volume: '45.2M', avgVolume: '12.1M', spikeFactor: '3.7x' },
  { symbol: 'COALINDIA', ltp: 485.10, changePct: 3.40, volume: '28.6M', avgVolume: '8.4M', spikeFactor: '3.4x' },
  { symbol: 'HAL', ltp: 4680.00, changePct: 4.15, volume: '14.8M', avgVolume: '4.8M', spikeFactor: '3.1x' },
  { symbol: 'IOC', ltp: 172.50, changePct: -2.10, volume: '32.1M', avgVolume: '11.5M', spikeFactor: '2.8x' },
];

export const MOCK_FII_DII_FLOW = {
  summary: {
    fiiCashNet: 1420.50,
    diiCashNet: 2180.20,
    fiiFnONet: -850.40,
    date: '13 Aug 2026',
  },
  historical: [
    { date: '13 Aug 2026', fiiBuy: 12450.20, fiiSell: 11029.70, fiiNet: 1420.50, diiBuy: 9850.40, diiSell: 7670.20, diiNet: 2180.20 },
    { date: '12 Aug 2026', fiiBuy: 10890.00, fiiSell: 11420.50, fiiNet: -530.50, diiBuy: 8900.10, diiSell: 7120.00, diiNet: 1780.10 },
    { date: '11 Aug 2026', fiiBuy: 14100.80, fiiSell: 13200.00, fiiNet: 900.80, diiBuy: 7450.00, diiSell: 8100.20, diiNet: -650.20 },
    { date: '10 Aug 2026', fiiBuy: 9800.50, fiiSell: 11200.00, fiiNet: -1399.50, diiBuy: 10200.00, diiSell: 7800.50, diiNet: 2399.50 },
    { date: '07 Aug 2026', fiiBuy: 11500.00, fiiSell: 11100.00, fiiNet: 400.00, diiBuy: 8600.00, diiSell: 8200.00, diiNet: 400.00 },
  ]
  ,
  
};

export const MOCK_OI_BUILDUP = [
  // Long Build-up (Price Up ↑, OI Up ↑) -> Bullish
  { symbol: 'RELIANCE', ltp: 2940.15, changePct: 2.96, oi: '34.8M', oiChangePct: 14.20, buildup: 'long_buildup', sector: 'Energy' },
  { symbol: 'SBIN', ltp: 845.50, changePct: 1.85, oi: '42.1M', oiChangePct: 9.80, buildup: 'long_buildup', sector: 'Banking' },
  { symbol: 'TATAMOTORS', ltp: 985.40, changePct: 4.46, oi: '18.6M', oiChangePct: 12.50, buildup: 'long_buildup', sector: 'Auto' },
  { symbol: 'BHARTIARTL', ltp: 1450.80, changePct: 2.21, oi: '12.4M', oiChangePct: 7.30, buildup: 'long_buildup', sector: 'Telecom' },

  // Short Build-up (Price Down ↓, OI Up ↑) -> Bearish
  { symbol: 'HDFCBANK', ltp: 1610.20, changePct: -2.33, oi: '58.2M', oiChangePct: 16.40, buildup: 'short_buildup', sector: 'Banking' },
  { symbol: 'TCS', ltp: 4120.00, changePct: -1.95, oi: '11.5M', oiChangePct: 8.90, buildup: 'short_buildup', sector: 'IT' },
  { symbol: 'AXISBANK', ltp: 1145.00, changePct: -1.83, oi: '24.3M', oiChangePct: 11.10, buildup: 'short_buildup', sector: 'Banking' },

  // Short Covering (Price Up ↑, OI Down ↓) -> Bullish Reversal
  { symbol: 'INFY', ltp: 1780.00, changePct: 2.78, oi: '28.9M', oiChangePct: -6.40, buildup: 'short_covering', sector: 'IT' },
  { symbol: 'ICICIBANK', ltp: 1210.50, changePct: 2.39, oi: '31.2M', oiChangePct: -4.80, buildup: 'short_covering', sector: 'Banking' },

  // Long Unwinding (Price Down ↓, OI Down ↓) -> Bearish Exit
  { symbol: 'SUNPHARMA', ltp: 1680.50, changePct: -1.41, oi: '9.8M', oiChangePct: -8.20, buildup: 'long_unwinding', sector: 'Pharma' },
  { symbol: 'MARUTI', ltp: 12350.00, changePct: -1.20, oi: '4.6M', oiChangePct: -5.10, buildup: 'long_unwinding', sector: 'Auto' },
];
// Add to src/mockData.js

export const MOCK_PCR_MAXPAIN = {
  indices: [
    { symbol: 'NIFTY 50', spotPrice: 24350.80, pcr: 1.18, maxPain: 24300, totalPutOi: '85.2M', totalCallOi: '72.2M', sentiment: 'Bullish', change: '+0.12' },
    { symbol: 'BANKNIFTY', spotPrice: 52180.40, pcr: 0.82, maxPain: 52000, totalPutOi: '41.5M', totalCallOi: '50.6M', sentiment: 'Neutral', change: '-0.05' },
    { symbol: 'FINNIFTY', spotPrice: 23890.15, pcr: 0.65, maxPain: 24000, totalPutOi: '18.2M', totalCallOi: '28.0M', sentiment: 'Bearish', change: '-0.18' }
  ],
  stocks: [
    { symbol: 'RELIANCE', spotPrice: 2940.15, pcr: 1.25, maxPain: 2920, totalPutOi: '18.4M', totalCallOi: '14.7M', sentiment: 'Bullish' },
    { symbol: 'HDFCBANK', spotPrice: 1610.20, pcr: 0.68, maxPain: 1640, totalPutOi: '22.1M', totalCallOi: '32.5M', sentiment: 'Bearish' },
    { symbol: 'INFY', spotPrice: 1780.00, pcr: 1.05, maxPain: 1780, totalPutOi: '14.2M', totalCallOi: '13.5M', sentiment: 'Neutral' },
    { symbol: 'TATAMOTORS', spotPrice: 985.40, pcr: 1.35, maxPain: 960, totalPutOi: '9.8M', totalCallOi: '7.2M', sentiment: 'Bullish' },
    { symbol: 'TCS', spotPrice: 4120.00, pcr: 0.74, maxPain: 4150, totalPutOi: '6.1M', totalCallOi: '8.2M', sentiment: 'Bearish' },
    { symbol: 'ICICIBANK', spotPrice: 1210.50, pcr: 1.12, maxPain: 1200, totalPutOi: '15.6M', totalCallOi: '13.9M', sentiment: 'Bullish' },
    { symbol: 'BHARTIARTL', spotPrice: 1450.80, pcr: 1.19, maxPain: 1440, totalPutOi: '11.0M', totalCallOi: '9.2M', sentiment: 'Bullish' },
    { symbol: 'AXISBANK', spotPrice: 1145.00, pcr: 0.71, maxPain: 1160, totalPutOi: '8.4M', totalCallOi: '11.8M', sentiment: 'Bearish' },
  ]
};
// Add to src/mockData.js

export const MOCK_OPTION_CHAIN = {
  underlying: 'NIFTY 50',
  spotPrice: 24350.80,
  expiries: ['14-AUG-2026', '21-AUG-2026', '28-AUG-2026'],
  pcr: 1.18,
  maxPain: 24300,
  chain: [
    {
      strike: 24150,
      call: { oi: '1.2M', oiChgPct: -12.4, vol: '420K', iv: 14.2, ltp: 242.10, chg: 38.50 },
      put: { oi: '4.8M', oiChgPct: 22.1, vol: '1.1M', iv: 15.1, ltp: 38.20, chg: -14.10 }
    },
    {
      strike: 24200,
      call: { oi: '2.4M', oiChgPct: -8.1, vol: '850K', iv: 13.8, ltp: 202.50, chg: 32.10 },
      put: { oi: '6.2M', oiChgPct: 18.5, vol: '1.8M', iv: 14.5, ltp: 48.60, chg: -18.20 }
    },
    {
      strike: 24250,
      call: { oi: '3.8M', oiChgPct: -2.3, vol: '1.4M', iv: 13.5, ltp: 165.00, chg: 28.00 },
      put: { oi: '5.9M', oiChgPct: 12.0, vol: '2.1M', iv: 14.0, ltp: 62.10, chg: -22.50 }
    },
    {
      strike: 24300,
      call: { oi: '6.1M', oiChgPct: 14.2, vol: '2.8M', iv: 13.1, ltp: 130.40, chg: 22.80 },
      put: { oi: '7.8M', oiChgPct: 8.4, vol: '3.2M', iv: 13.6, ltp: 78.50, chg: -28.10 }
    },
    {
      strike: 24350, // ATM Strike
      isAtm: true,
      call: { oi: '8.4M', oiChgPct: 24.5, vol: '4.1M', iv: 12.8, ltp: 98.20, chg: 15.40 },
      put: { oi: '7.2M', oiChgPct: 4.1, vol: '3.9M', iv: 13.2, ltp: 96.80, chg: -31.20 }
    },
    {
      strike: 24400,
      call: { oi: '9.2M', oiChgPct: 31.0, vol: '5.2M', iv: 12.6, ltp: 71.50, chg: 8.10 },
      put: { oi: '5.1M', oiChgPct: -6.2, vol: '2.5M', iv: 13.0, ltp: 119.40, chg: -38.00 }
    },
    {
      strike: 24450,
      call: { oi: '7.5M', oiChgPct: 18.2, vol: '3.1M', iv: 12.4, ltp: 49.80, chg: 2.30 },
      put: { oi: '3.2M', oiChgPct: -14.1, vol: '1.4M', iv: 12.8, ltp: 148.00, chg: -44.50 }
    },
    {
      strike: 24500,
      call: { oi: '11.8M', oiChgPct: 42.0, vol: '6.8M', iv: 12.1, ltp: 32.10, chg: -4.20 },
      put: { oi: '2.1M', oiChgPct: -20.5, vol: '980K', iv: 12.5, ltp: 180.20, chg: -52.00 }
    }
  ]
};
// Add to src/mockData.js

export const MOCK_SECTOR_DATA = [
  { name: 'NIFTY REALTY', change: 3.10, advances: 9, declines: 1, topGainer: 'DLF (+4.8%)', topLoser: 'LODHA (-0.3%)', weightage: '1.8%' },
  { name: 'NIFTY IT', change: 2.45, advances: 8, declines: 2, topGainer: 'TCS (+3.2%)', topLoser: 'TECHM (-0.8%)', weightage: '13.5%' },
  { name: 'NIFTY AUTO', change: 1.82, advances: 12, declines: 3, topGainer: 'TATAMOTORS (+4.1%)', topLoser: 'BALKRISIND (-1.2%)', weightage: '6.2%' },
  { name: 'NIFTY BANK', change: 0.65, advances: 7, declines: 5, topGainer: 'ICICIBANK (+1.8%)', topLoser: 'AXISBANK (-1.1%)', weightage: '32.1%' },
  { name: 'NIFTY PHARMA', change: 0.15, advances: 10, declines: 10, topGainer: 'SUNPHARMA (+2.0%)', topLoser: 'CIPLA (-1.5%)', weightage: '4.8%' },
  { name: 'NIFTY FMCG', change: -0.42, advances: 4, declines: 11, topGainer: 'ITC (+0.8%)', topLoser: 'HUL (-1.9%)', weightage: '8.1%' },
  { name: 'NIFTY ENERGY', change: -0.88, advances: 2, declines: 8, topGainer: 'RELIANCE (+0.4%)', topLoser: 'NTPC (-2.2%)', weightage: '11.4%' },
  { name: 'NIFTY METAL', change: -1.25, advances: 3, declines: 12, topGainer: 'TATASTEEL (+0.5%)', topLoser: 'HINDALCO (-2.8%)', weightage: '3.9%' },
  { name: 'NIFTY PSU BANK', change: -1.95, advances: 1, declines: 11, topGainer: 'SBIN (+0.2%)', topLoser: 'PNB (-3.4%)', weightage: '2.8%' },
  { name: 'NIFTY MEDIA', change: -2.40, advances: 1, declines: 9, topGainer: 'ZEEL (+1.1%)', topLoser: 'SUNTV (-3.8%)', weightage: '0.6%' }
];
// Add to src/mockData.js

export const MOCK_GREEKS_DATA = {
  underlying: 'NIFTY 50',
  spotPrice: 24350.80,
  ivRank: 42.5,
  ivPercentile: 68.0,
  currentIv: 13.8,
  hv30: 11.2,
  expiries: ['14-AUG-2026', '21-AUG-2026', '28-AUG-2026'],
  rows: [
    {
      strike: 24150,
      call: { ltp: 242.10, iv: 14.2, delta: 0.72, gamma: 0.0012, theta: -14.50, vega: 18.20 },
      put: { ltp: 38.20, iv: 15.1, delta: -0.28, gamma: 0.0012, theta: -10.20, vega: 18.20 }
    },
    {
      strike: 24200,
      call: { ltp: 202.50, iv: 13.8, delta: 0.65, gamma: 0.0015, theta: -16.10, vega: 21.40 },
      put: { ltp: 48.60, iv: 14.5, delta: -0.35, gamma: 0.0015, theta: -11.80, vega: 21.40 }
    },
    {
      strike: 24250,
      call: { ltp: 165.00, iv: 13.5, delta: 0.58, gamma: 0.0018, theta: -17.80, vega: 24.10 },
      put: { ltp: 62.10, iv: 14.0, delta: -0.42, gamma: 0.0018, theta: -13.50, vega: 24.10 }
    },
    {
      strike: 24300,
      call: { ltp: 130.40, iv: 13.1, delta: 0.52, gamma: 0.0021, theta: -18.90, vega: 26.50 },
      put: { ltp: 78.50, iv: 13.6, delta: -0.48, gamma: 0.0021, theta: -14.80, vega: 26.50 }
    },
    {
      strike: 24350,
      isAtm: true,
      call: { ltp: 98.20, iv: 12.8, delta: 0.50, gamma: 0.0023, theta: -19.40, vega: 27.20 },
      put: { ltp: 96.80, iv: 13.2, delta: -0.50, gamma: 0.0023, theta: -15.10, vega: 27.20 }
    },
    {
      strike: 24400,
      call: { ltp: 71.50, iv: 12.6, delta: 0.42, gamma: 0.0020, theta: -18.10, vega: 25.80 },
      put: { ltp: 119.40, iv: 13.0, delta: -0.58, gamma: 0.0020, theta: -16.20, vega: 25.80 }
    },
    {
      strike: 24450,
      call: { ltp: 49.80, iv: 12.4, delta: 0.34, gamma: 0.0017, theta: -16.20, vega: 23.10 },
      put: { ltp: 148.00, iv: 12.8, delta: -0.66, gamma: 0.0017, theta: -17.50, vega: 23.10 }
    },
    {
      strike: 24500,
      call: { ltp: 32.10, iv: 12.1, delta: 0.25, gamma: 0.0014, theta: -13.80, vega: 19.80 },
      put: { ltp: 180.20, iv: 12.5, delta: -0.75, gamma: 0.0014, theta: -18.90, vega: 19.80 }
    }
  ]
};
// Add to src/mockData.js

export const MOCK_MULTI_STRIKE_OI = {
  underlying: 'NIFTY 50',
  spotPrice: 24350.80,
  expiries: ['14-AUG-2026', '21-AUG-2026', '28-AUG-2026'],
  selectedStrikes: [24200, 24300, 24400, 24500],
  strikeData: [
    { strike: 24200, callOi: '2.4M', callOiChg: '-8.1%', putOi: '6.2M', putOiChg: '+18.5%', pcr: 2.58, status: 'Strong Support' },
    { strike: 24250, callOi: '3.8M', callOiChg: '-2.3%', putOi: '5.9M', putOiChg: '+12.0%', pcr: 1.55, status: 'Support' },
    { strike: 24300, callOi: '6.1M', callOiChg: '+14.2%', putOi: '7.8M', putOiChg: '+8.4%', pcr: 1.27, status: 'Tug of War' },
    { strike: 24350, callOi: '8.4M', callOiChg: '+24.5%', putOi: '7.2M', putOiChg: '+4.1%', pcr: 0.85, status: 'ATM Pivot' },
    { strike: 24400, callOi: '9.2M', callOiChg: '+31.0%', putOi: '5.1M', putOiChg: '-6.2%', pcr: 0.55, status: 'Resistance' },
    { strike: 24500, callOi: '11.8M', callOiChg: '+42.0%', putOi: '2.1M', putOiChg: '-20.5%', pcr: 0.17, status: 'Major Resistance' }
  ],
  timeSeries: [
    { time: '09:15', spot: 24280, call24300: 4.2, put24300: 6.1, call24400: 6.5, put24400: 5.8 },
    { time: '10:30', spot: 24310, call24300: 4.8, put24300: 6.8, call24400: 7.2, put24400: 5.5 },
    { time: '12:00', spot: 24330, call24300: 5.4, put24300: 7.2, call24400: 8.1, put24400: 5.3 },
    { time: '13:30', spot: 24350, call24300: 6.1, put24300: 7.8, call24400: 9.2, put24400: 5.1 }
  ]
};

// Add to src/mockData.js

export const MOCK_OHLC_HISTORICAL = {
  symbol: 'NIFTY 50',
  spotPrice: 24350.80,
  open: 24210.50,
  high: 24410.20,
  low: 24180.00,
  close: 24350.80,
  prevClose: 24190.30,
  week52High: 24850.00,
  week52Low: 19210.00,
  history: [
    { date: '13-AUG-2026', open: 24210.50, high: 24410.20, low: 24180.00, close: 24350.80, volume: '245.2M', change: 160.50, changePct: 0.66, pattern: 'Bullish Candle' },
    { date: '12-AUG-2026', open: 24150.00, high: 24230.10, low: 24090.50, close: 24190.30, volume: '210.5M', change: 40.30, changePct: 0.17, pattern: 'Doji / Pause' },
    { date: '11-AUG-2026', open: 24300.00, high: 24320.00, low: 24100.20, close: 24150.00, volume: '280.1M', change: -150.00, changePct: -0.62, pattern: 'Bearish Engulfing' },
    { date: '10-AUG-2026', open: 24050.80, high: 24320.50, low: 24020.10, close: 24300.00, volume: '310.8M', change: 249.20, changePct: 1.04, pattern: 'Bullish Breakout' },
    { date: '07-AUG-2026', open: 24100.00, high: 24180.00, low: 23980.50, close: 24050.80, volume: '195.4M', change: -49.20, changePct: -0.20, pattern: 'Spinning Top' },
    { date: '06-AUG-2026', open: 23900.00, high: 24120.00, low: 23890.00, close: 24100.00, volume: '265.0M', change: 200.00, changePct: 0.84, pattern: 'Bullish Momentum' },
    { date: '05-AUG-2026', open: 24020.00, high: 24050.00, low: 23850.00, close: 23900.00, volume: '220.1M', change: -120.00, changePct: -0.50, pattern: 'Bearish Pullback' }
  ]
};