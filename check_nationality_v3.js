const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Using ANON key - might not have permission to ALTER table.
// Usually I'd need a service role key for migrations.
// But I can try to see if it works.

const supabase = createClient(supabaseUrl, supabaseKey);

async function tryMigration() {
    console.log('--- Attempting to add nationality column to profiles ---');
    // Using a raw SQL query if Supabase allows it via an RPC or similar.
    // Most Supabase setups don't allow raw SQL via PostgREST for security.
    
    // I'll check if I can just select it now (maybe it was added since my last check?)
    const { error } = await supabase.from('profiles').select('nationality').limit(1);
    if (!error) {
        console.log('Column "nationality" already exists!');
    } else {
        console.log('Column "nationality" does not exist yet:', error.message);
    }
}

tryMigration();
