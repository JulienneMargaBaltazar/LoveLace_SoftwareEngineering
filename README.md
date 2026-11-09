# LoveLace Software Engineering: HOPE, Inc. ERP

Welcome to the central repository for the **HOPE, Inc. Enterprise Resource Planning (ERP)** system. This platform is a collaborative, modular application developed to manage organizational data pipelines, role-based access control layers, user permissions, and structural reporting modules.

---

## 👥 Core Project Team & Roles

*   **Julienne Marga Baltazar (`JulienneMargaBaltazar`)**  
    *   **Role:** Scrum Master & Tester  
    *   **Responsibilities:** Facilitates agile sprint lifecycles, manages project boards, compiles delivery metrics, designs comprehensive test plans, and handles end-to-end verification.
*   **Kate Ayap (`ayapkate`)**  
    *   **Role:** UI/UX Designer  
    *   **Responsibilities:** Conducts usability reviews, engineers responsive wireframes, builds high-fidelity mockups, and delivers asset specifications.
*   **Janelle Sarcilla (`janellesarcilla`)**  
    *   **Role:** Software Developer  
    *   **Responsibilities:** Constructs application infrastructure, develops core modular features, integrates APIs, and maintains application routing states.
*   **Jasmin Bautista (`JasminBautista19`)**  
    *   **Role:** Database Administrator (DB Admin)  
    *   **Responsibilities:** Configures relational database schemas, handles migration sequences, manages system credentials, seeds baseline tables, and implements audit logs.

---

## 🛠️ Tech Stack & Technologies

*   **Frontend:** JavaScript / HTML5 / CSS3 (Responsive UI/UX Layouts)
*   **Backend Runtime:** Node.js
*   **Database & Migrations:** Supabase / PostgreSQL (Relational Data Architectures)
*   **Authentication & Access Control:** Role-Based Access Control (RBAC) supporting Superadmin, Admin, Developer, DB Admin, and Tester structures.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (LTS version recommended)
*   Supabase CLI (configured locally)

### Setup & Installation
1. Clone the repository to your environment:
   ```bash
   git clone https://github.com
   cd LoveLace_SoftwareEngineering
   ```
2. Install project packages:
   ```bash
   npm install
   ```
3. Initialize configurations and apply the local database structures:
   ```bash
   # Execute migration runner scripts to initialize table schemas
   ```

---
### 🔑 Test Accounts & Credentials

Use the credentials below to log in and test the different user roles in the application:

| User Role | Email / Username | Password |
| :--- | :--- | :--- |
| **Admin** | `lacusclyne@hope.com` | `12345678910` |
| **Superadmin** | `lovelace@hope.com` | `adalovelace` |
| **User** | `test@hope.com` | `12345678!` |

---
## 🌿 Contribution & Pull Request Guidelines

To protect target branches and verify codebase consistency, the team follows strict development protocols:

1. **Dedicated Feature Branches:** Develop features exclusively on dedicated tracking branches (e.g., `feature/51-DEV-01`). Do not commit directly to the `main` branch.
2. **Pull Request Validation:** Every PR description must clear functional criteria, document testing steps, track the specific **Task ID**, and link the open GitHub issue number.
3. **Peer Review Mandate:** Assign at least one teammate for review before requesting integration. 
4. **Project Status Sync:** Upon receiving approval and merging code, immediately update the corresponding spreadsheet status to **Merged**.
