import { useContext, useState } from 'react'
import { NotificationContext } from '../contexts/NotificationContext'
import './NotificationBell.css'

/**
 * Icône cloche avec badge pour les notifications
 */
export function NotificationBell() {
  const context = useContext(NotificationContext)
  const [showHistory, setShowHistory] = useState(false)

  if (!context) return null

  const { notifications } = context
  const unreadCount = notifications.length

  // Garder l'historique des 10 dernières notifications
  const recentNotifications = notifications.slice(-10)

  return (
    <div className="notification-bell-container">
      <button
        className="notification-bell"
        onClick={() => setShowHistory(!showHistory)}
        title={`${unreadCount} notification${unreadCount > 1 ? 's' : ''}`}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showHistory && unreadCount > 0 && (
        <div className="notification-history">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button className="close-btn" onClick={() => setShowHistory(false)}>✕</button>
          </div>
          <div className="notification-list">
            {recentNotifications.map(notif => (
              <div key={notif.id} className={`notification-item notification-${notif.type}`}>
                <span className="notification-type-icon">
                  {notif.type === 'success' && '✅'}
                  {notif.type === 'error' && '❌'}
                  {notif.type === 'warning' && '⚠️'}
                  {notif.type === 'info' && 'ℹ️'}
                  {notif.type === 'loading' && '⏳'}
                </span>
                <span className="notification-text">{notif.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
