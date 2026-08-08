import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import {
  FileText,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  Search,
  Clock,
  User,
  ArrowLeft,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Tag,
  Image as ImageIcon,
  LogOut
} from 'lucide-react'
import { supabase } from './supabaseClient'
import './BlogModule.css'

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80'

export default function BlogModule({ isAdminAuthenticated, onLogoutAdmin }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { slug } = useParams()

  const isAdminFromQuery = searchParams.get('admin') === 'true' && isAdminAuthenticated

  const [selectedPost, setSelectedPost] = useState(null)
  const [adminMode, setAdminMode] = useState(isAdminFromQuery)
  const [adminTab, setAdminTab] = useState('posts')
  const [searchQuery, setSearchQuery] = useState('')

  // Database State
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Forms
  const [userComment, setUserComment] = useState({ author: '', email: '', text: '' })
  const [commentSubmitted, setCommentSubmitted] = useState(false)

  const [adminDirectComment, setAdminDirectComment] = useState({ postId: '', text: '' })
  const [adminCommentSuccess, setAdminCommentSuccess] = useState(false)

  const [editingPost, setEditingPost] = useState(null)
  const [postForm, setPostForm] = useState({
    title: '',
    category: 'Trading Strategies',
    status: 'Published',
    coverImage: '',
    excerpt: '',
    content: ''
  })
  const [replyText, setReplyText] = useState({})

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      await fetchPosts()
      await fetchComments()
      setLoading(false)
    }
    initializeData()
  }, [])

  useEffect(() => {
    setAdminMode(isAdminFromQuery)
  }, [isAdminFromQuery])

  // Sync route slug with selected post view
  useEffect(() => {
    if (slug && posts.length > 0) {
      const matched = posts.find((p) => p.slug === slug)
      if (matched) {
        setSelectedPost(matched)
      }
    } else if (!slug) {
      setSelectedPost(null)
    }
  }, [slug, posts])

  useEffect(() => {
    if (posts.length > 0 && !adminDirectComment.postId) {
      setAdminDirectComment((prev) => ({ ...prev, postId: posts[0].id }))
    }
  }, [posts])

  // --- DATABASE FETCHING ---
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const mapped = (data || []).map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        coverImage: p.cover_image,
        excerpt: p.excerpt,
        content: p.content,
        author: p.author || 'HeyFund Team',
        category: p.category || 'General',
        status: p.status || 'Published',
        publishedAt: p.published_at || new Date(p.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }),
        views: p.views || 0,
        readTime: '4 min read'
      }))
      setPosts(mapped)
    } catch (err) {
      console.error('Error fetching posts:', err.message)
    }
  }

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const mapped = (data || []).map((c) => ({
        id: c.id,
        postId: c.post_id,
        author: c.author,
        email: c.email,
        comment: c.comment,
        status: c.status,
        reply: c.reply || '',
        isAdmin: c.is_admin,
        createdAt: new Date(c.created_at).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })
      }))
      setComments(mapped)
    } catch (err) {
      console.error('Error fetching comments:', err.message)
    }
  }

  // --- SELECT POST & INCREMENT VIEW COUNT ---
  const handleSelectPost = async (post) => {
    const updatedViews = (post.views || 0) + 1

    setSelectedPost({ ...post, views: updatedViews })
    setPosts(posts.map((p) => (p.id === post.id ? { ...p, views: updatedViews } : p)))

    // Update URL route to article slug
    if (post.slug) {
      navigate(`/blog/${post.slug}`)
    }

    try {
      await supabase.rpc('increment_views', { post_id: post.id })
    } catch (err) {
      console.error('Error incrementing view count:', err.message)
    }
  }

  const handleBackToList = () => {
    setSelectedPost(null)
    navigate('/blog')
  }

  // --- IMAGE UPLOAD TO SUPABASE BUCKET ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `covers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath)

      setPostForm((prev) => ({ ...prev, coverImage: data.publicUrl }))
    } catch (err) {
      alert('Failed to upload image: ' + err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  // --- ACTIONS ---
  const handleUserCommentSubmit = async (e) => {
    e.preventDefault()
    if (!userComment.author.trim() || !userComment.text.trim() || !selectedPost) return

    try {
      const { error } = await supabase.from('comments').insert([
        {
          post_id: selectedPost.id,
          author: userComment.author,
          email: userComment.email,
          comment: userComment.text,
          status: 'Pending',
          is_admin: false
        }
      ])

      if (error) throw error

      setUserComment({ author: '', email: '', text: '' })
      setCommentSubmitted(true)
      fetchComments()
      setTimeout(() => setCommentSubmitted(false), 4000)
    } catch (err) {
      alert('Error posting comment: ' + err.message)
    }
  }

  const handleDirectAdminCommentSubmit = async (e) => {
    e.preventDefault()
    if (!adminDirectComment.text.trim() || !adminDirectComment.postId) return

    try {
      const { error } = await supabase.from('comments').insert([
        {
          post_id: Number(adminDirectComment.postId),
          author: 'HeyFund Admin',
          email: 'admin@heyfund.in',
          comment: adminDirectComment.text.trim(),
          status: 'Approved',
          is_admin: true
        }
      ])

      if (error) throw error

      setAdminDirectComment((prev) => ({ ...prev, text: '' }))
      setAdminCommentSuccess(true)
      fetchComments()
      setTimeout(() => setAdminCommentSuccess(false), 3000)
    } catch (err) {
      alert('Error posting admin comment: ' + err.message)
    }
  }

  const handleSavePost = async (e) => {
    e.preventDefault()
    if (!postForm.title.trim()) return

    const finalImage = postForm.coverImage.trim() || DEFAULT_COVER
    const slugValue = postForm.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')

    const payload = {
      title: postForm.title,
      slug: slugValue,
      cover_image: finalImage,
      excerpt: postForm.excerpt || postForm.content.substring(0, 100) + '...',
      content: postForm.content,
      category: postForm.category,
      status: postForm.status
    }

    try {
      if (editingPost.id === 'new') {
        const { error } = await supabase.from('posts').insert([payload])
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('posts')
          .update(payload)
          .eq('id', editingPost.id)
        if (error) throw error
      }

      setEditingPost(null)
      fetchPosts()
    } catch (err) {
      alert('Error saving post: ' + err.message)
    }
  }

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this blog post?')) return

    try {
      const { error } = await supabase.from('posts').delete().eq('id', id)
      if (error) throw error

      if (selectedPost && selectedPost.id === id) {
        setSelectedPost(null)
        navigate('/blog')
      }
      fetchPosts()
      fetchComments()
    } catch (err) {
      alert('Error deleting post: ' + err.message)
    }
  }

  const handleUpdateCommentStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      fetchComments()
    } catch (err) {
      alert('Error updating status: ' + err.message)
    }
  }

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Delete this comment?')) return

    try {
      const { error } = await supabase.from('comments').delete().eq('id', id)
      if (error) throw error
      fetchComments()
    } catch (err) {
      alert('Error deleting comment: ' + err.message)
    }
  }

  const handleAdminReply = async (commentId) => {
    const reply = replyText[commentId]
    if (!reply || !reply.trim()) return

    try {
      const { error } = await supabase
        .from('comments')
        .update({ reply: reply.trim(), status: 'Approved' })
        .eq('id', commentId)

      if (error) throw error

      setReplyText((prev) => ({ ...prev, [commentId]: '' }))
      fetchComments()
    } catch (err) {
      alert('Error replying: ' + err.message)
    }
  }

  const handleOpenPostForm = (post = null) => {
    if (post) {
      setEditingPost(post)
      setPostForm({
        title: post.title,
        category: post.category,
        status: post.status,
        coverImage: post.coverImage || '',
        excerpt: post.excerpt,
        content: post.content
      })
    } else {
      setEditingPost({ id: 'new' })
      setPostForm({
        title: '',
        category: 'Trading Strategies',
        status: 'Published',
        coverImage: '',
        excerpt: '',
        content: ''
      })
    }
  }

  const publishedPosts = posts.filter((p) => p.status === 'Published')
  const filteredPosts = publishedPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const recentPosts = publishedPosts.slice(0, 4)

  const activePostComments = selectedPost
    ? comments.filter((c) => c.postId === selectedPost.id && c.status === 'Approved')
    : []

  if (loading) {
    return (
      <div className="blog-section-wrapper" style={{ padding: 40, textAlign: 'center' }}>
        Loading Blog Module...
      </div>
    )
  }

  return (
    <div className="blog-section-wrapper">
      <div className="blog-section-header">
        <div className="header-titles">
          <h2>Market Insights & Blog</h2>
          <p>Educational analysis, market setups, and algorithmic trading breakdowns.</p>
        </div>

       {isAdminAuthenticated && adminMode && (
  <div style={{ display: 'flex', gap: 10 }}>
    <button
      className="admin-toggle-btn"
      style={{
        background: '#fee2e2',
        color: '#dc2626',
        borderColor: '#fca5a5'
      }}
      onClick={onLogoutAdmin}
    >
      <LogOut size={16} /> Logout
    </button>
  </div>
)}
      </div>

      {/* ==================== ADMIN PANEL VIEW ==================== */}
      {adminMode && isAdminAuthenticated ? (
        <div className="admin-panel-container">
          <div className="admin-tabs">
            <button
              className={`admin-tab-btn ${adminTab === 'posts' ? 'active' : ''}`}
              onClick={() => {
                setAdminTab('posts')
                setEditingPost(null)
              }}
            >
              <FileText size={16} /> Manage Posts ({posts.length})
            </button>
            <button
              className={`admin-tab-btn ${adminTab === 'comments' ? 'active' : ''}`}
              onClick={() => setAdminTab('comments')}
            >
              <MessageSquare size={16} /> Moderate Comments ({comments.length})
            </button>
          </div>

          {adminTab === 'posts' && (
            <div>
              {editingPost ? (
                <div className="admin-card">
                  <div className="card-top flex-between">
                    <h3>{editingPost.id === 'new' ? 'Create New Post' : 'Edit Post'}</h3>
                    <button className="btn-secondary" onClick={() => setEditingPost(null)}>
                      Cancel
                    </button>
                  </div>
                  <form onSubmit={handleSavePost} className="blog-form">
                    <div className="form-group">
                      <label>Article Title</label>
                      <input
                        type="text"
                        placeholder="Enter title..."
                        value={postForm.title}
                        onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={postForm.category}
                          onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                        >
                          <option value="Trading Strategies">Trading Strategies</option>
                          <option value="Market Analysis">Market Analysis</option>
                          <option value="Intraday">Intraday</option>
                          <option value="Swing Trading">Swing Trading</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={postForm.status}
                          onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}
                        >
                          <option value="Published">Published</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Featured Image URL or File Upload</label>
                      <div className="image-input-group">
                        <input
                          type="text"
                          placeholder="Paste image URL (https://...)"
                          value={postForm.coverImage}
                          onChange={(e) =>
                            setPostForm({ ...postForm, coverImage: e.target.value })
                          }
                        />
                        <label className="file-upload-label">
                          <ImageIcon size={16} />{' '}
                          {uploadingImage ? 'Uploading...' : 'Choose File'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            hidden
                          />
                        </label>
                      </div>
                      {postForm.coverImage && (
                        <div className="image-preview-wrapper">
                          <img src={postForm.coverImage} alt="Cover Preview" />
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Short Excerpt</label>
                      <input
                        type="text"
                        placeholder="Brief summary for feed cards..."
                        value={postForm.excerpt}
                        onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Content</label>
                      <textarea
                        rows={8}
                        placeholder="Write article content..."
                        value={postForm.content}
                        onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn-green">
                      {editingPost.id === 'new' ? 'Publish Article' : 'Update Article'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="admin-card">
                  <div className="card-top flex-between">
                    <h3>All Blog Posts</h3>
                    <button className="btn-green" onClick={() => handleOpenPostForm()}>
                      <Plus size={16} /> Create Article
                    </button>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Cover</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <img
                              src={p.coverImage || DEFAULT_COVER}
                              alt="thumb"
                              className="admin-table-thumb"
                            />
                          </td>
                          <td>
                            <strong>{p.title}</strong>
                          </td>
                          <td>
                            <span className="badge category-tag">{p.category}</span>
                          </td>
                          <td>
                            <span className={`status-pill ${p.status.toLowerCase()}`}>
                              {p.status}
                            </span>
                          </td>
                          <td>{p.views}</td>
                          <td>{p.publishedAt}</td>
                          <td>
                            <div className="action-row">
                              <button
                                className="icon-btn edit"
                                onClick={() => handleOpenPostForm(p)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="icon-btn delete"
                                onClick={() => handleDeletePost(p.id)}
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
              )}
            </div>
          )}

          {adminTab === 'comments' && (
            <div className="admin-card">
              <div className="comment-input-card admin-direct-comment-box">
                <h4>➕ Post Direct Admin Note / Comment</h4>
                {adminCommentSuccess && (
                  <div className="success-banner">
                    ✓ Admin comment posted and saved to database!
                  </div>
                )}
                <form onSubmit={handleDirectAdminCommentSubmit} className="blog-form">
                  <div className="form-group">
                    <label>Select Article</label>
                    <select
                      value={adminDirectComment.postId}
                      onChange={(e) =>
                        setAdminDirectComment({ ...adminDirectComment, postId: e.target.value })
                      }
                    >
                      {posts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Admin Comment Text</label>
                    <textarea
                      rows={3}
                      placeholder="Type official admin update or commentary..."
                      value={adminDirectComment.text}
                      onChange={(e) =>
                        setAdminDirectComment({ ...adminDirectComment, text: e.target.value })
                      }
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn-green-sm" style={{ alignSelf: 'flex-start' }}>
                    <Send size={14} /> Post Direct Comment
                  </button>
                </form>
              </div>

              <h3>Moderate Reader Comments</h3>
              <div className="comments-stream">
                {comments.map((c) => {
                  const targetPost = posts.find((p) => p.id === c.postId)
                  return (
                    <div className="comment-mod-card" key={c.id}>
                      <div className="comment-mod-header">
                        <div>
                          <strong>{c.author}</strong> ({c.email}) on{' '}
                          <em className="post-title-link">"{targetPost?.title || 'Article'}"</em>
                        </div>
                        <span className={`status-pill ${c.status.toLowerCase()}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="comment-mod-text">{c.comment}</p>

                      {c.reply && (
                        <div className="existing-reply">
                          <strong>Admin Reply:</strong> {c.reply}
                        </div>
                      )}

                      <div className="reply-input-row">
                        <input
                          type="text"
                          placeholder="Type an admin reply..."
                          value={replyText[c.id] || ''}
                          onChange={(e) =>
                            setReplyText({ ...replyText, [c.id]: e.target.value })
                          }
                        />
                        <button className="btn-green-sm" onClick={() => handleAdminReply(c.id)}>
                          Reply & Approve
                        </button>
                      </div>

                      <div className="comment-mod-actions">
                        <span className="time-stamp">{c.createdAt}</span>
                        <div className="btn-group">
                          {c.status !== 'Approved' && (
                            <button
                              className="btn-approve"
                              onClick={() => handleUpdateCommentStatus(c.id, 'Approved')}
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                          )}
                          {c.status !== 'Spam' && (
                            <button
                              className="btn-reject"
                              onClick={() => handleUpdateCommentStatus(c.id, 'Spam')}
                            >
                              <XCircle size={14} /> Spam
                            </button>
                          )}
                          <button className="btn-delete" onClick={() => handleDeleteComment(c.id)}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==================== USER PUBLIC VIEW ==================== */
        <div className="blog-public-container">
          {selectedPost ? (
            /* FULL ARTICLE READ VIEW */
            <article className="article-reader">
              <button className="back-link-btn" onClick={handleBackToList}>
                <ArrowLeft size={16} /> Back to Blog List
              </button>

              <div className="article-hero-banner">
                <img
                  src={selectedPost.coverImage || DEFAULT_COVER}
                  alt={selectedPost.title}
                />
              </div>

              <header className="article-reader-header">
                <span className="badge category-tag">{selectedPost.category}</span>
                <h1>{selectedPost.title}</h1>
                <div className="article-reader-meta">
                  <span>
                    <User size={14} /> {selectedPost.author}
                  </span>
                  <span>
                    <Clock size={14} /> {selectedPost.publishedAt}
                  </span>
                  <span>
                    <Eye size={14} /> {selectedPost.views} views
                  </span>
                  <span>{selectedPost.readTime}</span>
                </div>
              </header>

              <div className="article-reader-content">
                {selectedPost.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <section className="reader-comments-section">
                <h3>Comments & Discussion ({activePostComments.length})</h3>

                <form onSubmit={handleUserCommentSubmit} className="comment-input-card">
                  <h4>Leave a Reply</h4>
                  {commentSubmitted && (
                    <div className="success-banner">
                      ✓ Your comment has been submitted and is pending admin moderation!
                    </div>
                  )}
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      value={userComment.author}
                      onChange={(e) =>
                        setUserComment({ ...userComment, author: e.target.value })
                      }
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email *"
                      value={userComment.email}
                      onChange={(e) =>
                        setUserComment({ ...userComment, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Write your comment here..."
                    value={userComment.text}
                    onChange={(e) => setUserComment({ ...userComment, text: e.target.value })}
                    required
                  ></textarea>
                  <button type="submit" className="btn-green">
                    <Send size={14} /> Submit Comment
                  </button>
                </form>

                <div className="reader-comments-list">
                  {activePostComments.length === 0 ? (
                    <p className="no-comments">
                      No comments yet. Be the first to join the conversation!
                    </p>
                  ) : (
                    activePostComments.map((c) => (
                      <div className="reader-comment-card" key={c.id}>
                        <div
                          className={`comment-author-avatar ${c.isAdmin ? 'admin-avatar' : ''}`}
                        >
                          {c.isAdmin ? '🛡️' : c.author.charAt(0).toUpperCase()}
                        </div>
                        <div className="comment-card-body">
                          <div className="reader-comment-header">
                            <strong>
                              {c.author}{' '}
                              {c.isAdmin && (
                                <span
                                  className="badge category-tag"
                                  style={{ marginLeft: 6 }}
                                >
                                  Official
                                </span>
                              )}
                            </strong>
                            <span className="time-stamp">{c.createdAt}</span>
                          </div>
                          <p>{c.comment}</p>
                          {c.reply && (
                            <div className="reader-admin-reply">
                              <strong>HeyFund Team:</strong> {c.reply}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </article>
          ) : (
            /* BLOG CARDS FEED + RECENT SIDEBAR */
            <div className="blog-layout-grid">
              <main className="blog-main-stream">
                <div className="blog-search-bar">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search articles by title or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="cards-grid">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      className="blog-card"
                      onClick={() => handleSelectPost(post)}
                    >
                      <div className="blog-card-image">
                        <img
                          src={post.coverImage || DEFAULT_COVER}
                          alt={post.title}
                        />
                      </div>
                      <div className="blog-card-body">
                        <div className="card-badge-row">
                          <span className="badge category-tag">{post.category}</span>
                          <span className="read-time">{post.readTime}</span>
                        </div>
                        <h3 className="card-title">{post.title}</h3>
                        <p className="card-excerpt">{post.excerpt}</p>
                        <div className="card-meta-footer">
                          <span>{post.publishedAt}</span>
                          <span className="read-more-link">Read Article →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </main>

              <aside className="blog-sidebar">
                <div className="sidebar-widget">
                  <h4>🔥 Recent Articles</h4>
                  <div className="recent-list">
                    {recentPosts.map((post) => (
                      <div
                        key={post.id}
                        className="recent-item"
                        onClick={() => handleSelectPost(post)}
                      >
                        <img
                          src={post.coverImage || DEFAULT_COVER}
                          alt={post.title}
                          className="recent-thumb"
                        />
                        <div>
                          <div className="recent-title">{post.title}</div>
                          <div className="recent-date">{post.publishedAt}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sidebar-widget">
                  <h4>🏷️ Popular Topics</h4>
                  <div className="tags-cloud">
                    {['Trading Strategies', 'Market Analysis', 'Intraday', 'Swing Trading'].map(
                      (tag) => (
                        <button
                          key={tag}
                          className="tag-btn"
                          onClick={() => setSearchQuery(tag)}
                        >
                          <Tag size={12} /> {tag}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      )}
    </div>
  )
}