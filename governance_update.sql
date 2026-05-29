-- Governance Update: Workflow Stages & Closure Tracking

-- 1. Ensure all standard workflow stages exist
INSERT INTO public.workflow_stages (stage_id, stage_name, required_role_id)
VALUES 
  (3, 'Internal Sourcing (Demo)', (SELECT role_id FROM public.roles WHERE role_name = 'DEPT_REQUESTOR')),
  (4, 'Candidate Interviewing', (SELECT role_id FROM public.roles WHERE role_name = 'DEPT_REQUESTOR'))
ON CONFLICT (stage_id) DO UPDATE SET 
  stage_name = EXCLUDED.stage_name,
  required_role_id = EXCLUDED.required_role_id;

-- 2. Add Stage 10: Closure Pending HOD Approval
INSERT INTO public.workflow_stages (stage_id, stage_name, required_role_id)
VALUES (10, 'Closure Pending HOD Approval', (SELECT role_id FROM public.roles WHERE role_name = 'HOD'))
ON CONFLICT (stage_id) DO NOTHING;

-- 3. Add Closure Justification to Requisitions for audit trail
ALTER TABLE public.requisitions ADD COLUMN IF NOT EXISTS closure_justification TEXT;

-- 3.1. Add CV path to Candidates for sourcing audit
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS cv_path TEXT;

-- 4. Create RPC for safe budget release (if not already exists with negative support)
-- This logic assumes p_amount is positive, so we use it to decrement reserved_aed
CREATE OR REPLACE FUNCTION public.release_department_reserved(
  p_department_id uuid,
  p_financial_year integer,
  p_amount numeric
) RETURNS void AS $$
BEGIN
  UPDATE budgets
  SET reserved_aed = reserved_aed - p_amount
  WHERE department_id = p_department_id
    AND financial_year = p_financial_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
