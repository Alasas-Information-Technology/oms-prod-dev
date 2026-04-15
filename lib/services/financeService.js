import { supabase } from '../supabaseClient';

/**
 * Finance API Service
 * Fetches budget data from the `budgets` table joined with `departments`.
 */
export const financeService = {
  /**
   * Internal helper to verify if a role has financial clearance.
   * Throws an error if the role is not authorized.
   */
  _verifyFinanceAccess(role) {
    const authorized = ['FINANCE_OFFICER', 'SYSTEM_ADMIN'];
    if (!authorized.includes(role)) {
      throw new Error('403 Unauthorized: Financial clearance required.');
    }
  },

  /**
   * Fetch the current-year budget record for a single department.
   * Used by the New Requisition modal to show available liquidity in real-time.
   *
   * @param {string} departmentId - UUID from profiles.department_id
   * @returns {Promise<{ total: number, consumed: number, reserved: number, available: number } | null>}
   */
  async getDepartmentBudget(departmentId) {
    if (!departmentId) return null;

    const currentYear = new Date().getFullYear();

    const { data, error } = await supabase
      .from('budgets')
      .select('total_allocated_aed, consumed_aed, reserved_aed')
      .eq('department_id', departmentId)
      .eq('financial_year', currentYear)
      .maybeSingle(); // returns null (not error) if no row found

    if (error) {
      console.error('financeService.getDepartmentBudget error:', error);
      throw error;
    }

    if (!data) return null;

    const total    = Number(data.total_allocated_aed) || 0;
    const consumed = Number(data.consumed_aed)        || 0;
    const reserved = Number(data.reserved_aed)        || 0;

    return {
      total,
      consumed,
      reserved,
      available: total - consumed - reserved,
    };
  },

  /**
   * Fetch all department budgets for FY2026.
   * Returns an array of budget rows each enriched with the department name,
   * plus a calculated `available_aed` field.
   *
   * @param {string} userRole - currentUser.roles.role_name
   * @returns {Promise<Array>}
   */
  async getBudgetData(userRole) {
    this._verifyFinanceAccess(userRole);

    const { data, error } = await supabase
      .from('budgets')
      .select(`
        id,
        financial_year,
        total_allocated_aed,
        consumed_aed,
        reserved_aed,
        departments ( dept_name )
      `)
      .eq('financial_year', 2026)
      .order('total_allocated_aed', { ascending: false });

    if (error) {
      console.error('financeService.getBudgetData error:', error);
      throw error;
    }

    // Flatten the nested departments relation and compute derived fields
    return (data || []).map((row) => {
      const total     = Number(row.total_allocated_aed) || 0;
      const consumed  = Number(row.consumed_aed)        || 0;
      const reserved  = Number(row.reserved_aed)        || 0;
      const available = total - consumed - reserved;
      const utilization = total > 0 ? ((consumed + reserved) / total) * 100 : 0;

      return {
        id:              row.id,
        dept_name:       row.departments?.dept_name ?? 'Unknown Department',
        financial_year:  row.financial_year,
        total_allocated: total,
        consumed:        consumed,
        reserved:        reserved,
        available:       available,
        utilization:     Math.min(utilization, 100), // cap at 100%
      };
    });
  },

  /**
   * Derive enterprise-wide summary totals from an array of budget rows.
   * Pass the result of getBudgetData() here to avoid a second network call.
   *
   * @param {Array} rows - Rows returned by getBudgetData()
   * @returns {{ totalBudget: number, totalConsumed: number, totalReserved: number, totalAvailable: number }}
   */
  getEnterpriseSummary(rows) {
    return rows.reduce(
      (acc, row) => ({
        totalBudget:    acc.totalBudget    + row.total_allocated,
        totalConsumed:  acc.totalConsumed  + row.consumed,
        totalReserved:  acc.totalReserved  + row.reserved,
        totalAvailable: acc.totalAvailable + row.available,
      }),
      { totalBudget: 0, totalConsumed: 0, totalReserved: 0, totalAvailable: 0 }
    );
  },

  /**
   * Update a department's total budget allocation and write an audit trail entry.
   *
   * @param {string}  budgetId           - UUID of the budgets row to update
   * @param {number}  newTotalAllocated  - The new total_allocated_aed value
   * @param {string}  actorId            - currentUser.id of the Finance Officer / Admin
   * @param {string}  userRole           - currentUser.roles.role_name
   * @param {string}  deptName           - Human-readable department name (for audit comment)
   * @returns {Promise<void>}
   */
  async updateDepartmentBudget(budgetId, newTotalAllocated, actorId, userRole, deptName) {
    this._verifyFinanceAccess(userRole);

    // ── Step 1: Read the current allocation so we can record the delta ────────
    const { data: current, error: readError } = await supabase
      .from('budgets')
      .select('total_allocated_aed, financial_year')
      .eq('id', budgetId)
      .single();

    if (readError) {
      console.error('financeService.updateDepartmentBudget – read error:', readError);
      throw readError;
    }

    const oldAllocation  = Number(current.total_allocated_aed) || 0;
    const financialYear  = current.financial_year;

    // ── Step 2: Apply the budget UPDATE ───────────────────────────────────────
    const { error: updateError } = await supabase
      .from('budgets')
      .update({ total_allocated_aed: newTotalAllocated })
      .eq('id', budgetId);

    if (updateError) {
      console.error('financeService.updateDepartmentBudget – update error:', updateError);
      throw updateError;
    }

    // ── Step 3: Write BUDGET_AMENDMENT audit log ──────────────────────────────
    const delta      = newTotalAllocated - oldAllocation;
    const direction  = delta >= 0 ? 'increased' : 'decreased';
    const auditComment = JSON.stringify({
      department:    deptName,
      financial_year: financialYear,
      old_allocation: oldAllocation,
      new_allocation: newTotalAllocated,
      delta,
      summary: `Budget ${direction} by AED ${Math.abs(delta).toLocaleString('en-AE')} for ${deptName} (FY ${financialYear}).`,
    });

    const { error: auditError } = await supabase.from('audit_logs').insert([{
      requisition_id:  null,          // Not tied to a specific requisition
      actor_id:        actorId,
      action_type:     'BUDGET_AMENDMENT',
      old_stage_id:    null,
      new_stage_id:    null,
      comments:        auditComment,
    }]);

    if (auditError) {
      // Non-fatal — budget was already updated; log for reconciliation
      console.error('financeService.updateDepartmentBudget – audit log error (non-fatal):', auditError);
    }
  },

  /**
   * Return a Set of department_id UUIDs that already have a budget row
   * for the given financial year. Used by the Allocate New Budget modal
   * to filter the department dropdown to only unallocated departments.
   *
   * @param {number} year - Financial year to check (e.g. 2026)
   * @param {string} userRole - currentUser.roles.role_name
   * @returns {Promise<Set<string>>}
   */
  async getExistingBudgetDeptIds(year, userRole) {
    this._verifyFinanceAccess(userRole);

    const { data, error } = await supabase
      .from('budgets')
      .select('department_id')
      .eq('financial_year', year);

    if (error) {
      console.error('financeService.getExistingBudgetDeptIds error:', error);
      throw error;
    }

    return new Set((data || []).map(row => row.department_id));
  },

  /**
   * Fetch all departments for use in dropdowns.
   * @param {string} userRole - currentUser.roles.role_name
   * @returns {Promise<Array<{ id: string, dept_name: string }>>}
   */
  async getDepartments(userRole) {
    this._verifyFinanceAccess(userRole);

    const { data, error } = await supabase
      .from('departments')
      .select('id, dept_name')
      .order('dept_name', { ascending: true });

    if (error) {
      console.error('financeService.getDepartments error:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Insert a brand-new budget allocation row and write an audit entry.
   *
   * @param {string}  departmentId        - UUID from departments.id
   * @param {number}  financialYear       - e.g. 2026
   * @param {number}  totalAllocatedAmount
   * @param {string}  actorId             - currentUser.id
   * @param {string}  userRole            - currentUser.roles.role_name
   * @param {string}  deptName            - human-readable name for audit comment
   * @returns {Promise<object>}           - the newly-inserted budgets row
   */
  async allocateNewBudget(departmentId, financialYear, totalAllocatedAmount, actorId, userRole, deptName) {
    this._verifyFinanceAccess(userRole);

    // ── Step 1: INSERT the new budgets row ────────────────────────────────────
    const { data, error: insertError } = await supabase
      .from('budgets')
      .insert([{
        department_id:       departmentId,
        financial_year:      financialYear,
        total_allocated_aed: totalAllocatedAmount,
        consumed_aed:        0,
        reserved_aed:        0,
      }])
      .select()
      .single();

    if (insertError) {
      console.error('financeService.allocateNewBudget – insert error:', insertError);
      throw insertError;
    }

    // ── Step 2: Audit log ─────────────────────────────────────────────────────
    const { error: auditError } = await supabase.from('audit_logs').insert([{
      requisition_id: null,
      actor_id:       actorId,
      action_type:    'NEW_BUDGET_ALLOCATED',
      old_stage_id:   null,
      new_stage_id:   null,
      comments: JSON.stringify({
        department:      deptName,
        financial_year:  financialYear,
        total_allocated: totalAllocatedAmount,
        summary: `New budget of AED ${totalAllocatedAmount.toLocaleString('en-AE')} allocated for ${deptName} (FY ${financialYear}).`,
      }),
    }]);

    if (auditError) {
      console.error('financeService.allocateNewBudget – audit log error (non-fatal):', auditError);
    }

    return data;
  },
};
