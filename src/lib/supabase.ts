import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env.local and fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.',
  );
}

export const supabase = createClient(url, anonKey);

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: Pick<Profile, 'username' | 'display_name'> | null;
};
