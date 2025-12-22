import { useState } from 'react'
import NotificationBell from './NotificationBell'
import './Sidebar.css'

export default function Sidebar({ currentPage, setCurrentPage, isDark, toggleDarkMode, onLogout }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState({
    dashboards: true,
    campagnes: true,
    kpi: true,
    intelligence: true
  })

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  const menuGroups = [
    {
      id: 'dashboards',
      label: '📈 DASHBOARDS',
      items: [
        { id: 'home', label: 'Accueil', icon: '🏠' },
        { id: 'overview', label: 'Vue d\'Ensemble', icon: '📊' },
        { id: 'dashboard', label: 'Dashboard', icon: '📉' },
        { id: 'comparatif', label: 'Comparatif Performance', icon: '📈' }
      ]
    },
    {
      id: 'campagnes',
      label: '📢 CAMPAGNES',
      items: [
        { id: 'plan', label: 'Plan Marketing', icon: '📋' },
        { id: 'budget', label: 'Budget Global', icon: '💰' },
        { id: 'ambassadeurs', label: 'Ambassadeurs', icon: '👥' }
      ]
    },
    {
      id: 'kpi',
      label: '🎯 KPI & STRATÉGIE',
      items: [
        { id: 'kpi', label: 'KPI Financiers', icon: '📊' },
        { id: 'strategies', label: 'Stratégies', icon: '🎯' },
        { id: 'kpisettings', label: 'Paramètres KPI', icon: '⚙️' },
        { id: 'recommendations', label: 'Recommandations', icon: '💡' }
      ]
    },
    {
      id: 'intelligence',
      label: '🤖 INTELLIGENCE',
      items: [
        { id: 'analyse', label: 'Analyse Utilisateurs', icon: '👥' },
        { id: 'intelligence', label: 'Budget Intelligence IA', icon: '🤖' },
        { id: 'advanced', label: 'Analyse Avancée', icon: '🔮' },
        { id: 'benchmarking', label: 'Benchmarking', icon: '🏆' },
        { id: 'predictions', label: 'Prédictions', icon: '🔮' },
        { id: 'ambassadorscampagnes', label: 'Ambassadors & Campagnes', icon: '👥' }
      ]
    }
  ]

  return (
    <div className={`sidebar-container ${isDark ? 'dark' : 'light'}`}>
      {/* Sidebar */}
      <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className={`brand ${!isExpanded && 'hidden'}`}>
            <h2>📊 Marketing</h2>
            <p>Tracker</p>
          </div>
          <button 
            className="toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Replier' : 'Déplier'}
          >
            {isExpanded ? '◀' : '▶'}
          </button>
        </div>

        {/* Menu Groups */}
        <div className="sidebar-menu">
          {menuGroups.map(group => (
            <div key={group.id} className="menu-group">
              <button 
                className={`group-header ${expandedGroups[group.id] ? 'expanded' : ''}`}
                onClick={() => toggleGroup(group.id)}
              >
                <span className="group-label">{group.label}</span>
                <span className={`group-toggle ${expandedGroups[group.id] ? 'open' : ''}`}>▼</span>
              </button>
              
              {expandedGroups[group.id] && (
                <div className="group-items">
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
                      onClick={() => setCurrentPage(item.id)}
                      title={item.label}
                    >
                      <span className="item-icon">{item.icon}</span>
                      <span className={`item-label ${!isExpanded && 'hidden'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <button 
            className="menu-item logout"
            onClick={onLogout}
            title="Déconnexion"
          >
            <span className="item-icon">🚪</span>
            <span className={`item-label ${!isExpanded && 'hidden'}`}>
              Déconnexion
            </span>
          </button>
        </div>
      </div>

      {/* Top Bar */}
      <div className={`topbar ${isDark ? 'dark' : 'light'}`}>
        <div className="topbar-spacer"></div>
        <div className="topbar-actions">
          <NotificationBell />
          <button 
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </div>
  )
}
