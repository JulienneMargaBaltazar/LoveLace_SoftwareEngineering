# Customer Management Screens - Option Two

This is **Option Two** of the customer screens designed for the "New Customer" creation workflow. This variation introduces dropdown selectors for specific fields and demonstrates complex form interactions, including simultaneous dropdown menus and validation states.

## 📸 Preview

This option includes three distinct UI states based on the provided screenshots:

1.  **Default / Empty State:** The initial form layout. Note that "Term of Payment" and "Customer Status" are now dropdown menus rather than text inputs.
2.  **Active Dropdowns State:** Demonstrates the interactive dropdown menus for "Term of Payment" (Net 10, Net 15, Net 25, Net 30) and "Customer Status" (Active, Inactive), shown with one field filled and others open.
3.  **Validation Error State:** The form displaying error messages and red highlight borders when a user attempts to submit with missing required fields.

## ✨ Features Specific to Option Two

*   **Dropdown Selection:** Unlike the previous option, "Term of Payment" utilizes a dropdown menu with predefined net terms.
*   **Partial Fill Handling:** Demonstrates how the form handles a mix of filled fields (e.g., Customer No. and Address) alongside empty required fields.
*   **Enhanced Validation UI:** Clear visual feedback with red borders and specific error helper text below the invalid inputs.

## 🛠️ Field Specifications

| Field | Type | Validation Rule |
| :--- | :--- | :--- |
| **Customer No.** | Text Input | Required (Prefilled e.g., C-009) |
| **Customer Name** | Text Input | Required |
| **Enter Customer Address** | Text Input | Required |
| **Term of Payment** | Dropdown | Required (Options: Net 10, Net 15, Net 25, Net 30) |
| **Customer Status** | Dropdown | Required (Options: Active, Inactive) |

## 🎨 UI States Explained

### 1. Default View
The initial form state with placeholders for all inputs and default prompts ("Select an option") for the dropdowns.

### 2. Active Dropdowns
Clicking the "Term of Payment" or "Customer Status" fields reveals a dropdown list. The UI supports highlighting options (e.g., "Net 15" and "Inactive" shown in blue) to indicate hover or selection states.

### 3. Validation Errors
If the "Add Customer" button is clicked without completing the mandatory fields, the following visual cues appear:
*   Input borders turn red.
*   Helper text appears below the input (e.g., *"Customer Name is required"*, *"Please Select a mode of payment"*).

## 🚀 Usage

This "Option Two" layout is ideal for systems where payment terms are standardized. The frontend logic should ensure that the dropdown values are correctly mapped to backend codes and that the form prevents submission until all required fields (`*`) are valid.
