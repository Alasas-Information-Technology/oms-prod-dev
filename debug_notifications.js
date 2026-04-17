import { supabase } from './lib/supabaseClient';

async function debugData() {
    console.log('--- Roles ---');
    const { data: roles } = await supabase.from('roles').select('*');
    console.table(roles);

    console.log('\n--- Profiles (Sample) ---');
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, role_id, department_id').limit(5);
    console.table(profiles);

    console.log('\n--- Requisitions (Sample) ---');
    const { data: requisitions } = await supabase.from('requisitions').select('id, req_number, stage_id, department_id').limit(5);
    console.table(requisitions);
}

debugData();
