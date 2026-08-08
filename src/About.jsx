import { useNavigate } from 'react-router-dom'

const STATS = [
  { label: 'ACTIVE TRADERS', val: '300+', cls: 'up' },
  { label: 'REFRESH INTERVAL', val: '<15s', cls: 'up' },
  { label: 'MARKET COVERAGE', val: '24/7', cls: 'up' },
]

const PIPELINE_STEPS = [
  {
    title: 'Ingest',
    color: 'var(--primary-blue)',
    desc: 'We pull raw price, volume and open-interest data straight from exchange-linked feeds the moment the market moves — no batch delays, no stale snapshots.',
  },
  {
    title: 'Process',
    color: 'var(--bullish-green, #22c55e)',
    desc: 'Every tick is run through our screener logic — long build-up, short covering, gap scans, breakout levels — so signals are pre-filtered before you ever see them.',
  },
  {
    title: 'Deliver',
    color: 'var(--bearish-red)',
    desc: 'Results land on your dashboard and Telegram in real time. What you see is what the market is doing right now, not what it did ten minutes ago.',
  },
]

const VALUES = [
  {
    title: 'Speed Over Noise',
    desc: 'A dashboard full of numbers is not the same as a trader who knows what to do. We surface the handful of moves that matter and cut the rest.',
  },
  {
    title: 'Transparent Data',
    desc: 'Every figure on HeyFund traces back to a live sheet you could open yourself. No black-box scores, no vague "AI signals" dressed up as certainty.',
  },
  {
    title: 'Built By Traders',
    desc: 'HeyFund started as a personal screener for NF/BNF and intraday setups. We still trade with it every session — it has to work for us before it ships for you.',
  },
]

export default function About() {
  const navigate = useNavigate()

  return (
    <>
      <section className="hero-block">
        <div className="hero-left">
          <h1>Built by Traders,<br /><span>Powered by</span> Live Data</h1>
          <p>
            HeyFund turns raw exchange data into a screener that reacts as fast as the market does.
            No delayed feeds, no recycled tips — just structured, real-time intelligence for people
            who trade for a living and people learning to.
          </p>

          <div className="quick-features-row">
            <div className="feature-tag">📊 Live Screener</div>
            <div className="feature-tag">⚡ Sub-10s Refresh</div>
            <div className="feature-tag">🎯 Built-in Discipline</div>
          </div>

          <div className="cta-group">
            <button className="btn-green" onClick={() => navigate('/#screener-section')}>
              Open Screener Workspace
            </button>
            <button className="btn-outline" onClick={() => navigate('/contact')}>
              Talk To Us
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-right-hud">
            <div className="hud-sentiment-title">
              <span>Our Story</span>
              <span className="sentiment-percentage">Since 2025</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              We built HeyFund because every screener we tried was either too slow to trust
              intraday, or too locked-down to verify. So we wired our own dashboard directly
              to live market sheets — and started sharing it with traders who wanted the same.
            </p>
          </div>
        </div>
      </section>

      <section className="indices-grid">
        {STATS.map((s) => (
          <div className="index-card" key={s.label}>
            <div className="label">{s.label}</div>
            <div className="val">{s.val}</div>
            <div className={`change ${s.cls}`}>Live &amp; counting</div>
          </div>
        ))}
      </section>

      <div className="section-title-wrapper">
        <div className="section-title">How Our Data Pipeline Works</div>
      </div>

      <section className="sub-movers-grid">
        {PIPELINE_STEPS.map((step, i) => (
          <div className="mover-deck-panel" key={step.title}>
            <div className="mover-deck-title" style={{ color: step.color }}>
              {String(i + 1).padStart(2, '0')} · {step.title}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.7, padding: '4px 2px 8px' }}>
              {step.desc}
            </p>
          </div>
        ))}
      </section>

      <div className="section-title-wrapper">
        <div className="section-title">What We Stand For</div>
      </div>

      <section className="sub-movers-grid">
        {VALUES.map((v) => (
          <div className="mover-deck-panel" key={v.title}>
            <div className="mover-deck-title" style={{ color: 'var(--text-h)' }}>{v.title}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.7, padding: '4px 2px 8px' }}>
              {v.desc}
            </p>
          </div>
        ))}
      </section>

      <section className="newsletter-banner">
        <div className="banner-left">
          <h3>Want the Screener in Your Pocket?</h3>
          <p>Join our Telegram for the same signals we watch during market hours, delivered as they happen.</p>
        </div>
        <div className="banner-right-form">
          <a
            href="https://wa.me/918985535534?text=Hi%20HeyFund%2C%20I%27d%20like%20to%20know%20more%20about%20live%20market%20alerts."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-green"
            style={{ padding: '12px 24px', boxShadow: 'none', whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block' }}
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </>
  )
}