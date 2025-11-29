import React, { useState, useCallback } from 'react'

// Contexte pour les notifications
export const NotificationContext = React.createContext()

/**
 * Provider pour gérer les notifications globalement
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now()
    const notification = { id, message, type }

    setNotifications(prev => [...prev, notification])

    // Auto-dismiss après duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

/**
 * Hook pour utiliser les notifications
 */
export function useNotification() {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification doit être utilisé dans NotificationProvider')
  }

  return {
    notify: (message, type = 'info', duration = 4000) => context.addNotification(message, type, duration),
    success: (message, duration = 3000) => context.addNotification(message, 'success', duration),
    error: (message, duration = 5000) => context.addNotification(message, 'error', duration),
    warning: (message, duration = 4000) => context.addNotification(message, 'warning', duration),
    info: (message, duration = 3000) => context.addNotification(message, 'info', duration),
    loading: (message) => context.addNotification(message, 'loading', 0),
    remove: context.removeNotification
  }
}

export default NotificationProvider
