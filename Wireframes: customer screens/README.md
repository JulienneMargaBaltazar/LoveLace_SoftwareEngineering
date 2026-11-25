# Customer Management Screens

This is option of customer screens designed for a "New Customer" creation workflow. This repository contains the UI states for adding a new customer profile to the system, including error handling and interaction states.

## 📸 Preview

The design includes three distinct states represented in the screenshots:

1.  **Empty State / Default View:** The initial form layout with placeholders.
2.  **Validation State:** How the form looks when a user tries to submit without filling in required fields (highlighted in red with error messages).
3.  **Dropdown Interaction:** The active state of the "Customer Status" selection menu.

## ✨ Features

*   **Modal Layout:** Clean, centered card design with a close (X) button.
*   **Form Validation:** Real-time or on-submit validation indicators (red borders and text) for required fields.
*   **Responsive Input Fields:**
    *   **Customer No.:** (Auto-generated or manual entry e.g., C-009).
    *   **Customer Name:** Text input.
    *   **Address:** Text input for physical location.
    *   **Term of Payment:** Text input or selection for payment terms.
    *   **Customer Status:** Dropdown menu with options for "Active" and "Inactive".
*   **Action Buttons:** Clear "Cancel" and primary "Add Customer" buttons.

## 🛠️ Field Specifications

| Field | Type | Validation Rule |
| :--- | :--- | :--- |
| **Customer No.** | Text Input | Required (Prefilled in example) |
| **Customer Name** | Text Input | Required |
| **Address** | Text Input | Required |
| **Term of Payment** | Text Input | Required |
| **Customer Status** | Dropdown | Required (Select Active or Inactive) |

## 🎨 UI States

### 1. Default
The clean form ready for user input. Placeholders indicate the expected format.

### 2. Validation Errors
If the user clicks "Add Customer" without filling out the mandatory fields, the following visual cues appear:
*   Input borders turn red.
*   Helper text appears below the input (e.g., *"Customer Name is required"*).

### 3. Status Dropdown
Clicking the "Customer Status" field reveals a dropdown list allowing the user to select between:
*   **Active**
*   **Inactive**

## 🚀 Usage

These screens are intended for integration into a CRM or admin dashboard. The logic should ensure that the "Add Customer" button is disabled or triggers validation warnings until all required fields (`*`) are completed.
