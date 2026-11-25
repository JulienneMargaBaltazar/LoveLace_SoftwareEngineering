
## Features

*   **Header:** Contains the title "New Customer", a subtitle "Create a new customer profile", and a close (X) icon.
*   **Form Fields:**
    *   **Customer No.:** Text input (Required).
    *   **Customer Name:** Text input (Required).
    *   **Address:** Text input (Required).
    *   **Term of Payment:** Dropdown selection (Required).
    *   **Customer Status:** Dropdown selection (Required).
*   **Actions:**
    *   **Cancel:** Secondary button to dismiss the modal.
    *   **Add Customer:** Primary button to submit the form.

## Component States (Visual Reference)

1.  **Default State:** The form is empty with placeholder text and standard grey borders.
2.  **Active/Selection State:** Demonstrates the dropdown menus open. The active option is highlighted in blue (e.g., "Net 15", "Inactive"), and the input border turns blue to indicate focus.
3.  **Validation Error State:** Triggered when submitting an empty form or missing required fields.
    *   Input borders turn red.
    *   Error messages appear below specific fields (e.g., "Customer Name is required", "Please enter the customer's address", "Please Select a mode of payment").

## Tech Usage

To implement this component, ensure you handle:
*   **State Management:** Track the value of each input field and the open/close state of the dropdowns.
*   **Validation Logic:** Check for required fields (`*`) upon clicking the "Add Customer" button.
*   **Responsive Design:** Ensure the modal scales correctly on smaller screens.
