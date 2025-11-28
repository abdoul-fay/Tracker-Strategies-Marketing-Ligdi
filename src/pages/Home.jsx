import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import './Home.css';

// Formatteur de nombres: k, M, G seulement si >= 10 chiffres (1 milliard+)
const formatNumber = (num) => {
  const absNum = Math.abs(num);
  if (absNum >= 1000000000) return (num / 1000000000).toFixed(1) + 'G';
  if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (absNum >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
};

export default function Home({ campagnes }) {
  const [kpiList, setKpiList] = useState([])
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalReal: 0,
    totalROI: 0,
    ecartMoyen: 0,
    campagnesCount: 0,
    kpiCount: 0
  });

  // Charger les KPI depuis Supabase
  useEffect(() => {
    const loadKPIs = async (showLoader = false) => {
      try {
        if (showLoader) setLoading(true)
        const { data, error } = await supabase
          .from('kpi_financiers')
          .select('*')
          .order('mois', { ascending: false })
        
        if (error) {
          console.error('Erreur chargement KPI:', error)
          const saved = localStorage.getItem('kpiFinanciers')
          setKpiList(saved ? JSON.parse(saved) : [])
        } else {
          setKpiList(data || [])
        }
      } catch (err) {
        console.error('Erreur:', err)
      } finally {
        if (showLoader) setLoading(false)
      }
    }
    
    loadKPIs(true)
    const interval = setInterval(() => loadKPIs(false), 5000)
    return () => clearInterval(interval)
  }, [])

  // Calculer les stats à partir des KPI
  useEffect(() => {
    let totalBudget = 0;
    let totalReal = 0;
    let totalROI = 0;

    // Somme des budgets depuis tous les KPI (dépenses = budget)
    kpiList.forEach(kpi => {
      const cible = typeof kpi.cible === 'string' ? JSON.parse(kpi.cible) : (kpi.cible || {});
      const reel = typeof kpi.reel === 'string' ? JSON.parse(kpi.reel) : (kpi.reel || {});
      // Utiliser dépenses comme budget, et bénéfices comme ROI
      totalBudget += Number(cible.depenses || 0);
      totalReal += Number(reel.depenses || 0);
      totalROI += Number(reel.benefices || 0);
    });

    const ecartMoyen = totalBudget > 0 ? ((totalReal / totalBudget - 1) * 100) : 0;

    setStats({
      totalBudget,
      totalReal,
      totalROI,
      ecartMoyen: ecartMoyen.toFixed(2),
      campagnesCount: campagnes.length,
      kpiCount: kpiList.length
    });
  }, [kpiList, campagnes])

  // Données pour graphiques mini
  const byMonth = {};
  campagnes.forEach(c => {
    const month = c.date_start ? c.date_start.substring(0, 7) : 'N/A';
    if (!byMonth[month]) {
      byMonth[month] = { budget: 0, real: 0, count: 0 };
    }
    byMonth[month].budget += c.budget || 0;
    byMonth[month].real += c.budget_reel || 0;
    byMonth[month].count += 1;
  });

  const monthData = Object.keys(byMonth)
    .sort()
    .slice(-6)
    .map(month => ({
      month: month.substring(5),
      budget: byMonth[month].budget,
      real: byMonth[month].real
    }));

  const latestKPI = kpiList.length > 0 ? kpiList[0] : null;

  const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-content">
          <h1>📊 Tableau de Bord Marketing</h1>
          <p>Suivi complet de vos campagnes, stratégies et KPI financiers</p>
        </div>
      </div>

      <div className="home-stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <p className="stat-label">Budget Total</p>
            <p className="stat-value">{formatNumber(stats.totalBudget)} F</p>
            <p className="stat-subtitle">Prévu et réel</p>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <p className="stat-label">ROI Estimé</p>
            <p className="stat-value">{formatNumber(stats.totalROI)} F</p>
            <p className="stat-subtitle">Retour sur investissement</p>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <p className="stat-label">Écart Budgétaire</p>
            <p className="stat-value" style={{ color: stats.ecartMoyen > 5 ? '#ef4444' : '#10b981' }}>
              {stats.ecartMoyen}%
            </p>
            <p className="stat-subtitle">Prévu vs Réel</p>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <p className="stat-label">Campagnes</p>
            <p className="stat-value">{stats.campagnesCount}</p>
            <p className="stat-subtitle">Active et historique</p>
          </div>
        </div>
      </div>

      <div className="home-content">
        {monthData.length > 0 && (
          <div className="home-chart-card">
            <h2>📈 Évolution Budgétaire (6 derniers mois)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e7ff', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="budget" stroke="#6366f1" strokeWidth={2} name="Budget Prévu" />
                <Line type="monotone" dataKey="real" stroke="#3b82f6" strokeWidth={2} name="Budget Réel" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {latestKPI && (
          <div className="home-chart-card">
            <h2>💹 KPI Financiers Actuels ({latestKPI.mois})</h2>
            {(() => {
              const cible = typeof latestKPI.cible === 'string' ? JSON.parse(latestKPI.cible) : (latestKPI.cible || {});
              const reel = typeof latestKPI.reel === 'string' ? JSON.parse(latestKPI.reel) : (latestKPI.reel || {});
              return (
                <div className="kpi-mini-grid">
                  <div className="kpi-mini-item">
                    <p className="kpi-label">CPA (Cible)</p>
                    <p className="kpi-value">{cible.CPA ? formatNumber(Number(cible.CPA)) : 'N/A'}</p>
                  </div>
                  <div className="kpi-mini-item">
                    <p className="kpi-label">CPA (Réel)</p>
                    <p className="kpi-value">{reel.CPA ? formatNumber(Number(reel.CPA)) : 'N/A'}</p>
                  </div>
                  <div className="kpi-mini-item">
                    <p className="kpi-label">Panier Moyen (Cible)</p>
                    <p className="kpi-value">{cible.panierMoyen ? formatNumber(Number(cible.panierMoyen)) : 'N/A'}</p>
                  </div>
                  <div className="kpi-mini-item">
                    <p className="kpi-label">Panier Moyen (Réel)</p>
                    <p className="kpi-value">{reel.panierMoyen ? formatNumber(Number(reel.panierMoyen)) : 'N/A'}</p>
                  </div>
                  <div className="kpi-mini-item">
                    <p className="kpi-label">Bénéfices (Cible)</p>
                    <p className="kpi-value">{formatNumber(Number(cible.benefices || 0))} F</p>
                  </div>
                  <div className="kpi-mini-item">
                    <p className="kpi-label">Bénéfices (Réel)</p>
                    <p className="kpi-value">{formatNumber(Number(reel.benefices || 0))} F</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <div className="home-info-cards">
          <div className="info-card">
            <h3>🎯 Prochaines Actions</h3>
            <ul>
              <li>Accédez au <strong>Plan Marketing</strong> pour gérer vos campagnes</li>
              <li>Consultez le <strong>Dashboard</strong> pour l'analyse détaillée</li>
              <li>Renseignez les <strong>KPI Financiers</strong> pour le suivi financier</li>
              <li>Planifiez vos <strong>Stratégies</strong> hebdomadaires</li>
            </ul>
          </div>
          <div className="info-card">
            <h3>📊 Statistiques Globales</h3>
            <ul>
              <li>📌 Campagnes créées: <strong>{stats.campagnesCount}</strong></li>
              <li>💾 KPI mensuels enregistrés: <strong>{stats.kpiCount}</strong></li>
              <li>💰 Budget réel vs prévu: <strong>{((stats.totalReal / stats.totalBudget) * 100).toFixed(1)}%</strong></li>
              <li>📈 Performance globale: <strong>{stats.totalROI > 0 ? '✅ Positive' : '⚠️ À améliorer'}</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
