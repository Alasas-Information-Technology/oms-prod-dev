import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL ERROR: Supabase environment variables are missing. Auth will fail.');
}

export const supabase = createClient(
    supabaseUrl || 'https://missing-url.supabase.co',
    supabaseKey || 'missing-key'
);
