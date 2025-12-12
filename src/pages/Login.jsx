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
        // Sign up: Create new account (trigger automatically creates tenant & user records)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              company_name: companyName, // Passed to trigger function
            }
          }
        })

        if (authError) throw authError

        if (authData?.user) {
          // Wait a moment for trigger to execute
          await new Promise(resolve => setTimeout(resolve, 500))

          // Get tenant info from newly created records
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('auth_id', authData.user.id)
            .single()

          if (userError) throw new Error('Failed to create account records: ' + userError.message)

          // Store tenant info
          setTenantId(userData.tenant_id)
          setCurrentUser({
            id: authData.user.id,
            email: authData.user.email,
            tenant_id: userData.tenant_id,
            role: 'admin'
          })

          setError('✅ Compte créé avec succès! Vérifiez votre email.')
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
            .eq('auth_id', authData.user.id)
            .single()

          if (userError) throw new Error('Compte non trouvé. Veuillez créer un compte d\'abord.')

          setTenantId(userData.tenant_id)
          setCurrentUser({
            id: authData.user.id,
            email: authData.user.email,
            tenant_id: userData.tenant_id,
            role: userData.role || 'user'
          })

          // Success - trigger app reload with auth context
          onLoginSuccess()
        }
      }
    } catch (err) {
      setError(err.message || 'Erreur d\'authentification. Veuillez réessayer.')
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
              <label htmlFor="company">Nom de l'Entreprise *</label>
              <input
                id="company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nom de votre entreprise"
                required={isSignUp}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Adresse Email *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@entreprise.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe *</label>
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
            {loading ? '⏳ Traitement en cours...' : (isSignUp ? 'Créer un compte' : 'Se connecter')}
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
            {isSignUp ? 'Vous avez un compte? Se connecter' : 'Nouvelle entreprise? Créer un compte'}
          </button>
        </form>

        <div className="login-footer">
          <p className="security-note">🔒 Vos données sont complètement isolées et privées</p>
          <p className="info-text">Chaque compte d'entreprise n'a accès qu'à ses propres données</p>
          <p className="demo-text">Démo: Utilisez n'importe quel email avec le mot de passe 'demo123'</p>
        </div>
      </div>

      <div className="login-features">
        <h3>Pourquoi Marketing Tracker?</h3>
        <ul>
          <li>✅ Isolation des données - Vos données vous appartiennent</li>
          <li>✅ Analyses en temps réel - Tableaux de bord KPI en direct</li>
          <li>✅ Recommandations IA - Optimisation intelligente des campagnes</li>
          <li>✅ Prédictions de campagnes - Prévisions sur 3 mois</li>
          <li>✅ Suivi des ambassadeurs - Analyses de performance</li>
          <li>✅ Sécurisé et conforme - Prêt pour RGPD</li>
        </ul>
      </div>
    </div>
  )
}
