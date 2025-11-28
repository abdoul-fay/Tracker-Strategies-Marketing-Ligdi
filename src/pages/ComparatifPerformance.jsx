import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../lib/supabase';
import './ComparatifPerformance.css';

const PERIODS = [
  { value: 'week', label: 'Hebdomadaire' },
  { value: 'month', label: 'Mensuel' },
  { value: 'year', label: 'Annuel' }
];

export default function ComparatifPerformance() {
  const [kpiList, setKpiList] = useState([]);
  const [selectedKPI, setSelectedKPI] = useState(0);
  const [period, setPeriod] = useState('week');

  // Charger les KPI depuis Supabase
  useEffect(() => {
    const loadKPIs = async () => {
      try {
        const { data, error } = await supabase
          .from('kpi_financiers')
          .select('*')
          .order('mois', { ascending: false });
        
        if (error) {
          console.error('Erreur chargement KPI:', error);
          // Fallback sur localStorage
          const saved = localStorage.getItem('kpiFinanciers');
          setKpiList(saved ? JSON.parse(saved) : []);
        } else {
          setKpiList(data || []);
        }
      } catch (err) {
        console.error('Erreur:', err);
      }
    };
    loadKPIs();

    // Polling toutes les 5 secondes
    const interval = setInterval(loadKPIs, 5000);
    return () => clearInterval(interval);
  }, []);

  if (kpiList.length === 0) {
    return (
      <div className="comparatif-empty">
        <h2>Aucun KPI enregistré</h2>
        <p>Accédez à la page "KPI Financiers" pour saisir vos premières données.</p>
      </div>
    );
  }

  const current = kpiList[selectedKPI];
  const mois = current.mois;

  // Parser les données JSON si nécessaire (Supabase retourne des objets ou strings)
  const parseCible = typeof current.cible === 'string' ? JSON.parse(current.cible) : (current.cible || {});
  const parseReel = typeof current.reel === 'string' ? JSON.parse(current.reel) : (current.reel || {});

  // Calcul des écarts
  const ecarts = {
    coutUtilisateur: {
      value: Number(parseReel.coutUtilisateur || 0) - Number(parseCible.coutUtilisateur || 0),
      label: 'Coût Utilisateur'
    },
    CPA: {
      value: Number(parseReel.CPA || 0) - Number(parseCible.CPA || 0),
      label: 'CPA'
    },
    transactions: {
      value: Number(parseReel.transactions || 0) - Number(parseCible.transactions || 0),
      label: 'Transactions'
    },
    panierMoyen: {
      value: Number(parseReel.panierMoyen || 0) - Number(parseCible.panierMoyen || 0),
      label: 'Panier Moyen'
    },
    volume: {
      value: Number(parseReel.volume || 0) - Number(parseCible.volume || 0),
      label: 'Volume'
    },
    benefices: {
      value: Number(parseReel.benefices || 0) - Number(parseCible.benefices || 0),
      label: 'Bénéfices'
    }
  };

  // Données graphique
  const chartData = [
    {
      name: 'Coût Utilisateur',
      Cible: Number(parseCible.coutUtilisateur || 0),
      Réel: Number(parseReel.coutUtilisateur || 0),
      ecart: ecarts.coutUtilisateur.value
    },
    {
      name: 'CPA',
      Cible: Number(parseCible.CPA || 0),
      Réel: Number(parseReel.CPA || 0),
      ecart: ecarts.CPA.value
    },
    {
      name: 'Transactions',
      Cible: Number(parseCible.transactions || 0),
      Réel: Number(parseReel.transactions || 0),
      ecart: ecarts.transactions.value
    },
    {
      name: 'Panier Moyen',
      Cible: Number(parseCible.panierMoyen || 0),
      Réel: Number(parseReel.panierMoyen || 0),
      ecart: ecarts.panierMoyen.value
    },
    {
      name: 'Volume',
      Cible: Number(parseCible.volume || 0),
      Réel: Number(parseReel.volume || 0),
      ecart: ecarts.volume.value
    },
    {
      name: 'Bénéfices',
      Cible: Number(parseCible.benefices || 0),
      Réel: Number(parseReel.benefices || 0),
      ecart: ecarts.benefices.value
    }
  ];

  return (
    <div className="comparatif">
      <h1>📊 Comparatif Performance Cible vs Réel</h1>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 'bold', marginRight: 10 }}>Période :</label>
        <select value={period} onChange={e => setPeriod(e.target.value)}>
          {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      <div className="comparatif-selector">
        <label>Sélectionner un mois :</label>
        <select value={selectedKPI} onChange={(e) => setSelectedKPI(Number(e.target.value))}>
          {kpiList.map((kpi, idx) => (
            <option key={idx} value={idx}>
              {kpi.mois}
            </option>
          ))}
        </select>
      </div>

      <div className="comparatif-chart">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e7ff', borderRadius: '8px' }}
              labelStyle={{ color: '#1a1a2e', fontWeight: 'bold' }}
            />
            <Legend />
            <Bar dataKey="Cible" fill="#6366f1" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Réel" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="comparatif-ecarts">
        <h2>📈 Analyse des Écarts</h2>
        <div className="ecarts-grid">
          {Object.entries(ecarts).map(([key, data]) => {
            const isPositive = data.value > 0;
            const isGood = (key === 'CPA' || key === 'coutUtilisateur') ? !isPositive : isPositive;
            return (
              <div key={key} className={`ecart-card ${isGood ? 'ecart-good' : 'ecart-bad'}`}>
                <p className="ecart-label">{data.label}</p>
                <p className="ecart-icon">{isGood ? '✅' : '⚠️'}</p>
                <p className="ecart-value">{isPositive ? '+' : ''}{data.value.toFixed(2)}</p>
                <p className="ecart-status">
                  {isGood ? 'Dépassement positif' : 'Dépassement négatif'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="comparatif-detailed">
        <h2>📋 Détails Complets</h2>
        <div className="detailed-table">
          <div className="table-row table-header">
            <div className="table-cell">Indicateur</div>
            <div className="table-cell">Cible</div>
            <div className="table-cell">Réel</div>
            <div className="table-cell">Écart</div>
            <div className="table-cell">% Écart</div>
          </div>
          {chartData.map((item, idx) => (
            <div key={idx} className="table-row">
              <div className="table-cell"><strong>{item.name}</strong></div>
              <div className="table-cell">{item.Cible.toLocaleString()}</div>
              <div className="table-cell">{item.Réel.toLocaleString()}</div>
              <div className="table-cell" style={{ color: item.ecart > 0 ? '#ef4444' : '#10b981' }}>
                {item.ecart > 0 ? '+' : ''}{item.ecart.toFixed(2)}
              </div>
              <div className="table-cell">
                {item.Cible > 0 ? ((item.ecart / item.Cible) * 100).toFixed(1) : '0'}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="comparatif-insights">
        <h2>💡 Insights</h2>
        <div className="insights-list">
          <div className="insight">
            <p className="insight-title">🎯 Performance générale</p>
            <p className="insight-text">
              Basée sur les {Object.values(ecarts).filter(e => e.value < 0).length} indicateurs en dépassement positif 
              et {Object.values(ecarts).filter(e => e.value > 0).length} en dépassement négatif.
            </p>
          </div>
          <div className="insight">
            <p className="insight-title">💰 Bénéfices</p>
            <p className="insight-text">
              Écart de {ecarts.benefices.value.toFixed(2)} F 
              ({((ecarts.benefices.value / Number(current.cible.benefices)) * 100).toFixed(1)}%)
            </p>
          </div>
          <div className="insight">
            <p className="insight-title">📊 Actions recommandées</p>
            <p className="insight-text">
              {ecarts.CPA.value < 0 ? '✅ CPA en amélioration' : '⚠️ Optimiser le CPA'} - 
              {ecarts.transactions.value >= 0 ? '✅ Transactions en hausse' : '⚠️ Revoir stratégie transactions'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
