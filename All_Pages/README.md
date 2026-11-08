# LoveLace Inc. ERP - Sprint 1: Design QA & Usability Audit
---

## 🚨 Actionable Fix List (Prioritized by Severity)

### 🔴 High Severity (Blocking / Data Integrity)
- **DUPLICATE DATA:** All tables (Products, Customers, Sales, Employees, Job History) display identical dummy data in every row (e.g., `E-001 Maria Santos`, `$1,240.00`, `T-001`). This masks pagination, sorting, and layout rendering issues.
- **MISSING UI ELEMENT:** On the **Top Customers** report, the "Save as PDF" button is completely missing next to the "Print" button (which exists on all other report tabs).
- **BROKEN BUTTON:** On the **HR > Departments** tab (Admin view), the "Restore" button for the inactive row is rendering as a solid dark blue rectangle with no visible text.
- **STYLING BUG:** The user role selector button in the top right corner constantly changes styling (User, Superadmin, Admin) and sometimes overflows its container (e.g., "Superadmin" box is misaligned).
- **TRUNCATION:** In the **All Employees** report and the HR inactive list, the inactive employee ID is truncated to `E-00`. It should match the active list ID format (`E-001`).

### 🟡 Medium Severity (UX Friction & Inconsistencies)
- **MISSING PAGINATION:** Several long lists (*All Employees* Report, *Employee Job History* Report, *Top Customers* Report) are missing the pagination controls visible on the main management pages.
- **INCONSISTENT FILTERS:** The "Top Customers" and "Top Products" reports have date filters and "Top N" filters, but other reports (like "Product Master List" or "Top Sales") lack these filtering capabilities.
- **MODAL FOOTERS:** In the "Sale Details" modal, the "Add Line" button is at the top, but there is no "Save" or "Close" button at the bottom footer, unlike the "Rights" modal which has "Cancel" and "Save Rights".
- **NON-FUNCTIONAL SEARCH:** The "Search..." bar in the left navigation sidebar is present across all screens but appears non-functional (does not trigger an action or highlight).
- **STAMP FORMATTING:** The Stamp column in Superadmin/Admin views uses "CREATED system 2026-10-01 9:00AM". The format is inconsistent (mixed case, missing space before AM).

### 🟢 Low Severity (Visual Polish & Alignment)
- **TAB COLORS:** In the HR module, the "Active" tab is black/underline, but in other tabs (like Sales Management), the underline color is blue.
- **MISSING ACTIONS:** The Superadmin Product Management view lacks the "Details" button found in other admin views, preventing drill-down to price history without clicking the specific "Prices" button.
- **BUTTON ALIGNMENT:** The "Print" and "Save as PDF" buttons are not consistently aligned vertically with the filter rows across different report screens.
- **SUBTITLE ALIGNMENT:** The subtitle text (e.g., "Hope, Inc. ERP - Employee job history...") is inconsistently spaced relative to the header title.
- **EMPTY STATES:** No design has been provided for empty tables (what does the list look like if there are 0 customers?).

---

## 🐛 Ticket Template for Developers
When creating issues in GitHub based on this audit, please use the following template:

```text
**Title:** [Severity] - [Module/Page] - [Brief Description]
**Screenshots:** [Attach relevant image]
**Reproduction Steps:**
1. Navigate to [Page]
2. Click/View [Element]
3. Observe [Issue]

**Expected Behavior:** [Describe what should happen]
**Actual Behavior:** [Describe what is currently happening]
