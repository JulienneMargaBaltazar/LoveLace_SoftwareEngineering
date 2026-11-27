# Sprint 2 Mid-Sprint Health Check & Impediment Log
**Task ID:** S2-SM-03  
**Milestone:** Sprint 2 Mid-Sprint Audit (Week 3 / Day 5)  
**Scrum Master:** Julienne Baltazar  
**Date:** November 28, 2026  
**Dependency:** S2-SM-01  

---

## 1. Executive Summary
This report documents the Sprint 2 mid-sprint health check (Week 3 / Day 5) across all engineering, database, UI/UX, and QA tracks on the `SoftEng_Lovelace` project board. Out of **30 total Sprint 2 tasks**, **14 tasks (46.7%) are completed (`Done`)**, keeping the team on pace for Week 4 integration and closeout.

---

## 2. Week 3 Deliverable Health Check (Requirement 1)

| Track / Role | Week 3 Target Deliverables | Board Status | Health Assessment |
| :--- | :--- | :---: | :--- |
| **DB Admin** | Customer & Product views/indexes (`S2-DBA-01`), soft-delete columns (`S2-DBA-02`), price uniqueness (`S2-DBA-03`), delete-block triggers (`S2-DBA-04`) | ✅ **Done** | **On Track.** Core schema constraints are merged; remaining performance/audit checks (`S2-DBA-06`, `S2-DBA-07`) are queued for Week 4 validation. |
| **UI/UX Designer** | Customer list/form mockups (`S2-UIX-01`, `S2-UIX-02`), Product & price history layouts (`S2-UIX-03`, `S2-UIX-04`) | ✅ **Done** | **On Track.** All baseline mockups are delivered; usability review (`S2-UIX-05`) and empty/error state polish (`S2-UIX-06`) are scheduled for Week 4. |
| **Developer (Customer)** | Customer list with search/filter (`S2-DEV-01`), Customer create/edit (`S2-DEV-02`), Soft delete/restore (`S2-DEV-03`) | 🟡 **2/3 Done** | **On Track.** Customer CRUD is complete; `S2-DEV-03` (soft delete/restore) is ready for immediate execution using `S2-DBA-02` & `04`. |
| **Developer (Product & Auth)** | Price history (`S2-DEV-07` Done); Product list (`S2-DEV-04`), Product CRUD (`S2-DEV-05`), Soft delete (`S2-DEV-06`), Per-right permissions (`S2-DEV-08`) | 🟡 **1/5 Done** | **Needs Focus.** Product list (`S2-DEV-04`), CRUD (`S2-DEV-05`), and permissions (`S2-DEV-08`) are prioritized next to unblock Week 4 QA execution. |
| **QA / Tester** | Test suites `S2-TST-01` through `S2-TST-04` authored | ✅ **4/6 Done** | **Ahead of Schedule.** Test cases and execution guides are ready; `S2-TST-05` (regression) and `S2-TST-06` (bug verification) will execute as remaining dev PRs merge. |

---

## 3. Impediment & Cross-Role Dependency Log (Requirement 2)

| Impediment ID | Affected Task(s) | Description / Bottleneck | Assigned Owner | Target Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **IMP-S2-01** | `S2-DEV-04`, `S2-DEV-05`, `S2-DEV-08` | Product catalog CRUD and per-right permission enforcement (`S2-DEV-08`) must be merged early in Week 4 so QA (`S2-TST-02`, `S2-TST-04`) can complete live execution before sprint close. | Developer Lead | Week 4 / Day 2 | 🟡 **Monitoring** |
| **IMP-S2-02** | `S2-DEV-03`, `S2-DEV-06` | Soft-delete and restore endpoints depend on DB soft-delete columns (`S2-DBA-02`) and active-child delete triggers (`S2-DBA-04`). DB tasks are now `Done`; dev implementation is unblocked. | Developer / DB Admin | Week 4 / Day 2 | 🟢 **Unblocked** |
| **IMP-S2-03** | All Open PRs | **24-Hour PR Review Guardrail:** Any pull request sitting unreviewed for >24 hours is flagged in team chat during daily check-ins to prevent Week 4 merge bottlenecks. | Julienne Baltazar (SM) | Ongoing (Daily) | 🟢 **Active** |

---

## 4. Technical Guardrails & Action Plan
* **24-Hour PR Review SLA:** Audited open pull requests; flagged any pending documentation and feature PRs exceeding 24 hours for immediate peer review and merge into `main`.
* **Work Re-Balancing:** Prioritized `S2-DEV-04`, `S2-DEV-05`, and `S2-DEV-08` at the top of the Week 4 queue so full-stack integration and regression testing (`S2-TST-05`) stay on schedule.

---

**Audit Status:** ✅ Completed & Logged for Sprint 2 Mid-Sprint Review
