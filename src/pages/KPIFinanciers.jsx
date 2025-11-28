import React, { useState, useEffect } from 'react';
import './KPIFinanciers.css';

const initialKPI = {
  mois: '',
  cible: {
    coutUtilisateur: '',
    margePercent: '2',
    CPA: '',
    transactions: '',
    panierMoyen: '',
    volume: '',
    benefices: '',
    depenses: '',
  },
  reel: {
    coutUtilisateur: '',
    margePercent: '2',
    CPA: '',
    transactions: '',
    panierMoyen: '',
    volume: '',
    benefices: '',
    depenses: '',
  }
};


function calcKPI(base) {
  const transactions = Number(base.transactions) || 0;
  const volume = Number(base.volume) || 0;
  const depenses = Number(base.depenses) || 0;
  const marge = Number(base.margePercent) || 0; // pourcentage de marge sur le volume
  const utilisateurs = Number(base.coutUtilisateur) || 0;
  const CPA = utilisateurs > 0 ? (depenses / utilisateurs).toFixed(2) : '';
  const panierMoyen = transactions > 0 ? (volume / transactions).toFixed(2) : '';
  const beneficeBrut = (volume * (marge / 100));
  // bénéfice réel = bénéfice brut - dépenses
  const benefices = (beneficeBrut - depenses).toFixed(2);
  return { CPA, panierMoyen, benefices, beneficeBrut: beneficeBrut.toFixed(2) };
}

function KPIFinanciers() {
  const [kpiList, setKpiList] = useState(() => {
    const saved = localStorage.getItem('kpiFinanciers');
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState(initialKPI);

  useEffect(() => {
    localStorage.setItem('kpiFinanciers', JSON.stringify(kpiList));
  }, [kpiList]);

  // Calculs automatiques pour cible et réel
  const autoCible = calcKPI(form.cible);
  const autoReel = calcKPI(form.reel);

  const handleChange = (e, type, field) => {
    setForm({
      ...form,
      [type]: {
        ...form[type],
        [field]: e.target.value
      }
    });
  };

  const handleMoisChange = (e) => {
    setForm({ ...form, mois: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Enregistrer les valeurs calculées
    const newForm = {
      ...form,
      cible: {
        ...form.cible,
        CPA: autoCible.CPA,
        panierMoyen: autoCible.panierMoyen,
        benefices: autoCible.benefices,
        beneficeBrut: autoCible.beneficeBrut
      },
      reel: {
        ...form.reel,
        CPA: autoReel.CPA,
        panierMoyen: autoReel.panierMoyen,
        benefices: autoReel.benefices,
        beneficeBrut: autoReel.beneficeBrut
      }
    };
    setKpiList([newForm, ...kpiList]);
    setForm(initialKPI);
  };

  return (
    <div className="kpi-financiers-container">
      <h2>KPI Financiers Mensuels</h2>
      <form className="kpi-form" onSubmit={handleSubmit}>
        <div>
          <label>Mois:</label>
          <input type="month" value={form.mois} onChange={handleMoisChange} required />
        </div>
        <div className="kpi-section">
          <h3>Cible</h3>
          <input type="number" placeholder="Nombre d'utilisateurs ciblés" value={form.cible.coutUtilisateur} onChange={e => handleChange(e, 'cible', 'coutUtilisateur')} required />
            <div className="input-with-help">
              <input type="number" placeholder="Marge bénéfice (%)" value={form.cible.margePercent} onChange={e => handleChange(e, 'cible', 'margePercent')} required />
              <span className="help" title="Formule: bénéfice brut = volume * (marge% / 100). Bénéfice réel = bénéfice brut - dépenses.">?</span>
            </div>
          <input type="number" placeholder="Transactions mensuelles (Cible)" value={form.cible.transactions} onChange={e => handleChange(e, 'cible', 'transactions')} required />
          <input type="number" placeholder="Volume total des transactions (Cible)" value={form.cible.volume} onChange={e => handleChange(e, 'cible', 'volume')} required />
          <input type="number" placeholder="Dépenses (Cible)" value={form.cible.depenses} onChange={e => handleChange(e, 'cible', 'depenses')} required />
          <div className="kpi-auto">
            <label>CPA (auto):</label>
            <input type="text" value={autoCible.CPA} readOnly />
            <label>Panier moyen (auto):</label>
            <input type="text" value={autoCible.panierMoyen} readOnly />
              <label>Bénéfice brut (auto):</label>
              <input type="text" value={autoCible.beneficeBrut} readOnly />
              <label>Bénéfice réel (auto):</label>
              <input type="text" value={autoCible.benefices} readOnly />
          </div>
        </div>
        <div className="kpi-section">
          <h3>Réel</h3>
          <input type="number" placeholder="Nombre d'utilisateurs obtenus" value={form.reel.coutUtilisateur} onChange={e => handleChange(e, 'reel', 'coutUtilisateur')} required />
            <div className="input-with-help">
              <input type="number" placeholder="Marge bénéfice (%)" value={form.reel.margePercent} onChange={e => handleChange(e, 'reel', 'margePercent')} required />
              <span className="help" title="Formule: bénéfice brut = volume * (marge% / 100). Bénéfice réel = bénéfice brut - dépenses.">?</span>
            </div>
          <input type="number" placeholder="Transactions mensuelles (Réel)" value={form.reel.transactions} onChange={e => handleChange(e, 'reel', 'transactions')} required />
          <input type="number" placeholder="Volume total des transactions (Réel)" value={form.reel.volume} onChange={e => handleChange(e, 'reel', 'volume')} required />
          <input type="number" placeholder="Dépenses (Réel)" value={form.reel.depenses} onChange={e => handleChange(e, 'reel', 'depenses')} required />
          <div className="kpi-auto">
            <label>CPA (auto):</label>
            <input type="text" value={autoReel.CPA} readOnly />
            <label>Panier moyen (auto):</label>
            <input type="text" value={autoReel.panierMoyen} readOnly />
              <label>Bénéfice brut (auto):</label>
              <input type="text" value={autoReel.beneficeBrut} readOnly />
              <label>Bénéfice réel (auto):</label>
              <input type="text" value={autoReel.benefices} readOnly />
          </div>
        </div>
        <button type="submit">Enregistrer</button>
      </form>
      {/* Tableaux séparés Cible et Réel */}
      <div className="kpi-history">
        <h3>📊 Historique KPI - Cible</h3>
        {kpiList.length === 0 ? <p>Aucune donnée enregistrée.</p> : (
          <table>
            <thead>
              <tr>
                <th>Mois</th>
                <th>Utilisateurs</th>
                <th>CPA</th>
                <th>Transactions</th>
                <th>Panier Moyen</th>
                <th>Volume</th>
                <th>Bénéfice Brut</th>
                <th>Bénéfice Réel</th>
                <th>Dépenses</th>
              </tr>
            </thead>
            <tbody>
              {kpiList.map((kpi, idx) => (
                <tr key={`cible-${idx}`}>
                  <td><strong>{kpi.mois}</strong></td>
                  <td>{kpi.cible.coutUtilisateur}</td>
                  <td>{kpi.cible.CPA}</td>
                  <td>{kpi.cible.transactions}</td>
                  <td>{kpi.cible.panierMoyen}</td>
                  <td>{kpi.cible.volume}</td>
                  <td>{kpi.cible.beneficeBrut}</td>
                  <td>{kpi.cible.benefices}</td>
                  <td>{kpi.cible.depenses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="kpi-history">
        <h3>📊 Historique KPI - Réel Obtenu</h3>
        {kpiList.length === 0 ? <p>Aucune donnée enregistrée.</p> : (
          <table>
            <thead>
              <tr>
                <th>Mois</th>
                <th>Utilisateurs</th>
                <th>CPA</th>
                <th>Transactions</th>
                <th>Panier Moyen</th>
                <th>Volume</th>
                <th>Bénéfice Brut</th>
                <th>Bénéfice Réel</th>
                <th>Dépenses</th>
              </tr>
            </thead>
            <tbody>
              {kpiList.map((kpi, idx) => (
                <tr key={`reel-${idx}`}>
                  <td><strong>{kpi.mois}</strong></td>
                  <td>{kpi.reel.coutUtilisateur}</td>
                  <td>{kpi.reel.CPA}</td>
                  <td>{kpi.reel.transactions}</td>
                  <td>{kpi.reel.panierMoyen}</td>
                  <td>{kpi.reel.volume}</td>
                  <td>{kpi.reel.beneficeBrut}</td>
                  <td>{kpi.reel.benefices}</td>
                  <td>{kpi.reel.depenses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default KPIFinanciers;
