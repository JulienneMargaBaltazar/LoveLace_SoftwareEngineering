-- S2-DBA-01: Customer and product active views, indexes
--
-- Schema mapping (issue wording -> actual schema):
--   deleted_at IS NULL    -> is_deleted = FALSE (BOOLEAN NOT NULL DEFAULT FALSE)
--   customer(name)        -> customer(custname)
--   product(name)         -> product(description)
--   product(code)         -> product(prodcode)  [already PRIMARY KEY]
--   price_history(...)    -> pricehist(prodcode, effdate DESC)
--
-- Existing customer_active / product_active views are left untouched.
-- Idempotent: safe to run more than once.

-- Requirement 1: active views (soft-deleted rows excluded)
-- security_invoker = true so the views respect the caller's RLS policies.
CREATE OR REPLACE VIEW v_active_customers
WITH (security_invoker = true) AS
SELECT custno, custname, address, payterm, is_blocked
FROM customer
WHERE is_deleted = FALSE;

CREATE OR REPLACE VIEW v_active_products
WITH (security_invoker = true) AS
SELECT prodcode, description, unit
FROM product
WHERE is_deleted = FALSE;

-- Requirement 2: search and foreign-key indexes
CREATE INDEX IF NOT EXISTS idx_customer_custname   ON customer (custname);
CREATE INDEX IF NOT EXISTS idx_customer_is_deleted ON customer (is_deleted);

CREATE INDEX IF NOT EXISTS idx_product_description ON product (description);
CREATE INDEX IF NOT EXISTS idx_product_is_deleted  ON product (is_deleted);
-- product(prodcode) is the PRIMARY KEY, so no extra index is needed.

-- pricehist PK is (effdate, prodcode): it does not lead with prodcode,
-- so this index is needed for per-product, latest-price lookups.
CREATE INDEX IF NOT EXISTS idx_pricehist_prodcode_effdate
  ON pricehist (prodcode, effdate DESC);

-- Foreign-key indexes (Postgres does not create these automatically)
CREATE INDEX IF NOT EXISTS idx_sales_custno         ON sales (custno);
CREATE INDEX IF NOT EXISTS idx_sales_empno          ON sales (empno);
CREATE INDEX IF NOT EXISTS idx_salesdetail_prodcode ON salesdetail (prodcode);
-- salesdetail(transno) leads its composite PK (transno, prodcode),
-- so it is already indexed; no extra index is created.