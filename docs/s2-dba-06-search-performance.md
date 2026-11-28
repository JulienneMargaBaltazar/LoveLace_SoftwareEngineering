# S2-DBA-06 (Issue #87) — Search Performance Check & Index Tuning Notes

## Scope & Dataset Context
- Verified `EXPLAIN (ANALYZE, BUFFERS)` on:
  1. Customer search/filter (`is_deleted = FALSE` with `LOWER(custname) LIKE '%apex%' OR custno ILIKE 'D00%'`, ordered by `custname`).
  2. Product catalog + current effective price join (`product` left lateral join to `pricehist` where `is_deleted = FALSE` and `effdate <= CURRENT_DATE` ordered by `effdate DESC LIMIT 1`, filtered by `is_deleted = FALSE` and `LOWER(description) LIKE '%steel%'`).
  3. Price history timeline query (`pricehist` filtered by `prodcode = 'P0005'` ordered by `effdate DESC`).

## Benchmark Summary
| Query | Plan Highlights | Planning Time | Execution Time | Target (<50ms) |
| --- | --- | --- | --- | --- |
| Customer Search/Filter | `Seq Scan on customer` (88 rows filtered, 13 returned) + `Sort` (quicksort, 25kB) | 0.905 ms | 0.471 ms | Pass |
| Product + Current Price Join | `Seq Scan on product p` (69 rows filtered, 3 returned) + `Nested Loop Left Join` + `Index Scan using idx_pricehist_prodcode_effdate` | 1.026 ms | 0.281 ms | Pass |
| Price History Timeline (`P0005`) | `Index Scan using idx_pricehist_prodcode_effdate` (3 rows) | 0.065 ms | 11.888 ms | Pass |

## Index Tuning Decision
- **No redundant or premature indexes added** in this migration so `INSERT`/`UPDATE` write overhead is not increased without measurable read gains under current row counts.
- Existing `idx_pricehist_prodcode_effdate` already serves effective-date lookups and timeline ordering efficiently.
- **Future Trigger:** If `customer` or `product` grows significantly and `LOWER(...) LIKE '%...%'` queries exceed `50ms`, add partial `GIN (LOWER(col) gin_trgm_ops) WHERE is_deleted = FALSE` indexes (with `pg_trgm`) and re-benchmark.
