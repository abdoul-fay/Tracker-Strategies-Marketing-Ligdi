// Configuration et utilitaires pour l'application Ligdi Marketing Tracker

export const CONFIG = {
  APP_NAME: 'Ligdi Marketing Tracker',
  VERSION: '1.0.0',
  
  // Couleurs du thème
  COLORS: {
    primary: '#6366f1',
    secondary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    light: '#f8fafc',
    dark: '#1a1a2e',
  },

  // Canaux marketing
  CANAUX: [
    'Réseaux Sociaux',
    'Email',
    'SEO',
    'SEM (Google Ads)',
    'Influenceurs',
    'Publicité Display',
    'Affilié',
    'Autre'
  ],

  // Formats d'export
  EXPORT_FORMATS: ['PDF', 'Excel', 'CSV'],

  // Validation
  VALIDATION: {
    budgetMin: 0,
    budgetMax: 999999999,
    roiMin: -100,
    roiMax: 1000,
  },
};

// Utilitaire : Formater devise
export const formatCurrency = (value) => {
  if (!value) return '0 F';
  return `${Number(value).toLocaleString()} F`;
};

// Utilitaire : Formater pourcentage
export const formatPercent = (value) => {
  if (!value) return '0%';
  return `${Number(value).toFixed(2)}%`;
};

// Utilitaire : Calculer écart
export const calculateGap = (real, target) => {
  if (target === 0) return 0;
  return ((real - target) / target) * 100;
};

// Utilitaire : Déterminer couleur selon écart
export const getGapColor = (value, isPositiveGood = false) => {
  if (value === 0) return '#666';
  const isPositive = value > 0;
  const shouldBeGood = isPositiveGood ? isPositive : !isPositive;
  return shouldBeGood ? '#10b981' : '#ef4444';
};

// Utilitaire : Export en JSON
export const exportData = () => {
  const data = localStorage.getItem('ligdiData');
  const kpi = localStorage.getItem('kpiFinanciers');
  const allData = { campagnes: data, kpi };
  
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2)));
  element.setAttribute('download', `ligdi_data_${new Date().toISOString().slice(0, 10)}.json`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Utilitaire : Supprimer toutes les données
export const clearAllData = () => {
  if (window.confirm('Êtes-vous sûr ? Cette action est irréversible.')) {
    localStorage.removeItem('ligdiData');
    localStorage.removeItem('kpiFinanciers');
    window.location.reload();
  }
};
