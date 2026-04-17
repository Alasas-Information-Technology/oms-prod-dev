import { supabase } from './lib/supabaseClient';

async function diagnose() {
    console.log('--- ACTUAL WORKFLOW STAGES ---');
    const { data: stages, error: sError } = await supabase.from('workflow_stages').select('*').order('stage_id');
    if (sError) console.error(sError);
    else console.table(stages);

    console.log('\n--- ROLES ---');
    const { data: roles, error: rError } = await supabase.from('roles').select('*');
    if (rError) console.error(rError);
    else console.table(roles);

    console.log('\n--- PROFILES (Role & Dept) ---');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('full_name, roles(role_name), department_id').limit(10);
    if (pError) console.error(pError);
    else {
        profiles.forEach(p => {
            console.log(`${p.full_name}: Role=${p.roles?.role_name}, Dept=${p.department_id}`);
        });
    }
}

diagnose();
