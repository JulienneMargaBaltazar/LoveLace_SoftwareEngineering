# QA Test Cases & Execution Log: Customer Module
**Task ID:** S2-TST-01  
**Issue:** #90  
**Module:** Customer Management (List, Search, Filter, Create, Edit)  
**Dependencies:** S2-DEV-01, S2-DEV-02  
**Tester:** Julienne Baltazar  
**Date:** November 28, 2026  

---

## 1. Test Cases & Execution Table

| Test ID | Category | Scenario / Title | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-CUST-01** | Create (Positive) | Create customer with valid data via UI | 1. Navigate to **Customers** > **Add Customer**.<br>2. Enter unique `code` (e.g., `CUST-001`), valid `name`, valid `payTerms` (e.g., `Net 30`), and active status.<br>3. Click **Save**. | Customer is created, appears in the customer list, and a confirmation toast/message is shown. | *Pending / Pass* | ⬜ |
| **TC-CUST-02** | Create (Negative) | Submit form with empty required fields | 1. Open **Add Customer** form.<br>2. Leave `code` and `name` blank.<br>3. Click **Save**. | Form submission is blocked; inline validation errors prompt user to fill required fields. | *Pending / Pass* | ⬜ |
| **TC-CUST-03** | Create (Negative) | Exceed max character length boundaries | 1. Open **Add Customer** form.<br>2. Input strings exceeding max allowed length (e.g., >50 chars for `code`, >255 chars for `name`).<br>3. Click **Save**. | Input is truncated at max length or rejected with a field length validation error. | *Pending / Pass* | ⬜ |
| **TC-CUST-04** | Create (Negative) | Create customer with duplicate customer code | 1. Open **Add Customer** form.<br>2. Enter an existing `code` (`CUST-001`) with a new name.<br>3. Click **Save**. | Creation fails with a clear error message stating that the customer code already exists. | *Pending / Pass* | ⬜ |
| **TC-CUST-05** | Edit (Positive) | Edit existing customer details via UI | 1. Select an existing customer (`CUST-001`) and click **Edit**.<br>2. Update `name` and change `payTerms` to `COD`.<br>3. Click **Save**. | Updated details persist in the database and display accurately in the customer list. | *Pending / Pass* | ⬜ |
| **TC-CUST-06** | Edit (Negative) | Edit customer code to match another existing record | 1. Open **Edit** form for `CUST-002`.<br>2. Change `code` to `CUST-001` (already taken).<br>3. Click **Save**. | Update is rejected with a duplicate customer code error; original data remains intact. | *Pending / Pass* | ⬜ |
| **TC-CUST-07** | Search & Filter | Search by partial name and partial code | 1. Go to **Customer List**.<br>2. Enter a partial string (e.g., `CUST` or `Acme`) into the search bar.<br>3. Observe filtered results. | Only customers whose `code` or `name` contains the substring are displayed. | *Pending / Pass* | ⬜ |
| **TC-CUST-08** | Search & Filter | Case-insensitive search check | 1. Search using lowercase (e.g., `cust-001`).<br>2. Search using uppercase (e.g., `CUST-001`). | Both queries return the exact same matching customer records regardless of letter casing. | *Pending / Pass* | ⬜ |
| **TC-CUST-09** | Search & Filter | Filter customers by status (Active / Inactive) | 1. Select **Inactive** from the status filter dropdown.<br>2. Verify list.<br>3. Switch filter to **Active** and **All**. | List dynamically updates to display only records matching the selected status filter. | *Pending / Pass* | ⬜ |
| **TC-CUST-10** | Pagination | Pagination edge cases (first/last page, empty results) | 1. Populate >1 page of customers (e.g., 15+ records).<br>2. Navigate to Page 1 (verify **Previous** is disabled) and Last Page (verify **Next** is disabled).<br>3. Search a non-existent term (`ZZZZZ`). | Navigation buttons disable cleanly at boundaries; empty search displays a "No customers found" state without errors. | *Pending / Pass* | ⬜ |
| **TC-CUST-11** | API Validation | Reject invalid `payTerms` payload via direct API (`POST`/`PUT`) | 1. Send a direct API `POST /api/customers` request (via `curl`/Postman) with an invalid `payTerms` value (`"payTerms": "INVALID_TERM_999"`).<br>2. Inspect HTTP response. | API rejects the request with HTTP `400 Bad Request` or `422 Unprocessable Entity` and returns a validation error. | *Pending / Pass* | ⬜ |
| **TC-CUST-12** | Audit Log | Verify audit log generation on Create and Edit | 1. Create a new customer (`TC-CUST-01`) and edit an existing customer (`TC-CUST-05`).<br>2. Query the audit log table or view the Audit Log UI. | Two distinct audit log entries are recorded with accurate action types (`CREATE`, `UPDATE`), target ID, user ID, and timestamp. | *Pending / Pass* | ⬜ |

---

## 2. Step-by-Step Execution Guide (`TC-CUST-01` through `TC-CUST-12`)

### Before You Start
1. Run your app locally (both backend server and frontend UI, plus your database).
2. Log in to the web app with an account that has permission to manage customers.
3. Open DevTools (`F12` or `Right-click -> Inspect -> Network tab`) in your browser so you can watch API responses if something fails.

### Part 1: UI Create & Edit Tests (`TC-CUST-01` to `TC-CUST-06`)
* **TC-CUST-01 (Valid Create):**
  1. Go to the **Customers** page and click **Add / New Customer**.
  2. Type `CUST-001` in Code, `Acme Corp` in Name, pick a valid payment term (like `Net 30`), and set Status to `Active`.
  3. Click **Save**. Check that `CUST-001` appears in the table.
* **TC-CUST-02 (Empty Required Fields):**
  1. Click **Add Customer** again.
  2. Leave **Code** and **Name** completely empty.
  3. Click **Save**. Verify the form stops you and shows a "Required" error message.
* **TC-CUST-03 (Max Length Boundaries):**
  1. Open **Add Customer**.
  2. Paste a very long string (e.g., 60+ characters for Code, 300+ characters for Name).
  3. Notice if the input stops accepting characters at the limit, or click **Save** and confirm a validation error appears instead of a server crash (`500` error).
* **TC-CUST-04 (Duplicate Code on Create):**
  1. Open **Add Customer**.
  2. Type `CUST-001` (the exact code you used in TC-01) and a different name like `Beta Inc`.
  3. Click **Save**. Confirm it blocks creation with a "Code already exists / duplicate" message.
* **TC-CUST-05 (Valid Edit):**
  1. Find `CUST-001` in the table and click **Edit**.
  2. Change the Name to `Acme Corporation Updated` and change Payment Terms to another valid option (e.g., `COD`).
  3. Click **Save** and refresh the page to confirm the changes saved.
* **TC-CUST-06 (Duplicate Code on Edit):**
  1. Create a second valid customer first (`CUST-002`, `Beta Inc`).
  2. Click **Edit** on `CUST-002`, change its Code to `CUST-001`, and click **Save**.
  3. Confirm it rejects the edit and keeps `CUST-002` unchanged.

### Part 2: Search, Filter & Pagination (`TC-CUST-07` to `TC-CUST-10`)
* **TC-CUST-07 (Partial Search):**
  1. Type `Acme` into the search bar -> only `CUST-001` should show.
  2. Clear it and type `002` -> only `CUST-002` should show.
* **TC-CUST-08 (Case-Insensitive Search):**
  1. Type `acme` (all lowercase) -> `CUST-001` shows.
  2. Type `ACME` (all uppercase) -> `CUST-001` still shows.
* **TC-CUST-09 (Status Filter):**
  1. Edit `CUST-002` and set its status to **Inactive**.
  2. Use the Status dropdown on the Customer List: select **Inactive** (only `CUST-002` shows), then **Active** (only `CUST-001` shows), then **All** (both show).
* **TC-CUST-10 (Pagination Edge Cases):**
  1. Add enough customers to exceed 1 page (e.g., if page size is 10, have at least 11 records—or check if seed data already has them).
  2. On **Page 1**, check that the **Previous** button is disabled.
  3. Go to the **Last Page**, check that the **Next** button is disabled.
  4. Search for `ZZZZZ` (something that doesn't exist) and verify it cleanly shows an empty state message without breaking pagination.

### Part 3: API Payload & Audit Log Tests (`TC-CUST-11` & `TC-CUST-12`)
* **TC-CUST-11 (Invalid `payTerms` via API):**
  * Because a UI dropdown only lets you pick valid options, you must bypass the UI to test invalid `payTerms`.
  * **Easiest method (Browser Console or Terminal):**
    1. Open your terminal (or Postman/Thunder Client in VS Code).
    2. Run the `curl` command (replace `localhost:3000/api/customers` with your actual backend route, and include your auth token/cookie if your API requires login):
       ```bash
       curl -i -X POST http://localhost:3000/api/customers \
         -H "Content-Type: application/json" \
         -d '{"code":"CUST-999","name":"Bad Terms","payTerms":"INVALID_TERM"}'
       ```
    3. Verify the response header starts with `HTTP/1.1 400` or `422` (not `200` or `500`).
* **TC-CUST-12 (Audit Log Check):**
  1. Open your **Audit Logs** page in the UI (or open your database client like pgAdmin / Prisma Studio / DBeaver and inspect the `audit_logs` table).
  2. Look for the records generated when you created `CUST-001` (`CREATE`) and edited `CUST-001` (`UPDATE`).
  3. Confirm each log entry shows the correct action, customer record ID, timestamp, and logged-in user.

### Recording Your Evidence
As you pass each test:
* Take a few quick screenshots (e.g., validation error message, `400` API response, and the audit log rows).
* Update the `Actual Result` column in the test case table above to `Pass` (with a brief note of what happened) and change `⬜` to `✅`.

---

## 3. Execution Summary
* **Total Test Cases:** 12
* **Passed:** [X] / 12
* **Failed:** [X] / 12
* **Sign-off Status:** Ready for review / Completed
