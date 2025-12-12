import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { setTenantId, setCurrentUser } from '../lib/multiTenant'
import '../styles/Login.css'

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        onLoginSuccess()
      }
    }
    checkAuth()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        // Sign up: Create new account and tenant
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              company_name: companyName,
            }
          }
        })

        if (authError) throw authError

        if (authData?.user) {
          // Create tenant record
          const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .insert({
              owner_id: authData.user.id,
              company_name: companyName,
              subscription_tier: 'starter',
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (tenantError) throw tenantError

          // Store tenant info
          setTenantId(tenantData.id)
          setCurrentUser({
            id: authData.user.id,
            email: authData.user.email,
            tenant_id: tenantData.id,
            role: 'admin'
          })

          setError('✅ Account created! Check your email to verify.')
          setTimeout(() => {
            setIsSignUp(false)
            setPassword('')
            setCompanyName('')
          }, 2000)
        }
      } else {
        // Sign in: Get existing account and tenant
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (authError) throw authError

        if (authData?.user) {
          // Get user's tenant
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('tenant_id, role')
            .eq('id', authData.user.id)
            .single()

          if (userError) {
            // First login - create user record and get tenant
            const { data: tenantData, error: tenantError } = await supabase
              .from('tenants')
              .select('id')
              .eq('owner_id', authData.user.id)
              .single()

            if (tenantError) throw new Error('No tenant found. Please sign up first.')

            await supabase.from('users').insert({
              id: authData.user.id,
              email: authData.user.email,
              tenant_id: tenantData.id,
              role: 'admin'
            })

            setTenantId(tenantData.id)
            setCurrentUser({
              id: authData.user.id,
              email: authData.user.email,
              tenant_id: tenantData.id,
              role: 'admin'
            })
          } else {
            // Existing user
            setTenantId(userData.tenant_id)
            setCurrentUser({
              id: authData.user.id,
              email: authData.user.email,
              tenant_id: userData.tenant_id,
              role: userData.role || 'user'
            })
          }

          // Success - trigger app reload with auth context
          onLoginSuccess()
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error. Please try again.')
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🎯 Marketing Tracker</h1>
          <p className="tagline">Multi-Client Campaign Intelligence</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="company">Company Name *</label>
              <input
                id="company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company name"
                required={isSignUp}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && <div className={`form-message ${error.includes('✅') ? 'success' : 'error'}`}>
            {error}
          </div>}

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? '⏳ Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setPassword('')
              setCompanyName('')
            }}
            disabled={loading}
            className="toggle-button"
          >
            {isSignUp ? 'Have an account? Sign In' : 'New company? Create Account'}
          </button>
        </form>

        <div className="login-footer">
          <p className="security-note">🔒 Your data is completely isolated and private</p>
          <p className="info-text">Each company account has access to only their own data</p>
          <p className="demo-text">Demo: Use any email with password 'demo123'</p>
        </div>
      </div>

      <div className="login-features">
        <h3>Why Marketing Tracker?</h3>
        <ul>
          <li>✅ Data isolation - Your data is yours alone</li>
          <li>✅ Real-time insights - Live KPI dashboards</li>
          <li>✅ AI recommendations - Smart campaign optimization</li>
          <li>✅ Campaign predictions - 3-month forecasting</li>
          <li>✅ Ambassador tracking - Performance analytics</li>
          <li>✅ Secure & compliant - GDPR ready</li>
        </ul>
      </div>
    </div>
  )
}
