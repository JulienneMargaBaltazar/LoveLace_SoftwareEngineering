-- S2-DBA-04 (Issue #85): Child-record delete checks for customer and product
-- 1. Helper functions for checking whether customer or product has active child records
CREATE OR REPLACE FUNCTION public.can_delete_customer(p_custno varchar)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.sales
    WHERE custno = p_custno
      AND NOT is_deleted
  );
$$;

CREATE OR REPLACE FUNCTION public.can_delete_product(p_prodcode varchar)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.salesdetail
    WHERE prodcode = p_prodcode
      AND NOT is_deleted
    UNION ALL
    SELECT 1
    FROM public.pricehist
    WHERE prodcode = p_prodcode
      AND NOT is_deleted
  );
$$;

-- 2. Refine trg_check_children() to check active sales for customer, preserve existing
--    table checks, and raise a structured 409 Conflict exception when active children exist
CREATE OR REPLACE FUNCTION public.trg_check_children()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    v_n INT := 0;
    v_detail TEXT := '';
    v_sales_cnt INT := 0;
    v_detail_cnt INT := 0;
    v_price_cnt INT := 0;
BEGIN
    IF NOT (NEW.is_deleted AND NOT OLD.is_deleted) THEN
        RETURN NEW; -- not a soft delete
    END IF;

    CASE TG_TABLE_NAME
        WHEN 'customer' THEN
            SELECT count(*)
              INTO v_sales_cnt
              FROM public.sales
             WHERE custno = OLD.custno
               AND NOT is_deleted;
            v_n := v_sales_cnt;
            v_detail := format('active_sales=%s', v_sales_cnt);

        WHEN 'product' THEN
            SELECT count(*)
              INTO v_detail_cnt
              FROM public.salesdetail
             WHERE prodcode = OLD.prodcode
               AND NOT is_deleted;

            SELECT count(*)
              INTO v_price_cnt
              FROM public.pricehist
             WHERE prodcode = OLD.prodcode
               AND NOT is_deleted;

            v_n := v_detail_cnt + v_price_cnt;
            v_detail := format('active_salesdetail=%s, active_pricehist=%s', v_detail_cnt, v_price_cnt);

        WHEN 'employee' THEN
            SELECT count(*) INTO v_n FROM (
                SELECT 1 FROM public.jobhistory WHERE empno = OLD.empno AND NOT is_deleted
                UNION ALL
                SELECT 1 FROM public.sales      WHERE empno = OLD.empno AND NOT is_deleted
            ) c;
            v_detail := format('active_employee_refs=%s', v_n);

        WHEN 'department' THEN
            SELECT count(*) INTO v_n
              FROM public.jobhistory
             WHERE deptcode = OLD.deptcode AND NOT is_deleted;
            v_detail := format('active_jobhistory=%s', v_n);

        WHEN 'job' THEN
            SELECT count(*) INTO v_n
              FROM public.jobhistory
             WHERE jobcode = OLD.jobcode AND NOT is_deleted;
            v_detail := format('active_jobhistory=%s', v_n);

        WHEN 'sales' THEN
            SELECT count(*) INTO v_n FROM (
                SELECT 1 FROM public.salesdetail WHERE transno = OLD.transno AND NOT is_deleted
                UNION ALL
                SELECT 1 FROM public.payment     WHERE transno = OLD.transno AND NOT is_deleted
            ) c;
            v_detail := format('active_sales_refs=%s', v_n);

        ELSE
            NULL; -- other child tables: nothing to check
    END CASE;

    IF v_n > 0 THEN
        RAISE EXCEPTION '[409 CONFLICT] ACTIVE_CHILDREN_EXIST: Cannot soft-delete % due to % active child record(s) (%).',
            TG_TABLE_NAME, v_n, v_detail
            USING ERRCODE = 'P0001',
                  DETAIL = format('code=ACTIVE_CHILDREN_EXIST; http_status=409; table=%s; active_count=%s; %s',
                                  TG_TABLE_NAME, v_n, v_detail),
                  HINT = 'Archive or resolve active child records before soft-deleting this record.';
    END IF;

    RETURN NEW;
END;
$function$;

-- 3. Enforce ON DELETE RESTRICT on foreign keys referencing customer and product
ALTER TABLE public.sales
  DROP CONSTRAINT IF EXISTS sales_custno_fkey,
  ADD CONSTRAINT sales_custno_fkey
    FOREIGN KEY (custno) REFERENCES public.customer(custno)
    ON DELETE RESTRICT;

ALTER TABLE public.pricehist
  DROP CONSTRAINT IF EXISTS pricehist_prodcode_fkey,
  ADD CONSTRAINT pricehist_prodcode_fkey
    FOREIGN KEY (prodcode) REFERENCES public.product(prodcode)
    ON DELETE RESTRICT;

ALTER TABLE public.salesdetail
  DROP CONSTRAINT IF EXISTS salesdetail_prodcode_fkey,
  ADD CONSTRAINT salesdetail_prodcode_fkey
    FOREIGN KEY (prodcode) REFERENCES public.product(prodcode)
    ON DELETE RESTRICT;
