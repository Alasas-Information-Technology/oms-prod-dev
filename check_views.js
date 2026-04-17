const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseViews() {
    console.log('--- Checking for database VIEWS ---');
    // Try to guess some view names
    const views = ['v_emiratisation_compliance', 'v_vendor_compliance', 'v_workforce_stats'];
    for (const view of views) {
        const { error } = await supabase.from(view).select('*').limit(1);
        if (!error) console.log(`View '${view}' EXISTS.`);
        else if (error.message.includes('not exist')) {
            // skip
        } else {
            console.log(`Error checking view '${view}':`, error.message);
        }
    }
}

checkDatabaseViews();
