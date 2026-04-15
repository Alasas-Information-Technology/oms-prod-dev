-- =====================================================================
-- RPC: increment_department_reserved
-- =====================================================================
-- Called by requisitionService.createRequisition() after a new BUDGETED
-- requisition is inserted. Atomically adds the reservation amount to the
-- department's reserved_aed column for the given financial year.
--
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → Run).
-- =====================================================================

CREATE OR REPLACE FUNCTION public.increment_department_reserved(
  p_department_id   UUID,
  p_financial_year  INTEGER,
  p_amount          NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.budgets
  SET reserved_aed = reserved_aed + p_amount
  WHERE department_id  = p_department_id
    AND financial_year = p_financial_year;

  -- If no row matched (department has no budget record for this year) raise a
  -- notice so it surfaces in the server logs without rolling back the caller.
  IF NOT FOUND THEN
    RAISE NOTICE
      'increment_department_reserved: No budget row found for dept % / year %',
      p_department_id, p_financial_year;
  END IF;
END;
$$;

-- Grant EXECUTE to the anon role so the Supabase client can call it.
GRANT EXECUTE ON FUNCTION public.increment_department_reserved(UUID, INTEGER, NUMERIC)
  TO anon, authenticated;
