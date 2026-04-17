const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log('--- Inspecting PROFILES table Columns ---');
    // Using RPC to call a meta function if available, or just trying to select a non-existent column to see error message which might list columns (hacky)
    // Better: use the list of columns from a known good source or just try to see if 'nationality' exists.
    
    const { data, error } = await supabase.from('profiles').select('nationality').limit(1);
    if (error) {
        console.log('Nationality column does NOT exist in profiles table.');
        console.error('Error detail:', error.message);
    } else {
        console.log('Nationality column EXISTS in profiles table.');
    }

    console.log('\n--- Inspecting VENDORS table ---');
    const { data: vData, error: vError } = await supabase.from('vendors').select('*').limit(1);
    if (vError) {
        console.log('Vendors table might not exist.');
        console.error('Error detail:', vError.message);
    } else {
        console.log('Vendors table exists.');
    }
}

inspectSchema();
