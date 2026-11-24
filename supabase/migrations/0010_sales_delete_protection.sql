-- S4-DBA-05: Soft-delete / hard-delete protection for sales with line items or payments
-- Depends on: S4-DBA-01 (payment table) and S4-DBA-02.
-- payment table uses transno (FK -> sales.transno) and is_deleted BOOLEAN.
-- "active payment" = payment row with is_deleted = FALSE.

-- 1. Helper: can_delete_sale(transno) -> blocking details for UI modal
CREATE OR REPLACE FUNCTION can_delete_sale(p_transno TEXT)
RETURNS TABLE (
  can_delete      BOOLEAN,
  payment_count   INTEGER,
  line_item_count INTEGER,
  reason          TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_payments INTEGER;
  v_items    INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM sales WHERE transno = p_transno) THEN
    RAISE EXCEPTION 'Sale % does not exist', p_transno;
  END IF;

  SELECT COUNT(*) INTO v_payments
  FROM payment
  WHERE transno = p_transno AND is_deleted = FALSE;

  SELECT COUNT(*) INTO v_items
  FROM salesdetail
  WHERE transno = p_transno;

  can_delete      := (v_payments = 0);
  payment_count   := v_payments;
  line_item_count := v_items;
  reason := CASE
    WHEN v_payments > 0 THEN
      format('Sale %s has %s active payment(s) and cannot be deleted.', p_transno, v_payments)
    ELSE
      'Sale has no active payments and can be deleted.'
  END;

  RETURN NEXT;
END;
$$;

-- 2. Requirement 1: block SOFT delete when active payments exist.
--    Paid sale -> error with payment count.
--    Unpaid sale -> allowed; its line items are soft-deleted too.
--    Trigger name sorts BEFORE existing sales_bu_check (trg_check_children),
--    so this runs first. The shared trg_check_children is NOT modified.
CREATE OR REPLACE FUNCTION guard_sale_soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_payments INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_payments
  FROM payment
  WHERE transno = OLD.transno AND is_deleted = FALSE;

  IF v_payments > 0 THEN
    RAISE EXCEPTION
      'Cannot delete sale %: it has % active recorded payment(s).', OLD.transno, v_payments
      USING ERRCODE = 'restrict_violation',
            HINT    = 'Void or remove the payments first, or keep the sale.';
  END IF;

  UPDATE salesdetail
  SET is_deleted = TRUE
  WHERE transno = OLD.transno AND is_deleted = FALSE;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_sale_soft_delete ON sales;
DROP TRIGGER IF EXISTS sales_bu_00_guard_payments ON sales;
CREATE TRIGGER sales_bu_00_guard_payments
  BEFORE UPDATE OF is_deleted ON sales
  FOR EACH ROW
  WHEN (OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE)
  EXECUTE FUNCTION guard_sale_soft_delete();

-- 3. Requirement 2: HARD delete protection
--    (a) clear error message via trigger, (b) ON DELETE RESTRICT FKs as backstop
CREATE OR REPLACE FUNCTION guard_sale_hard_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_payments INTEGER;
  v_items    INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_payments FROM payment WHERE transno = OLD.transno;
  SELECT COUNT(*) INTO v_items    FROM salesdetail WHERE transno = OLD.transno;

  IF v_payments > 0 OR v_items > 0 THEN
    RAISE EXCEPTION
      'Cannot physically delete sale %: % payment record(s) and % line item(s) depend on it.',
      OLD.transno, v_payments, v_items
      USING ERRCODE = 'restrict_violation';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_sale_hard_delete ON sales;
CREATE TRIGGER trg_guard_sale_hard_delete
  BEFORE DELETE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION guard_sale_hard_delete();

-- Replace salesdetail's ON DELETE CASCADE with RESTRICT
DO $$
DECLARE
  fk_name TEXT;
BEGIN
  FOR fk_name IN
    SELECT con.conname
    FROM pg_constraint con
    WHERE con.conrelid = 'salesdetail'::regclass
      AND con.contype = 'f'
      AND con.confrelid = 'sales'::regclass
  LOOP
    EXECUTE format('ALTER TABLE salesdetail DROP CONSTRAINT %I', fk_name);
  END LOOP;

  ALTER TABLE salesdetail
    ADD CONSTRAINT salesdetail_transno_fkey
    FOREIGN KEY (transno) REFERENCES sales(transno) ON DELETE RESTRICT;
END $$;

-- Same for payment -> sales
DO $$
DECLARE
  fk_name TEXT;
BEGIN
  FOR fk_name IN
    SELECT con.conname
    FROM pg_constraint con
    WHERE con.conrelid = 'payment'::regclass
      AND con.contype = 'f'
      AND con.confrelid = 'sales'::regclass
  LOOP
    EXECUTE format('ALTER TABLE payment DROP CONSTRAINT %I', fk_name);
  END LOOP;

  ALTER TABLE payment
    ADD CONSTRAINT payment_transno_fkey
    FOREIGN KEY (transno) REFERENCES sales(transno) ON DELETE RESTRICT;
END $$;
