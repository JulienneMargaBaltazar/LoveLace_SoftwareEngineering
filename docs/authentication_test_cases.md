# Sprint 1 Test Plan and Acceptance Criteria: Authentication & Tokens

**Tester:** Julienne Baltazar

## 1. Test Execution Summary
*Update the status and actual results here during active testing based on the Status Reference Guide below.*

| Test ID | Test Scenario | Traced Engineering Task | Status | Actual Result |
| :--- | :--- | :--- | :--- | :--- |
| TC-01 | Register with valid, complex credentials | S1-DEV-02 | 🟢 Passed | Account registered cleanly with mock profile; user successfully redirected to dashboard. |
| TC-02 | Register with a password below length boundaries | S1-DEV-02 | 🟢 Passed | Form rejected submission and displayed validation error: "Password must be at least 8 characters long." |
| TC-03 | Register with credentials missing complexity requirements | S1-DEV-02 | 🔴 Failed | Server accepted password lagging required special character constraints. (Logged as Issue #81) |
| TC-04 | Log in with valid credentials and establish secure session | S1-DEV-02 | 🟢 Passed | Secure session initialized cleanly on server-side dashboard route. |
| Test Case 05 | Explicit log out session invalidation verification | S1-DEV-02 | 🟢 Passed | Token invalidated instantly on server; browser back button forced a redirect back to login. |
| TC-06 | Attempt password reset using an expired security token | S1-DEV-02 | 🟢 Passed | Application accurately caught expired timestamp token and safely rejected modifications. |
| TC-07 | Attempt password reset using a reused security token | S1-DEV-02 | 🟢 Passed | Server-side security guardrail caught identical token resubmission and dropped request. |

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
<summary><b>▼ Account Boundaries & Password Complexity Verification (TC-01 to TC-03)</b></summary>

### Verification Steps
1. Navigate to the local deployment registration view.
2. For **TC-01**, fill out all mandatory data fields using a mock email (`mock-user@example.com`) and a complex password payload meeting length limits.
3. For **TC-02**, inputs should contain an ultra-short password string (e.g., `Ab1!`).
4. For **TC-03**, inputs should feature a long password completely lacking special characters or structural diversity (e.g., `PlaintextPassword123`).

### Expected Outputs
* **TC-01 Expected Output:** System successfully registers the profile record on the server-side, issues a temporary validation path, and securely redirects the browser to the initial welcome dashboard.
* **TC-02 Expected Output:** The application natively catches the boundary violation, drops processing, and renders an on-screen validation alert: *"Password does not meet the structural minimum length requirements."*
* **TC-03 Expected Output:** The application drops the request and displays an on-screen validation error indicating that password complexity constraints (missing special tokens/integers) were not satisfied.

### Execution Evidence & Screenshots

| Test ID | Scenario Description | Execution Evidence Screenshot |
| :--- | :--- | :--- |
| **TC-01** | Account Registration Success Flow | <img width="822" height="720" alt="Screenshot 2026-11-08 145846" src="https://github.com/user-attachments/assets/cc4113c3-e493-4bd6-982f-442486ca4dd2" /> Test results matches expected output.|
| **TC-02** | Length Boundary Validation Rejection | !<img width="822" height="720" alt="Screenshot 2026-11-08 151050" src="https://github.com/user-attachments/assets/19a5f4c0-1df2-4d27-80f8-912a7a120cea" /> Test results matches expected output. |
| **TC-03** | Complexity Pattern Rejection | <img width="683" height="720" alt="image" src="https://github.com/user-attachments/assets/9a2a41e9-ed64-4464-8b19-1e4427e34144" /> Test results matched expectesoutput. |

</details>

<details>
<summary><b>▼ Session Handling & Server-Side Invalidation (TC-04 to TC-05)</b></summary>

### Verification Steps
1. Navigate to the login view interface.
2. For **TC-04**, input an active test account (`mock-user@example.com`) and the correct matching password. Open developer tools to confirm a secure server-side session token is mapped.
3. For **TC-05**, click the explicit 'Logout' interface action component. Once redirected, attempt to access the authenticated dashboard route directly via URL navigation or by triggering the browser's "Back" action.

### Expected Outputs
* **TC-04 Expected Output:** Authentication validation parses cleanly. System initializes a secure server-side session, passes validation, and displays user navigation panels.
* **TC-05 Expected Output:** Server-side structural data invalidation triggers instantly upon logging out. Attempting direct URL access or browser backtracking securely forces redirection back to the root login barrier.

### Execution Evidence & Screenshots

| Test ID | Scenario Description | Execution Evidence Screenshot |
| :--- | :--- | :--- |
| **TC-04** | Secure Dashboard Authentication Flow | <img width="1920" height="1032" alt="Screenshot 2026-11-08 054456" src="https://github.com/user-attachments/assets/2ff45390-deaf-4ff4-8c0b-7d2eb65e9d05" /> Test results matches expected output.|
| **TC-05** | Server Token Session Invalidation Verification | <img width="683" height="720" alt="Screenshot 2026-11-08 145648" src="https://github.com/user-attachments/assets/ac944cc6-0cf1-4026-b71d-9a79576f9722" /> Test results matches expected output.|

</details>

<details>
<summary><b>▼ Token Lifecycle Edge Cases: Expiration & Reuse (TC-06 to TC-07)</b></summary>

### Verification Steps
1. For **TC-06**, trigger a forgot password recovery mechanism for your mock email. Allow the generated security token profile to surpass its expiration timeframe lifecycle window, then execute a password update attempt.
2. For **TC-07**, capture a separate active password reset URL. Process the change cleanly once, then click the exact same URL path a second time to force token re-submission.

### Expected Outputs
* **TC-06 Expected Output:** Server-side validation drops execution due to age threshold violations. UI reports a clear error: *"Token expired. Please request a new verification path."*
* **TC-07 Expected Output:** Server-side token reuse guardrails flag the consumed security payload signature instantly. Process drops immediately and rejects additional entry updates.

### Execution Evidence & Screenshots

| Test ID | Scenario Description | Execution Evidence Screenshot |
| :--- | :--- | :--- |
| **TC-06** | Expired Security Token Rejection Alert | ![TC-06 Evidence Placeholder](https://placehold.co) |
| **TC-07** | Double Token Submission Guardrail Block | ![TC-07 Evidence Placeholder](https://placehold.co) |

</details>

---

## 4. Metadata & Environment Details
* **Task ID Reference:** S1-TST-02
* **Assigned Quality Analyst:** Julienne Baltazar
* **Target Application URL:** *To be recorded upon deployment pipeline build completion*
* **Testing Hardware & Engine Profile:** *To be recorded (e.g., Chrome v124 on Windows 11)*
* **Testing Execution Baseline Result:** 🟡 Partial Failures Logged
