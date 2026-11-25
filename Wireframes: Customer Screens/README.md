
# New Customer UI Options

Welcome to the Customer Management Screens repository. 

In this repository, you will find two distinct UI options for the "New Customer" creation workflow, organized into the `Option One` and `Option Two` folders.

## 💡 Why Two Options?

I created two options because the data entry requirements for "Term of Payment" can vary significantly depending on the backend architecture and business logic:

*   **Option One** utilizes standard text inputs for manual entry. This is ideal if payment terms are highly customized, vary widely per client, or need to be imported from an external system where a fixed dropdown list isn't sufficient.
*   **Option Two** upgrades the "Term of Payment" field to a dropdown menu (e.g., Net 10, Net 15, Net 25, Net 30). This approach is best for standardizing data entry, reducing user errors, and ensuring consistency across the database when terms are predefined.

Providing both options allows stakeholders to choose the interaction model that best fits the specific business rules and user workflows.

## 📂 Repository Structure

*   **[Option One](./Option%20One):** Features manual text inputs for payment terms and standard validation states.
*   **[Option Two](./Option%20Two):** Features dropdown selections for standardized payment terms and status, along with complex validation and active dropdown states.

## 🚀 Getting Started

Please navigate into the specific folder (`Option One` or `Option Two`) to view the detailed `README.md` for that specific design, including screenshots, field specifications, and UI state explanations.

### Quick Comparison

| Feature | Option One | Option Two |
| :--- | :--- | :--- |
| **Term of Payment Input** | Text Input (Manual) | Dropdown (Predefined) |
| **Customer Status Input** | Dropdown | Dropdown |
| **Best For** | Custom/Unique payment terms | Standardized payment terms |
