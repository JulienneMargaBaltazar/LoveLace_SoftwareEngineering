# QA Bug Reports & Fix Verification Log: Sprint 2
**Task ID:** S2-TST-06  
**Module:** Customer, Product, Price History & Per-Right Permissions  
**Dependencies:** S2-TST-01, S2-TST-02, S2-TST-03, S2-TST-04, S2-TST-05  
**Tester:** Julienne Baltazar  
**Date:** November 28, 2026  

---

## 1. Defect Summary & Verification Tracker

| Bug ID | Severity | Module / Area | Defect Summary | Role / Context | Fix PR / Issue | Regression Re-Test | Status |
| :--- | :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| **BUG-S2-01** | **High** | Customer API (`S2-DEV-02`) | Direct `POST /api/customers` accepts invalid `payTerms` strings instead of returning `400`/`422` validation error | Admin / Dev User (`TC-CUST-11`) | Linked Fix PR | `TC-CUST-11` Passed | ✅ **Verified Closed** |
| **BUG-S2-02** | **Critical** | Price History (`S2-DEV-07`) | Adding a price with a future effective date prematurely overwrote the active current price on the product list | Admin (`TC-PROD-07`) | Linked Fix PR | `TC-PROD-06`, `TC-PROD-07`, `TC-PROD-11` Passed | ✅ **Verified Closed** |
| **BUG-S2-03** | **High** | Soft Delete (`S2-DEV-03`) | Soft-deleted customers still appeared in transaction/order dropdown selectors despite being hidden from main list | Admin (`TC-DEL-01`) | Linked Fix PR | `TC-DEL-01`, `TC-DEL-06` Passed | ✅ **Verified Closed** |
| **BUG-S2-04** | **Critical** | Permissions (`S2-DEV-08`) | View-only user UI hid mutation buttons, but direct `DELETE /api/products/:id/prices/:priceId` returned `200` instead of `403 Forbidden` | View-Only User (`TC-PERM-02`) | Linked Fix PR | `TC-PERM-01`, `TC-PERM-02`, `TC-PERM-06` Passed | ✅ **Verified Closed** |
| **BUG-S2-05** | **Low** | Customer List UI (`S2-DEV-01`) | Long customer names (>80 chars) slightly overflow table cell padding on mobile/narrow viewports | All Roles (`TC-CUST-03`) | Deferred to Sprint 3 | N/A | 📋 **Deferred (Sprint 3)** |

---

## 2. Detailed Reproducible Bug Reports (Requirement 1)

### `BUG-S2-01` — Invalid `payTerms` Payload Accepted on Customer Create API
* **Severity:** High
* **Role / Permission Context:** Authenticated Admin user with Customer `Add` permission (`TC-CUST-11`).
* **Steps to Reproduce:**
  1. Authenticate as an Admin user and obtain a valid session token.
  2. Send a direct API request:
     ```bash
     curl -i -X POST http://localhost:3000/api/customers \
       -H "Content-Type: application/json" \
       -d '{"code":"CUST-ERR-01","name":"Bad Terms Corp","payTerms":"INVALID_TERM_999"}'
     ```
  3. Inspect the HTTP status code and database record.
* **Expected Result:** API rejects the payload with `HTTP 400 Bad Request` or `422 Unprocessable Entity` and does not insert the customer.
* **Actual Result:** API returned `HTTP 201 Created` and persisted `"INVALID_TERM_999"` in `pay_terms`.
* **Evidence / API Log:** `HTTP/1.1 201 Created` observed in terminal/DevTools response payload.
* **Fix Verification:** Re-tested after backend enum/schema validation merge; request now properly returns `HTTP 400 Bad Request` (`Validation failed: invalid payTerms`). **Status: Verified Closed.**

---

### `BUG-S2-02` — Future Effective-Date Price Prematurely Overwrites Active Product Price
* **Severity:** Critical
* **Role / Permission Context:** Authenticated Admin user with Product & Price rights (`TC-PROD-07`).
* **Steps to Reproduce:**
  1. Open product `PROD-001` with an active today price of `125.50`.
  2. Add a new price entry of `150.00` with a **future** effective date (next month).
  3. Return to the **Products** catalog table and inspect the displayed active price.
* **Expected Result:** Active price remains `125.50` until the future effective date arrives.
* **Actual Result:** Product catalog immediately displayed `150.00` as the active price because the query sorted by `effective_date DESC` without filtering `effective_date <= CURRENT_DATE`.
* **Evidence / API Log:** `GET /api/products` returned `"currentPrice": 150.00` instead of `125.50`.
* **Fix Verification:** Re-tested `TC-PROD-06`, `TC-PROD-07`, and `TC-PROD-11` after SQL view/query filter update; active price now strictly reflects the latest price where `effective_date <= CURRENT_DATE`. **Status: Verified Closed.**

---

### `BUG-S2-03` — Soft-Deleted Customers Still Appearing in Active Dropdown Selectors
* **Severity:** High
* **Role / Permission Context:** Authenticated Admin user with Customer `Delete` permission (`TC-DEL-01`).
* **Steps to Reproduce:**
  1. Soft-delete an eligible customer (`CUST-DEL-01`) from the Customers module (`deleted_at` populated).
  2. Open a dependent form containing a customer selection dropdown.
  3. Search or scroll through the dropdown options.
* **Expected Result:** Soft-deleted customers (`deleted_at IS NOT NULL`) are excluded from all active lists and dropdown selectors.
* **Actual Result:** `CUST-DEL-01` was hidden from the main Customers table but still selectable in dropdown options.
* **Evidence / API Log:** Dropdown lookup query omitted the `WHERE deleted_at IS NULL` filter.
* **Fix Verification:** Re-ran `TC-DEL-01` and `TC-DEL-06`; soft-deleted records are now excluded from all active dropdowns and reappear only after clicking **Restore**. **Status: Verified Closed.**

---

### `BUG-S2-04` — Missing Backend `403 Forbidden` Check on Price History `DELETE` Endpoint
* **Severity:** Critical
* **Role / Permission Context:** Restricted View-Only user (`View = ON`, `Add/Edit/Delete/Price = OFF`) (`TC-PERM-02`).
* **Steps to Reproduce:**
  1. Log in as a View-Only user and confirm the **Delete Price** button is hidden in the UI.
  2. Copy the user's auth header and execute:
     ```bash
     curl -i -X DELETE http://localhost:3000/api/products/1/prices/10 \
       -H "Authorization: Bearer <VIEW_ONLY_TOKEN>"
     ```
* **Expected Result:** Backend middleware blocks the request with `HTTP 403 Forbidden`.
* **Actual Result:** Endpoint returned `HTTP 200 OK` and deleted the price entry.
* **Evidence / API Log:** `HTTP/1.1 200 OK` returned for unauthorized token.
* **Fix Verification:** Re-ran `TC-PERM-01`, `TC-PERM-02`, and `TC-PERM-06` after RBAC middleware patch; endpoint now returns `HTTP 403 Forbidden`. **Status: Verified Closed.**

---

## 3. Deferred Low-Severity UI Polish (Sprint 3 Triage)

| Item ID | Module | Description | Severity | Target Milestone |
| :--- | :--- | :--- | :---: | :---: |
| **BUG-S2-05** | Customer List UI | Long customer names (>80 characters) wrap awkwardly and slightly crowd action buttons on narrow screens (<768px). Truncate with ellipsis (`text-overflow: ellipsis`) and tooltip on hover. | Low | **Sprint 3 Backlog** |

---

## 4. Sign-Off Summary (Requirement 2)
* **Total Defects Logged:** 5
* **Critical / High Defects Verified Closed:** 4 / 4 (100%)
* **Low-Severity Defects Deferred to Sprint 3:** 1 (`BUG-S2-05`)
* **Sprint 2 Release Readiness:** ✅ Approved — No open Critical or High severity blockers remaining.
