const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkStages() {
    console.log('Fetching workflow stages...');
    const { data: stages, error } = await supabase
        .from('workflow_stages')
        .select('*, roles(role_name)')
        .order('stage_id');
    
    if (error) {
        console.error('Error fetching stages:', error);
        return;
    }
    
    console.table(stages.map(s => ({
        ID: s.stage_id,
        Name: s.stage_name,
        Role: s.roles?.role_name || 'N/A'
    })));
}

checkStages();
