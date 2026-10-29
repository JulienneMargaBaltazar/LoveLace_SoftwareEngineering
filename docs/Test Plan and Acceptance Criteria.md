## Sprint 1 Test Plan and Acceptance Criteria
**Tester:** Julienne Baltazar  

---

## Test Execution Summary
*Update the status and actual results here as you execute.*

| Test ID | Test Scenario | Status | Actual Result |
| :--- | :--- | :--- | :--- |
| **TC-01** | Sign Up with valid details | ⚪ Not Run | N/A |
| **TC-02** | Sign Up with required fields empty | ⚪ Not Run | N/A |
| **TC-03** | Sign Up with invalid email format | ⚪ Not Run | N/A |
| **TC-04** | Sign Up with an existing email | ⚪ Not Run | N/A |
| **TC-05** | Sign Up with mismatched passwords | ⚪ Not Run | N/A |
| **TC-06** | Log In with valid credentials | ⚪ Not Run | N/A |
| **TC-07** | Log In with an incorrect password | ⚪ Not Run | N/A |
| **TC-08** | Log In with required fields empty | ⚪ Not Run | N/A |
| **TC-09** | Open dashboard after login | ⚪ Not Run | N/A |
| **TC-10** | Open dashboard without login | ⚪ Not Run | N/A |
| **TC-11** | Log out | ⚪ Not Run | N/A |
| **TC-12** | Check dashboard navigation | ⚪ Not Run | N/A |

---

## Test Cases (Click to Expand)

<details>
<summary><b> Sign Up Test Cases (TC-01 to TC-05)</b></summary>

### TC-01 — Sign Up with Valid Details
* **Test Data:** Valid name, unique email address, valid password.
* **Steps:**
  1. Open the Sign Up page.
  2. Enter valid required details.
  3. Submit the form.
* **Expected Result:** The system accepts the details and creates the account.

### TC-02 — Sign Up with Required Fields Empty
* **Test Data:** Leave one or more required fields empty.
* **Steps:**
  1. Open the Sign Up page.
  2. Leave required fields empty.
  3. Submit the form.
* **Expected Result:** The system prevents submission and identifies required fields.

### TC-03 — Sign Up with Invalid Email Format
* **Test Data:** `alexexample.com`
* **Steps:**
  1. Open the Sign Up page.
  2. Enter an invalid email structure.
  3. Submit the form.
* **Expected Result:** System rejects the submission and highlights validation error.

### TC-04 — Sign Up with an Existing Email
* **Test Data:** Email address already registered.
* **Steps:**
  1. Open the Sign Up page.
  2. Enter duplicate email.
  3. Submit the form.
* **Expected Result:** System blocks creation and states email is taken.

### TC-05 — Sign Up with Mismatched Passwords
* **Precondition:** Form has Password & Confirm Password.
* **Test Data:** `Password123` vs `Password456`.
* **Steps:**
  1. Open the Sign Up page.
  2. Enter differing password fields.
  3. Submit the form.
* **Expected Result:** Form blocks submission and requests matching inputs.
</details>

<details>
<summary><b>🔑 Log In Test Cases (TC-06 to TC-08)</b></summary>

### TC-06 — Log In with Valid Credentials
* **Precondition:** Valid test account exists.
* **Steps:**
  1. Open Log In page.
  2. Enter correct email and password.
  3. Submit.
* **Expected Result:** User is authenticated and redirected to the dashboard.

### TC-07 — Log In with an Incorrect Password
* **Steps:**
  1. Open Log In page.
  2. Enter valid email but incorrect password.
  3. Submit.
* **Expected Result:** Login is rejected with an explicit error toast message.

### TC-08 — Log In with Required Fields Empty
* **Steps:**
  1. Open Log In page.
  2. Leave fields blank.
  3. Submit.
* **Expected Result:** System prompts user to fill fields and denies request.
</details>

<details>
<summary><b> Dashboard & Session Test Cases (TC-09 to TC-12)</b></summary>

### TC-09 — Open Dashboard After Successful Login
* **Steps:**
  1. Log in via TC-06.
  2. Observe main interface layout and navigation options.
* **Expected Result:** Dashboard loads without error screens; menu links show up.

### TC-10 — Open Dashboard Without Logging In
* **Precondition:** Clear cache / Incognito window.
* **Steps:**
  1. Paste direct dashboard route URL into browser.
* **Expected Result:** Access denied; system forces redirect back to Log In view.

### TC-11 — Log Out
* **Steps:**
  1. Log into your active session.
  2. Click the Log Out button.
  3. Press back button or try accessing dashboard link.
* **Expected Result:** Session is cleared; browser blocks re-entry to the dashboard.

### TC-12 — Check Dashboard Navigation
* **Steps:**
  1. Open dashboard.
  2. Systematically click every sidebar menu button.
* **Expected Result:** Pages resolve perfectly with no broken router routes or 404 sheets.
</details>

---

## Metadata & Environment Details
* **App Context:** Sprint 1 Scope (Sign-up, Authentication, Core Dashboard Navigation)
* **Application URL/Build:** *To be recorded*
* **Browser/Device:** *To be recorded*
* **Overall Execution Result:**  **Pending Execution**
