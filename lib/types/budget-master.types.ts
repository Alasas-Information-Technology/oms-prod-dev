/**
 * Budget Master Data Types & DTO Definitions
 * Maps to database schemas:
 * - [masters].[tbl_Fiscal_Year]
 * - [masters].[tbl_Budget_Period]
 */

export type BudgetMasterStatus = "DRAFT" | "OPEN" | "FROZEN" | "CLOSED" | string;
export type FiscalYearStatus = BudgetMasterStatus;

export interface IFiscalYearDto {
  fiscal_year_id: string | number;
  code: string;
  start_date: string;
  end_date: string;
  status: BudgetMasterStatus;
  oracle_budget_name: string;
  is_delete?: boolean;
  created_date?: string;
  created_by?: string;
  modified_date?: string;
  modified_by?: string;
  attr1?: string | null;
  attr2?: string | null;
  attr3?: string | null;
  attr4?: string | null;
  attr5?: string | null;
}

export interface ICreateFiscalYearDto {
  code: string;
  start_date: string;
  end_date: string;
  status: BudgetMasterStatus;
  oracle_budget_name: string;
}

export interface IBudgetPeriodDto {
  period_id: string;
  period_code: string;
  fiscal_year_id: string;
  fiscal_year_code?: string;
  period_name: string;
  period_num: number;
  start_date: string;
  end_date: string;
  status: BudgetMasterStatus;
  oracle_period_name: string;
  is_delete?: boolean;
  created_date?: string;
  created_by?: string;
  modified_date?: string;
  modified_by?: string;
  attr1?: string | null;
  attr2?: string | null;
  attr3?: string | null;
  attr4?: string | null;
  attr5?: string | null;
}

export interface ICreateBudgetPeriodDto {
  period_code: string;
  fiscal_year_id: string;
  period_name: string;
  period_num: number;
  start_date: string;
  end_date: string;
  status: BudgetMasterStatus;
  oracle_period_name: string;
}

export interface IBudgetCategoryDto {
  budget_category_id: string;
  code: string;
  name: string;
  expense_type: string;
  oracle_account_code: string;
  is_active: boolean;
  is_delete?: boolean;
  created_date?: string;
  created_by?: string;
  modified_date?: string;
  modified_by?: string;
  attr1?: string | null;
  attr2?: string | null;
  attr3?: string | null;
  attr4?: string | null;
  attr5?: string | null;
}

export interface ICreateBudgetCategoryDto {
  code: string;
  name: string;
  expense_type: string;
  oracle_account_code: string;
  is_active: boolean;
}

