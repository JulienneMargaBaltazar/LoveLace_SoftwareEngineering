# Developer Handoff: LoveLace, Inc. ERP

This document outlines the design tokens, responsive layouts, interaction states, and form validation logic required to implement the LoveLace, Inc. ERP 

---

## 1. Design Tokens & Variables

To ensure consistency across the marketing site and the web application, establish these global variables (e.g., in a `variables.css` file or Tailwind config).

### 1.1 Colors

| Token Name | Hex Code | Usage Context |
| :--- | :--- | :--- |
| `--brand-primary` | `#4F46E5` | Primary buttons, active menu items, links, focus rings. |
| `--brand-primary-hover` | `#4338CA` | Hover state for primary elements. |
| `--bg-light` | `#F3F4F6` | Input backgrounds, subtle section backgrounds. |
| `--text-primary` | `#111827` | Headings, main body text. |
| `--text-secondary` | `#6B7280` | Helper text, descriptions, labels. |
| `--border-default` | `#D1D5DB` | Input borders, divider lines. |
| `--sidebar-bg` | `#1E1B4B` | Deep navy/indigo background for the app sidebar. |
| `--status-success-bg` | `#D1FAE5` | Background for "Active" badges. |
| `--status-success-text` | `#059669` | Text color for "Active" badges. |
| `--status-error` | `#DC2626` | Validation errors, destructive actions. |
| `--role-admin-bg` | `#C7D2FE` | Background for Admin role badges. |
| `--role-admin-text` | `#3730A3` | Text color for Admin role badges. |

### 1.2 Typography

*   **Font Family:** `Inter`, `Roboto`, or system-ui sans-serif.
*   **Headings (H1/H2):** `2rem` to `3rem`, Font Weight: `600` or `700`.
    *   *Note:* Auth pages use Brand Primary color for headings; App pages use Text Primary.
*   **Body Text:** `0.875rem` (14px) in-app, `1rem` (16px) on marketing site. Font Weight: `400`.
*   **Labels/Captions:** `0.75rem` (12px), Font Weight: `500`.

### 1.3 Spacing & Layout Structure

*   **Grid System:** Base 8px unit (e.g., `8px`, `16px`, `24px`, `32px`, `48px`, `64px`).
*   **Marketing Container:** Max-width `1280px`, centered, horizontal padding `px-4` (mobile) to `px-8` (desktop).
*   **App Layout:**
    *   Sidebar Width: Fixed `250px` or `280px`.
    *   Main Content Area: `calc(100vw - sidebar_width)`, padding `32px` (Desktop).
    *   Header Height: `64px` or `72px`.

### 1.4 Border Radius & Shadows

*   **Radius:** Buttons & Inputs `8px`, Cards `12px`, Modals `16px`.
*   **Shadows:**
    *   *Card/Panel:* `box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);`
    *   *Modal/Dropdown:* `box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);`

---

## 2. Responsive Layout Strategy

The design must adapt fluidly across devices.

### Desktop (> 1024px)
*   **Marketing:** Full side-by-side layouts (hero, feature splits).
*   **Auth Pages:** Split-screen layout (Image/Info panel on left, Form on right).
*   **App:** Sidebar fixed on the left, full data tables, inline action buttons.

---

## 3. Component Interaction States

All interactive elements must have clear visual feedback.

### Global States
*   **Buttons (Primary & Secondary):** Hover changes background slightly darker; Active scales down slightly (`transform: scale(0.98)`); Disabled opacity `0.5` with `cursor: not-allowed`.
*   **Inputs:** Default state has `#D1D5DB` border. On Focus, border turns Brand Primary and adds a subtle ring (`box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2)`).
*   **Table Rows:** Hover background changes to `#F9FAFB` to highlight the active row.
*   **Checkboxes:** Clicking the label or the box toggles state. Disabled checkboxes (e.g., "Delete Customer" in Rights modal) must have `opacity: 0.5` and `cursor: not-allowed`.

### App-Specific Components
*   **Data Table (User Management):**
    *   *Row Actions:* The "Rights" and "Edits" buttons open the corresponding modal views.
    *   *Pagination:* If the list exceeds the viewport, pagination controls must be added to the bottom right.
    *   *Search/Filter:* The search input and "Filter" button should filter the table data dynamically. If no results are found, show an empty state.
*   **Sidebar Navigation:**
    *   The active menu item (e.g., "User Management") has a distinct background fill and bold text.
    *   *Tooltip:* If the sidebar is collapsed on smaller screens, hovering over icons reveals text labels via a tooltip.
*   **RBAC (Role-Based Access Control):**
    *   **Superadmin:** Can see the "Superadmin" badge top right. Data table shows actions for admins but "---" for other superadmins.
    *   **Admin:** Top right badge says "Admin". Banner states superadmin accounts are hidden. Table will only render standard users or manageable accounts. Ensure the data API respects these RBAC rules.

---

## 4. Form Validation & UI Behavior States

This applies to the "Forgot Password", "Set New Password", "Create Account", "Log In", and the "Rights" modal.

### 4.1 Real-time Validation (On Input/Blur)
*   **Default State:** Clean border. Helper text (if any) is muted gray (`--text-secondary`).
*   **Error State (e.g., invalid email format, passwords don't match):**
    *   Border turns red (`--status-error`).
    *   An error message appears below the input field (`color: var(--status-error); font-size: 0.875rem;`).
    *   *A11y:* Input gets `aria-invalid="true"` and `aria-describedby="[error-message-id]"`.
*   **Success State (e.g., valid password criteria met):**
    *   The requirement checkmark changes from gray/red (`X`) to green (`✓`).

### 4.2 Specific Form Logic

#### A. Password Reset (Set New Password Page)
*   **Dynamic Checklist Behavior:**
    *   Requirements list ("At least 8 characters", "One number", "One special character").
    *   As the user types, valid criteria update visually in real-time (e.g., the `X` turns into a green `✓`).
*   **Password Match:** The "Confirm password" field must validate against the "New password" field on blur or form submit. If they do not match, trigger the Error State on the confirm field with the message *"Passwords do not match."*
*   **Visibility Toggle:** The "Eye" icon toggles the input type between `password` and `text`. Clicking it should not submit the form.

#### B. Login & Create Account
*   **Email Validation:** Must match standard regex (e.g., `user@domain.com`).
*   **Terms Checkbox (Create Account):** The "Create account" button is disabled until this box is checked. Clicking the link "terms and conditions" should open a modal or new tab.
*   **Loading State:** Upon valid submission, the button text should change to a loading spinner (or text like "Creating..."), and the button is disabled to prevent double submission.

#### C. Rights Modal (App View)
*   **Parent/Child Checkbox Logic:**
    *   If a user selects "All" for a specific module (e.g., Customer Management), all individual checkboxes under it become checked.
    *   If a user selects "None", all become unchecked.
    *   If a user manually checks all individual boxes, the parent "All" box should auto-check (or show an indeterminate state).
*   **Disabled States:** In the mockup, "Delete Customer" is disabled. This must be reflected in the DOM with the `disabled` attribute on the input.
