# Bug Tracking Log (Task ID: S1-TST-06)

**Assignee:** Julienne Baltazar, Tester  
**Objective:** Track system anomalies, compile thorough defect documentations, and coordinate validation workflows to confirm all engineered fixes resolve detected issues.

---

## Defect Inventory & Validation Tracking Matrix

| Bug ID | Severity | System Context / Environment | Root Cause Log Trace | Reproduction Steps Summary | Targeted Patch Build | Localized Regression Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Critical | Staging-US-East-01 <br> Build v2.4.1-rc3 <br> Ubuntu 22.04 LTS | `[FATAL] [SYSTEM] Process terminated with exit code 137 (OOM)` at `WorkflowManager.AllocateBuffer`. | 1. Deploy v2.4.1-rc3. <br> 2. Spin up 5,000 websocket connections. <br> 3. Monitor heap growth. | `v2.4.1-patch1` | **PASSED** <br> (Batch Transaction Processor stable; baseline performance intact) |
| **BUG-002** | Major | Integration-EU-West-02 <br> Build v2.4.1-rc3 <br> RedHat Enterprise 9 | `[ERROR] [VALIDATION] TimeoutException: Target node failed to acknowledge verification token` | 1. Initialize validation handshake. <br> 2. Introduce 300ms artificial network latency. | `v2.4.1-patch2` | **PASSED** <br> (Node heartbeat monitoring and clustering unaffected) |
| **BUG-003** | Minor | Staging-US-East-01 <br> Build v2.4.1-rc4 <br> Ubuntu 22.04 LTS | `[WARN] [DASHBOARD] Visual Data Evidence payload parsing failed (Malformed JSON)` | 1. Navigate to tracking dashboard. <br> 2. Upload telemetry data file via UI. | `v2.4.1-patch2` | **PASSED** <br> (File import wizard and adjacent chart views operational) |

---

## Visual Data Evidence Registry

| Bug ID | Dashboard Metric Link | Storage Profile Link | Artifact Description |
| :--- | :--- | :--- | :--- |
| **BUG-001** | `https://dashboard.internal` | `https://storage.internal` | Peak memory threshold line chart & V8 engine heap snapshot. |
| **BUG-002** | `https://dashboard.internal` | `https://storage.internal` | Node connection handshake timeline capture & packet dump data. |
| **BUG-003** | `https://dashboard.internal` | `https://storage.internal` | Dashboard rendering exceptions & raw Chrome DevTools JSON parser log text. |
