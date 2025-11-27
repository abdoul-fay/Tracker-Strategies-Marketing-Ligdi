import './Navbar.css'

export default function Navbar({ currentPage, setCurrentPage }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>📊 Ligdi Marketing Tracker</h1>
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
      </ul>
    </nav>
  )
}
