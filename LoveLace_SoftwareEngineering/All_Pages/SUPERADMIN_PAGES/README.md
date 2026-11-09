# 👑 Superadmin Module Overview

This document outlines the specific features, layouts, and permissions associated with the **Superadmin** role within the LoveLace Inc. ERP system. The Superadmin has the highest level of access, including system-level configurations and the ability to manage all data across the platform.

---

## 🔐 Role & Access Overview
- **Role Badge:** `Superadmin` (displayed in the top right corner of all screens).
- **Scope:** Full system access. Unlike standard Admins, Superadmins can view and restore deleted records, access system settings, and manage user roles.
- **Exclusive Access:** The `System Settings` and `User Management` modules are only visible in the sidebar for this role.

---

## 🗺️ Core Modules

### 1. Dashboard
- **Welcome Banner:** Personalized greeting for the Superadmin.
- **KPI Cards:** High-level metrics including Revenue, Active Users, New Orders, and Refunds (with positive/negative trend indicators).
- **Quick Actions:** Expanded grid (6 items) providing one-click access to critical tasks:
  - Add Customer
  - Manage Products
  - Human Resources
  - Sales Pipeline
  - Manage Users
  - System Settings *(Superadmin exclusive)*

### 2. User Management
- **Account Overview:** Displays all registered users with Name, Email, Role, and Status.
- **Superadmin Banner:** A clear notice indicates that Superadmin accounts are hidden and cannot be modified by standard admins.
- **Actions:** Provides the ability to Block, manage Rights (permissions), or Edit standard users.

### 3. System Settings & Settings
- The left-hand navigation includes a dedicated **System Settings** module exclusively for the Superadmin, alongside standard personal Settings.

### 4. Human Resources (HR)
- **Data Views:** Manage Employees, Jobs, and Departments.
- **Soft Delete & Restore:** Superadmins have visibility into inactive (soft-deleted) records (highlighted in red). 
- **Restore Functionality:** A dedicated `Restore` button is available on deleted rows (e.g., Employee `E-001 Pedro Garcia`, Job `J-003 Accountant`, Department `D-003 Finance`) allowing the Superadmin to revert deletions.

### 5. Sales Management
- **Transaction Tracking:** View all sales records with detailed metadata.
- **Soft Delete & Restore:** Similar to HR, inactive/deleted sales (highlighted in pink) can be restored using the `Restore` button in the Actions column.

### 6. Products & Customers
- **Full CRUD:** View, add, edit, and delete products and customers.
- **Status Filtering:** Tabs to filter by `All Products`, `Active`, and `Inactive`.
- **Pricing History:** Access to view and manage historical pricing for products via the `Prices` button.

### 7. Reports & Analytics
- Access to all data visualization and reporting tools:
  - Top Customers
  - Product Master List
  - Top Products
  - Active Employees / All Employees
  - Employee Job History
  - Top Sales
- Includes `Print` and `Save as PDF` functionality for all reports.

---

## 🛠️ Technical Guardrails (UI/UX)
- **Consistent Navigation:** The sidebar layout is persistent across all Superadmin screens.
- **Status Indicators:** Clear visual cues using color-coded pills (Green for `Active`, Red for `Inactive`).
- **Audit Trail:** Every table includes a `STAMP` column (e.g., `CREATED system 2026-10-01 9:00AM`) to track data creation and modification.
