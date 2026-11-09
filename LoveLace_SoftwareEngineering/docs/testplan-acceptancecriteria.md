# Sprint 1 Test Plan and Acceptance Criteria
**Tester:** Julienne Baltazar  
---

## 1. Test Execution Summary
*Update the status and actual results here during active testing.*

| Test ID | Test Scenario | Traced Engineering Task | Status | Actual Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Sign Up with valid details | S1-DEV-02 | ⚪ Not Run | N/A |
| **TC-02** | Sign Up with required fields empty | S1-DEV-02 | ⚪ Not Run | N/A |
| **TC-03** | Sign Up with invalid email format | S1-DEV-02 | ⚪ Not Run | N/A |
| **TC-04** | Sign Up with an existing email | S1-DEV-02 | ⚪ Not Run | N/A |
| **TC-05** | Sign Up with mismatched passwords | S1-DEV-02 | ⚪ Not Run | N/A |
| **TC-06** | Log In with valid credentials | S1-DEV-03 | ⚪ Not Run | N/A |
| **TC-07** | Log In with an incorrect password | S1-DEV-03 | ⚪ Not Run | N/A |
| **TC-08** | Log In with required fields empty | S1-DEV-03 | ⚪ Not Run | N/A |
| **TC-09** | Open dashboard after login | S1-DEV-08 | ⚪ Not Run | N/A |
| **TC-10** | Open dashboard without login | S1-DEV-03 / 08 | ⚪ Not Run | N/A |
| **TC-11** | Log out session verification | S1-DEV-03 | ⚪ Not Run | N/A |
| **TC-12** | Check role-based sidebar navigation | S1-DEV-05 / 06 / 07 | ⚪ Not Run | N/A |

---

## 2. Test Cases & Verification Pathways

<details>
<summary><b> Sign Up & Registration Verification (TC-01 to TC-05)</b></summary>

### TC-01 — Sign Up with Valid Details
* **Traceability Reference:** Maps to `S1-DEV-02` (Register user form and API)
* **Test Data:** Valid text name, unique unused email string, valid criteria password.
* **Steps:**
  1. Open the Sign Up interface page.
  2. Input valid structural credentials.
  3. Submit the registration form.
* **Expected Result:** The system safely posts details, initializes the account record as `pending` in the database, and presents the documented next-step visual confirmation screen.

### TC-02 — Sign Up with Required Fields Empty
* **Traceability Reference:** Maps to `S1-DEV-02` (Form Validation)
* **Steps:**
  1. Leave required fields completely empty.
  2. Trigger form submission action.
* **Expected Result:** Edge validation catches empty inputs; form submittal is blocked with explicit UI highlights.

### TC-03 — Sign Up with Invalid Email Format
* **Traceability Reference:** Maps to `S1-DEV-02` (API edge logic validation)
* **Test Data:** String missing standard symbols (`alexexample.com`).
* **Steps:**
  1. Input structural malformed email address format.
  2. Trigger form submission.
* **Expected Result:** System flags structural invalidity, rejects post-call, and returns visual alert indication.

### TC-04 — Sign Up with an Existing Email
* **Traceability Reference:** Maps to `S1-DEV-02` (Database uniqueness constraints)
* **Test Data:** Email matching a previously registered account profile.
* **Expected Result:** API returns failure message preventing duplicate profile creation on backend database levels.

### TC-05 — Sign Up with Mismatched Passwords
* **Traceability Reference:** Maps to `S1-DEV-02` (Input matching checks)
* **Test Data:** Two distinct inputs inside password checking entry boxes.
* **Expected Result:** Form blocks submission routine processing, returning matching validation warning flags.
</details>

<details>
<summary><b> Authentication & System Constraints (TC-06 to TC-08)</b></summary>

### TC-06 — Log In with Valid Credentials
* **Traceability Reference:** Maps to `S1-DEV-03` (Login/Logout handling and hashing verification)
* **Expected Result:** Password check resolves successfully against hashed DB record, generating valid active session.

### TC-07 — Log In with an Incorrect Password
* **Traceability Reference:** Maps to `S1-DEV-03` (Edge error bounds matching)
* **Expected Result:** Authentication fails natively; returns general "Invalid credentials" notification toast.

### TC-08 — Log In with Required Fields Empty
* **Traceability Reference:** Maps to `S1-DEV-03`
* **Expected Result:** Client front-end intercept blocks submission request, flashing field missing alerts.
</details>

<details>
<summary><b> Role Constraints, Sessions, & Dashboards (TC-09 to TC-12)</b></summary>

### TC-09 — Open Dashboard After Successful Login
* **Traceability Reference:** Maps to `S1-DEV-08` (Main page modules)
* **Expected Result:** Workspace structure loads correctly based on user permission level.

### TC-10 — Open Dashboard Without Logging In
* **Traceability Reference:** Maps to `S1-DEV-03` & `S1-DEV-08` (Server-side session check)
* **Steps:** Clear active cookie history, open private tab window, paste dashboard route URL address directly.
* **Expected Result:** Guard architecture safely rejects route access and forces client redirect toward Login entry point.

### TC-11 — Log Out
* **Traceability Reference:** Maps to `S1-DEV-03` (Session clearing)
* **Expected Result:** Active user token is securely destroyed on server-side engine, instantly disabling old URL access routes.

### TC-12 — Role Constraint & Sidebar Verification
* **Traceability Reference:** Maps to `S1-DEV-05`, `S1-DEV-06`, & `S1-DEV-07` (Role boundary configurations)
* **Test Conditions (System Role Constraints):**
  * **Standard User Account:** Cannot view User Management paths or administrative dashboards.
  * **Admin Account:** Can manage basic user rosters, but cannot view, edit, or modify Superadmin account records.
  * **Superadmin Account:** Full visibility. Can elevate normal permissions and access granular Rights Dialog matrices.
* **Expected Result:** Layout rendering filters out structural components dynamically at both UI module and database API levels matching exact role tokens.
</details>

---

## 3. Metadata & Environment Details
*   **Task ID Reference:** S1-TST-01
*   **Assigned Quality Analyst:** Julienne Baltazar
*   **Target Application URL:** *To be recorded upon deployment pipeline build completion*
*   **Testing Hardware & Engine Profile:** *To be recorded (e.g., Chrome v124 on Windows 11)*
*   **Testing Execution Baseline Result:** ⏳ **Pending Execution**
