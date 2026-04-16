const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllTables() {
    console.log('--- Listing all tables in public schema ---');
    // Using a trick: query a non-existent table to see if the error gives hints, 
    // or try common tables.
    // Better: use an RPC if defined in the schema.
    
    // Let's try to query 'information_schema.tables' via a raw select if allowed
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) console.error('Error:', error);
    
    // Actually, I'll just try to guess more names based on the UI
    const guesses = ['compliance', 'metrics', 'emiratisation', 'national_stats', 'vendor_compliance'];
    for (const g of guesses) {
        const { error } = await supabase.from(g).select('*').limit(1);
        if (!error) console.log(`Table '${g}' EXISTS.`);
    }
}

listAllTables();
