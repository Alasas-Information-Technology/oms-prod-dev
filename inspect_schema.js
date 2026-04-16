const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log('--- Inspecting PROFILES table ---');
    const { data: profileSample, error: pError } = await supabase.from('profiles').select('*').limit(1);
    if (pError) console.error('Profiles Error:', pError);
    else console.log('Profile columns:', Object.keys(profileSample[0] || {}));

    console.log('\n--- Inspecting VENDORS table ---');
    const { data: vendorSample, error: vError } = await supabase.from('vendors').select('*').limit(1);
    if (vError) console.error('Vendors Error:', vError);
    else console.log('Vendor columns:', Object.keys(vendorSample[0] || {}));

    console.log('\n--- Checking Emiratisation Counts ---');
    const { data: citizens, count: citizenCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('nationality', 'UAE');
    const { data: all, count: totalCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    
    console.log(`UAE Nationals: ${citizenCount}`);
    console.log(`Total Employees: ${totalCount}`);
}

inspectSchema();
