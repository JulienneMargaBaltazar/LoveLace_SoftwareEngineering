# 👤 Standard User Module Overview

This document outlines the specific features, layouts, and permissions associated with the standard **User** role within the LoveLace Inc. ERP system. The User role is designed for day-to-day operational tasks, restricting access to system-level configurations and destructive data actions.

---

## 🔐 Role & Access Overview
- **Role Badge:** `User` (displayed in the top right corner of all screens).
- **Scope:** Operational access to core business modules (Sales, HR, Reports, Products, Customers).
- **Limitations:** Standard Users do not have access to `User Management` or `System Settings`. They cannot view or restore soft-deleted (inactive) records—when a record is deleted, it is removed from their view entirely.

---

## 🗺️ Core Modules

### 1. Dashboard
- **Welcome Banner:** Personalized greeting for the user.
- **KPI Cards:** Snapshot metrics for Total Customers, Products, Open Orders, and Revenue (with trend indicators).
- **Quick Actions:** A focused grid (4 items) providing shortcuts to daily tasks:
  - View Customers
  - Manage Products
  - Sales Pipeline
  - My Settings

### 2. Customer Management
- **Directory:** View and manage customer accounts, billing terms, and addresses.
- **Status Filtering:** Tabs for `All customers`, `Active`, and `Inactive`.
- **Actions:** Users can Add, Edit, and Delete customers.
- **Pagination:** Standard table pagination displaying total record counts (e.g., "Showing 1–8 of 1,248").

### 3. Product Management
- **Catalog View:** Access to product codes, descriptions, units, and current prices.
- **Actions:** Users can Add, Edit, and Delete products.
- **Price History:** Users can click the `Prices` button on any product to open a modal, allowing them to view the effective date and historical unit prices, as well as `+ Add Price`.

### 4. Sales Management
- **Transaction Tracking:** View all sales records with Transaction No, Date, Customer, Employee, Status, and Total.
- **Status Indicators:** Color-coded pills for sale status (`Completed`, `Pending`, `Cancelled`).
- **Actions:** Users can Add, Edit, and Delete sales. 
- **Sale Details Modal:** Clicking `Details` opens a modal where users can manage line items, view unit prices, calculate line totals, and add new lines to the sale.

### 5. Human Resources (HR)
- **Workforce Management:** Tabbed interface to manage `Employees`, `Jobs`, and `Departments`.
- **Actions:** Users can Add, Edit, and Delete employees, jobs, and departments.
- **Job History Modal:** Clicking `History` on an employee opens a modal to view their employment timeline, including effective dates, job codes, departments, and salary history. Users can `+ Add History` to append new records.

### 6. Reports & Analytics
- **Data Views:** Access to generate analytical reports via a tabbed navigation bar:
  - Top Customers
  - Product Master List
  - Top Products
  - Active Employees
  - All Employees
  - Employee Job History
  - Top Sales
- **Filtering & Exporting:** All reports include date pickers (`From` / `To`), a `Top N` limit input, and action buttons to `Print` or `Save as PDF`.

---

## 🛠️ Technical Guardrails (UI/UX)
- **Consistent Navigation:** The sidebar layout is persistent but excludes restricted modules (User Management, System Settings).
- **Data Visibility:** Standard Users can only view `Active` records. Deleted records (which appear with pink/red backgrounds and a "Restore" button in higher-level roles) are hidden from this view.
- **Audit Trail:** Minimal visibility into system stamps. Standard users see simple data tables without the deep audit `STAMP` columns (e.g., "CREATED system 2026-10-01") found in the Admin views.
