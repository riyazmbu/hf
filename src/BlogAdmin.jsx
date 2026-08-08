import React, { useState } from 'react'
import {
  BarChart3,
  CheckCircle,
  FileText,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  Eye,
  XCircle,
  Search,
  Filter,
  CornerDownRight,
  Clock,
  ArrowLeft
} from 'lucide-react'

export default function BlogAdmin({ posts, setPosts, comments, setComments, onSwitchToUser }) {
  const [activeTab, setActiveTab] = useState('posts') // 'posts' | 'comments' | 'dashboard'
  const [postSearch, setPostSearch] = useState('')
  const [editingPost, setEditingPost] = useState(null)
  
  const [commentFilter, setCommentFilter] = useState('All')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  const [formPost, setFormPost] = useState({
    title: '',
    category: 'Development',
    status: 'Published',
    content: ''
  })

  // --- POSTS CRUD ---
  const handleOpenPostForm = (post = null) => {
    if (post) {
      setEditingPost(post)
      setFormPost({
        title: post.title,
        category: post.category,
        status: post.status,
        content: post.content
      })
    } else {
      setEditingPost({ id: 'new' })
      setFormPost({
        title: '',
        category: 'Development',
        status: 'Published',
        content: ''
      })
    }
  }

  const handleSavePost = (e) => {
    e.preventDefault()
    if (!formPost.title.trim()) return

    if (editingPost.id === 'new') {
      const newPost = {
        id: Date.now(),
        title: formPost.title,
        slug: formPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        author: 'Admin',
        category: formPost.category,
        status: formPost.status,
        content: formPost.content,
        publishedAt: new Date().toISOString().split('T')[0],
        views: 0
      }
      setPosts([newPost, ...posts])
    } else {
      setPosts(
        posts.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                title: formPost.title,
                slug: formPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                category: formPost.category,
                status: formPost.status,
                content: formPost.content
              }
            : p
        )
      )
    }
    setEditingPost(null)
  }

  const handleDeletePost = (id) => {
    if (window.confirm('Delete this blog post and its associated comments?')) {
      setPosts(posts.filter((p) => p.id !== id))
      setComments(comments.filter((c) => c.postId !== id))
    }
  }

  // --- COMMENTS MODERATION ---
  const handleUpdateCommentStatus = (id, status) => {
    setComments(comments.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  const handleDeleteComment = (id) => {
    if (window.confirm('Delete this comment permanently?')) {
      setComments(comments.filter((c) => c.id !== id))
    }
  }

  const handleSaveReply = (id) => {
    setComments(
      comments.map((c) => (c.id === id ? { ...c, reply: replyText, status: 'Approved' } : c))
    )
    setReplyingTo(null)
    setReplyText('')
  }

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(postSearch.toLowerCase())
  )

  const filteredComments = comments.filter((c) => {
    if (commentFilter === 'All') return true
    return c.status === commentFilter
  })

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="brand-header">
          <h2>⚡ StudioAdmin</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => { setActiveTab('posts'); setEditingPost(null); }}
          >
            <FileText size={18} /> Posts ({posts.length})
          </button>
          <button
            className={`nav-item ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('comments'); setEditingPost(null); }}
          >
            <MessageSquare size={18} /> Comments ({comments.length})
          </button>
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setEditingPost(null); }}
          >
            <BarChart3 size={18} /> Analytics
          </button>
        </nav>

        <button className="user-switch-btn" onClick={onSwitchToUser}>
          <ArrowLeft size={16} /> Public Site
        </button>
      </aside>

      <main className="admin-viewport">
        {activeTab === 'posts' && (
          <div>
            {editingPost ? (
              /* CREATE / EDIT FORM */
              <div className="editor-card">
                <div className="editor-header">
                  <h2>{editingPost.id === 'new' ? 'Create Post' : 'Edit Post'}</h2>
                  <button className="btn-secondary" onClick={() => setEditingPost(null)}>
                    Cancel
                  </button>
                </div>
                <form onSubmit={handleSavePost} className="admin-form">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={formPost.title}
                      onChange={(e) => setFormPost({ ...formPost, title: e.target.value })}
                      placeholder="Title..."
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={formPost.category}
                        onChange={(e) => setFormPost({ ...formPost, category: e.target.value })}
                      >
                        <option value="Development">Development</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Design">Design</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={formPost.status}
                        onChange={(e) => setFormPost({ ...formPost, status: e.target.value })}
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Content</label>
                    <textarea
                      rows={8}
                      value={formPost.content}
                      onChange={(e) => setFormPost({ ...formPost, content: e.target.value })}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </form>
              </div>
            ) : (
              /* POSTS LIST TABLE */
              <div>
                <header className="page-header flex-between">
                  <div>
                    <h1>Manage Articles</h1>
                    <p>Full CRUD controls for blog posts.</p>
                  </div>
                  <button className="btn-primary" onClick={() => handleOpenPostForm()}>
                    <Plus size={16} /> New Article
                  </button>
                </header>

                <div className="table-controls">
                  <div className="search-bar">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search title..."
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-viewport">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPosts.map((post) => (
                        <tr key={post.id}>
                          <td><strong>{post.title}</strong></td>
                          <td><span className="badge category-badge">{post.category}</span></td>
                          <td>
                            <span className={`badge status-${post.status.toLowerCase()}`}>
                              {post.status}
                            </span>
                          </td>
                          <td>{post.publishedAt}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="icon-btn edit"
                                onClick={() => handleOpenPostForm(post)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="icon-btn delete"
                                onClick={() => handleDeletePost(post.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMMENTS TAB */}
        {activeTab === 'comments' && (
          <div>
            <header className="page-header">
              <h1>Moderate Comments</h1>
              <p>Approve reader comments or reply directly.</p>
            </header>

            <div className="table-controls">
              <div className="filter-group">
                <Filter size={16} />
                {['All', 'Approved', 'Pending', 'Spam'].map((status) => (
                  <button
                    key={status}
                    className={`filter-btn ${commentFilter === status ? 'active' : ''}`}
                    onClick={() => setCommentFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="comments-stream">
              {filteredComments.map((comment) => (
                <div key={comment.id} className="comment-card">
                  <div className="comment-card-header">
                    <div>
                      <strong>{comment.author}</strong> on <em>"{comment.postTitle}"</em>
                    </div>
                    <span className={`badge status-${comment.status.toLowerCase()}`}>
                      {comment.status}
                    </span>
                  </div>
                  <p className="comment-body">{comment.comment}</p>

                  {comment.reply && (
                    <div className="admin-reply-box">
                      <CornerDownRight size={16} />
                      <div><strong>Your Reply:</strong> {comment.reply}</div>
                    </div>
                  )}

                  {replyingTo === comment.id && (
                    <div className="reply-form">
                      <textarea
                        rows={2}
                        placeholder="Admin response..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      ></textarea>
                      <button className="btn-primary" onClick={() => handleSaveReply(comment.id)}>
                        Submit Reply & Approve
                      </button>
                    </div>
                  )}

                  <div className="comment-card-footer">
                    <span className="date-stamp">{comment.createdAt}</span>
                    <div className="btn-group">
                      {comment.status !== 'Approved' && (
                        <button
                          className="btn-approve"
                          onClick={() => handleUpdateCommentStatus(comment.id, 'Approved')}
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                      )}
                      {comment.status !== 'Spam' && (
                        <button
                          className="btn-reject"
                          onClick={() => handleUpdateCommentStatus(comment.id, 'Spam')}
                        >
                          <XCircle size={14} /> Spam
                        </button>
                      )}
                      <button className="btn-secondary" onClick={() => setReplyingTo(comment.id)}>
                        Reply
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteComment(comment.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'dashboard' && (
          <div className="stats-cards">
            <div className="stat-card">
              <div>
                <span className="stat-label">Articles Published</span>
                <div className="stat-value">{posts.filter(p => p.status === 'Published').length}</div>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <span className="stat-label">Pending Approval</span>
                <div className="stat-value">{comments.filter(c => c.status === 'Pending').length}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}