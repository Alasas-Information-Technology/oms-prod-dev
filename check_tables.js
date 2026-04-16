const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllTables() {
    // In Supabase, we can't easily query information_schema.tables directly via PostgREST unless exposed.
    // However, we can try to guess or use a common set of tables.
    // Let's try to see if there is any table with 'compliance' in its name.
    
    console.log('--- Checking for Compliance/Emiratisation related data ---');
    
    // Attempting to fetch from a hypothetical table
    const tables = ['emiratisation', 'compliance_stats', 'workforce_diversity'];
    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (!error) console.log(`Table '${table}' EXISTS.`);
        else console.log(`Table '${table}' does NOT exist or is inaccessible.`);
    }
}

listAllTables();
