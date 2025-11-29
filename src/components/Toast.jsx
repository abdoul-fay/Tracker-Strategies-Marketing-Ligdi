import { NotificationContext } from '../contexts/NotificationContext'
import { useContext } from 'react'
import './Toast.css'

/**
 * Composant Toast pour afficher les notifications
 */
export function ToastContainer() {
  const context = useContext(NotificationContext)
  if (!context) return null

  const { notifications, removeNotification } = context

  return (
    <div className="toast-container">
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

/**
 * Composant Toast individuel
 */
function Toast({ notification, onClose }) {
  const { id, message, type } = notification

  const typeIcons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    loading: '⏳'
  }

  const icon = typeIcons[type] || 'ℹ️'

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">{icon}</span>
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>✕</button>
      {type !== 'loading' && <div className="toast-progress" />}
    </div>
  )
}

export default ToastContainer
