
# Sprint 2 Task Map

| Order | Task ID | Title & GitHub Issue | Track | Depends On | Core Deliverable |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **1** | `S2-SM-01` | [Sprint 2 planning notes and board](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/101) | SM | `S1-SM-05` | Sprint 2 board configured with owners, due days, dependencies, ACs, and capacity notes |
| **2** | `S2-SM-02` | [Follow up Sprint 1 retro actions](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/102) | SM | `S2-SM-01` | Sprint 1 retrospective improvement actions tracked and verified in Sprint 2 |
| **3** | `S2-DBA-01` | [Customer and product active views, indexes](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/82) | DBA | `S2-SM-01` | Active-record database views and base indexes for Customer and Product modules |
| **4** | `S2-DBA-02` | [Query: current price as of a given date](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/83) | DBA | `S2-SM-01` | Effective-date query returning accurate current product price as of any target date |
| **5** | `S2-DBA-03` | [Validation constraints (payTerms, unit)](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/84) | DBA | `S2-SM-01` | Schema-level validation constraints enforced on `payTerms` and `unit` fields |
| **6** | `S2-DBA-08` | [Verify rights catalogue entries and seed permission presets for Customer and Product modules](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/89) | DBA | `S2-SM-01` | Verified rights catalogue entries and seeded Add/Edit/Delete/Price permission presets |
| **7** | `S2-UIX-01` | [Wireframes: customer screens](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/96) | UIX | `S2-SM-01` | Low/mid-fidelity wireframes for Customer list, create/edit, and delete/restore flows |
| **8** | `S2-UIX-02` | [Wireframes: product and price history screens](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/97) | UIX | `S2-SM-01` | Low/mid-fidelity wireframes for Product list, create/edit, delete/restore, and Price History |
| **9** | `S2-UIX-03` | [Hi-fi mockups and handoff notes](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/98) | UIX | `S2-UIX-01`, `S2-UIX-02` | High-fidelity UI mockups and developer handoff specifications |
| **10** | `S2-UIX-04` | [Empty, error and confirm-delete states](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/99) | UIX | `S2-UIX-01`, `S2-UIX-02` | UI states and copy for empty lists, validation/permission errors, and confirm-delete modals |
| **11** | `S2-DBA-04` | [Verify child-record delete checks for customer and product](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/85) | DBA | `S2-DBA-01`, `S2-DBA-03` | Verified DB-level referential/child-record guards blocking deletion when active children exist |
| **12** | `S2-DBA-05` | [Demo data for customer, product, price history](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/86) | DBA | `S2-DBA-01`–`S2-DBA-03` | Clean seed script with realistic Customer, Product, and Price History demo records |
| **13** | `S2-DEV-01` | [Customer list with search and filter (permission-checked)](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/73) | DEV | `S2-DBA-01`, `S2-DBA-08`, `S2-UIX-01` | Permission-gated Customer list view with working search and filter controls |
| **14** | `S2-DEV-02` | [Customer create and edit form](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/74) | DEV | `S2-DBA-03`, `S2-UIX-01`, `S2-UIX-03` | Customer create/edit form enforcing `payTerms` validation and UI specs |
| **15** | `S2-DEV-03` | [Customer soft delete and restore](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/75) | DEV | `S2-DBA-01`, `S2-DBA-04`, `S2-UIX-04` | Customer soft-delete and restore actions honoring child-record delete blocks |
| **16** | `S2-DEV-04` | [Product list with search and filter](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/76) | DEV | `S2-DBA-01`, `S2-UIX-02` | Product list view with search and filter controls backed by active product views |
| **17** | `S2-DEV-05` | [Product create and edit form](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/77) | DEV | `S2-DBA-03`, `S2-UIX-02`, `S2-UIX-03` | Product create/edit form enforcing `unit` validation and UI specs |
| **18** | `S2-DEV-06` | [Product soft delete and restore](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/78) | DEV | `S2-DBA-01`, `S2-DBA-04`, `S2-UIX-04` | Product soft-delete and restore actions honoring child-record delete blocks |
| **19** | `S2-DEV-07` | [Price history: add, edit and delete price with effective date](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/79) | DEV | `S2-DBA-02`, `S2-UIX-02` | Full CRUD for Product Price History entries with effective-date handling |
| **20** | `S2-DEV-08` | [Current-price display on product page; per-action rights checks (Add/Edit/Delete) across both modules](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/80) | DEV | `S2-DBA-02`, `S2-DBA-08`, `S2-DEV-01`–`S2-DEV-07` | As-of-date current price display on Product page and granular UI/API rights enforcement |
| **21** | `S2-DEV-09` | [Wire audit_user() session context into Customer, Product & Price History mutations](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/81) | DEV | `S2-DEV-02`, `S2-DEV-03`, `S2-DEV-05`–`S2-DEV-07` | Authenticated `audit_user()` session context passed on all Customer, Product, and Price mutations |
| **22** | `S2-DBA-06` | [Search performance check and index tuning](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/87) | DBA | `S2-DEV-01`, `S2-DEV-04` | Query execution plan verification and index tuning for Customer/Product search & filter |
| **23** | `S2-DBA-07` | [Verify audit_log triggers fire accurately on soft-delete, restore, and price history changes](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/88) | DBA | `S2-DEV-09` | Confirmed `audit_log` entries capturing user, action, and before/after values across mutations |
| **24** | `S2-SM-03` | [Mid-sprint check and impediment log](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/103) | SM | `S2-SM-01` | Mid-sprint progress checkpoint completed and active blockers logged with owners |
| **25** | `S2-TST-01` | [Test cases: customer module](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/90) | TST | `S2-DEV-01`–`S2-DEV-03` | Executed test cases covering Customer list, search/filter, create/edit, and validation |
| **26** | `S2-TST-02` | [Test cases: product and price history](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/91) | TST | `S2-DEV-04`–`S2-DEV-08` | Executed test cases covering Product CRUD, effective-date pricing, and Price History |
| **27** | `S2-TST-03` | [Soft delete/restore tests, incl. delete blocked by active children](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/92) | TST | `S2-DEV-03`, `S2-DEV-06`, `S2-DBA-04` | Verified soft-delete, restore, and active-child deletion block behavior for Customer & Product |
| **28** | `S2-TST-04` | [Per-right permission tests for customer and product (Add/Edit/Delete, price rights)](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/93) | TST | `S2-DEV-08`, `S2-DBA-08` | Verified role/permission enforcement across Add, Edit, Delete, and Price History actions |
| **29** | `S2-TST-05` | [Regression test of Sprint 1](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/94) | TST | `S2-DEV-01`–`S2-DEV-09` | Sprint 1 core features re-tested to confirm zero regressions from Sprint 2 merges |
| **30** | `S2-UIX-05` | [Usability review of built screens](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/100) | UIX | `S2-DEV-01`–`S2-DEV-08`, `S2-UIX-03`, `S2-UIX-04` | UI/UX walkthrough of implemented screens with polish/usability feedback logged |
| **31** | `S2-TST-06` | [Bug reports and fix verification](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/95) | TST | `S2-TST-01`–`S2-TST-05`, `S2-UIX-05` | All defects logged, re-tested after DEV/DBA fixes, and signed off for release |
| **32** | `S2-SM-04` | [Update velocity and burndown](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/104) | SM | `S2-TST-06` | Sprint 2 velocity metrics and burndown chart updated with final completed points |
| **33** | `S2-SM-05` | [Sprint 2 review and retrospective report](https://github.com/JulienneMargaBaltazar/LoveLace_SoftwareEngineering/issues/105) | SM | `S2-SM-04`, `S2-TST-06` | Final Sprint 2 review summary and retrospective report published for Sprint 3 handoff |

---

## Phase Breakdown & Track Guardrails

### Phase 1: Sprint Kickoff & Planning (`SM`)
* **Gate:** `S1-SM-05` must be closed before starting `S2-SM-01`.
* **Tasks:** `S2-SM-01` (#101) → `S2-SM-02` (#102)
* **Goal:** Lock team capacity, assign all 33 issues with target due days and acceptance criteria, and carry forward Sprint 1 retro improvements.

### Phase 2: Database & UI/UX Foundations (`DBA` & `UIX` — Parallel Tracks)
* **Technical Guardrail:** `S2-DBA-01` through `S2-DBA-03` and `S2-UIX-01` through `S2-UIX-02` **must complete before dependent DEV PRs are merged**.
* **DBA Foundation:** `S2-DBA-01` (#82), `S2-DBA-02` (#83), `S2-DBA-03` (#84), `S2-DBA-08` (#89) → followed by `S2-DBA-04` (#85) and `S2-DBA-05` (#86).
* **UIX Foundation:** `S2-UIX-01` (#96), `S2-UIX-02` (#97) → followed by `S2-UIX-03` (#98) and `S2-UIX-04` (#99).

### Phase 3: Feature Implementation & Wiring (`DEV`)
* **Customer Module:** `S2-DEV-01` (#73) → `S2-DEV-02` (#74) → `S2-DEV-03` (#75)
* **Product & Price History Module:** `S2-DEV-04` (#76) → `S2-DEV-05` (#77) → `S2-DEV-06` (#78) → `S2-DEV-07` (#79)
* **Cross-Module Integration:** `S2-DEV-08` (#80) (current price display + per-action rights) → `S2-DEV-09` (#81) (`audit_user()` session context wiring)

### Phase 4: Post-Build DB Verification & Mid-Sprint Check (`DBA` & `SM`)
* **Tasks:** `S2-DBA-06` (#87), `S2-DBA-07` (#88), `S2-SM-03` (#103)
* **Goal:** Tune search indexes against real DEV queries, confirm `audit_log` triggers fire accurately with `audit_user()` context, and log mid-sprint status/impediments.

### Phase 5: QA Testing, Usability Review & Bug Verification (`TST` & `UIX`)
* **Functional & Security Testing:** `S2-TST-01` (#90), `S2-TST-02` (#91), `S2-TST-03` (#92), `S2-TST-04` (#93), `S2-TST-05` (#94)
* **Usability Sign-Off:** `S2-UIX-05` (#100)
* **Defect Closure:** `S2-TST-06` (#95)

### Phase 6: Sprint Closeout & Reporting (`SM`)
* **Tasks:** `S2-SM-04` (#104) → `S2-SM-05` (#105)
* **Goal:** Finalize velocity/burndown metrics and deliver the Sprint 2 review and retrospective report.
