# QA Test Cases & Execution Log: Product & Price History Module
**Task ID:** S2-TST-02  
**Issue:** #91  
**Module:** Product Catalog, Unit Validation & Effective-Date Price History  
**Dependencies:** S2-DEV-04, S2-DEV-05, S2-DEV-07  
**Tester:** Julienne Baltazar  
**Date:** November 28, 2026  

---

## 1. Test Cases & Execution Table

| Test ID | Category | Scenario / Title | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-PROD-01** | Product Create (Positive) | Create product with valid catalog data and unit | 1. Navigate to **Products** > **Add Product**.<br>2. Enter unique `sku`/`code` (`PROD-001`), valid `name`, valid `unit` (e.g., `PCS`, `KG`), and active status.<br>3. Click **Save**. | Product is created, appears in the product catalog list, and displays the selected unit accurately. | *Pending / Pass* | ⬜ |
| **TC-PROD-02** | Unit Validation (Negative) | Reject invalid or missing unit on Product Create/Edit | 1. Open **Add/Edit Product** (or send direct API `POST`/`PUT`).<br>2. Submit empty `unit` or an unsupported unit string (`INVALID_UNIT`).<br>3. Click **Save** / inspect response. | Submission is blocked by inline UI validation or rejected by API (`400`/`422`) with a unit validation error. | *Pending / Pass* | ⬜ |
| **TC-PROD-03** | Product Edit (Positive) | Edit existing product details | 1. Select `PROD-001` and click **Edit**.<br>2. Update product `name` and `unit` (e.g., `BOX`).<br>3. Click **Save**. | Updated details persist in the database and reflect immediately in the product catalog. | *Pending / Pass* | ⬜ |
| **TC-PROD-04** | Search & Filter | Search and filter products by name, code, and status/unit | 1. Go to **Product List**.<br>2. Search by partial `name` and partial `sku`/`code` (case-insensitive).<br>3. Apply available status/category filters. | List dynamically filters to display only matching products without errors. | *Pending / Pass* | ⬜ |
| **TC-PROD-05** | Price Empty State | View product with zero price history records | 1. Open the **Price History** view for newly created `PROD-001` (before adding any prices). | Graceful empty-state message (e.g., "No price history recorded") renders cleanly with no `500` server error. | *Pending / Pass* | ⬜ |
| **TC-PROD-06** | Price History (Past/Today) | Add past and today effective-date prices | 1. Add a price of `100.00` with a **past** effective date (e.g., last month).<br>2. Add a price of `125.50` with **today's** effective date. | Both entries appear in price history; `125.50` (today's effective date) is displayed as the active current price. | *Pending / Pass* | ⬜ |
| **TC-PROD-07** | Price History (Future) | Add future effective-date price without overwriting active price | 1. Add a price of `150.00` with a **future** effective date (e.g., next month).<br>2. Check the product's active price on the catalog and detail view. | Future price is scheduled in the history table, but **today's active price remains `125.50`** and is not overwritten prematurely. | *Pending / Pass* | ⬜ |
| **TC-PROD-08** | Price Validation (Negative) | Reject duplicate effective date (`409 Conflict`) | 1. Attempt to add another price entry for `PROD-001` using **today's** exact effective date (already used in `TC-PROD-06`).<br>2. Click **Save** / inspect API response. | Request is rejected with HTTP `409 Conflict` and a clear error stating a price already exists for that effective date. | *Pending / Pass* | ⬜ |
| **TC-PROD-09** | Price Validation (Negative) | Reject zero and negative price amounts | 1. Attempt to submit a price of `0` or `-25.00` for `PROD-001` (via UI and direct API). | Form/API blocks submission (`400`/`422`) with a validation error requiring a positive price greater than zero. | *Pending / Pass* | ⬜ |
| **TC-PROD-10** | Decimal Precision | Preserve exact decimal precision without rounding errors | 1. Add valid prices with exact decimals: `19.99` and `0.005` (or max supported decimal places).<br>2. Save, refresh, and inspect API/DB values. | Values `19.99` and `0.005` are stored and rendered verbatim without floating-point drift or unintended rounding. | *Pending / Pass* | ⬜ |
| **TC-PROD-11** | Price Deletion & Fallback | Delete current active price and verify fallback recalculation | 1. Delete the active price (`125.50` dated today) from `PROD-001` price history.<br>2. Check the product's active price. | Active price automatically falls back to the most recent valid past/today price (`100.00`), ignoring future scheduled prices. | *Pending / Pass* | ⬜ |

---

## 2. Step-by-Step Execution Guide (`TC-PROD-01` through `TC-PROD-11`)

### Before You Start
1. Run your backend server, frontend UI, and database locally.
2. Log in with an account authorized to create/edit products and manage price history.
3. Open Browser DevTools (`F12` -> **Network** tab) to inspect HTTP status codes (especially `409 Conflict` and `400`/`422` validation errors).

### Part 1: Product Catalog & Unit Validation (`TC-PROD-01` to `TC-PROD-04`)
* **TC-PROD-01 (Valid Product Create):**
  1. Go to **Products** -> **Add Product**.
  2. Enter `PROD-001`, Name `Industrial Valve`, Unit `PCS`, and click **Save**.
  3. Confirm `PROD-001` appears in the product table with unit `PCS`.
* **TC-PROD-02 (Invalid/Empty Unit):**
  1. Try creating/editing a product with no unit selected in the UI, or send an invalid unit via `curl`:
     ```bash
     curl -i -X POST http://localhost:3000/api/products \
       -H "Content-Type: application/json" \
       -d '{"code":"PROD-999","name":"Bad Unit Item","unit":"INVALID_UNIT"}'
     ```
  2. Confirm the request is rejected (`400` or `422`) and not saved.
* **TC-PROD-03 (Valid Edit):**
  1. Click **Edit** on `PROD-001`, change Name to `Heavy Duty Valve` and Unit to `BOX`, then click **Save**.
  2. Refresh the page and verify changes persisted.
* **TC-PROD-04 (Search & Filter):**
  1. Search `valve` (lowercase) and `PROD-001` in the product search bar; verify matching results appear.
  2. Toggle status/unit filters to confirm dynamic filtering works cleanly.

### Part 2: Effective-Date Price History & Guardrails (`TC-PROD-05` to `TC-PROD-11`)
* **TC-PROD-05 (Zero Price Records Empty State):**
  1. Open `PROD-001` before adding any prices.
  2. Verify the price history section loads cleanly with an empty-state message and **no `500` error** in the Network tab.
* **TC-PROD-06 (Past & Today Effective Dates):**
  1. Add Price `100.00` with last month's date -> saves cleanly.
  2. Add Price `125.50` with **today's** date -> saves cleanly and becomes the product's **Current / Active Price**.
* **TC-PROD-07 (Future Effective Date):**
  1. Add Price `150.00` with **next month's** date.
  2. Verify `150.00` appears in the history list as scheduled/upcoming, while the product's active price **stays `125.50`**.
* **TC-PROD-08 (Duplicate Effective Date — `409 Conflict`):**
  1. Attempt to add another price (e.g., `130.00`) using **today's** exact date again.
  2. Check the Network tab / UI alert to confirm the backend returns **`409 Conflict`** and blocks the duplicate date.
* **TC-PROD-09 (Zero & Negative Price Rejection):**
  1. Try submitting `0` and `-10.00` as price amounts in the UI (and via API if the UI input blocks negative numbers).
  2. Confirm both are rejected with validation errors.
* **TC-PROD-10 (Decimal Precision Check):**
  1. Add prices `19.99` and `0.005` (with distinct valid dates).
  2. Refresh the page and inspect both the UI and API JSON response to verify `19.99` and `0.005` are exact (not rounded to `20.00` or `0.01`).
* **TC-PROD-11 (Delete Current Price & Fallback):**
  1. Delete today's active price (`125.50`).
  2. Verify the active price automatically reverts to the most recent past price (`100.00`) rather than jumping to the future price (`150.00`).

### Recording Your Evidence
* Capture screenshots of the `409 Conflict` duplicate date response, empty state, decimal precision values, and fallback active price.
* Update `Actual Result` to `Pass` and change `⬜` to `✅` before opening your PR.

---

## 3. Execution Summary
* **Total Test Cases:** 11
* **Passed:** [X] / 11
* **Failed:** [X] / 11
* **Sign-off Status:** Ready for review / Completed
