# S2-DBA-07 (Issue #88) — Audit Log Trigger Verification Notes

## Scope
- Verified `public.audit_log` trigger behavior across `customer`, `product`, and `pricehist` for `INSERT`, field `UPDATE`, soft-delete (`is_deleted = TRUE`), and restore (`is_deleted = FALSE`) with acting `user_id` and `user_email` context.

## Verification Results
- Confirmed 15 audit entries (`audit_id` 147–161) across `customer` (5 rows), `product` (5 rows), and `pricehist` (5 rows) for test records `D9991` and `P9991`.
- Verified `user_id` (`00000000-0000-0000-0000-000000000001`), `user_email` (`lacusclyne@hope.com`), `old_data`, and `new_data` snapshots are captured accurately across `INSERT` (`old_data` null) and `UPDATE` (before/after JSONB values).
- Confirmed legitimate field edits, soft-deletes, and restores are not blocked by triggers, while hard `DELETE` on `pricehist` remains protected by `trg_block_hard_delete()`.
- No missing trigger bindings or schema patches were required for `customer`, `product`, or `pricehist`.
