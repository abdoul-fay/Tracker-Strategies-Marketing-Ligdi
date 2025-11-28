import { createClient } from '@supabase/supabase-js';
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

(async () => {
  try {
    console.log('📊 VÉRIFICATION DES DONNÉES STOCKÉES');
    console.log('=====================================\n');
    
    // Récupérer KPI
    const { data: kpiData, error: kpiError } = await supabase
      .from('kpi_financiers')
      .select('*');
    
    console.log('📈 KPI FINANCIERS:');
    if (kpiError) {
      console.log('❌ Erreur:', kpiError.message);
    } else {
      console.log('Nombre d\'entrées:', kpiData.length);
      if (kpiData.length === 0) {
        console.log('  ⚠️  Aucune donnée trouvée');
      } else {
        kpiData.forEach((kpi, idx) => {
          const cibleStr = kpi.cible ? JSON.stringify(kpi.cible).substring(0, 80) : 'null';
          const reelStr = kpi.reel ? JSON.stringify(kpi.reel).substring(0, 80) : 'null';
          console.log(`  [${idx + 1}] Mois: ${kpi.mois}`);
          console.log(`       Cible: ${cibleStr}...`);
          console.log(`       Réel: ${reelStr}...`);
        });
      }
    }
    
    console.log('\n📍 AMBASSADEURS:');
    const { data: ambData, error: ambError } = await supabase
      .from('ambassadeurs')
      .select('*');
    
    if (ambError) {
      console.log('❌ Erreur:', ambError.message);
    } else {
      console.log('Nombre d\'ambassadeurs:', ambData.length);
      if (ambData.length === 0) {
        console.log('  ⚠️  Aucun ambassadeur trouvé');
      } else {
        ambData.forEach((amb, idx) => {
          console.log(`  [${idx + 1}] ${amb.ambassadeur} (${amb.canal})`);
          console.log(`       Filleuls: ${amb.filleulsRecrutés}, Actifs: ${amb.utilisateursActifs}, Récompense: ${amb.récompenseTotal}€`);
        });
      }
    }
    
    console.log('\n🎯 STRATÉGIES:');
    const { data: stratData, error: stratError } = await supabase
      .from('strategies')
      .select('*');
    
    if (stratError) {
      console.log('❌ Erreur:', stratError.message);
    } else {
      console.log('Nombre de stratégies:', stratData.length);
      if (stratData.length === 0) {
        console.log('  ⚠️  Aucune stratégie trouvée');
      } else {
        stratData.forEach((strat, idx) => {
          console.log(`  [${idx + 1}] ${strat.titre}`);
          console.log(`       Mois: ${strat.mois}, Année: ${strat.annee}, Budget: ${strat.budgetTotal}€`);
        });
      }
    }
  } catch (err) {
    console.log('❌ Erreur:', err.message);
  }
})();
