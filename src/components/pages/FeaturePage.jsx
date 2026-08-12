import { Link } from 'react-router-dom'
import '../dashboard/Dashboard.css'

export default function FeaturePage({
  title,
  eyebrow = 'New module',
  description,
  stats = [],
  highlights = [],
  ctaLabel = 'Back to home',
  ctaTo = '/',
}) {
  return (
    <div className="feature-page-shell">
      <div className="feature-page-card">
        <div className="feature-page-hero">
          <span className="feature-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="feature-actions">
            <Link to={ctaTo} className="feature-primary-btn">
              {ctaLabel}
            </Link>
            <Link to="/" className="feature-secondary-btn">
              Explore home
            </Link>
          </div>
        </div>

        <div className="feature-page-body">
          <div className="feature-stat-grid">
            {stats.map((item) => (
              <div key={item.label} className="feature-stat-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="feature-highlight-card">
            <h3>What you will see here</h3>
            <ul>
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
