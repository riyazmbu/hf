import { useCallback, useEffect, useState } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import BlogModule from './BlogModule'
import NewsModule from './NewsModule'
import AdminLogin from './AdminLogin'
import OptionChain from './OptionChain'
import Screener from './Screener'
import About from './About'
import Contact from './Contact'
import Sector from './Sector'
import MultiStrikeOiPage from './pages/MultiStrikeOiPage'
import HomeDashboard from './components/dashboard/HomeDashboard'
import AppShell from './components/layout/AppShell'
import FeaturePage from './components/pages/FeaturePage'
import DerivativesOiPage from './pages/DerivativesOiPage'
import PcrMaxPainPage from './pages/PcrMaxPainPage'
import OptionChainPage from './pages/OptionChainPage'
import './pages/pages.css';
import SectorsPage from './pages/SectorsPage'
import GreeksPage from './pages/GreeksPage'
import OhlcHistoricalPage from './pages/OhlcHistoricalPage'

import VolumeShockersPage from './pages/VolumeShockersPage'
// Update Route inside <Routes>:

import GainersLosersPage from './pages/GainersLosersPage'
import FiiDiiPage from './pages/FiiDiiPage'

const PROMO_DISMISS_KEY = 'heyfund_promo_dismissed_until'

export default function App() {
  const [navOpen, setNavOpen] = useState(false)
  const [promoVisible, setPromoVisible] = useState(false)
  const [promoDismissChecked, setPromoDismissChecked] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  function handleAdminLoginSuccess() { setIsAdminAuthenticated(true) }
  function handleAdminLogout() { setIsAdminAuthenticated(false) }
  function toggleMobileNav() { setNavOpen((open) => !open) }
  function closeMobileNav() { setNavOpen(false) }
  function openPromoModal() { setPromoVisible(true) }

  const closePromoModal = useCallback((persist) => {
    setPromoVisible(false)
    if (persist || promoDismissChecked) {
      const expiry = Date.now() + 24 * 60 * 60 * 1000
      try { localStorage.setItem(PROMO_DISMISS_KEY, String(expiry)) } catch {
        // Ignore storage errors and continue gracefully.
      }
    }
  }, [promoDismissChecked])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') closePromoModal(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closePromoModal, promoDismissChecked])

  useEffect(() => {
    const savedUntil = (() => {
      try {
        return parseInt(localStorage.getItem(PROMO_DISMISS_KEY) || '0', 10)
      } catch {
        return 0
      }
    })()
    if (Date.now() > savedUntil) {
      const t = setTimeout(openPromoModal, 2200)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <>
      <AppShell
        navOpen={navOpen}
        onToggleNav={toggleMobileNav}
        onCloseNav={closeMobileNav}
      >
        <Routes>
          <Route path="/" element={<HomeDashboard />} />
          
          {/* Market Data Routes */}
<Route path="/market-data/ltp" element={<GainersLosersPage />} />
<Route path="/market-data/fii-dii" element={<FiiDiiPage />} />          
<Route path="/market-data/historical" element={<OhlcHistoricalPage />} />          <Route path="/market-data/historical" element={<FeaturePage title="Historical Data" eyebrow="Market Data" description="Historical price action, charts, and backtesting metrics." ctaLabel="Open Screener" ctaTo="/screener" />} />
          <Route path="/market-data/fundamentals" element={<FeaturePage title="Fundamentals" eyebrow="Market Data" description="Financial statements, ratios, quarterly results, and balance sheets." ctaLabel="Open Screener" ctaTo="/screener" />} />
          <Route path="/market-data/volume-shockers" element={<VolumeShockersPage />} />
          {/* Options Data Routes */}
          <Route path="/options-data/chain" element={<OptionChain />} />
          <Route path="/options-data/greeks" element={<GreeksPage />} />
<Route path="/options-data/oi" element={<DerivativesOiPage />} />
<Route path="/options-data/pcr" element={<PcrMaxPainPage />} />
          <Route path="/options-data/max-pain" element={<FeaturePage title="Max Pain" eyebrow="Options Data" description="Expiry strike projections and maximum loss levels for option writers." ctaLabel="Open Option Chain" ctaTo="/optionchain" />} />
<Route path="/options-data/multi-strike-oi" element={<MultiStrikeOiPage />} />
          {/* Core Routes */}
          <Route
            path="/blog/:slug?"
            element={
              <BlogModule
                isAdminAuthenticated={isAdminAuthenticated}
                onLogoutAdmin={handleAdminLogout}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
<Route path="/optionchain" element={<OptionChainPage />} />
          <Route path="/sectors" element={<SectorsPage />} />
          <Route
            path="/admin"
            element={<AdminLogin onLoginSuccess={handleAdminLoginSuccess} />}
          />
          <Route path="/news" element={<NewsModule />} />
          <Route path="/screener" element={<Screener />} />
          
          {/* Features Routes */}
          <Route
            path="/features/screener"
            element={
              <FeaturePage
                title="Screener"
                eyebrow="Market scanner"
                description="A dedicated workspace for filtering stocks, sectors, and momentum setups before you trade."
                stats={[{ value: '120+', label: 'Screen criteria' }, { value: 'Live', label: 'Data status' }, { value: '24/7', label: 'Monitoring' }]}
                highlights={['Custom filters and watchlists', 'Momentum, volatility, and breakout signals', 'Ready for live market API integration']}
                ctaLabel="Open screener"
                ctaTo="/screener"
              />
            }
          />
          <Route
            path="/features/option-chain"
            element={
              <FeaturePage
                title="Option Chain"
                eyebrow="Options insights"
                description="Track OI, volume, PCR, and strike-level activity in a dedicated options view."
                stats={[{ value: 'CE/PE', label: 'Strike view' }, { value: 'Live', label: 'OI updates' }, { value: 'Custom', label: 'Watchlist' }]}
                highlights={['Open interest and volume snapshots', 'Strike-wise build-up view', 'API-ready data cards']}
                ctaLabel="Open option chain"
                ctaTo="/optionchain"
              />
            }
          />
          <Route
            path="/features/blog"
            element={
              <FeaturePage
                title="Blog"
                eyebrow="Market education"
                description="Publish educational notes, trade ideas, and tutorials in a clean content hub."
                stats={[{ value: 'Unlimited', label: 'Posts' }, { value: 'SEO', label: 'Ready' }, { value: 'Admin', label: 'Managed' }]}
                highlights={['Article cards and detail pages', 'Admin publishing workflow', 'Easy content API migration']}
                ctaLabel="Open blog"
                ctaTo="/blog"
              />
            }
          />
          <Route
            path="/features/news"
            element={
              <FeaturePage
                title="News"
                eyebrow="Market updates"
                description="Show the latest headlines, market movers, and curated insights in one place."
                stats={[{ value: 'Real-time', label: 'Feed' }, { value: 'Curated', label: 'Stories' }, { value: 'Fast', label: 'Updates' }]}
                highlights={['Latest headlines and summaries', 'Category-based filtering', 'API-ready news feed']}
                ctaLabel="Open news"
                ctaTo="/news"
              />
            }
          />
          <Route
            path="/features/sector"
            element={
              <FeaturePage
                title="Sector Analysis"
                eyebrow="Sector view"
                description="Browse sector performance and strength across the market with a dedicated analysis page."
                stats={[{ value: 'Top', label: 'Sectors' }, { value: 'Daily', label: 'Performance' }, { value: 'Custom', label: 'Filters' }]}
                highlights={['Sector rotation highlights', 'Relative strength comparisons', 'Expandable insights']}
                ctaLabel="Open sectors"
                ctaTo="/sectors"
              />
            }
          />
        </Routes>
      </AppShell>

      <footer className="platform-footer">
        <div className="footer-columns">
          <div className="footer-col">
            <div className="footer-brand-summary">
              <a href="/">
                <img src="/logo.png" alt="HeyFund Logo" style={{ height: '95px', width: 'auto', marginBottom: '8px' }} />
              </a>
            </div>
            <p className="footer-brand-summary-p">Your trusted partner in stock market research and analysis. Invest Smart, Trade Fast, Grow Future.</p>
          </div>
          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><NavLink to="/">Home</NavLink></li>
              <li><a href="/screener">Screener</a></li>
              <li><NavLink to="/blog">Blog</NavLink></li>
              <li><NavLink to="/news" onClick={closeMobileNav}>News</NavLink></li>
              <li><NavLink to="/optionchain" onClick={closeMobileNav}>Option Chain</NavLink></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><NavLink to="/about" onClick={closeMobileNav}>About</NavLink></li>
              <li><NavLink to="/contact" onClick={closeMobileNav}>Contact</NavLink></li>
              <li><NavLink to="/admin" onClick={closeMobileNav}>Admin</NavLink></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Resources</h5>
            <ul>
              <li><a href="https://www.youtube.com/@heyfund_official">YouTube Channel</a></li>
              <li><a href="https://t.me/heyfund">Telegram Group</a></li>
              <li><a href="https://www.instagram.com/donimrantrader">Instagram Channel</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <ul>
              <li>askheyfund@gmail.com</li>
              <li>+91 89855 35534</li>
              <li>India</li>
            </ul>
          </div>
        </div>

        <div className="bottom-copyright-strip">
          <div>We are not a SEBI-registered Investment Adviser or Research Analyst. All content is for educational purposes only.</div>
          <div>© 2026 HeyFund. All rights reserved.</div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <a
        className="whatsapp-float"
        id="whatsapp-btn"
        href="https://wa.me/918985535534?text=Hi%20HeyFund%2C%20I%27d%20like%20to%20know%20more%20about%20live%20market%20alerts."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with HeyFund on WhatsApp"
      >
        <span className="wa-ping"></span>
        <svg viewBox="0 0 32 32" fill="#ffffff" style={{ position: 'relative' }}>
          <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.61 1.91 6.478L4 29l7.72-1.865A11.93 11.93 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3zm6.997 16.99c-.303.85-1.5 1.556-2.457 1.76-.653.14-1.507.25-4.383-.942-3.68-1.523-6.05-5.24-6.234-5.48-.176-.24-1.487-1.98-1.487-3.78 0-1.8.94-2.685 1.28-3.05.29-.31.63-.39.85-.39.213 0 .427.002.614.012.196.01.46-.075.72.548.27.65.917 2.245.996 2.408.08.16.132.35.026.56-.107.21-.16.34-.32.523-.16.184-.336.41-.48.55-.16.16-.326.334-.14.654.186.32.827 1.365 1.775 2.21 1.22 1.088 2.25 1.425 2.57 1.585.32.16.507.134.694-.08.186-.213.8-.933 1.014-1.253.213-.32.427-.267.72-.16.293.107 1.858.876 2.177 1.036.32.16.533.24.613.373.08.134.08.774-.223 1.624z" />
        </svg>
      </a>

      {/* Promo Modal */}
      <div
        className={`modal-overlay ${promoVisible ? 'visible' : ''}`}
        id="promo-modal-overlay"
        onClick={(e) => {
          if (e.target.id === 'promo-modal-overlay') closePromoModal(false)
        }}
      >
        <div className="promo-modal-card" role="dialog" aria-modal="true">
          <div className="promo-modal-banner">
            <button className="modal-close-btn" onClick={() => closePromoModal(true)}>✕</button>
            <div className="promo-modal-eyebrow">🔥 Limited Time Offer</div>
            <h4>Get Free Live Trade Alerts on Telegram</h4>
          </div>
          <div className="promo-modal-body">
            <p>Join thousands of active traders receiving real-time long/short build-up signals, intraday levels, and breakout alerts.</p>
            <div className="promo-modal-actions">
              <a href="https://t.me/heyfund" className="btn-green" style={{ display: 'inline-block' }}>Join Telegram Free</a>
              <button className="btn-outline" onClick={() => closePromoModal(false)}>Maybe Later</button>
            </div>
            <label className="modal-dismiss-note">
              <input
                type="checkbox"
                checked={promoDismissChecked}
                onChange={(e) => setPromoDismissChecked(e.target.checked)}
              />
              Don't show this again
            </label>
          </div>
        </div>
      </div>
    </>
  )
}