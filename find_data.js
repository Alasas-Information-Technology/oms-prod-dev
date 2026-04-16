const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findEmiratisationData() {
    console.log('--- Searching for Emiratisation data across all tables ---');
    
    // 1. Try to find any table with 'uae' or 'citizen' or 'emirat' in name
    // Since we can't easily list tables via PostgREST without an RPC, let's try to infer from common columns
    
    // 2. Let's try to see if 'profiles' has hidden columns or if we can find it in 'candidates'
    const { data: candidates, error: cError } = await supabase.from('candidates').select('*').limit(1);
    if (!cError && candidates.length > 0) {
        console.log('Candidate sample:', candidates[0]);
    }

    // 3. Let's check for a 'vendors' table structure
    const { data: vendors, error: vError } = await supabase.from('vendors').select('*').limit(1);
    if (!vError && vendors.length > 0) {
        console.log('Vendor sample:', vendors[0]);
    }
}

findEmiratisationData();
