import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERREUR CRITIQUE : Les variables d\'environnement Supabase sont manquantes.');
  console.error('Veuillez configurer VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans Netlify.');
}

// On exporte quand même le client, mais on s'assure qu'il ne fasse pas planter l'importation
// si les variables sont vides (createClient jettera une erreur si l'URL est vide)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
