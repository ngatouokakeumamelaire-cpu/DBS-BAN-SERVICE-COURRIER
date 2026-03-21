import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERREUR CRITIQUE : Les variables d\'environnement Supabase sont manquantes.');
  console.error('Veuillez configurer VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans Netlify.');
}

let supabaseClient;

try {
  supabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder'
  );
} catch (err) {
  console.error('Supabase client creation error:', err);
  // Fallback to a dummy client that won't crash on import
  supabaseClient = {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    })
  } as any;
}

export const supabase = supabaseClient;
