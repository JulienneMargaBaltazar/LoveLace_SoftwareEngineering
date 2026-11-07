# Sprint 1 QA Test Suite & Deliverables

## 1. S1-TST-03: User Management Suite

### TC-TST03-01: Administrative Operations - Add New Standard User
*   **Description:** Verify that an administrative user can successfully create a new standard user account.
*   **Preconditions:**
    1. Tester is logged into the ERP system with an account assigned the `Superadmin` or authorized `Admin` role.
    2. Tester is currently viewing the main dashboard interface.
*   **Steps:**
    1. Click on the **User Management** tab located on the primary left-hand navigation sidebar.
    2. Click on the **User Directory** sub-menu item.
    3. Click the **+ Add User** button at the top right corner of the user data table grid.
    4. Type a unique, unregistered email address (`new_hire_hope@example.com`) into the **Email Address** input field.
    5. Type a valid first name and last name into the respective text input fields.
    6. Click the **Role Assignment** dropdown menu and select the **User** option.
    7. Click the blue **Save Account** button at the bottom of the form modal.
*   **Test Data:** `Role: 'User'`, `Email: 'new_hire_hope@example.com'`
*   **Expected Result:**
    *   The modal form closes immediately.
    *   A green success toast notification appears stating: *"Account created successfully."*
    *   A new row displays within the User Directory table matching the parameters.
    *   An automated onboarding verification email is dispatched to the target mailbox in the background.

### TC-TST03-02: Administrative Operations - Block Active User Session
*   **Description:** Verify that an administrative user can instantly block an active account and invalidate its sessions.
*   **Preconditions:**
    1. A target user account (`active_staff@example.com`) exists in the system with its status currently set to `Active`.
    2. Tester is logged in as an `Admin` and navigating the **User Directory** view.
*   **Steps:**
    1. Click the **Search Users** input field above the data grid layout.
    2. Type `active_staff@example.com` into the search field and press the `Enter` key.
    3. Click the three-dot **Actions** ellipsis button on the right-hand edge of the filtered user row.
    4. Select the **Block Account** option from the context menu dropdown.
    5. Type a brief administrative justification into the **Reason for Block** text box within the confirmation dialogue pop-up.
    6. Click the red **Confirm Deactivation** button.
*   **Test Data:** `Target User: 'active_staff@example.com'`
*   **Expected Result:**
    *   The confirmation pop-up modal disappears.
    *   The status label badge in the user row changes instantly from green `Active` to red `Blocked`.
    *   All current active session tokens for the user are completely revoked server-side.
    *   If the target user attempts any network request or page transition, they are booted back to the login page immediately.

### TC-TST03-03: Superadmin Isolation Guardrail Constraint Check
*   **Description:** Enforce strict structural isolation by ensuring standard Admins cannot view or modify Superadmin profiles.
*   **Preconditions:**
    1. Tester is logged in with a standard `Admin` role account (e.g., `Janelle Sarcilla`).
    2. A `Superadmin` account exists in the database environment (`super_root@example.com`).
    3. Tester is on the **User Directory** page view.
*   **Steps:**
    1. Click the **Search Users** input text box.
    2. Type the exact email address of the Superadmin account (`super_root@example.com`) and press `Enter`.
    3. Open a separate browser tab, launch the browser's Developer Tools Console, and attempt to dispatch a direct manual `PATCH` network request to mutate the Superadmin record: `/api/v1/users/superadmin-id/update`.
*   **Test Data:** `Target Superadmin: 'super_root@example.com'`
*   **Expected Result:**
    *   The user directory data table returns zero rows or an explicit message reading *"No records found"*, confirming the account is completely masked from standard Admins.
    *   The manual API network request yields a strict HTTP status code `403 Forbidden` response.
    *   The JSON response body contains an explicit error string: *"Unauthorized access."*

---

## 2. S1-TST-04: Permission Matrix Validation

### TC-TST04-01: UI Element Visibility (Menus/Buttons Enforcements)
*   **Description:** Verify that low-privilege standard user accounts cannot see or access privileged administrative controls in the DOM/UI.
*   **Preconditions:**
    1. Tester is logged into the application using valid credentials belonging to a standard `User` role profile.
    2. User has been successfully redirected to the application homepage view.
*   **Steps:**
    1. Visually scan the primary left-hand application navigation sidebar layout.
    2. Verify the absence of the **User Management**, **Rights Dialog**, and **System Settings** navigation labels.
    3. Right-click on the sidebar menu panel layout, select **Inspect Element**, and look through the HTML tree structure.
    4. Search for DOM element IDs containing strings like `admin-nav`, `btn-delete`, or `rights-matrix`.
*   **Test Data:** Standard User Login Credentials (`role: 'User'`)
*   **Expected Result:**
    *   The **User Management**, **Rights Dialog**, and **System Settings** links are invisible on the screen layout.
    *   The DOM tree confirms that these layout nodes are completely omitted from the HTML structure, rather than just hidden with CSS styles (`display: none`).

### TC-TST04-02: Server Endpoint Restrictive Route Bypassing Attempt
*   **Description:** Verify that the application backend actively blocks standard user accounts from accessing administrative routes via direct URL path entry.
*   **Preconditions:**
    1. Tester is logged into the application using a standard `User` role account profile.
*   **Steps:**
    1. Click the browser's top address entry URL bar field.
    2. Type the exact administrative route URL path into the browser address bar: `https://hope-inc.local`
    3. Press the `Enter` key to initiate page load navigation.
*   **Test Data:** `Target Restricted URL: '/admin/management/permissions-matrix'`
*   **Expected Result:**
    *   The core client-side router prevents the page layout from rendering.
    *   The application forces an immediate redirect to a public login page or an explicit `/unauthorized` landing path page.
    *   A clear warning message appears reading: *"Access Denied: You do not possess the required privileges to view this asset resource."*

---

## 3. S1-TST-05: Core Smoke Automation

### TC-TST05-01: Core Automation E2E - Main System Happy Path Navigation
*   **Description:** Verify that a standard user can execute the standard login sequence and transition cleanly to the primary application hub without errors.
*   **Preconditions:**
    1. The latest Sprint 1 software build artifact has been deployed to the test target environment server.
    2. The relational database service instance is fully initialized and operational.
*   **Steps:**
    1. Load the root web application URL path endpoint.
    2. Type `smoke_test_runner@example.com` into the **Email Address** form text field element.
    3. Type `ValidPassword123!` into the secure password masking text field input form element.
    4. Click the primary **Sign In** action button.
    5. Wait for the page redirection loop to complete.
    6. Click on the **Home Dashboard** navigation icon element.
*   **Test Data:** `Username: 'smoke_test_runner@example.com'`, `Password: 'ValidPassword123!'`
*   **Expected Result:**
    *   The authentication process returns a successful status response payload instantaneously.
    *   The user interface switches over cleanly to the primary interactive dashboard viewport array grid layouts.
    *   The browser Developer Tools network console log pane stays completely free of any HTTP `500 Internal Server Error` statuses.

---

## 4. S1-TST-06: Defect Lifecycle Management

### TC-TST06-01: Regression Testing on QA Resolved Sprint Engineering Fixes
*   **Description:** Verify that code changes deployed by engineering successfully resolve a previously reported system defect.
*   **Preconditions:**
    1. A bug report ticket exists in the tracker system detailing an application crash when submitting empty text forms.
    2. The engineering assignment owner has marked the tracking ticket status as `Resolved`.
    3. The updated fix build has been deployed to the target testing environment.
*   **Steps:**
    1. Open the specific component panel page viewport area where the error occurred.
    2. Clear out any pre-populated test data strings present inside the user entry form text fields.
    3. Leave every single field blank intentionally.
    4. Click the **Submit Form Action** processing element trigger button.
*   **Test Data:** Empty string parameter payloads matching the initial failure trace reports logs.
*   **Expected Result:**
    *   The application handles the structural execution query smoothly without locking up or crashing.
    *   Native red inline validation texts render below the text boxes reading: *"This input field is mandatory."*

---

## 5. Test Run Execution Log
*Use this section during execution to record your actual results directly inside Git.*

| Test Case ID | Module Scope | Target Environment | Executed By | Date (YYYY-MM-DD) | Result Status (Pass/Fail) | Notes / Observations |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-TST03-01** | User Management | Staging-v1.0.0 | Julienne Baltazar | | | |
| **TC-TST03-02** | User Management | Staging-v1.0.0 | Julienne Baltazar | | | |
| **TC-TST03-03** | User Management | Staging-v1.0.0 | Julienne Baltazar | | | |
  
