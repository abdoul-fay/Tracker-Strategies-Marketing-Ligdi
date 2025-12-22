import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { db } from '../lib/supabase';
import './AnalyseUtilisateurs.css';

const formatNumber = (num) => {
  const absNum = Math.abs(num);
  if (absNum >= 1000000000) return (num / 1000000000).toFixed(1) + 'G';
  if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (absNum >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
};

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const PERIODS = [
  { value: 'week', label: 'Hebdomadaire' },
  { value: 'month', label: 'Mensuel' },
  { value: 'year', label: 'Annuel' }
];

export default function AnalyseUtilisateurs({ campagnes = [] }) {
  const [kpiList, setKpiList] = useState([]);
  const [ambassadeurs, setAmbassadeurs] = useState([]);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [kpis, ambs] = await Promise.all([
          db.getKPIs(),
          db.getAmbassadors()
        ]);
        setKpiList(kpis || []);
        setAmbassadeurs(ambs || []);
      } catch (err) {
        console.error('❌ Erreur chargement données:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculer statistiques globales
  const stats = React.useMemo(() => {
    let totalUtilisateurs = 0;
    let totalActifs = 0;
    let totalFilleuls = 0;
    let totalDepenses = 0;
    let totalTransactions = 0;
    let totalVolume = 0;

    kpiList.forEach(kpi => {
      const cible = typeof kpi.cible === 'string' ? JSON.parse(kpi.cible) : kpi.cible || {};
      const reel = typeof kpi.reel === 'string' ? JSON.parse(kpi.reel) : kpi.reel || {};
      
      totalUtilisateurs += Number(reel.coutUtilisateur || 0);
      totalTransactions += Number(reel.transactions || 0);
      totalVolume += Number(reel.volume || 0);
      totalDepenses += Number(reel.depenses || 0);
    });

    ambassadeurs.forEach(amb => {
      totalActifs += Number(amb.utilisateurs_actifs || 0);
      totalFilleuls += Number(amb.filleuls_recrutes || 0);
    });

    const costPerUser = totalUtilisateurs > 0 ? (totalDepenses / totalUtilisateurs).toFixed(2) : 0;
    const conversionRate = totalFilleuls > 0 ? ((totalActifs / totalFilleuls) * 100).toFixed(2) : 0;
    const avgOrderValue = totalTransactions > 0 ? (totalVolume / totalTransactions).toFixed(2) : 0;

    return {
      totalUtilisateurs,
      totalActifs,
      totalFilleuls,
      totalDepenses,
      totalTransactions,
      totalVolume,
      costPerUser,
      conversionRate,
      avgOrderValue
    };
  }, [kpiList, ambassadeurs]);

  // Données par période
  const chartData = React.useMemo(() => {
    const data = {};

    kpiList.forEach(kpi => {
      const reel = typeof kpi.reel === 'string' ? JSON.parse(kpi.reel) : kpi.reel || {};
      const mois = kpi.mois;

      if (!mois) return;

      let key = '';
      if (period === 'month') {
        key = mois.substring(0, 7);
      } else if (period === 'year') {
        key = mois.substring(0, 4);
      } else {
        key = mois;
      }

      if (!data[key]) {
        data[key] = {
          period: key,
          utilisateurs: 0,
          transactions: 0,
          volume: 0,
          depenses: 0,
          coutParUtil: 0,
          count: 0
        };
      }

      data[key].utilisateurs += Number(reel.coutUtilisateur || 0);
      data[key].transactions += Number(reel.transactions || 0);
      data[key].volume += Number(reel.volume || 0);
      data[key].depenses += Number(reel.depenses || 0);
      data[key].count += 1;
    });

    // Calculer coût par utilisateur
    Object.values(data).forEach(d => {
      d.coutParUtil = d.utilisateurs > 0 ? (d.depenses / d.utilisateurs).toFixed(2) : 0;
    });

    return Object.values(data).sort((a, b) => a.period.localeCompare(b.period));
  }, [kpiList, period]);

  // Distribution par canal
  const canalData = React.useMemo(() => {
    const canaux = {};
    campagnes.forEach(c => {
      const canal = c.canal || 'Autre';
      if (!canaux[canal]) {
        canaux[canal] = 0;
      }
      canaux[canal] += 1;
    });

    return Object.entries(canaux).map(([name, count]) => ({
      name,
      value: count
    }));
  }, [campagnes]);

  // Top ambassadeurs
  const topAmbassadeurs = React.useMemo(() => {
    return ambassadeurs
      .sort((a, b) => (b.utilisateurs_actifs || 0) - (a.utilisateurs_actifs || 0))
      .slice(0, 5);
  }, [ambassadeurs]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Chargement des données...</div>;
  }

  return (
    <div className="analyse-utilisateurs">
      <h1>👥 Analyse Utilisateurs</h1>

      {/* Sélection période */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 'bold', marginRight: 10 }}>Période :</label>
        <select value={period} onChange={e => setPeriod(e.target.value)}>
          {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>👤 Total Utilisateurs</h3>
          <p className="value">{formatNumber(stats.totalUtilisateurs)}</p>
          <p className="label">contacts acquis</p>
        </div>
        <div className="kpi-card">
          <h3>🎯 Utilisateurs Actifs</h3>
          <p className="value">{formatNumber(stats.totalActifs)}</p>
          <p className="label">from ambassadors</p>
        </div>
        <div className="kpi-card">
          <h3>💳 Transactions</h3>
          <p className="value">{formatNumber(stats.totalTransactions)}</p>
          <p className="label">completed</p>
        </div>
        <div className="kpi-card">
          <h3>💰 Volume Total</h3>
          <p className="value">{formatNumber(stats.totalVolume)}</p>
          <p className="label">FCFA</p>
        </div>
        <div className="kpi-card">
          <h3>💸 Coût/Utilisateur</h3>
          <p className="value">{formatNumber(stats.costPerUser)}</p>
          <p className="label">FCFA par user</p>
        </div>
        <div className="kpi-card">
          <h3>📊 Taux Conversion</h3>
          <p className="value">{stats.conversionRate}%</p>
          <p className="label">filleuls → actifs</p>
        </div>
        <div className="kpi-card">
          <h3>🛒 Panier Moyen</h3>
          <p className="value">{formatNumber(stats.avgOrderValue)}</p>
          <p className="label">FCFA</p>
        </div>
        <div className="kpi-card">
          <h3>🌱 Total Filleuls</h3>
          <p className="value">{formatNumber(stats.totalFilleuls)}</p>
          <p className="label">recruited</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="charts-section">
        {/* Évolution Utilisateurs */}
        <div className="chart-container">
          <h2>📈 Évolution des Utilisateurs</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Area type="monotone" dataKey="utilisateurs" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Coût par Utilisateur */}
        <div className="chart-container">
          <h2>💰 Coût par Utilisateur</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Line type="monotone" dataKey="coutParUtil" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions vs Volume */}
        <div className="chart-container">
          <h2>📊 Transactions & Volume</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Bar dataKey="transactions" fill="#3b82f6" />
              <Bar dataKey="volume" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Canaux */}
        <div className="chart-container">
          <h2>🎯 Distribution par Canal</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={canalData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} (${value})`} outerRadius={80} fill="#8884d8" dataKey="value">
                {canalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Ambassadeurs */}
        <div className="chart-container top-ambassadeurs">
          <h2>🏆 Top 5 Ambassadeurs</h2>
          {topAmbassadeurs.length > 0 ? (
            <table className="ambassadeurs-table">
              <thead>
                <tr>
                  <th>Ambassadeur</th>
                  <th>Filleuls Recrutés</th>
                  <th>Utilisateurs Actifs</th>
                  <th>Taux Conversion</th>
                </tr>
              </thead>
              <tbody>
                {topAmbassadeurs.map((amb, idx) => {
                  const convRate = amb.filleuls_recrutes > 0 
                    ? ((amb.utilisateurs_actifs / amb.filleuls_recrutes) * 100).toFixed(2)
                    : 0;
                  return (
                    <tr key={idx}>
                      <td>{amb.ambassadeur || amb.name || amb.nom || 'N/A'}</td>
                      <td>{amb.filleuls_recrutes || 0}</td>
                      <td>{amb.utilisateurs_actifs || 0}</td>
                      <td>{convRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>Aucun ambassadeur enregistré</p>
          )}
        </div>

        {/* Dépenses Totales */}
        <div className="chart-container">
          <h2>💸 Évolution des Dépenses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Line type="monotone" dataKey="depenses" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
