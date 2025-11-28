#!/usr/bin/env node
/**
 * Script de diagnostic Supabase
 * Vérifie que toutes les tables existent et que les env vars sont correctes
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wttqgvxqyucvwevvihtf.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dHFndnhxeXVjdndldnZpaHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjA5OTcsImV4cCI6MjA3OTgzNjk5N30.jQaGNM6WUEUy5QkCsuyJqk1INRIIZ14sz5CxtbB08W4'

console.log('🔍 Test de connexion Supabase...')
console.log('URL:', supabaseUrl)
console.log('Clé:', supabaseAnonKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testTables() {
  const tables = ['campaigns', 'kpi_financiers', 'strategies', 'ambassadeurs', 'budget_recommendations']
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ Table ${table}: ERREUR - ${error.message}`)
      } else {
        console.log(`✅ Table ${table}: OK (${count} lignes)`)
      }
    } catch (err) {
      console.log(`❌ Table ${table}: EXCEPTION - ${err.message}`)
    }
  }
}

async function testInsert() {
  console.log('\n📝 Test d\'insertion...')
  
  try {
    // Test insertion KPI
    const { data: kpiData, error: kpiError } = await supabase
      .from('kpi_financiers')
      .insert({
        mois: '2025-11',
        cible: JSON.stringify({ transactions: 100, volume: 5000 }),
        reel: JSON.stringify({ transactions: 95, volume: 4800 })
      })
      .select()
    
    if (kpiError) {
      console.log(`❌ Insertion KPI: ERREUR - ${kpiError.message}`)
    } else {
      console.log(`✅ Insertion KPI: SUCCESS - ${JSON.stringify(kpiData)}`)
    }
  } catch (err) {
    console.log(`❌ Test insertion: ${err.message}`)
  }
}

async function main() {
  await testTables()
  await testInsert()
  console.log('\n✅ Diagnostic terminé!')
}

main().catch(console.error)
