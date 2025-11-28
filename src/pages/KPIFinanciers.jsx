import React, { useState, useEffect } from 'react';
import { supabase, db } from '../lib/supabase';
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
  const [kpiList, setKpiList] = useState([]);
  const [form, setForm] = useState(initialKPI);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadKPIs = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
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
        // Garder localStorage comme backup
        localStorage.setItem('kpiFinanciers', JSON.stringify(data || []));
      }
    } catch (err) {
      console.error('Erreur Supabase:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Charger les KPI depuis Supabase au démarrage (avec loader)
  useEffect(() => {
    loadKPIs(true);
  }, []);

  // Polling: recharger les KPI toutes les 5 secondes pour synchro en temps réel (sans loader)
  useEffect(() => {
    const interval = setInterval(() => {
      loadKPIs(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Préparer les données avec les valeurs calculées
    const newKPI = {
      mois: form.mois,
      cible: JSON.stringify({
        ...form.cible,
        CPA: autoCible.CPA,
        panierMoyen: autoCible.panierMoyen,
        benefices: autoCible.benefices,
        beneficeBrut: autoCible.beneficeBrut
      }),
      reel: JSON.stringify({
        ...form.reel,
        CPA: autoReel.CPA,
        panierMoyen: autoReel.panierMoyen,
        benefices: autoReel.benefices,
        beneficeBrut: autoReel.beneficeBrut
      })
    };

    try {
      if (editingId) {
        // Mise à jour
        const { data, error } = await supabase
          .from('kpi_financiers')
          .update(newKPI)
          .eq('id', editingId)
          .select();

        if (error) {
          console.error('Erreur mise à jour:', error);
          alert('Erreur lors de la mise à jour: ' + error.message);
        } else {
          console.log('KPI mis à jour:', data);
          alert('KPI modifié avec succès!');
          setEditingId(null);
          setShowEditModal(false);
          setForm(initialKPI);
          loadKPIs();
        }
      } else {
        // Insertion nouvelle
        const { data, error } = await supabase
          .from('kpi_financiers')
          .insert([newKPI])
          .select();

        if (error) {
          console.error('Erreur sauvegarde:', error);
          alert('Erreur lors de la sauvegarde: ' + error.message);
        } else {
          console.log('KPI sauvegardé avec succès:', data);
          setKpiList([data[0], ...kpiList]);
          setForm(initialKPI);
          alert('KPI enregistré avec succès!');
          // Recharger depuis Supabase pour sync
          loadKPIs();
        }
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur: ' + err.message);
    }
  };

  const handleEdit = (kpi) => {
    // Charger le KPI à éditer
    const cible = typeof kpi.cible === 'string' ? JSON.parse(kpi.cible) : kpi.cible;
    const reel = typeof kpi.reel === 'string' ? JSON.parse(kpi.reel) : kpi.reel;
    
    setForm({
      mois: kpi.mois,
      cible,
      reel
    });
    setEditingId(kpi.id);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce KPI ?')) return;

    try {
      const { error } = await supabase
        .from('kpi_financiers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression: ' + error.message);
      } else {
        console.log('KPI supprimé');
        alert('KPI supprimé avec succès!');
        loadKPIs();
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur: ' + err.message);
    }
  };

  const handleCancel = () => {
    setForm(initialKPI);
    setEditingId(null);
    setShowEditModal(false);
  };

  return (
    <div className="kpi-financiers-container">
      <h2>KPI Financiers Mensuels</h2>
      {loading && <p style={{ color: '#666', fontStyle: 'italic' }}>Chargement des données...</p>}
      
      <form className="kpi-form" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>{editingId ? '✏️ Modifier KPI' : '➕ Nouveau KPI'}</h3>
          {editingId && (
            <button type="button" onClick={handleCancel} className="btn-cancel">
              Annuler
            </button>
          )}
        </div>
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
        <button type="submit" disabled={loading}>{editingId ? 'Mettre à jour' : 'Enregistrer'}</button>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {kpiList.map((kpi) => {
                const cible = typeof kpi.cible === 'string' ? JSON.parse(kpi.cible) : kpi.cible;
                const reel = typeof kpi.reel === 'string' ? JSON.parse(kpi.reel) : kpi.reel;
                return (
                <tr key={`cible-${kpi.id}`}>
                  <td><strong>{kpi.mois}</strong></td>
                  <td>{cible.coutUtilisateur}</td>
                  <td>{cible.CPA}</td>
                  <td>{cible.transactions}</td>
                  <td>{cible.panierMoyen}</td>
                  <td>{cible.volume}</td>
                  <td>{cible.beneficeBrut}</td>
                  <td>{cible.benefices}</td>
                  <td>{cible.depenses}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button onClick={() => handleEdit(kpi)} className="btn-edit" title="Modifier">✏️</button>
                    <button onClick={() => handleDelete(kpi.id)} className="btn-delete" title="Supprimer">🗑️</button>
                  </td>
                </tr>
                );
              })}
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {kpiList.map((kpi) => {
                const cible = typeof kpi.cible === 'string' ? JSON.parse(kpi.cible) : kpi.cible;
                const reel = typeof kpi.reel === 'string' ? JSON.parse(kpi.reel) : kpi.reel;
                return (
                <tr key={`reel-${kpi.id}`}>
                  <td><strong>{kpi.mois}</strong></td>
                  <td>{reel.coutUtilisateur}</td>
                  <td>{reel.CPA}</td>
                  <td>{reel.transactions}</td>
                  <td>{reel.panierMoyen}</td>
                  <td>{reel.volume}</td>
                  <td>{reel.beneficeBrut}</td>
                  <td>{reel.benefices}</td>
                  <td>{reel.depenses}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button onClick={() => handleEdit(kpi)} className="btn-edit" title="Modifier">✏️</button>
                    <button onClick={() => handleDelete(kpi.id)} className="btn-delete" title="Supprimer">🗑️</button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default KPIFinanciers;
