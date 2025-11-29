import { useState, useEffect } from 'react'
import { CONFIG } from '../config'

/**
 * Hook pour gérer le dark mode
 * Persiste dans localStorage
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Lire depuis localStorage au démarrage
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return JSON.parse(saved)
    // Par défaut, respecter la préférence système
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Sauvegarder dans localStorage quand ça change
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark))
    applyTheme(isDark)
  }, [isDark])

  return { isDark, toggleDarkMode: () => setIsDark(!isDark) }
}

/**
 * Appliquer le thème au document
 */
function applyTheme(isDark) {
  const root = document.documentElement
  if (isDark) {
    root.style.colorScheme = 'dark'
    root.style.backgroundColor = CONFIG.DARK_COLORS.background
    root.style.color = CONFIG.DARK_COLORS.text
    
    // Variables CSS pour le mode sombre
    root.style.setProperty('--bg-primary', CONFIG.DARK_COLORS.background)
    root.style.setProperty('--bg-secondary', CONFIG.DARK_COLORS.surface)
    root.style.setProperty('--bg-tertiary', CONFIG.DARK_COLORS.surfaceLight)
    root.style.setProperty('--text-primary', CONFIG.DARK_COLORS.text)
    root.style.setProperty('--text-secondary', CONFIG.DARK_COLORS.textSecondary)
    root.style.setProperty('--border-color', CONFIG.DARK_COLORS.border)
  } else {
    root.style.colorScheme = 'light'
    root.style.backgroundColor = '#ffffff'
    root.style.color = '#1a1a2e'
    
    // Variables CSS pour le mode clair
    root.style.setProperty('--bg-primary', '#ffffff')
    root.style.setProperty('--bg-secondary', '#f8fafc')
    root.style.setProperty('--bg-tertiary', '#f1f5f9')
    root.style.setProperty('--text-primary', '#1a1a2e')
    root.style.setProperty('--text-secondary', '#666')
    root.style.setProperty('--border-color', '#e2e8f0')
  }
}

export default useDarkMode
