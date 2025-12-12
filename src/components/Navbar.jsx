import './Navbar.css'
import NotificationBell from './NotificationBell'

export default function Navbar({ currentPage, setCurrentPage, isDark, toggleDarkMode, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>📊 Marketing Tracker</h1>
      </div>
      <ul className="navbar-menu">
        <li>
          <button 
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            Accueil
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'overview' ? 'active' : ''}`}
            onClick={() => setCurrentPage('overview')}
          >
            📊 Vue d'Ensemble
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'recommendations' ? 'active' : ''}`}
            onClick={() => setCurrentPage('recommendations')}
          >
            🎯 Recommandations
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'plan' ? 'active' : ''}`}
            onClick={() => setCurrentPage('plan')}
          >
            Plan Marketing
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'budget' ? 'active' : ''}`}
            onClick={() => setCurrentPage('budget')}
          >
            Budget Global
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'ambassadeurs' ? 'active' : ''}`}
            onClick={() => setCurrentPage('ambassadeurs')}
          >
            Ambassadeurs
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'strategies' ? 'active' : ''}`}
            onClick={() => setCurrentPage('strategies')}
          >
            Stratégies
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'kpi' ? 'active' : ''}`}
            onClick={() => setCurrentPage('kpi')}
          >
            KPI Financiers
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'comparatif' ? 'active' : ''}`}
            onClick={() => setCurrentPage('comparatif')}
          >
            Comparatif Performance
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'advanced' ? 'active' : ''}`}
            onClick={() => setCurrentPage('advanced')}
          >
            🔮 Analyse Avancée
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'intelligence' ? 'active' : ''}`}
            onClick={() => setCurrentPage('intelligence')}
          >
            🤖 Budget Intelligence IA
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'kpisettings' ? 'active' : ''}`}
            onClick={() => setCurrentPage('kpisettings')}
          >
            ⚙️ Paramètres KPI
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'ambassadorscampagnes' ? 'active' : ''}`}
            onClick={() => setCurrentPage('ambassadorscampagnes')}
          >
            👥 Ambassadors & Campagnes
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'benchmarking' ? 'active' : ''}`}
            onClick={() => setCurrentPage('benchmarking')}
          >
            🏆 Benchmarking
          </button>
        </li>
        <li>
          <button 
            className={`nav-link ${currentPage === 'predictions' ? 'active' : ''}`}
            onClick={() => setCurrentPage('predictions')}
          >
            🔮 Prédictions
          </button>
        </li>
        <li style={{ marginLeft: 'auto' }}>
          <NotificationBell />
        </li>
        <li>
          <button 
            className="nav-link dark-mode-toggle"
            onClick={toggleDarkMode}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </li>
        <li>
          <button 
            className="nav-link logout-button"
            onClick={onLogout}
            title="Se déconnecter"
          >
            🚪 Déconnexion
          </button>
        </li>
      </ul>
    </nav>
  )
}
