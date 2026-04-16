const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmployeesTable() {
    const { data, error } = await supabase.from('employees').select('*').limit(1);
    if (!error) {
        console.log('Table employees EXISTS.');
        console.log('Columns:', Object.keys(data[0] || {}));
    } else {
        console.log('Table employees does NOT exist.');
    }
}

checkEmployeesTable();
