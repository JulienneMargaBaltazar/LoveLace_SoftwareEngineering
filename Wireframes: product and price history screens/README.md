# Price History UI Components

This README outlines the UI structure and functionality for the **Price History** data table and the **Add/Edit Price** modal.

## 1. Price History View

This component displays a historical log of pricing for a specific item.

### Structure
*   **Header:** "Price History" title with a close (X) icon.
*   **Product Banner:** A grey highlighted container displaying the product name (e.g., "Acme Steel Rod").
*   **Data Table:**
    *   **Status:** Visual pill badges.
        *   `Pending`: Blue background.
        *   `Active`: Green background (Note: The entire row is highlighted in light green to indicate it is the current active price).
        *   `Disabled`: Dark grey/black background.
    *   **Price:** Displays the monetary value (e.g., $1,240.00).
    *   **Created By:** Displays the user/admin and the creation timestamp (e.g., ADMIN : 09-10-2001).
    *   **Effective Date:** The date the price takes effect (e.g., 09-11-2001).
    *   **Actions:** Edit (pencil) and Delete (trash can) icons for each row.
*   **Footer Actions:**
    *   **Cancel:** Secondary outlined button to close the view.
    *   **Add Price:** Primary blue button to open the creation modal.

## 2. Add / Edit Price Modal

This component is a form used to create a new price record or update an existing one.

### Structure & States
*   **Header:** "Add / Edit Price" title.
*   **Form Fields:**
    *   **Effective Date:** Date picker input with a calendar icon. Placeholder: `dd/mm/yyyy`. (Required field, marked with red asterisk).
    *   **Price:** Numeric input with up/down stepper arrows. Placeholder: `00.00`. (Required field, marked with red asterisk).
*   **Validation State (Error):**
    *   If a user attempts to save without filling out the fields, the input borders turn red.
    *   Error text appears below the field in red: *"Date cannot be empty"* and *"Price cannot be empty"*.
*   **Footer Actions:**
    *   **Cancel:** Secondary outlined button to discard changes.
    *   **Save:** Primary blue button to submit the form.

## Tech Notes
*   Ensure the date picker restricts invalid inputs.
*   Ensure the price input enforces numeric values and appropriate currency formatting (e.g., 2 decimal places).
*   Implement logic to ensure only one price can be marked as "Active" at a time, updating the table row background colors accordingly.
