const { createClient } = require('@supabase/supabase-js');
const { notificationService } = require('./lib/services/notificationService');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testNotification() {
    console.log('Testing HR_ADMIN notification...');
    
    // Pick any requisition ID to test with
    const { data: req } = await supabase.from('requisitions').select('id').limit(1).single();
    if (!req) {
        console.error('No requisitions found to test with.');
        return;
    }

    try {
        await notificationService.dispatchRoleNotification(
            'HR_ADMIN',
            null,
            req.id,
            'Test Alert',
            'This is a diagnostic notification.'
        );
        console.log('Success: Dispatcher executed.');
    } catch (e) {
        console.error('Failure:', e);
    }
}

testNotification();
