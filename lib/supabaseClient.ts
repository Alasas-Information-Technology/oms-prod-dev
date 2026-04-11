import { createClient } from '@supabase/supabase-js';

// Load values directly from the environment variables configured in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'dummy_anon_key_for_demo_purposes';

// Instantiate the globally accessible Supabase connection client
export const supabase = createClient(supabaseUrl, supabaseKey);
