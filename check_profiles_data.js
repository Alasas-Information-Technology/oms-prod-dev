const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfileData() {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }
    
    console.log(`Found ${data.length} profiles.`);
    if (data.length > 0) {
        console.log('Columns in profiles:', Object.keys(data[0]));
        // Look for any nationality or emiratisation related field
        const emiratisationFields = Object.keys(data[0]).filter(k => 
            k.includes('uae') || k.includes('national') || k.includes('citizen') || k.includes('country') || k.includes('nationality')
        );
        console.log('Potential Emiratisation fields:', emiratisationFields);
    }
}

checkProfileData();
