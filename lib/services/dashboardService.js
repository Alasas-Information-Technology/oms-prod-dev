import { supabase } from '../supabaseClient';

/**
 * Dashboard API Service
 * Pools data for Operations Dashboard KPIs, Charts, and Activity Feeds.
 */
export const dashboardService = {
  /**
   * Fetch high-level KPIs for the Bento Grid.
   */
  async getDashboardStats() {
    const [reqs, candidates, budget] = await Promise.all([
      supabase.from('requisitions').select('id', { count: 'exact', head: true }),
      supabase.from('candidates').select('id', { count: 'exact', head: true }),
      supabase.from('requisitions').select('reserved_budget_aed')
    ]);

    const totalBudget = budget.data?.reduce((sum, item) => sum + (Number(item.reserved_budget_aed) || 0), 0) || 0;

    return {
      activeRequisitions: reqs.count || 0,
      totalCandidates: candidates.count || 0,
      totalBudgetReserved: totalBudget,
      // Mock metrics for demo completeness where data might not be rich enough yet
      slaBreachRisk: Math.floor(Math.random() * 5), 
      emiratisationRate: 38.4,
      avgTimeToHire: 18.3
    };
  },

  /**
   * Fetch requisition distribution across workflow stages for the Pipeline Chart.
   */
  async getPipelineData() {
    const { data: stages } = await supabase.from('workflow_stages').select('stage_id, stage_name').order('stage_id');
    const { data: reqs } = await supabase.from('requisitions').select('stage_id');

    if (!stages || !reqs) return [];

    return stages.map(stage => ({
      name: stage.stage_name,
      count: reqs.filter(r => r.stage_id === stage.stage_id).length
    }));
  },

  /**
   * Fetch budget utilization aggregated by department.
   */
  async getBudgetByDepartment() {
    const { data } = await supabase
      .from('requisitions')
      .select('department, reserved_budget_aed');

    if (!data) return [];

    const depts = [...new Set(data.map(d => d.department))];
    return depts.map(dept => {
      const reserved = data.filter(d => d.department === dept).reduce((sum, item) => sum + (Number(item.reserved_budget_aed) || 0), 0);
      // Consume logic is simplified: mock 75-90% consumption for demo visual impact
      const consumed = reserved * (0.75 + Math.random() * 0.15);
      return {
        dept,
        reserved,
        consumed,
        remaining: reserved - consumed
      };
    });
  },

  /**
   * Fetch recent system activity from audit logs.
   */
  async getRecentActivity(limit = 10) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        id,
        action_type,
        cryptographic_timestamp,
        comments,
        requisitions(req_number),
        profiles!actor_id(full_name, role_id, roles(role_name))
      `)
      .order('cryptographic_timestamp', { ascending: false })
      .limit(limit);

    if (error) {
        console.error('Error fetching activity:', error);
        return [];
    }

    return data.map(log => ({
      id: log.id,
      actor: log.profiles?.full_name || 'System',
      role: log.profiles?.roles?.role_name || 'OMS',
      action: this.formatActionType(log.action_type),
      target: log.requisitions?.req_number || 'TRK-XXXX',
      timestamp: log.cryptographic_timestamp,
      type: log.action_type
    }));
  },

  /**
   * Fetch requisitions pending approval for a specific role.
   */
  async getPendingApprovals(roleId) {
    // If no roleId (system admin), show all awaiting approval in early stages
    let query = supabase
      .from('requisitions')
      .select('*, workflow_stages(stage_name)')
      .order('created_at', { ascending: false });

    if (roleId) {
      query = query.filter('workflow_stages.required_role_id', 'eq', roleId);
    } else {
      // For Admins, show all in Approval-related stages (e.g., 2, 4)
      query = query.in('stage_id', [2, 4]);
    }

    const { data, error } = await query.limit(5);
    
    if (error) {
        console.error('Error fetching pending approvals:', error);
        return [];
    }
    return data;
  },

  formatActionType(type) {
    const map = {
        'STAGE_ADVANCED': 'advanced',
        'CREATED': 'created',
        'REJECTED': 'rejected',
        'BUDGET_AMENDMENT': 'updated budget for'
    };
    return map[type] || 'processed';
  },

  /**
   * Fetch aggregated counts for Sidebar Badges.
   */
  async getSidebarCounts(currentUser) {
    if (!currentUser) return { requisitions: 0, candidates: 0, onboarding: 0, notifications: 0 };

    const roleId = currentUser.role_id;
    const roleName = currentUser.roles?.role_name || 'Guest';

    // 1. Pending Approvals count (Filtered by Role)
    let pQuery = supabase.from('requisitions').select('id', { count: 'exact', head: true });
    
    // Use joining to aggregate based on required_role_id in workflow_stages
    const { data: stages } = await supabase.from('workflow_stages').select('stage_id').eq('required_role_id', roleId);
    const stageIds = stages?.map(s => s.stage_id) || [];
    
    if (stageIds.length > 0) {
        pQuery = pQuery.in('stage_id', stageIds);
    } else if (roleName === 'SYSTEM_ADMIN' || roleName === 'HR_ADMIN') {
        pQuery = pQuery.in('stage_id', [2, 4]);
    } else {
        // Fallback for roles with no specific workflow "gating" duty in Sidebar context
        pQuery = pQuery.eq('id', '00000000-0000-0000-0000-000000000000'); 
    }

    // 2. Candidates Awaiting Review (Stage 4 ready)
    const cQuery = supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('status', 'SUBMITTED');

    // 3. Onboarding count (Stage 5)
    const oQuery = supabase.from('requisitions').select('id', { count: 'exact', head: true }).eq('stage_id', 5);

    const [pending, candidates, onboarding] = await Promise.all([
        pQuery,
        cQuery,
        oQuery
    ]);

    return {
      requisitions: pending.count || 0,
      candidates: candidates.count || 0,
      onboarding: onboarding.count || 0,
      notifications: 0 // Placeholder until notifications table is implemented
    };
  }
};
