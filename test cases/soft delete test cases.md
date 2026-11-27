# QA Test Cases & Execution Log: Soft Delete, Restore & Active Child Protection
**Task ID:** S2-TST-03  
**Issue:** #92  
**Module:** Customer & Product Lifecycle (Soft Delete, Archive Filter, Restore, Referential Integrity)  
**Dependencies:** S2-DEV-03, S2-DEV-06, S2-DBA-04  
**Tester:** Julienne Baltazar  
**Date:** November 28, 2026  

---

## 1. Test Cases & Execution Table

| Test ID | Category | Scenario / Title | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-DEL-01** | Soft Delete (Customer) | Soft-delete an eligible customer and verify active list/dropdown exclusion | 1. Select an active customer with no blocking child records (`CUST-DEL-01`) and click **Delete / Archive**.<br>2. Confirm deletion.<br>3. Check the main **Active Customers** list and any transaction/order customer dropdowns.<br>4. Switch status filter to **Archived / Deleted**. | Customer disappears from active lists and dropdowns, remains retrievable under the **Archived** filter, and retains its row in the database with `deleted_at` populated. | *Pending / Pass* | ⬜ |
| **TC-DEL-02** | Soft Delete (Product) | Soft-delete an eligible product and verify active list/dropdown exclusion | 1. Select an active product with no blocking child records (`PROD-DEL-01`) and click **Delete / Archive**.<br>2. Confirm deletion.<br>3. Check the main **Active Products** catalog and product selection dropdowns.<br>4. Switch status filter to **Archived / Deleted**. | Product disappears from active catalog lists and dropdowns, appears under **Archived**, and is never physically removed from the database (`deleted_at` populated). | *Pending / Pass* | ⬜ |
| **TC-DEL-03** | Guardrail (Archived Lock) | Block editing or adding prices to soft-deleted records | 1. Locate soft-deleted `CUST-DEL-01` and `PROD-DEL-01` in the **Archived** view.<br>2. Attempt to edit their details via UI or direct API (`PUT`/`PATCH`).<br>3. Attempt to add a new price entry to archived `PROD-DEL-01`. | UI hides/disables edit and add-price actions; direct API requests are rejected (`400`/`403`/`409`) while the record is archived. | *Pending / Pass* | ⬜ |
| **TC-DEL-04** | Child Protection (Customer) | Block deletion of a customer with active child records | 1. Select an active customer (`CUST-CHILD-01`) that has active linked child records (e.g., open orders, invoices, or active contracts).<br>2. Click **Delete / Archive** and confirm. | Deletion is blocked; a clear user-facing error message explains that the customer cannot be deleted due to active child records, and `deleted_at` remains `NULL`. | *Pending / Pass* | ⬜ |
| **TC-DEL-05** | Child Protection (Product) | Block deletion of a product with active child records | 1. Select an active product (`PROD-CHILD-01`) that has active linked child records (e.g., active order lines, stock movements, or active price/line references).<br>2. Click **Delete / Archive** and confirm. | Deletion is blocked; a clear user-facing error message explains that the product has active child records, and the product stays active. | *Pending / Pass* | ⬜ |
| **TC-DEL-06** | Restore (Customer) | Restore an archived customer and verify editability | 1. Filter **Customers** by **Archived** and select `CUST-DEL-01`.<br>2. Click **Restore**.<br>3. Check the **Active** list, dropdowns, and edit form for `CUST-DEL-01`. | `CUST-DEL-01` returns to active lists/dropdowns, `deleted_at` is cleared (`NULL`), and the record can be edited normally again. | *Pending / Pass* | ⬜ |
| **TC-DEL-07** | Restore (Product) | Restore an archived product and verify editability & pricing | 1. Filter **Products** by **Archived** and select `PROD-DEL-01`.<br>2. Click **Restore**.<br>3. Check the **Active** catalog, edit form, and price history actions. | `PROD-DEL-01` returns to active lists/dropdowns, `deleted_at` is cleared (`NULL`), and both product details and new price entries can be saved again. | *Pending / Pass* | ⬜ |
| **TC-DEL-08** | Audit Log | Verify audit logs capture both soft-delete and restore events | 1. Open the **Audit Logs** UI or query the `audit_logs` database table.<br>2. Inspect events generated during `TC-DEL-01`, `TC-DEL-02`, `TC-DEL-06`, and `TC-DEL-07`. | Distinct audit log records exist for every `DELETE` (soft-delete) and `RESTORE` action with accurate entity type, record ID, user ID, and timestamp. | *Pending / Pass* | ⬜ |

---

## 2. Step-by-Step Execution Guide (`TC-DEL-01` through `TC-DEL-08`)

### Before You Start
1. Start your backend server, frontend app, and database locally.
2. Open your database viewer (e.g., pgAdmin, Prisma Studio, DBeaver, or Supabase Table Editor) alongside Browser DevTools (`F12` -> **Network** tab) so you can verify the `deleted_at` column and `audit_logs` rows directly.

### Part 1: Soft Delete & Archived Guardrails (`TC-DEL-01` to `TC-DEL-03`)
* **TC-DEL-01 (Soft-Delete Customer):**
  1. Create or pick an active customer with no child records (`CUST-DEL-01`).
  2. Click **Delete / Archive** and confirm.
  3. Verify `CUST-DEL-01` no longer appears in the default **Active** customer list or in any dropdown selectors on other forms.
  4. Switch the status filter to **Archived** -> verify `CUST-DEL-01` appears.
  5. Check the `customers` database table -> confirm the row still exists and `deleted_at` has a timestamp (not physically deleted).
* **TC-DEL-02 (Soft-Delete Product):**
  1. Repeat the exact same steps for an eligible product (`PROD-DEL-01`).
  2. Confirm it is hidden from active product lists/dropdowns, visible under **Archived**, and still present in the `products` table with `deleted_at` populated.
* **TC-DEL-03 (Archived Read-Only Guardrail):**
  1. While `CUST-DEL-01` and `PROD-DEL-01` are archived, confirm the UI disables or hides **Edit** and **Add Price** buttons.
  2. Test bypassing the UI via `curl` to confirm the backend also blocks mutations on archived records:
     ```bash
     curl -i -X PUT http://localhost:3000/api/products/<ARCHIVED_PROD_ID> \
       -H "Content-Type: application/json" \
       -d '{"name":"Should Fail While Archived"}'
     ```
     ```bash
     curl -i -X POST http://localhost:3000/api/products/<ARCHIVED_PROD_ID>/prices \
       -H "Content-Type: application/json" \
       -d '{"price":99.99,"effectiveDate":"2026-12-01"}'
     ```
  3. Confirm both API requests return `400`, `403`, or `409` (and never `200`).

### Part 2: Active Child-Record Delete Protection (`TC-DEL-04` & `TC-DEL-05`)
* **TC-DEL-04 (Customer with Active Children):**
  1. Pick or create a customer (`CUST-CHILD-01`) linked to an active child record (such as an active order/transaction).
  2. Attempt to **Delete / Archive** `CUST-CHILD-01`.
  3. Verify a clear error alert/toast blocks the deletion and `deleted_at` remains `NULL` in the database.
* **TC-DEL-05 (Product with Active Children):**
  1. Pick or create a product (`PROD-CHILD-01`) linked to an active child record.
  2. Attempt to **Delete / Archive** `PROD-CHILD-01`.
  3. Verify a clear error message blocks the deletion and the product stays active.

### Part 3: Restore & Audit Log Verification (`TC-DEL-06` to `TC-DEL-08`)
* **TC-DEL-06 & TC-DEL-07 (Restore Customer & Product):**
  1. Go to the **Archived** filter for Customers, click **Restore** on `CUST-DEL-01`, and verify it reappears in the **Active** list, has `deleted_at = NULL`, and can be edited again.
  2. Repeat for `PROD-DEL-01` in Products, and verify you can both edit the product and add a new price entry once restored.
* **TC-DEL-08 (Audit Logs):**
  1. Check the **Audit Logs** page or `audit_logs` table.
  2. Confirm separate log entries were recorded for both the **Soft Delete** and **Restore** events for `CUST-DEL-01` and `PROD-DEL-01`.

### Recording Your Evidence
* Take screenshots of: (1) the user-facing error blocking deletion with active children, (2) the `deleted_at` column in the database, and (3) the `DELETE` and `RESTORE` audit log entries.
* Update `Actual Result` to `Pass` and change `⬜` to `✅` before submitting your PR.

---

## 3. Execution Summary
* **Total Test Cases:** 8
* **Passed:** [X] / 8
* **Failed:** [X] / 8
* **Sign-off Status:** Ready for review / Completed
