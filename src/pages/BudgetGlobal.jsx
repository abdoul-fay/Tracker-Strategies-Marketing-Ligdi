import { useState, useMemo } from 'react';
import './BudgetGlobal.css';

// Formatteur de nombres: k, M, G seulement si > 8 chiffres
const formatNumber = (num) => {
  const absNum = Math.abs(num);
  if (absNum >= 100000000) return (num / 1000000000).toFixed(1) + 'G';
  if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (absNum >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
};

const PERIODS = [
  { value: 'week', label: 'Hebdomadaire' },
  { value: 'month', label: 'Mensuel' },
  { value: 'year', label: 'Annuel' }
];

export default function BudgetGlobal({ campagnes = [] }) {
  const [period, setPeriod] = useState('week');

  const budgetData = useMemo(() => {
    const result = {};
    campagnes.forEach(c => {
      const date = c.date_start ? new Date(c.date_start) : new Date();
      let key = '';
      if (period === 'week') {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const diff = date - startOfYear;
        const oneDay = 24 * 60 * 60 * 1000;
        const dayOfYear = Math.floor(diff / oneDay);
        const week = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
        key = `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
      } else if (period === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = `${date.getFullYear()}`;
      }
      if (!result[key]) {
        result[key] = { budgetPrevx: 0, budgetReal: 0, byCanal: {} };
      }
      result[key].budgetPrevx += c.budget || 0;
      result[key].budgetReal += c.budget_reel || 0;
      const canal = c.canal || 'Autre';
      if (!result[key].byCanal[canal]) {
        result[key].byCanal[canal] = { prevx: 0, real: 0 };
      }
      result[key].byCanal[canal].prevx += c.budget || 0;
      result[key].byCanal[canal].real += c.budget_reel || 0;
    });
    return result;
  }, [campagnes, period]);

  const totalPrevx = Object.values(budgetData).reduce((sum, m) => sum + m.budgetPrevx, 0);
  const totalReal = Object.values(budgetData).reduce((sum, m) => sum + m.budgetReal, 0);
  const ecartGlobal = totalPrevx > 0 ? ((totalReal / totalPrevx - 1) * 100).toFixed(2) : 0;

  return (
    <div className="budget-global">
      <h1>💰 Budget Global</h1>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 'bold', marginRight: 10 }}>Période :</label>
        <select value={period} onChange={e => setPeriod(e.target.value)}>
          {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      <div className="budget-summary">
        <div className="summary-item">
          <h3>Budget Total Prévu</h3>
          <p>{formatNumber(totalPrevx)} FCFA</p>
        </div>
        <div className="summary-item">
          <h3>Budget Total Réel</h3>
          <p>{formatNumber(totalReal)} FCFA</p>
        </div>
        <div className="summary-item">
          <h3>Écart Global</h3>
          <p style={{ color: ecartGlobal > 0 ? '#dc3545' : '#28a745' }}>{ecartGlobal}%</p>
        </div>
        <div className="summary-item">
          <h3>Économies / Dépassements</h3>
          <p style={{ color: (totalReal - totalPrevx) > 0 ? '#dc3545' : '#28a745' }}>{formatNumber(totalReal - totalPrevx)} FCFA</p>
        </div>
      </div>
      <div className="budget-table">
        <h2>Budget par {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}</h2>
        <table>
          <thead>
            <tr>
              <th>{period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}</th>
              <th>Budget Prévu</th>
              <th>Budget Réel</th>
              <th>Écart (FCFA)</th>
              <th>Écart %</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(budgetData).sort().map(([key, data]) => {
              const ecart = data.budgetReal - data.budgetPrevx;
              const ecartPct = data.budgetPrevx > 0 ? ((data.budgetReal / data.budgetPrevx - 1) * 100).toFixed(2) : 0;
              const statut = ecart > 0 ? '❌ Dépassement' : '✅ Dans budget';
              return (
                <tr key={key}>
                  <td><strong>{key}</strong></td>
                  <td>{formatNumber(data.budgetPrevx)}</td>
                  <td>{formatNumber(data.budgetReal)}</td>
                  <td style={{ color: ecart > 0 ? '#dc3545' : '#28a745' }}>{formatNumber(ecart)}</td>
                  <td style={{ color: ecartPct > 0 ? '#dc3545' : '#28a745' }}>{ecartPct}%</td>
                  <td>{statut}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="budget-by-canal">
        <h2>Budget par Canal</h2>
        {Object.entries(budgetData).sort().map(([key, data]) => (
          <div key={`canal-${key}`} className="canal-section">
            <h3>{key}</h3>
            <table>
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>Budget Prévu</th>
                  <th>Budget Réel</th>
                  <th>Écart %</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.byCanal).sort().map(([canal, values]) => {
                  const ecart = values.prevx > 0 ? ((values.real / values.prevx - 1) * 100).toFixed(2) : 0;
                  return (
                    <tr key={`${key}-${canal}`}>
                      <td>{canal}</td>
                      <td>{formatNumber(values.prevx)}</td>
                      <td>{formatNumber(values.real)}</td>
                      <td style={{ color: ecart > 0 ? '#dc3545' : '#28a745' }}>{ecart}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      {campagnes.length === 0 && (
        <div className="empty-state">
          <p>Aucune campagne enregistrée. Commencez par ajouter une campagne dans le Plan Marketing.</p>
        </div>
      )}
    </div>
  );
}
