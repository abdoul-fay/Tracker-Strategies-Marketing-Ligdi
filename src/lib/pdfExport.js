/**
 * Module d'export PDF pour Ligdi Marketing Tracker
 * Utilise html2pdf.js via CDN
 */

// Charger html2pdf depuis CDN si pas déjà chargé
function loadHtml2Pdf() {
  return new Promise((resolve) => {
    if (window.html2pdf) {
      resolve()
      return
    }
    
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

/**
 * Génère un PDF avec les données des campagnes
 */
export async function exportCampagnesPDF(campagnes = []) {
  await loadHtml2Pdf()
  
  const date = new Date().toLocaleDateString('fr-FR')
  const totalBudget = campagnes.reduce((sum, c) => sum + (c.budget || 0), 0)
  const totalReal = campagnes.reduce((sum, c) => sum + (c.budget_reel || 0), 0)
  const totalROI = campagnes.length > 0 
    ? campagnes.reduce((sum, c) => sum + (c.roi || 0), 0) / campagnes.length 
    : 0

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Rapport Campagnes Marketing</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #6366f1;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #6366f1;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .summary {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f8fafc;
          padding: 15px;
          border-left: 4px solid #6366f1;
          border-radius: 4px;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          color: #6366f1;
          font-size: 13px;
          text-transform: uppercase;
        }
        .summary-card p {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          color: #1a1a2e;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 12px;
        }
        table thead {
          background: #6366f1;
          color: white;
        }
        table th, table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        table tbody tr:nth-child(even) {
          background: #f8fafc;
        }
        table tbody tr:hover {
          background: #f0f4f8;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #999;
          font-size: 11px;
        }
        .green { color: #10b981; font-weight: bold; }
        .red { color: #ef4444; font-weight: bold; }
        .orange { color: #f59e0b; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Rapport Campagnes Marketing</h1>
        <p>Ligdi Marketing Tracker</p>
        <p>Généré le ${date}</p>
      </div>

      <div class="summary">
        <div class="summary-card">
          <h3>💰 Budget Total</h3>
          <p>${(totalBudget / 1000000).toFixed(1)}M FCFA</p>
        </div>
        <div class="summary-card">
          <h3>💸 Dépensé</h3>
          <p>${(totalReal / 1000000).toFixed(1)}M FCFA</p>
        </div>
        <div class="summary-card">
          <h3>📈 ROI Moyen</h3>
          <p>${totalROI.toFixed(2)}%</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Campagne</th>
            <th>Canal</th>
            <th>Budget</th>
            <th>Dépensé</th>
            <th>Écart</th>
            <th>ROI</th>
            <th>Reach</th>
          </tr>
        </thead>
        <tbody>
          ${campagnes.map(camp => {
            const ecart = camp.budget > 0 ? ((camp.budget_reel - camp.budget) / camp.budget * 100).toFixed(1) : 0
            const ecartClass = ecart > 0 ? 'red' : ecart < -5 ? 'green' : ''
            return `
              <tr>
                <td><strong>${camp.name || '-'}</strong></td>
                <td>${camp.canal || '-'}</td>
                <td>${(camp.budget || 0).toLocaleString('fr-FR')} F</td>
                <td>${(camp.budget_reel || 0).toLocaleString('fr-FR')} F</td>
                <td><span class="${ecartClass}">${ecart}%</span></td>
                <td>${(camp.roi || 0).toFixed(2)}%</td>
                <td>${(camp.reach || 0).toLocaleString('fr-FR')}</td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Ce rapport a été généré automatiquement par Ligdi Marketing Tracker</p>
        <p>Pour plus d'informations, consultez le dashboard complet</p>
      </div>
    </body>
    </html>
  `

  const element = document.createElement('div')
  element.innerHTML = html
  
  const opt = {
    margin: 10,
    filename: `rapport_campagnes_${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  }

  window.html2pdf().set(opt).from(element).save()
}

/**
 * Génère un PDF avec statistiques KPI
 */
export async function exportKPIPDF(kpiList = []) {
  await loadHtml2Pdf()

  const date = new Date().toLocaleDateString('fr-FR')
  const latestKPI = kpiList.length > 0 ? kpiList[0] : null

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Rapport KPI Financiers</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #6366f1;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #6366f1;
          font-size: 28px;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 20px;
        }
        .kpi-item {
          background: #f8fafc;
          padding: 15px;
          border-radius: 4px;
          border-left: 4px solid #6366f1;
        }
        .kpi-item h3 {
          margin: 0 0 10px 0;
          color: #6366f1;
          font-size: 13px;
        }
        .kpi-values {
          display: flex;
          gap: 20px;
        }
        .kpi-value {
          flex: 1;
        }
        .kpi-value label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
        }
        .kpi-value p {
          margin: 5px 0 0 0;
          font-size: 20px;
          font-weight: bold;
          color: #1a1a2e;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #999;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💰 Rapport KPI Financiers</h1>
        <p>Généré le ${date}</p>
      </div>

      ${latestKPI ? `
        <div class="kpi-grid">
          ${Object.entries(latestKPI.cible || {}).map(([key, value]) => `
            <div class="kpi-item">
              <h3>${key.toUpperCase()}</h3>
              <div class="kpi-values">
                <div class="kpi-value">
                  <label>Cible</label>
                  <p>${value.toLocaleString('fr-FR')} F</p>
                </div>
                <div class="kpi-value">
                  <label>Réel</label>
                  <p>${(latestKPI.reel?.[key] || 0).toLocaleString('fr-FR')} F</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : '<p>Aucune donnée KPI disponible</p>'}

      <div class="footer">
        <p>Ce rapport a été généré automatiquement par Ligdi Marketing Tracker</p>
      </div>
    </body>
    </html>
  `

  const element = document.createElement('div')
  element.innerHTML = html

  const opt = {
    margin: 10,
    filename: `rapport_kpi_${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  }

  window.html2pdf().set(opt).from(element).save()
}

export default { exportCampagnesPDF, exportKPIPDF }
