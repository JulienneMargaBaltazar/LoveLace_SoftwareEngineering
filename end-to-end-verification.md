# Sprint 1 Test Plan and Acceptance Criteria: End-to-End Blocked Account Flow

**Tester:** Julienne Baltazar

## 1. Test Execution Summary
*Update the status and actual results here during active testing based on the Status Reference Guide below.*

| Test ID | Test Scenario | Traced Engineering Task | Status | Actual Result |
| :--- | :--- | :--- | :--- | :--- |
| TC-01 | Verify administrative interface displays correct state transitions when toggling a user account between Active and Blocked | S1-TST-04 | 🟢 Passed | User status transitions cleanly between Active and Blocked, with appropriate action buttons appearing instantly. |
| TC-02 | Assert that blocked users are rejected immediately at authentication and shown a clear error notification message | S1-TST-04 | 🟢 Passed | Authentication request accurately intercepts the blocked state and throws an "Access denied" browser alert window. |

---

## 2. Test Execution Status Reference Guide
*Consult this lifecycle table to update the `Status` column as features move through verification panels.*

| Status Choice | Meaning / Criteria | Workflow Action Required |
| :--- | :--- | :--- |
| **⚪ Not Run** | Initial default state. Feature is in development or waiting for verification. | Leave as-is until build deployment is finalized. |
| **🔄 In Progress** | The QA analyst is actively running through verification steps. | Optional indicator for tracking long-running validation sequences. |
| **🟢 Passed** | Feature behaves exactly as described and matches all criteria. | Update `Actual Result` with client observations and embed screenshot evidence. |
| **🔴 Failed** | Feature errors out, misses boundaries, or breaks guardrails. | Stop execution, capture evidence screenshot, log a GitHub Issue, and link its ID. |
| **🔄 Retest** | Code changes/fixes have been merged to resolve a previous failure. | Clear prior failure details, rerun verification steps, and check against expected outcomes. |

---

## 3. Test Cases & Verification Pathways

<details>
<summary><b>▼ Profile Administrative Block State Transitions (TC-01)</b></summary>

### Verification Steps
1. Log into the system administrative workspace dashboard.
2. Select a target account record (`testcase@hope.com`) with role configuration set to `Admin`.
3. Locate the profile row action triggers and toggle the user account context between `Block` and `Unblock`.
4. Observe UI layout changes, state badge indicators, and row action modifications.

### Expected Outputs
* **TC-01 Expected Output:** System accurately registers updates across administrative views. Active accounts display a green `Active` badge alongside a red `Block` option button. Blocked accounts display a red `Blocked` badge alongside a green `Unblock` option button.

### Execution Evidence & Screenshots

| Test ID | Scenario Description | Execution Evidence Screenshot |
| :--- | :--- | :--- |
| **TC-01** | User Administrative Blocking Context Verification | Active user account record configuration: <br/> `testcase@hope.com` Admin role shows Active status with option to block. <br/> Blocked account updates status badge instantly: <br/> `testcase@hope.com` status moves cleanly into Blocked state context. <br/> Test results match expected output. |

</details>

<details>
<summary><b>▼ Blocked Account Authentication Interception Safety Safeguard (TC-02)</b></summary>

### Verification Steps
1. Navigate to the application gateway deployment workspace interface.
2. Enter the email credentials corresponding to a blocked workspace instance (`testcase@hope.com`) along with valid password inputs.
3. Click the `Log In` call-to-action button element container.
4. Verify window-level alert messaging and tracking limits.

### Expected Outputs
* **TC-02 Expected Output:** Application rejects access protocols, interrupts pipeline workflows, and forces an browser alert overlay message reporting: *"k6s6cstk-3000.asse.devtunnels.ms says Access denied. This account has been blocked."*

### Execution Evidence & Screenshots

| Test ID | Scenario Description | Execution Evidence Screenshot |
| :--- | :--- | :--- |
| **TC-02** | Security Boundary Interception Verification Flow | Account rejection flow verification profile: <br/> System blocks entry protocols instantly at the authentication layer boundaries. <br/> Test results match expected output. |

</details>

---

## 4. Metadata & Environment Details
* **Task ID Reference:** S1-TST-04
* **Assigned Quality Analyst:** Julienne Baltazar
* **Target Application URL:** `https://devtunnels.ms`
* **Testing Hardware & Engine Profile:** Chrome v131 on Windows 11 Home
* **Testing Execution Baseline Result:** 🟢 Passed All Operational Checkpoints
