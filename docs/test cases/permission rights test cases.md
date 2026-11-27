# QA Test Cases & Execution Log: Per-Right Permission Matrix (Customer, Product & Price)
**Task ID:** S2-TST-04  
**Issue:** #93  
**Module:** Role-Based & Per-Right Access Control (Customer, Product, Price History)  
**Dependencies:** S2-DEV-08, S1-DEV-07  
**Tester:** Julienne Baltazar  
**Date:** November 28, 2026  

---

## 1. Permission Test Matrix & Execution Table

| Test ID | Category | Scenario / Title | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-PERM-01** | View-Only UI | Verify View-only user sees zero mutation controls in UI | 1. Log in as a **View-Only** test user (only `View` rights enabled for Customers and Products).<br>2. Open **Customers**, **Products**, and **Product Price History** pages. | User can read lists and details, but **no Add, Edit, Delete, Restore, or Add/Delete Price buttons** are rendered in the UI. | *Pending / Pass* | ⬜ |
| **TC-PERM-02** | API Enforcement (`403`) | Block direct `POST`/`PUT`/`PATCH`/`DELETE` calls from unauthorized accounts | 1. Using the View-Only account's auth session/token, send direct API requests (`POST`, `PUT`, `PATCH`, `DELETE`) to `/api/customers`, `/api/products`, and `/api/products/:id/prices`.<br>2. Inspect HTTP response status codes. | Every unauthorized mutation endpoint rejects the request with **`403 Forbidden`** and makes zero database changes. | *Pending / Pass* | ⬜ |
| **TC-PERM-03** | Independent Rights (Add Only) | User with `Add` right only (no `Edit` or `Delete`) | 1. Configure a test user with **only `Add`** enabled for Customers/Products.<br>2. Log in, create a new record, then check UI controls and send direct `PUT`/`DELETE` API calls. | User can create records (`Add` visible and succeeds), while `Edit`/`Delete`/`Restore` buttons are hidden and direct `PUT`/`DELETE` API calls return `403 Forbidden`. | *Pending / Pass* | ⬜ |
| **TC-PERM-04** | Independent Rights (Edit Only) | User with `Edit` right only (no `Add` or `Delete`) | 1. Configure a test user with **only `Edit`** enabled.<br>2. Log in, update an existing record, then check UI and send direct `POST`/`DELETE` API calls. | User can edit existing records, while `Add` and `Delete` buttons are hidden and direct `POST`/`DELETE` API calls return `403 Forbidden`. | *Pending / Pass* | ⬜ |
| **TC-PERM-05** | Independent Rights (Delete Only) | User with `Delete` right only (no `Add` or `Edit`) | 1. Configure a test user with **only `Delete`** enabled.<br>2. Log in, soft-delete/restore a record, then check UI and send direct `POST`/`PUT` API calls. | User can delete/restore records, while `Add` and `Edit` buttons are hidden and direct `POST`/`PUT` API calls return `403 Forbidden`. | *Pending / Pass* | ⬜ |
| **TC-PERM-06** | Granular Price Rights | Test Price History mutation rights independently from Product rights | 1. Configure a user with **Product `Edit` = ON**, but **Price Rights = OFF** (and vice versa).<br>2. Attempt to add or delete a product price via UI and `POST`/`DELETE` API. | Product edits succeed, while Add/Delete Price controls are hidden and direct price mutation API calls return `403 Forbidden`. | *Pending / Pass* | ⬜ |
| **TC-PERM-07** | Live Rights Dialog Sync | Verify toggling permissions in Sprint 1 Rights Dialog updates Sprint 2 immediately | 1. Log in as Admin and open the **Rights Dialog** (`S1-DEV-07`) for a restricted test user.<br>2. Toggle `Add` or `Edit` right ON, save, and refresh the test user's session.<br>3. Toggle the right back OFF and re-test. | Sprint 2 Customer, Product, and Price modules immediately reflect the updated permission flags in both UI controls and API enforcement. | *Pending / Pass* | ⬜ |
| **TC-PERM-08** | Role Hierarchy | Compare Superadmin vs. Admin vs. Restricted Standard User behavior | 1. Test full CRUD + Price + Restore flows across three accounts: **Superadmin**, **Admin**, and **Restricted Standard User**.<br>2. Verify permission management access and module access. | **Superadmin** has unrestricted access and can modify all user rights; **Admin** operates within assigned admin rights; **Restricted Standard User** is strictly bound to individual toggled flags. | *Pending / Pass* | ⬜ |

---

## 2. Step-by-Step Execution Guide (`TC-PERM-01` through `TC-PERM-08`)

### Before You Start
1. Run your backend server, frontend app, and database locally.
2. Prepare at least **three test accounts** (or two browser windows: e.g., Regular Chrome for **Superadmin/Admin** and Incognito Chrome for the **Restricted Test User** so you can toggle rights live without logging in and out constantly).
3. Open Browser DevTools (`F12` -> **Network** tab) in the Restricted User's window to inspect `403 Forbidden` responses.

### Part 1: View-Only UI & `403 Forbidden` API Enforcement (`TC-PERM-01` & `TC-PERM-02`)
* **TC-PERM-01 (View-Only UI Check):**
  1. As Superadmin, open the **Rights Dialog** for your test user and set **only `View`** to ON (all `Add`, `Edit`, `Delete`, and `Price` rights OFF).
  2. In the test user's browser, navigate to **Customers**, **Products**, and open a product's **Price History**.
  3. Confirm you can view tables and details, and confirm **zero** buttons appear for *Add*, *Edit*, *Delete*, *Restore*, or *Add/Delete Price*.
* **TC-PERM-02 (Direct API `403 Forbidden` Check):**
  1. Copy the test user's session cookie or `Authorization: Bearer <TOKEN>` from DevTools (**Network** tab -> any `/api/` request -> **Request Headers**).
  2. Run `curl` commands against each mutation endpoint to verify the backend blocks unauthorized requests:
     ```bash
     # 1. Unauthorized Customer Create (POST)
     curl -i -X POST http://localhost:3000/api/customers \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer <VIEW_ONLY_TOKEN>" \
       -d '{"code":"PERM-01","name":"Unauthorized Corp","payTerms":"Net 30"}'

     # 2. Unauthorized Product Edit (PUT/PATCH)
     curl -i -X PUT http://localhost:3000/api/products/<PRODUCT_ID> \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer <VIEW_ONLY_TOKEN>" \
       -d '{"name":"Hacked Product"}'

     # 3. Unauthorized Price Create & Delete (POST & DELETE)
     curl -i -X POST http://localhost:3000/api/products/<PRODUCT_ID>/prices \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer <VIEW_ONLY_TOKEN>" \
       -d '{"price":10.00,"effectiveDate":"2026-12-01"}'

     curl -i -X DELETE http://localhost:3000/api/customers/<CUSTOMER_ID> \
       -H "Authorization: Bearer <VIEW_ONLY_TOKEN>"
     ```
  3. Verify every response starts with **`HTTP/1.1 403 Forbidden`**.

### Part 2: Independent Permission Flags (`TC-PERM-03` to `TC-PERM-06`)
* **TC-PERM-03 (`Add` Only):** Enable *only* `Add`. Verify you can create a Customer/Product, but `Edit`/`Delete` buttons are hidden and `PUT`/`DELETE` API calls return `403`.
* **TC-PERM-04 (`Edit` Only):** Enable *only* `Edit`. Verify you can update a record, but `Add`/`Delete` buttons are hidden and `POST`/`DELETE` API calls return `403`.
* **TC-PERM-05 (`Delete` Only):** Enable *only* `Delete`. Verify you can soft-delete/restore a record, but `Add`/`Edit` buttons are hidden and `POST`/`PUT` API calls return `403`.
* **TC-PERM-06 (Price Rights Isolation):** Enable Product `Edit` while keeping **Price Rights OFF**. Verify you can edit the product's name/unit, but cannot add or delete entries in its Price History (`403` on price endpoints).

### Part 3: Live Rights Dialog Sync & Role Hierarchy (`TC-PERM-07` & `TC-PERM-08`)
* **TC-PERM-07 (Immediate Update from Rights Dialog):**
  1. Keep the test user logged in on the Customers or Products page.
  2. In the Superadmin window, open the **Rights Dialog**, toggle `Add` ON, and save.
  3. Refresh the test user's page -> verify the **Add** button appears immediately and works.
  4. Toggle `Add` back OFF in the Rights Dialog, refresh the test user's page -> verify the **Add** button disappears and `POST` returns `403` again.
* **TC-PERM-08 (Superadmin vs. Admin vs. Standard User):**
  1. Log in as **Superadmin**, **Admin**, and **Restricted Standard User** respectively.
  2. Verify Superadmin has full access to all modules and the Rights Dialog, Admin respects configured administrative permissions, and Standard User is strictly limited to its granted per-right flags.

### Recording Your Evidence
* Capture screenshots of: (1) the View-Only UI with hidden action buttons, (2) `403 Forbidden` responses in DevTools or terminal, and (3) the Sprint 1 Rights Dialog toggle updating Sprint 2 access.
* Update `Actual Result` to `Pass` and change `⬜` to `✅` before submitting your PR.

---

## 3. Execution Summary
* **Total Test Cases:** 8
* **Passed:** [X] / 8
* **Failed:** [X] / 8
* **Sign-off Status:** Ready for review / Completed
