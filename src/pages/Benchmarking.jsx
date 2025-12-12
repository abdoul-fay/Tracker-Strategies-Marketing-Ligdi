import { useMemo, useState } from 'react'
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Benchmarking.css'

const formatNumber = (num) => {
  const absNum = Math.abs(num);
  if (absNum >= 1000000000) return (num / 1000000000).toFixed(1) + 'G';
  if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (absNum >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
};

export default function Benchmarking({ campagnes = [] }) {
  const [sortBy, setSortBy] = useState('roi')

  const rankings = useMemo(() => {
    if (campagnes.length === 0) return {}

    const metrics = {
      roi: [...campagnes].sort((a, b) => (b.roi || 0) - (a.roi || 0)),
      reach: [...campagnes].sort((a, b) => (b.reach || 0) - (a.reach || 0)),
      efficiency: [...campagnes].sort((a, b) => {
        const aEff = a.budget > 0 ? (a.reach || 0) / a.budget : 0
        const bEff = b.budget > 0 ? (b.reach || 0) / b.budget : 0
        return bEff - aEff
      }),
      budget: [...campagnes].sort((a, b) => (b.budget || 0) - (a.budget || 0))
    }

    return metrics
  }, [campagnes])

  const averageMetrics = useMemo(() => {
    if (campagnes.length === 0) return {}

    const avgROI = campagnes.reduce((sum, c) => sum + (c.roi || 0), 0) / campagnes.length
    const avgReach = campagnes.reduce((sum, c) => sum + (c.reach || 0), 0) / campagnes.length
    const avgBudget = campagnes.reduce((sum, c) => sum + (c.budget || 0), 0) / campagnes.length
    const avgEfficiency = campagnes.length > 0 
      ? campagnes.reduce((sum, c) => sum + (c.budget > 0 ? (c.reach || 0) / c.budget : 0), 0) / campagnes.length
      : 0

    return { avgROI, avgReach, avgBudget, avgEfficiency }
  }, [campagnes])

  const scatterData = useMemo(() => {
    return campagnes.map(c => ({
      name: c.nom,
      budget: c.budget || 0,
      roi: c.roi || 0,
      reach: c.reach || 0
    }))
  }, [campagnes])

  const topPerformers = useMemo(() => {
    return [...campagnes]
      .sort((a, b) => (b.roi || 0) - (a.roi || 0))
      .slice(0, 5)
  }, [campagnes])

  const bottomPerformers = useMemo(() => {
    return [...campagnes]
      .sort((a, b) => (a.roi || 0) - (b.roi || 0))
      .slice(0, 5)
  }, [campagnes])

  const sortedCampagnes = rankings[sortBy] || []

  return (
    <div className="benchmarking">
      <div className="bench-header">
        <h1>🏆 Benchmarking des Campagnes</h1>
        <p>Comparez les performances de vos campagnes</p>
      </div>

      {/* Métriques Moyennes */}
      <div className="bench-averages">
        <div className="bench-avg-card">
          <div className="avg-label">ROI Moyen</div>
          <div className="avg-value">{averageMetrics.avgROI?.toFixed(1)}%</div>
        </div>
        <div className="bench-avg-card">
          <div className="avg-label">Reach Moyen</div>
          <div className="avg-value">{formatNumber(averageMetrics.avgReach || 0)}</div>
        </div>
        <div className="bench-avg-card">
          <div className="avg-label">Budget Moyen</div>
          <div className="avg-value">{formatNumber(averageMetrics.avgBudget || 0)}</div>
        </div>
        <div className="bench-avg-card">
          <div className="avg-label">Efficacité</div>
          <div className="avg-value">{(averageMetrics.avgEfficiency || 0).toFixed(2)}</div>
        </div>
      </div>

      {/* Top vs Bottom Performers */}
      <div className="bench-performers">
        <div className="bench-section top-section">
          <h2>🌟 Top 5 Campagnes (ROI)</h2>
          <div className="performers-list">
            {topPerformers.map((camp, i) => (
              <div key={i} className="performer-card top">
                <div className="performer-rank">#{i + 1}</div>
                <div className="performer-info">
                  <h4>{camp.nom}</h4>
                  <p className="performer-metric">ROI: {(camp.roi || 0).toFixed(1)}%</p>
                  <p className="performer-detail">Reach: {formatNumber(camp.reach || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bench-section bottom-section">
          <h2>📉 À Optimiser (Bas ROI)</h2>
          <div className="performers-list">
            {bottomPerformers.map((camp, i) => (
              <div key={i} className="performer-card bottom">
                <div className="performer-rank">#{i + 1}</div>
                <div className="performer-info">
                  <h4>{camp.nom}</h4>
                  <p className="performer-metric">ROI: {(camp.roi || 0).toFixed(1)}%</p>
                  <p className="performer-detail">Reach: {formatNumber(camp.reach || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="bench-charts">
        <div className="bench-chart">
          <h3>📊 Budget vs ROI</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={scatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="budget" name="Budget" />
              <YAxis dataKey="roi" name="ROI %" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                name="Campagnes" 
                data={scatterData} 
                fill="#6366f1"
                onClick={(point) => console.log(point)}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bench-chart">
          <h3>🎯 Classement par ROI</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={sortedCampagnes.slice(0, 10)}
              layout="vertical"
              margin={{ left: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nom" type="category" width={110} />
              <Tooltip />
              <Bar dataKey="roi" fill="#6366f1" name="ROI %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Classements */}
      <div className="bench-section rankings-section">
        <div className="ranking-controls">
          <h2>📋 Classements</h2>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="roi">Par ROI</option>
            <option value="reach">Par Reach</option>
            <option value="efficiency">Par Efficacité</option>
            <option value="budget">Par Budget</option>
          </select>
        </div>

        <div className="bench-table-container">
          <table className="bench-table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Campagne</th>
                <th>Canal</th>
                <th>Budget</th>
                <th>Reach</th>
                <th>ROI</th>
                <th>Efficacité</th>
              </tr>
            </thead>
            <tbody>
              {sortedCampagnes.map((camp, i) => {
                const efficiency = camp.budget > 0 ? ((camp.reach || 0) / camp.budget).toFixed(3) : 0
                const avgROI = averageMetrics.avgROI || 0
                const isAboveAvg = (camp.roi || 0) >= avgROI

                return (
                  <tr key={i} className={isAboveAvg ? 'above-avg' : 'below-avg'}>
                    <td className="rank-cell">#{i + 1}</td>
                    <td>{camp.nom}</td>
                    <td>{camp.canal || 'N/A'}</td>
                    <td>{formatNumber(camp.budget || 0)}</td>
                    <td>{formatNumber(camp.reach || 0)}</td>
                    <td className={`roi-cell ${isAboveAvg ? 'positive' : 'negative'}`}>
                      {(camp.roi || 0).toFixed(1)}%
                    </td>
                    <td>{efficiency}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bench-insights">
        <h2>💡 Insights Benchmarking</h2>
        <div className="insights-list">
          <div className="insight">
            <span className="insight-icon">🎯</span>
            <div>
              <h4>Campagne Meilleure ROI</h4>
              <p>{topPerformers[0]?.nom} avec {(topPerformers[0]?.roi || 0).toFixed(1)}%</p>
            </div>
          </div>
          <div className="insight">
            <span className="insight-icon">👥</span>
            <div>
              <h4>Meilleure Reach</h4>
              <p>{rankings.reach?.[0]?.nom} avec {formatNumber(rankings.reach?.[0]?.reach || 0)} contacts</p>
            </div>
          </div>
          <div className="insight">
            <span className="insight-icon">⚡</span>
            <div>
              <h4>Efficacité Moyenne</h4>
              <p>{(averageMetrics.avgEfficiency || 0).toFixed(3)} utilisateurs par FCFA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
