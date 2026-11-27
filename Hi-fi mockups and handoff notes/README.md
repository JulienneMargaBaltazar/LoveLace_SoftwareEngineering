# UI/UX Developer Handoff: Customer, Product, & Price History Screens
## Handoff notes
---

## 1. Overview
This document provides high-fidelity mockup specifications and developer handoff notes for the Customer, Product, and Price History screens. It includes global design token applications, specific field annotations, validation states, and permission-based UI behaviors.

---

## 2. Global Design System & Tokens
*(Ensure these map to the existing Sprint 1 variables in your codebase)*

*   **Typography:** 
    *   Headers: `[Font-Family]` Bold/Semi-Bold
    *   Labels: `[Font-Family]` Medium (14px)
    *   Body/Input Text: `[Font-Family]` Regular (14px)
    *   Helper/Error Text: `[Font-Family]` Regular (12px)
*   **Color Tokens:**
    *   Primary Action/Header: `#2D316E` (Dark Blue)
    *   Secondary Action/Outline: `#3A5BCC` (Bright Blue)
    *   Background (Modals): `#F2EEF9` (Light Purple)
    *   Input Border (Default): `#C0C0D0`
    *   Input Border (Error): `#D32F2F` (Red)
    *   Error Text: `#D32F2F` (Red)
*   **Button Hierarchy:**
    *   **Primary (Save/Add):** Solid dark blue background, white text. Hover state: 10% darken.
    *   **Secondary (Cancel):** Transparent background, bright blue border and text. Hover state: Light blue background tint.

---

## 3. Screen Specifications: Customer Modal

**Note:** Two layout options (A and B) have been provided for the Customer screen. Development should implement **Option A** (standard order: Customer No. -> Name -> Address) as the primary, but structure the form components to allow easy reordering if **Option B** (Name -> Customer No.) is selected as the final variant.

### 3.1 Field Annotations & Validation
*All fields marked with `*` are mandatory.*

| Field Label | Input Type | Helper Text / Placeholder | Validation Rule | Error Message |
| :--- | :--- | :--- | :--- | :--- |
| **Customer No.** | Text Input | "Enter Customer Number" | Alphanumeric, Unique | "Customer Number is required" |
| **Customer Name** | Text Input | "Enter Customer Name" | Min 2 chars | "Customer Name is required" |
| **Address** | Text Input | "Enter Customer Address" | Min 5 chars | "Please enter the customer's address" |
| **Term of Payment** | Dropdown | "Select an option" | Must select | "Please select a mode of payment" |
| **Customer Status** | Dropdown | "Select a status" | Must select | "Please provide the status of the customer" |

*   **Dropdown Options:**
    *   *Term of Payment:* Net 10, Net 15, Net 25, Net 30
    *   *Customer Status:* Active, Inactive

### 3.2 Interaction States
*   **Error State (Red):** Triggered on form submission (e.g., clicking "Add Customer") if fields are empty or invalid. Input borders turn red (`#D32F2F`), and error text appears below the field.
*   **Dropdown Open State:** Highlight selected/hovered item with a light blue background (`#E8F0FE`).

---

## 4. Screen Specifications: Price History Modal

### 4.1 Field Annotations & Validation
**View/List State:**
*   **Table Headers:** Status, Price, Created By, Effective Date, Actions (Edit/Delete).
*   **Status Badges (WCAG AA Compliant):**
    *   `Pending` (Grey/Purple bg `#7B82B8`, White text)
    *   `Active` (Green bg `#2E7D32`, White text)
    *   `Disabled` (Dark Grey bg `#4A4A4A`, White text)
*   **Active Row Styling:** The "Current Price" row has a subtle light green background (`#E8F5E9`) to distinguish it visually.

**Add/Edit Price State:**
| Field Label | Input Type | Format Rule | Error Message |
| :--- | :--- | :--- | :--- |
| **Effective Date** | Date Picker | `dd/mm/yyyy` | "Date cannot be empty" |
| **Price** | Number Input | Currency format: `$1,240.00` (USD). Right-aligned. | "Price cannot be empty" |

---

## 5. Technical Guardrails & Formatting Rules

### 5.1 WCAG AA Color Contrast
*   **Status Pills:** All status badges (Active, Pending, Disabled) must be tested to ensure text-to-background contrast is at least 4.5:1.
*   **Archived/Disabled Rows:** If a row in the Price History is "Disabled," do not just reduce opacity, as this may fail contrast requirements. Use a distinct grey text color (`#757575`) against a white background while keeping the status badge high-contrast.

### 5.2 Formatting Rules
*   **Currency:** Always format as `$#,##0.00`. Input fields should allow numeric input and automatically format on blur.
*   **Date:** Display as `DD-MM-YYYY` (e.g., 09-11-2001) in the table. The Date Picker input should display `dd/mm/yyyy` placeholder.

---

## 6. Permission-Restricted States (CRUD Rights)
*Implementation must check user permissions and adjust the UI accordingly.*

*   **Add Customer / Add Price / Save Button:**
    *   *Right Enabled:* Fully visible and clickable.
    *   *Right Disabled:* Disabled state (reduced opacity to 50%, cursor: `not-allowed`). Tooltip on hover: "You do not have permission to add."
    *   *Right Hidden:* Button is completely removed from the DOM and layout.
*   **Edit/Delete Icons (Price History Table):**
    *   *Right Enabled:* Visible.
    *   *Right Disabled/Hidden:* Remove icons entirely from the table rows. Keep the table column width consistent if only the icons are removed.
*   **Dropdowns (Term of Payment/Status):**
    *   If a user cannot edit a customer's status, the dropdown should be rendered as a read-only text field or disabled state (greyed out) with the current value visible.

---
*End of Handoff Document*
