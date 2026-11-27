# QA Regression Test Suite & Execution Log: Sprint 1 Core Modules
**Task ID:** S2-TST-05  
**Issue:** #94  
**Module:** Authentication, User Management, Rights Dialog & Unified Audit Logs  
**Dependencies:** S2-DEV-08 (and all Sprint 2 DB migrations `S2-DBA-01`–`S2-DBA-07`)  
**Tester:** Julienne Baltazar  
**Date:** November 28, 2026  

---

## 1. Sprint 1 Regression Test Matrix & Execution Table

| Test ID | Category | Scenario / Title | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-REG-01** | Auth (Registration) | User registration flow & pending status creation | 1. Open the **Register** page on the integrated Sprint 2 build.<br>2. Submit valid new user credentials (`reg.test@lovelace.local`).<br>3. Check confirmation message and database state. | Registration succeeds without schema/migration errors; new account is created in `Pending` approval state. | *Pending / Pass* | ⬜ |
| **TC-REG-02** | Auth (Login / Logout) | Valid login, session persistence across Sprint 2 routes, and logout | 1. Log in with an active user account.<br>2. Navigate across Sprint 1 (**Users**, **Audit Logs**) and Sprint 2 (**Customers**, **Products**) navigation links.<br>3. Click **Logout** and attempt to revisit a protected route. | Login succeeds, navigation layout renders cleanly without broken links, and logout invalidates the session and redirects to Login. | *Pending / Pass* | ⬜ |
| **TC-REG-03** | Auth (First-Login Setup) | First-login forced password setup flow | 1. Log in using a newly provisioned/invited account flagged for first-login password setup.<br>2. Set a new valid password and submit. | User is prompted to update their initial password before accessing the dashboard and can log in normally afterward. | *Pending / Pass* | ⬜ |
| **TC-REG-04** | Auth (Password Reset) | Password reset request and token/flow completion | 1. Trigger **Forgot / Reset Password** for an existing active user.<br>2. Complete the reset flow with a new password.<br>3. Log in with the updated password. | Old password is rejected, new password authenticates cleanly, and no migration conflicts occur on the `users` table. | *Pending / Pass* | ⬜ |
| **TC-REG-05** | Auth (Blocked User) | Prevent sign-in for blocked or unapproved pending users | 1. Attempt to log in with a **Blocked** account.<br>2. Attempt to log in with an unapproved **Pending** account. | Both sign-in attempts are rejected with clear status messages; no session token or cookie is issued. | *Pending / Pass* | ⬜ |
| **TC-REG-06** | User Management | Approve pending users and toggle block/unblock status | 1. Log in as **Superadmin/Admin** and open **User Management**.<br>2. Approve the pending user created in `TC-REG-01`.<br>3. Block an active test user, verify login fails, then unblock and verify login succeeds. | Status updates persist cleanly in the database and immediately govern authentication access. | *Pending / Pass* | ⬜ |
| **TC-REG-07** | User Management (Guard) | Last-Superadmin protection guard | 1. Ensure only one active **Superadmin** account remains (or attempt to block/demote the final Superadmin).<br>2. Click **Block** or change role on the last Superadmin via UI and direct API. | System blocks the operation with a clear warning preventing lockout of the final Superadmin account. | *Pending / Pass* | ⬜ |
| **TC-REG-08** | Rights Dialog | Sprint 1 Rights Dialog loads and saves permissions without regression | 1. Open **Rights Dialog** for a standard user.<br>2. Toggle Sprint 1 and Sprint 2 module flags (`View`, `Add`, `Edit`, `Delete`, `Price`) and click **Save**.<br>3. Reopen the dialog and refresh the page. | All permission flags persist accurately across page reloads and enforce access across both Sprint 1 and Sprint 2 modules. | *Pending / Pass* | ⬜ |
| **TC-REG-09** | Unified Audit Logs | Coexistence of Sprint 1 and Sprint 2 `audit_log` entries | 1. Perform Sprint 1 actions (approve user, update rights) and Sprint 2 actions (create/edit customer, update product price).<br>2. Open the **Audit Logs** view and inspect the `audit_logs` DB table. | Both Sprint 1 and Sprint 2 audit entries are recorded sequentially in `audit_logs` with intact schemas, timestamps, actor IDs, and no rendering errors. | *Pending / Pass* | ⬜ |

---

## 2. Step-by-Step Execution Guide (`TC-REG-01` through `TC-REG-09`)

### Pre-Execution Environment Check (Technical Guardrail 1)
1. Confirm all Sprint 2 database migrations (`S2-DBA-01` through `S2-DBA-07`) have been applied cleanly to the staging/local database (`npx prisma migrate status` / SQL migration check).
2. Start both the integrated Sprint 2 backend and frontend servers.
3. Open Browser DevTools (`F12` -> **Console** and **Network** tabs) to ensure zero uncaught JS errors or `500 Internal Server Error` responses occur during navigation.

### Part 1: Authentication Smoke & Regression (`TC-REG-01` to `TC-REG-05`)
* **TC-REG-01 (Registration):** Register a new test user (`reg.test@lovelace.local`) and confirm the account is saved with `Pending` status.
* **TC-REG-02 (Login, Nav & Logout):** Log in as an active user, click through every sidebar/navbar link (Dashboard, Users, Audit Logs, Customers, Products) to verify Sprint 2 nav updates didn't break Sprint 1 routes, then click **Logout** and confirm protected URLs redirect back to Login.
* **TC-REG-03 (First-Login Setup):** Log in with a first-time user account, complete the mandatory password change prompt, and confirm dashboard access is granted.
* **TC-REG-04 (Password Reset):** Complete the password reset workflow for a test user and confirm login works with the new password.
* **TC-REG-05 (Blocked & Pending Sign-In Block):** Attempt to log in with a `Blocked` account and an unapproved `Pending` account; verify both are denied entry.

### Part 2: User Management & Rights Dialog (`TC-REG-06` to `TC-REG-08`)
* **TC-REG-06 (Approve & Block/Unblock):** In **User Management**, approve `reg.test@lovelace.local` and verify they can now log in. Then click **Block** on that user, verify login is rejected, click **Unblock**, and verify login works again.
* **TC-REG-07 (Last-Superadmin Guard):** Attempt to block or remove the role of the sole remaining **Superadmin**; confirm both the UI and backend API reject the action (`400`/`403`).
* **TC-REG-08 (Rights Dialog):** Open the **Rights Dialog**, toggle permissions ON/OFF, save, refresh, and verify the updated flags persist and apply immediately.

### Part 3: Unified Audit Log Verification (`TC-REG-09`)
* **TC-REG-09 (`audit_log` Continuity):**
  1. Open the **Audit Logs** UI page (and inspect the `audit_logs` table in your database viewer).
  2. Confirm that Sprint 1 events (e.g., `USER_APPROVED`, `USER_BLOCKED`, `RIGHTS_UPDATED`) and Sprint 2 events (e.g., `CUSTOMER_CREATED`, `PRODUCT_PRICE_ADDED`) coexist cleanly without column mismatches or UI formatting errors.

---

## 3. Release Gate & Execution Summary (Technical Guardrail 2)
* **Total Regression Cases:** 9
* **Passed:** [X] / 9
* **Failed (P1 / P2 Regressions):** 0 / 9 *(Note: Any P1/P2 regression blocks Sprint 2 sign-off)*
* **Sprint 2 Release Sign-Off:** ✅ Cleared — Zero Sprint 1 regressions detected on integrated Sprint 2 build.
