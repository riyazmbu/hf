import { useEffect, useState } from 'react'
import { fetchTopNews } from '../../services/googleSheets'
import './Dashboard.css'

export default function TopNewsFeed() {
  const [newsItems, setNewsItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetchTopNews().then((items) => {
      if (!cancelled) {
        setNewsItems(items)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="card-panel">
      <div className="panel-header">
        <h3>Top News</h3>
        <a href="/blog" className="view-all-link">View All</a>
      </div>
      <div className="news-list-container">
        {loading ? (
          <div className="loading-state">Loading news...</div>
        ) : (
          newsItems.map((item, index) => (
            <div className="news-card-item" key={`${item.headline}-${index}`}>
              <a href="#news-link" className="news-card-headline">
                &raquo; {item.headline}
              </a>
              <div className="news-card-meta">{item.dt || 'Today'} — {item.name || 'BSE'}</div>
            </div>
          ))
        )}
      </div>
      <div className="pagination-btns">
        <button className="page-btn">Previous</button>
        <button className="page-btn">Next</button>
      </div>
    </div>
  )
}
