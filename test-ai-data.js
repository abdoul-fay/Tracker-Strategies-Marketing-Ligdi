/**
 * Script pour insérer des campagnes de test dans Supabase
 * Usage: node test-ai-data.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wttqgvxqyucvwevvihtf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dHFndnhxeXVjdndldnZpaHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjA5OTcsImV4cCI6MjA3OTgzNjk5N30.jQaGNM6WUEUy5QkCsuyJqk1INRIIZ14sz5CxtbB08W4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Campagnes de test (variées par canal)
const testCampaigns = [
  {
    name: 'Digital Q4 2025 - Ads Google',
    action: 'Google Ads Campaign',
    canal: 'Digital',
    budget: 5000,
    budget_reel: 4850,
    kpi_cible: 'Increase traffic 50%',
    kpi_reel: '65% increase',
    roi: 45,
    reach: 25000,
    engagement: 1250,
    etat: 'En cours',
    responsable: 'Alice',
    date_start: '2025-09-01',
    date_end: '2025-12-31'
  },
  {
    name: 'Influence Collaborations Micro',
    action: 'Micro-Influencer Campaign',
    canal: 'Influence',
    budget: 8000,
    budget_reel: 7920,
    kpi_cible: '100k reach',
    kpi_reel: '156k reach',
    roi: 52,
    reach: 156000,
    engagement: 9360,
    etat: 'En cours',
    responsable: 'Bob',
    date_start: '2025-08-15',
    date_end: '2025-11-30'
  },
  {
    name: 'Radio Spots Matinaux',
    action: 'Morning Radio Spots',
    canal: 'Radio',
    budget: 3500,
    budget_reel: 3450,
    kpi_cible: '40k reach',
    kpi_reel: '35.2k reach',
    roi: 22,
    reach: 35200,
    engagement: 1056,
    etat: 'En cours',
    responsable: 'Charlie',
    date_start: '2025-10-01',
    date_end: '2025-11-30'
  },
  {
    name: 'Terrain Activations Pop-up',
    action: 'Pop-up Store Activation',
    canal: 'Terrain',
    budget: 6500,
    budget_reel: 6200,
    kpi_cible: '25k interactions',
    kpi_reel: '18.5k interactions',
    roi: 18,
    reach: 18500,
    engagement: 925,
    etat: 'Terminé',
    responsable: 'Diana',
    date_start: '2025-09-15',
    date_end: '2025-11-15'
  },
  {
    name: 'Parrainage Event VIP',
    action: 'VIP Event Sponsorship',
    canal: 'Parrainage',
    budget: 12000,
    budget_reel: 11850,
    kpi_cible: '80k reach',
    kpi_reel: '95k reach',
    roi: 38,
    reach: 95000,
    engagement: 5700,
    etat: 'Terminé',
    responsable: 'Emma',
    date_start: '2025-08-01',
    date_end: '2025-10-31'
  },
  {
    name: 'Digital LinkedIn B2B',
    action: 'LinkedIn B2B Ads',
    canal: 'Digital',
    budget: 4500,
    budget_reel: 4400,
    kpi_cible: '35k reach',
    kpi_reel: '42k reach',
    roi: 48,
    reach: 42000,
    engagement: 2100,
    etat: 'En cours',
    responsable: 'Frank',
    date_start: '2025-10-15',
    date_end: '2025-12-15'
  },
  {
    name: 'Influence Nano Creators',
    action: 'Nano Creator Partnerships',
    canal: 'Influence',
    budget: 3000,
    budget_reel: 2980,
    kpi_cible: '50k reach',
    kpi_reel: '62k reach',
    roi: 58,
    reach: 62000,
    engagement: 3720,
    etat: 'En cours',
    responsable: 'Grace',
    date_start: '2025-11-01',
    date_end: '2025-12-31'
  },
  {
    name: 'Terrain Street Marketing',
    action: 'Street Team Campaign',
    canal: 'Terrain',
    budget: 4200,
    budget_reel: 4100,
    kpi_cible: '30k interactions',
    kpi_reel: '28.5k interactions',
    roi: 20,
    reach: 28500,
    engagement: 1425,
    etat: 'En cours',
    responsable: 'Henry',
    date_start: '2025-11-01',
    date_end: '2025-12-31'
  }
];

async function insertTestCampaigns() {
  try {
    console.log('🚀 Insertion des campagnes de test...\n');

    for (const campaign of testCampaigns) {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaign])
        .select();

      if (error) {
        console.error(`❌ Erreur pour ${campaign.name}:`, error.message);
      } else {
        console.log(`✅ ${campaign.name}`);
        console.log(`   Canal: ${campaign.canal} | Budget: €${campaign.budget} | ROI: ${campaign.roi}%`);
      }
    }

    console.log('\n✨ Toutes les campagnes de test ont été inséré!');
    console.log('\n📊 Résumé:');
    console.log(`- ${testCampaigns.length} campagnes ajoutées`);
    console.log(`- Canals: Digital (2), Influence (2), Radio (1), Terrain (2), Parrainage (1)`);
    console.log(`- Budget total: €${testCampaigns.reduce((a, c) => a + c.budget, 0)}`);
    console.log(`- ROI moyen: ${(testCampaigns.reduce((a, c) => a + c.roi, 0) / testCampaigns.length).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

insertTestCampaigns();
