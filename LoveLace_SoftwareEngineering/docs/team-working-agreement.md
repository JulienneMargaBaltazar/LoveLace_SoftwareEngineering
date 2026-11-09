
## Team Working Agreement

**Core Principles & Collaboration**
- Active Participation: Every team member contributes actively to daily ceremonies and discussion boards.
- Open Communication: Blockers must be raised immediately on communication channels rather than waiting for the daily sync.
- Respect & Psychological Safety: All ideas are valued, and constructive critique focuses purely on the work, never the individual.

**Synchronous Ceremonies (PST / Asia/Manila)**
- Daily Standup: 05:30 PM – 05:45 PM daily. Focus strictly on: What was done yesterday, what is planned today, and any current blockers.
- Sprint Planning: First Monday of the sprint cycle at 10:00 AM.
- Sprint Review & Retrospective: Alternate Fridays at 05:00 PM.

## Acceptance & Constraint Mapping

**Definition of Done (DoD)**
Before any backlog item or task can be formally marked as Done, it must satisfy the following checklist standards without exception:

**Development & Verification**
- Local Test Compliance: All local unit, integration, and functional tests run and pass successfully on the local environment before task completion.
- Code Reviews: A minimum of two peer reviews must be completed, and all approval requirements must be met before task completion.
- Zero High/Medium Security Alerts: Automated scanning tools must return no outstanding high or medium vulnerabilities.

**Documentation & Deployment**
- Documentation Updates: Technical architecture files, inline documentation, and change logs are updated.
- Functional Acceptance Criteria Met: The feature matches all specific acceptance criteria outlined in the ticket.
- Deployment Readiness: Code passes static analysis pipelines and is successfully merged into the staging branch.

## Acceptance & Constraint Mapping

**Role Guides & Daily Procedural Expectations**


**Scrum Master**

- Facilitate Ceremonies: Keep daily standups under 15 minutes and protect the team from external scope creep.
-  Unblock Team Members: Escalate and resolve blockers identified during daily syncs within 2 hours.
-  Metrics Tracking: Maintain and update sprint burn-down charts and velocity logs daily.

**Developer**

- Daily Updates: Update task statuses in the tracking board prior to the daily standup.
- Code Quality: Ensure all code conforms to the project's styling guidelines and architectural constraints.
- Review Participation: Dedicate at least 30 minutes daily to reviewing peer pull requests.

**Tester**

- Test Case Creation: Generate comprehensive test plans within the first 48 hours of a sprint starting.
- Regression Testing: Run full automated regression suites on every release candidate branch.
- Bug Reporting: Document defects with clear step-by-step reproduction instructions and environment logs.

**UI/UX Designer**

- Design Delivery: Provide finalized asset links and design specs prior to the start of sprint development.
- Design QA: Review developed interfaces in staging environments to verify visual fidelity against original prototypes.

**Database Administrator** 

- Schema Management: Review and execute database migration scripts in lower environments safely.
- Performance Tuning: Monitor execution patterns and optimize query index strategies weekly.
