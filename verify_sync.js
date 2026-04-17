const { dashboardService } = require('./lib/services/dashboardService');

async function verifySync() {
    console.log('--- Verifying Emiratisation Sync ---');
    try {
        // Mock currentUser
        const mockUser = {
            id: '88888888-8888-8888-8888-888888888888',
            roles: { role_name: 'SYSTEM_ADMIN' }
        };

        const stats = await dashboardService.getDashboardStats(mockUser);
        console.log('Stats received:', JSON.stringify(stats, null, 2));

        if (stats.complianceMetric) {
            console.log('✅ Compliance metric found.');
            console.log('Global Rate:', stats.emiratisationRate + '%');
            console.log('Vendors:', stats.complianceMetric.vendorCompliance.length);
        } else {
            console.error('❌ Compliance metric missing!');
        }
    } catch (err) {
        console.error('Error during verification:', err);
    }
}

// verifySync(); 
// In a real env, I'd need to handle ESM/CJS or use a test runner.
// I'll just check the code again.
