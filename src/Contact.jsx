const CONTACT_CHANNELS = [
  {
    label: 'Email',
    value: 'askheyfund@gmail.com',
    href: 'mailto:askheyfund@gmail.com',
    color: 'var(--primary-blue)',
    icon: '✉️',
  },
  {
    label: 'WhatsApp',
    value: '+91 89855 35534',
    href: 'https://wa.me/918985535534?text=Hi%20HeyFund%2C%20I%20have%20a%20question.',
    color: 'var(--bullish-green, #22c55e)',
    icon: '💬',
  },
  {
    label: 'Phone',
    value: '+91 89855 35534',
    href: 'tel:+918985535534',
    color: 'var(--bearish-red)',
    icon: '📞',
  },
  {
    label: 'Location',
    value: 'India',
    href: null,
    color: 'var(--text-h)',
    icon: '📍',
  },
]

// TODO: replace with your real group invite links
const COMMUNITY_GROUPS = [
  {
    label: 'WhatsApp Group',
    desc: 'Get intraday alerts, breakout levels, and quick trader chatter straight in WhatsApp.',
    href: 'https://chat.whatsapp.com/Cp0zToyXx526qQlFLgEWvK?s=cl&p=a&ilr=4',
    color: 'var(--bullish-green, #22c55e)',
    icon: '💬',
    cta: 'Join WhatsApp Group',
  },
  {
    label: 'Telegram Group',
    desc: 'Follow the same signals our team watches during market hours, posted the moment they trigger.',
    href: 'https://t.me/heyfund',
    color: 'var(--primary-blue)',
    icon: '📢',
    cta: 'Join Telegram Group',
  },
]

export default function Contact() {
  return (
    <>
      <section className="hero-block">
        <div className="hero-left">
          <h1>Let's Talk<br /><span>Trading,</span> Data & Everything Else</h1>
          <p>
            Questions about a screener column, a data mismatch, or want to partner with us?
            Reach out directly — a real trader on our team reads every message.
          </p>

          <div className="quick-features-row">
            <div className="feature-tag">⚡ Fast Response</div>
            <div className="feature-tag">🧑‍💻 Real Humans</div>
            <div className="feature-tag">🔒 No Spam</div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-right-hud">
            <div className="hud-sentiment-title">
              <span>Support Hours</span>
              <span className="sentiment-percentage">IST</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              Mon – Sat, 9:00 AM – 7:00 PM IST. Messages sent outside these hours are picked up
              first thing the next trading day.
            </p>
          </div>
        </div>
      </section>

      <div className="section-title-wrapper">
        <div className="section-title">Reach Us Directly</div>
      </div>

      <section className="sub-movers-grid">
        {CONTACT_CHANNELS.map((c) => {
          const inner = (
            <>
              <div className="mover-deck-title" style={{ color: c.color }}>
                {c.icon} {c.label}
              </div>
              <div style={{ padding: '4px 2px 8px', fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text-h)' }}>
                {c.value}
              </div>
            </>
          )
          return c.href ? (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="mover-deck-panel"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              {inner}
            </a>
          ) : (
            <div className="mover-deck-panel" key={c.label}>
              {inner}
            </div>
          )
        })}
      </section>

      <div className="section-title-wrapper">
        <div className="section-title">Join Our Trading Community</div>
      </div>

      <section className="sub-movers-grid community-grid">
        {COMMUNITY_GROUPS.map((g) => (
          <div className="mover-deck-panel community-card" key={g.label}>
            <div className="mover-deck-title" style={{ color: g.color, fontSize: 15 }}>
              {g.icon} {g.label}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.7, padding: '4px 2px 14px' }}>
              {g.desc}
            </p>
            <a
              href={g.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-green"
              style={{ boxShadow: 'none', textDecoration: 'none', display: 'inline-block' }}
            >
              {g.cta}
            </a>
          </div>
        ))}
      </section>
    </>
  )
}