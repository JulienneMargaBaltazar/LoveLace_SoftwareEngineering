-- S2-DBA-08: Verify rights catalogue entries and seed permission presets (Customer / Product)
-- Depends on: S1-DBA-05 (rights_catalogue, user_permission) and S2-DEV-08
--
-- VERIFIED (read-only): rights_catalogue already contains every right key the Sprint 2
-- backend checks, with status 'Active'. The catalogue code is the backend key in UPPER_SNAKE
-- form (backend: lower-case with hyphens):
--   module 1 (Customer Management): ADD_CUSTOMER(1) EDIT_CUSTOMER(2) DELETE_CUSTOMER(3)
--   module 2 (Product Management) : ADD_PRODUCT(4) EDIT_PRODUCT(5) DELETE_PRODUCT(6)
--                                   ADD_PRICE(7)   EDIT_PRICE(8)   DELETE_PRICE(9)
-- NOT in the catalogue (and not checked by any backend endpoint): VIEW_CUSTOMER, VIEW_PRODUCT,
-- MANAGE_PRICE. View is implicit for any logged-in user; price management is covered by
-- ADD_PRICE / EDIT_PRICE / DELETE_PRICE. No catalogue rows are added or changed here.
--
-- THIS FILE only ADDS missing user_permission mappings (no existing IDs are altered):
--   * every Superadmin (role_id 1)  -> all 9 customer/product rights
--   * lacusclyne@hope.com (Admin)   -> all 9 customer/product rights
--   * test@hope.com (QA User preset)-> the same customer/product rights it already has in
--                                      user_rights (so user_permission and user_rights agree)
--
-- Idempotent: a mapping is only inserted if it does not already exist.

-- Superadmin accounts: all customer + product rights
INSERT INTO user_permission (user_id, right_id, status, stamp)
SELECT u.user_id, rc.right_id, 'Active',
       'CREATED system ' || to_char(now(), 'YYYY-MM-DD HH12:MI AM')
FROM app_user u
CROSS JOIN rights_catalogue rc
WHERE u.role_id = 1
  AND rc.module_id IN (1, 2)
  AND rc.status = 'Active'
  AND NOT EXISTS (
    SELECT 1 FROM user_permission up
    WHERE up.user_id = u.user_id AND up.right_id = rc.right_id
  );

-- QA admin account: all customer + product rights
INSERT INTO user_permission (user_id, right_id, status, stamp)
SELECT u.user_id, rc.right_id, 'Active',
       'CREATED system ' || to_char(now(), 'YYYY-MM-DD HH12:MI AM')
FROM app_user u
CROSS JOIN rights_catalogue rc
WHERE u.email = 'lacusclyne@hope.com'
  AND rc.module_id IN (1, 2)
  AND rc.status = 'Active'
  AND NOT EXISTS (
    SELECT 1 FROM user_permission up
    WHERE up.user_id = u.user_id AND up.right_id = rc.right_id
  );

-- QA user preset: mirror the rights test@hope.com already has in user_rights
INSERT INTO user_permission (user_id, right_id, status, stamp)
SELECT DISTINCT u.user_id, rc.right_id, 'Active',
       'CREATED system ' || to_char(now(), 'YYYY-MM-DD HH12:MI AM')
FROM app_user u
JOIN user_rights ur
  ON ur.user_id = u.user_id::text
 AND ur.is_allowed = TRUE
 AND ur.is_deleted = FALSE
JOIN rights_catalogue rc
  ON lower(replace(rc.right_code, '_', '-')) = ur.action_key
 AND rc.module_id IN (1, 2)
WHERE u.email = 'test@hope.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_permission up
    WHERE up.user_id = u.user_id AND up.right_id = rc.right_id
  );
