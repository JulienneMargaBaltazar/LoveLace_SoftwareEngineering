-- S2-DBA-02: Query: current price as of a given date
-- Depends on: S2-DBA-01 (index on pricehist), S2-DBA-03 (unique price per product and date)
--
-- NAMING NOTE: the issue says product_id / effective_date / price_history.
-- Actual schema: pricehist(prodcode, unitprice, effdate, is_deleted).
--
-- Functions:
--   get_price_as_of(p_prodcode, p_target_date DEFAULT CURRENT_DATE)
--       -> the single price row (prodcode, unitprice, effdate) with the latest effdate
--          where effdate <= target date. Returns NO ROWS (no error) if there is none.
--   get_unit_price_as_of(p_prodcode, p_target_date DEFAULT CURRENT_DATE)
--       -> just the unit price as NUMERIC. Returns NULL (no error) if there is none.
--
-- Rules:
--   * Future-dated prices (effdate > target date) are ignored until their date is reached.
--   * Soft-deleted prices (is_deleted = TRUE) are ignored.
--   * Tie-breaking is deterministic: pricehist's primary key (effdate, prodcode) allows
--     only one price per product per effective date.
--   * The query filters on prodcode and effdate, so it can use the composite index
--     idx_pricehist_prodcode_effdate (prodcode, effdate DESC) instead of a full scan.
--
-- Re-runnable.

-- Index from S2-DBA-01 (created here too only if it is missing)
CREATE INDEX IF NOT EXISTS idx_pricehist_prodcode_effdate
  ON pricehist (prodcode, effdate DESC);

CREATE OR REPLACE FUNCTION get_price_as_of(
  p_prodcode    TEXT,
  p_target_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (prodcode TEXT, unitprice NUMERIC, effdate DATE)
LANGUAGE sql
STABLE
AS $$
  SELECT ph.prodcode, ph.unitprice, ph.effdate
  FROM pricehist ph
  WHERE ph.prodcode   = p_prodcode
    AND ph.is_deleted = FALSE
    AND ph.effdate   <= COALESCE(p_target_date, CURRENT_DATE)
  ORDER BY ph.effdate DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_unit_price_as_of(
  p_prodcode    TEXT,
  p_target_date DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT ph.unitprice
  FROM pricehist ph
  WHERE ph.prodcode   = p_prodcode
    AND ph.is_deleted = FALSE
    AND ph.effdate   <= COALESCE(p_target_date, CURRENT_DATE)
  ORDER BY ph.effdate DESC
  LIMIT 1;
$$;
