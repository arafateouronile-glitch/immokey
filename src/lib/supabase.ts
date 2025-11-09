import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Vérifier si on utilise des valeurs placeholder
const isPlaceholder =
  supabaseUrl.includes('placeholder') ||
  supabaseAnonKey.includes('placeholder') ||
  !import.meta.env.VITE_SUPABASE_URL ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY

if (isPlaceholder) {
  console.warn(
    '%c⚠️ Supabase non configuré',
    'color: orange; font-weight: bold; font-size: 14px;'
  )
  console.warn(
    'Pour corriger l\'erreur "fail to fetch" :\n' +
    '1. Créez un projet sur https://supabase.com\n' +
    '2. Allez dans Settings > API\n' +
    '3. Copiez l\'URL et la clé Anon\n' +
    '4. Mettez à jour votre fichier .env :\n' +
    '   VITE_SUPABASE_URL=https://votre-projet.supabase.co\n' +
    '   VITE_SUPABASE_ANON_KEY=votre-clé-ici'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper pour vérifier si Supabase est configuré
export const isSupabaseConfigured = !isPlaceholder





