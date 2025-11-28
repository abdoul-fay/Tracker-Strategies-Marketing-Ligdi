/**
 * Vérification directe de la structure des tables
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wttqgvxqyucvwevvihtf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dHFndnhxeXVjdndldnZpaHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjA5OTcsImV4cCI6MjA3OTgzNjk5N30.jQaGNM6WUEUy5QkCsuyJqk1INRIIZ14sz5CxtbB08W4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSchema() {
  console.log('🔍 Vérification de la structure des tables...\n')
  
  // Récupérer les métadonnées via une requête directe
  const { data, error } = await supabase
    .from('kpi_financiers')
    .select()
    .limit(0)
  
  if (error) {
    console.log('❌ Erreur:', error.message)
    console.log('Code:', error.code)
  } else {
    console.log('✅ Connexion OK')
    console.log('Réponse:', data)
  }
  
  // Try simple insert with minimal data
  console.log('\n📝 Test insertion simple...')
  const { data: testData, error: testError } = await supabase
    .from('kpi_financiers')
    .insert({
      mois: '2025-11'
    })
    .select()
  
  if (testError) {
    console.log('❌ Erreur:', testError.message)
  } else {
    console.log('✅ Insertion réussie:', testData)
  }
}

checkSchema().catch(console.error)
