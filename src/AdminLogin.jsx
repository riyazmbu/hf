import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock, Mail } from 'lucide-react'
import { supabase } from './supabaseClient'
import './BlogModule.css'

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Query admin record from Supabase table
      const { data, error: dbError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .eq('password', password)
        .single()

      if (dbError || !data) {
        setError('Invalid admin credentials. Please check email & password.')
      } else {
        // Successfully verified against database
        onLoginSuccess(data)
        navigate('/blog?admin=true')
      }
    } catch (err) {
      setError('Connection error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-icon-circle">
            <ShieldCheck size={32} />
          </div>
          <h2>HeyFund Admin Portal</h2>
          <p>Sign in with your database credentials to access moderation tools.</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleLogin} className="blog-form">
          <div className="form-group">
            <label>Admin Email</label>
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                type="email"
                placeholder="admin@heyfund.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={16} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-green"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Verifying DB Credentials...' : 'Login to Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  )
}