-- S2-DBA-03: Validation constraints (payterm, unit) on customer, product, pricehist
-- Depends on: S2-DBA-01
--
-- ALLOWED VALUES (keep backend/UI dropdowns aligned with these):
--   customer.payterm    : 'COD', '30D', '45D'
--   product.unit        : 'ea', 'pc', 'box', 'set', 'bag', 'kg', 'g', 'L', 'mL', 'm'
--   pricehist.unitprice : must be > 0
-- Notes:
--   * Existing data uses payterm COD/30D/45D and unit ea/pc.
--   * customer.payterm and product.unit are VARCHAR(3) in the database, so every
--     allowed value is at most 3 characters.
--   * Unique (product, effective date) is already enforced by the existing primary key
--     pricehist_pkey (effdate, prodcode), so no extra index is created for it.
--
-- NAMING NOTE: the issue says pay_terms / price_history(product_id, effective_date) / deleted_at.
-- Actual schema: customer.payterm, pricehist(prodcode, effdate), is_deleted BOOLEAN.
--
-- Re-runnable: each CHECK is dropped (if present) and re-added, so the allowed list can be updated.
-- Existing rows must already satisfy the rules, otherwise adding a CHECK fails.

-- Requirement 1: customer.payterm restricted to approved values
ALTER TABLE customer DROP CONSTRAINT IF EXISTS customer_payterm_check;
ALTER TABLE customer
  ADD CONSTRAINT customer_payterm_check
  CHECK (payterm IN ('COD', '30D', '45D'));

-- Requirement 2: product.unit restricted + price > 0
ALTER TABLE product DROP CONSTRAINT IF EXISTS product_unit_check;
ALTER TABLE product
  ADD CONSTRAINT product_unit_check
  CHECK (unit IN ('ea', 'pc', 'box', 'set', 'bag', 'kg', 'g', 'L', 'mL', 'm'));

ALTER TABLE pricehist DROP CONSTRAINT IF EXISTS pricehist_unitprice_positive;
ALTER TABLE pricehist
  ADD CONSTRAINT pricehist_unitprice_positive
  CHECK (unitprice > 0);

-- Requirement 3: unique active product codes
-- product.prodcode is already the PRIMARY KEY (unique). This partial index also blocks
-- codes that differ only by letter case among active products.
CREATE UNIQUE INDEX IF NOT EXISTS uq_product_active_prodcode_ci
  ON product (UPPER(prodcode))
  WHERE is_deleted = FALSE;

-- Remove the redundant partial index from the earlier draft, if it was created.
DROP INDEX IF EXISTS uq_pricehist_active_prodcode_effdate;
