const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function searchForNationalityColumn() {
    console.log('--- Searching for "nationality" column across all tables via RPC ---');
    
    // Since we can't query information_schema directly via PostgREST, 
    // we can try to find if there is an RPC for this, 
    // or try common tables that might have it.
    
    const candidates = ['profiles', 'candidates', 'employees', 'users', 'recruitments', 'vendors'];
    for (const table of candidates) {
        const { error } = await supabase.from(table).select('nationality').limit(1);
        if (!error) {
            console.log(`Column "nationality" EXISTS in table "${table}".`);
        } else if (error.message.includes('not exist')) {
            // skip
        } else {
            console.log(`Error checking "${table}":`, error.message);
        }
    }
}

searchForNationalityColumn();
