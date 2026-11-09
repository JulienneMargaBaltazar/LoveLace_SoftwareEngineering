# 🛡️ Admin Module Overview

This document outlines the specific features, layouts, and permissions associated with the **Admin** role within the LoveLace Inc. ERP system. The Admin role is designed for management-level operations, bridging the gap between standard User tasks and system-level Superadmin configurations.

---

## 🔐 Role & Access Overview
- **Role Badge:** `Admin` (displayed in the top right corner of all screens).
- **Scope:** Comprehensive access to all operational modules (Sales, HR, Products, Customers, Reports) plus the ability to manage system users.
- **Key Distinctions:** 
  - Admins have access to the **User Management** module.
  - Admins can view and **restore soft-deleted (inactive)** records.
  - Admins *cannot* access `System Settings` or modify Superadmin accounts.

---

## 🗺️ Core Modules & Features

### 1. Dashboard
- **Welcome Banner:** Personalized greeting for the Admin ("Manage your team, customers, and operations from here").
- **KPI Cards:** Snapshot metrics for Revenue, Active Users, New Orders, and Refunds.
- **Quick Actions:** A management-focused grid (5 items) providing shortcuts to:
  - Add Customer
  - Manage Products
  - Human Resources
  - Sales Pipeline
  - Manage Users *(Admin exclusive)*

### 2. User Management & Rights
- **User Directory:** View all system users, including Superadmins, Admins, and standard Users. A banner clarifies that Superadmin accounts are hidden/immutable.
- **Actions Column:** Admins can perform specific actions on standard users:
  - **Block:** Suspend a user's access.
  - **Rights:** Open a granular permissions modal to toggle access for Customer, Product, HR, Sales, and Reports modules.
  - **Edits:** Modify user details.
- **Add User:** Ability to provision new accounts into the system.

### 3. Soft Delete & Restore Functionality
Admins have the unique ability to view, manage, and recover soft-deleted records across multiple modules. Inactive/deleted records are visually distinguished with a **pink background** and a red `Inactive` status pill.
- **Sales Management:** View deleted transactions and click `Restore`.
- **Human Resources:** View deleted Employees, Jobs (e.g., `J-003 Accountant`), and Departments (e.g., `D-003 Finance`) and click `Restore`.
- **Products & Customers:** View and manage inactive records via the top-level filter tabs (`All Products`, `Active`, `Inactive`).

### 4. Human Resources (HR)
- **Workforce Management:** Tabbed interface to manage Employees, Jobs, and Departments.
- **Audit Trail:** Tables include a `STAMP` column detailing creation and edit history (e.g., `EDITED system 2026-10-01 9:00AM`).
- **Job History Modal:** Access employee timelines to view effective dates, departments, salaries, and append new records using the `+ Add History` button.

### 5. Sales Management
- **Transaction Tracking:** View detailed sales data with Transaction No, Date, Customer, Employee, and Total.
- **Status Filtering:** Tabs for `All`, `Active`, `Inactive`, and `Pending`.
- **Sale Details Modal:** Manage line items, adjust quantities, view unit prices, and calculate line totals. Includes the `+ Add Line` button and `Active/Inactive/All` toggles.

### 6. Reports & Analytics
- **Data Views:** Access to generate analytical reports via a tabbed navigation bar (Top Customers, Product Master List, Top Products, Active/All Employees, Employee Job History, Top Sales).
- **Filtering & Exporting:** All reports include date pickers (`From` / `To`), a `Top N` limit input, and action buttons to `Print` or `Save as PDF`.

---

## 🛠️ Technical Guardrails (UI/UX)
- **Navigation:** The persistent left sidebar includes standard operational modules plus `User Management`.
- **Data Visibility:** Admins see a comprehensive view of data, including the `STAMP` column for audit purposes and pink-highlighted rows for deleted records.
- **Permissions Management:** The "Rights" modal uses a clear checkbox grid system with "All" and "None" quick-select toggles for each module (Customer Management, Product Management, Human Resources, Sales, Reports).
