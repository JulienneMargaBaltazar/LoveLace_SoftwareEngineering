# S1-UIX-05: Usability Evaluation & Fix List

**Task ID:** S1-UIX-05  
**Status:** ✅ Completed  
**Assignee:** UI/UX Designer  
**Sprint:** Sprint 1 Sign-off  

## 📋 Context & Goal
Conduct a thorough usability evaluation of the developed application screens against design specifications and compile an actionable fix list to address bugs, friction points, or visual regressions before Sprint 1 sign-off.

## 🎯 Acceptance Criteria
- [x] **Req 1:** Audit all newly built screens for design-to-code alignment and UX friction points.
- [x] **Req 2:** Produce an actionable fix list detailing specific visual or behavioral regressions.
- [x] **Req 3:** Prioritize issues by severity to guide developer remediation before the sprint ends.

---

## 🚨 Actionable Fix List

| ID | Severity | Screen / Area | Issue Description | Reproduction Steps | Expected Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | 🔴 **Critical** | All Management Tables | Data integrity error: Pagination footer says "Showing 1–8 of 1,248" and "Page 1 of 10", but the table rows repeat the exact same data (e.g., `C-001`, `P-001`) instead of unique records. | 1. Navigate to **Customers**.<br>2. Scroll to bottom of table. | Unique data per row; pagination accurately reflects total count. |
| **02** | 🔴 **Critical** | Sales > Sale Details Modal | Missing UI elements. The `+ Add Line` button is missing from the top-left, and the `Active / Inactive / All` toggle tabs are missing from the footer. | 1. Navigate to **Sales**.<br>2. Click **Details** on any row. | Modal must include the `+ Add Line` button and status filter pills. |
| **03** | 🟠 **High** | Reports > Top Sales/Products/Customers | Inconsistent input field styling. The `From` and `To` date pickers have different border thickness, background colors, and spacing compared to the adjacent `Top N` input field. | 1. Navigate to **Reports** > **Top Sales**. | All input fields should align to the same height, border-radius, and background color. |
| **04** | 🟠 **High** | HR > Job History Modal | The `+ Add History` button is missing below the employee name, preventing users from adding new job records. | 1. Navigate to **HR** > **Employees**.<br>2. Click **History** on E-001. | `+ Add History` button should be present and functional. |
| **05** | 🟠 **High** | HR > Departments / Jobs | Sub-navigation tabs (Employees, Jobs, Departments) have insufficient contrast when inactive against the background, especially in Admin view. | 1. Navigate to **HR** > **Departments**. | Ensure active/inactive tab states have sufficient contrast per WCAG AA. |
| **06** | 🟡 **Medium** | User Management (Superadmin) | The "Rights" button is missing next to the "Block" and "Edits" buttons in the Actions column for Alex Rivera. | 1. Log in as Superadmin.<br>2. Go to **User Management**. | Actions column should consistently show `Block | Rights | Edits` across all rows. |
| **07** | 🟡 **Medium** | Customer & Product Tables | Truncated text lacks affordance. The "Address" column truncates with `...` without a hover tooltip. The "Stamp" column text wraps awkwardly. | 1. Navigate to **Customer Management**. | Add a `title` attribute/tooltip on truncated text. Prevent wrapping in Stamp column. |
| **08** | 🟡 **Medium** | Customer Management | Placeholder text left in UI. The "PAY TERMS" column displays the literal string "Cell text" for customers C-002 through C-008. | 1. Navigate to **Customer Management**. | Replace "Cell text" with valid billing terms (e.g., "Net 30"). |
| **09** | 🔵 **Low** | Dashboard (Admin/Superadmin) | Inconsistent iconography. The "Manage Products" quick action uses a document icon, while the "Products" side-nav uses a shopping bag icon. | 1. Navigate to **Dashboard**. | Align icons with the standard icon library (use shopping bag for both). |
| **10** | 🔵 **Low** | HR vs. Sales Management | Tab styling inconsistency. HR tabs use a pill-shaped background, while Sales Management tabs use a text underline. | 1. Compare tabs in **Sales** vs. **HR**. | Standardize the tab component styling across the entire application. |

---

## 📝 Developer Notes
> Please prioritize the **Critical** and **High** severity items before Sprint 1 sign-off. The data-integrity issues (repeated rows) are the most significant blockers for QA testing. Visual evidence (screenshots) for all issues are attached in the issue tracker.
