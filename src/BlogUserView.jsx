import React, { useState } from 'react'
import { MessageSquare, Send, Eye, Clock, User, ArrowLeft } from 'lucide-react'

export default function BlogUserView({ posts, comments, onAddComment, onSwitchToAdmin }) {
  const [selectedPost, setSelectedPost] = useState(null)
  
  // New Comment Form State
  const [author, setAuthor] = useState('')
  const [email, setEmail] = useState('')
  const [commentText, setCommentText] = useState('')
  const [submittedNotice, setSubmittedNotice] = useState(false)

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (!author.trim() || !commentText.trim()) return

    onAddComment({
      id: Date.now(),
      postId: selectedPost.id,
      postTitle: selectedPost.title,
      author,
      email,
      comment: commentText,
      status: 'Pending', // Sent to Admin for review
      createdAt: new Date().toLocaleString(),
      reply: ''
    })

    setAuthor('')
    setEmail('')
    setCommentText('')
    setSubmittedNotice(true)
    setTimeout(() => setSubmittedNotice(false), 4000)
  }

  // Filter approved comments for the current post
  const activePostComments = selectedPost
    ? comments.filter((c) => c.postId === selectedPost.id && c.status === 'Approved')
    : []

  return (
    <div className="user-view-container">
      {/* Top Bar */}
      <header className="user-navbar">
        <div className="brand">📰 DevPulse Blog</div>
        <button className="admin-switch-btn" onClick={onSwitchToAdmin}>
          Admin Dashboard →
        </button>
      </header>

      <main className="user-content">
        {selectedPost ? (
          /* READ ARTICLE VIEW */
          <article className="full-article">
            <button className="back-btn" onClick={() => setSelectedPost(null)}>
              <ArrowLeft size={16} /> Back to Articles
            </button>

            <header className="article-header">
              <span className="badge category-badge">{selectedPost.category}</span>
              <h1>{selectedPost.title}</h1>
              <div className="article-meta">
                <span><User size={14} /> {selectedPost.author}</span>
                <span><Clock size={14} /> {selectedPost.publishedAt}</span>
                <span><Eye size={14} /> {selectedPost.views} views</span>
              </div>
            </header>

            <div className="article-body">
              <p>{selectedPost.content}</p>
            </div>

            {/* Comments Section */}
            <section className="comments-section">
              <h3>Discussion ({activePostComments.length})</h3>

              {/* Submit Comment Form */}
              <form onSubmit={handleCommentSubmit} className="user-comment-form">
                <h4>Leave a Comment</h4>
                {submittedNotice && (
                  <div className="notice-success">
                    Your comment was submitted and is pending admin approval!
                  </div>
                )}
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <textarea
                  rows={4}
                  placeholder="Share your thoughts..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                ></textarea>
                <button type="submit" className="btn-primary">
                  <Send size={14} /> Submit Comment
                </button>
              </form>

              {/* Approved Comments List */}
              <div className="user-comments-list">
                {activePostComments.length === 0 ? (
                  <p className="empty-text">No comments yet. Be the first to start the conversation!</p>
                ) : (
                  activePostComments.map((c) => (
                    <div key={c.id} className="user-comment-card">
                      <div className="comment-meta">
                        <strong>{c.author}</strong> • <span className="sub-text">{c.createdAt}</span>
                      </div>
                      <p>{c.comment}</p>

                      {c.reply && (
                        <div className="admin-reply-box">
                          <strong>Admin Reply:</strong> {c.reply}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </article>
        ) : (
          /* ARTICLES FEED VIEW */
          <div className="blog-feed">
            <header className="feed-header">
              <h1>Latest Articles</h1>
              <p>Explore ideas, tutorials, and tech insights.</p>
            </header>

            <div className="articles-grid">
              {posts
                .filter((p) => p.status === 'Published')
                .map((post) => (
                  <div
                    key={post.id}
                    className="article-card"
                    onClick={() => setSelectedPost(post)}
                  >
                    <span className="badge category-badge">{post.category}</span>
                    <h2>{post.title}</h2>
                    <p>{post.content.substring(0, 120)}...</p>
                    <div className="card-footer">
                      <span>{post.publishedAt}</span>
                      <span className="read-more">Read Article →</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}