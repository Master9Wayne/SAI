# Verified education software SDLC evidence corpus

Research date: 2026-09-22. This corpus is a comparative evidence base, not a prescriptive SDLC catalog. Public documentation shows documented practices; it does not prove undocumented internal execution. The full normalized records and 57 source entries are in `education_software_sdlc.json` and `source_index.json`.

## Selection rule

Included projects are education-related software with official documentation or repositories supporting at least three traceable lifecycle sources. Methodology names are used only when a project source explicitly supports them. Otherwise, the record says `Not explicitly stated` and reports documented activities without relabeling them.

## Comparative records

### Moodle
- Category: education technology / learning management system.
- Documented lifecycle: Moodle HQ stable teams explicitly use Scrum; the wider project uses tracker intake, peer review, integration, testing, weekly release, and stable maintenance.
- Evidence: roadmap and quarterly planning; Tracker issues and feature specifications; core-plus-plugin architecture; branch/patch/review workflow; PHPUnit, Behat, CI, regression, performance, browser, and QA testing; six-month major releases and two-month point releases; coordinated security response and backports.
- Limits: no single whole-project SDLC label; architecture reference is older; public evidence is incomplete for deployment monitoring, incident response, and plugin operations.
- Sources: https://moodledev.io/general/development/process | https://moodledev.io/general/community/roadmap | https://docs.moodle.org/dev/Moodle_architecture | https://github.com/moodle/moodle/blob/main/CONTRIBUTING.md | https://docs.moodle.org/502/en/Development:Tests | https://moodledev.io/general/development/process/release | https://moodledev.io/general/development/process/security

### Open edX
- Category: education technology / online learning platform.
- Documented lifecycle: no named methodology; product proposals and roadmap connect to design/technical planning, pull-request review, CI/manual QA, named releases, deployment, and security updates.
- Evidence: proposals include user problem, use cases, implementation, ownership, and maintenance; LMS/Studio plus independently deployed applications and micro-frontends; forks/issues/PRs; GitHub Actions, Codecov, linting and manual test plans; six-month named releases, community testing, frequent edx.org deployment; private vulnerability handling.
- Limits: multi-repository ecosystem; practices and licenses vary; no complete organization-wide traceability, SLO, incident-response, or every-component maintenance policy.
- Sources: https://openedx.atlassian.net/wiki/spaces/COMM/pages/3875962884/How+to+submit+an+open+source+contribution+for+Product+Review | https://docs.openedx.org/en/latest/developers/references/developer_guide/architecture.html | https://docs.openedx.org/en/latest/developers/references/developer_guide/process/landing-your-work.html | https://docs.openedx.org/en/latest/developers/references/developer_guide/testing/github-actions.html | https://docs.openedx.org/en/latest/community/release_notes/named_release_branches_and_tags.html | https://docs.openedx.org/en/latest/community/security_policy/index.html

### Sakai
- Category: education technology / learning management system.
- Documented lifecycle: no named methodology; community roadmap consultation, Jira requirements, branch/commit/PR review, QA verification, release-manager merging, and maintenance/security releases.
- Evidence: three-year roadmap consultation; Jira bugs/features/use cases/detailed requirements; modular repository, Maven, Java, Tomcat; PR/CLA workflow; QA verification and nightly testing; supported releases and maintenance branches; private security Jira/repository and published advisories.
- Limits: some architecture criteria are historical; current CI, coverage, architecture decisions, and security SLAs are incomplete publicly.
- Sources: https://github.com/sakaiproject/sakai | https://github.com/sakaiproject/sakai/blob/master/CONTRIBUTING.md | https://sakaiproject.atlassian.net/wiki/spaces/MGT/pages/13953859616/Sakai+Jira+Guidelines | https://sakaiproject.atlassian.net/wiki/spaces/REL/pages/1384677712/Sakai+s+Open+3-Year+Roadmap | https://sakaiproject.atlassian.net/wiki/spaces/DOC/pages/32324813077/Sakai+23+Install+Guide+Source | https://github.com/sakaiproject/sakai/security

### Kolibri
- Category: offline-first education platform.
- Documented lifecycle: Gitflow is explicitly documented; dev/alpha/beta/final phases, PR review, automated checks, release branches/tags, and automation are also documented.
- Evidence: community and needs-driven product design; Python/Django/Vue architecture with core/plugins/hooks; fork/PR workflow; TDD Red/Green/Refactor, pytest, Jest/Vue Testing Library, linting, tox and manual/Gherkin/UI review; release checklists, Buildkite, npm/PyPI publishing, OIDC and SLSA attestations; private vulnerability reporting and coordinated disclosure targets.
- Limits: incomplete public evidence for formal requirements sign-off, production monitoring, incident response, dependency governance, and end-of-life policy.
- Sources: https://kolibri-dev.readthedocs.io/en/develop/development_workflow.html | https://kolibri-dev.readthedocs.io/en/develop/stack.html | https://kolibri-dev.readthedocs.io/en/latest/testing.html | https://kolibri-dev.readthedocs.io/en/develop/backend_architecture/plugins.html | https://kolibri-dev.readthedocs.io/en/develop/release_process.html | https://github.com/learningequality/kolibri/security | https://learningequality.org/kolibri/about-kolibri/

### Oppia
- Category: education technology / online learning platform.
- Documented lifecycle: no named methodology; Technical Design Documents, issue/PR/CI implementation, scheduled QA/deployment, feature gating, regression handling, and privacy review.
- Evidence: TDDs cover user stories, technical requirements, APIs, database, frontend, architecture, stakeholder feedback and approval; Python/Angular/Google App Engine; develop branch and PR workflow; backend/frontend/e2e/TypeScript/Lighthouse/Pylint/ESLint testing; monthly release cut, QA, deployment, and controlled feature exposure; privacy-aware programming and revert/regression policy.
- Limits: no complete public requirements lifecycle, deployment infrastructure, vulnerability SLA, or security history.
- Sources: https://github.com/oppia/oppia | https://github.com/oppia/oppia-web-developer-docs/blob/develop/Tutorial-Learn-how-to-write-a-TDD.md | https://github.com/oppia/oppia/wiki/Tests | https://github.com/oppia/oppia/wiki/Release-schedule-and-other-information | https://github.com/oppia/oppia/wiki/Privacy-aware-programming | https://github.com/oppia/oppia/wiki/Revert-and-Regression-Policy

### Canvas LMS
- Category: education technology / learning management system.
- Documented lifecycle: no named methodology; issue/feature intake, focused PRs, automated tests/linting, code/QA/product review, merge, and beta-to-production deploys.
- Evidence: defects in GitHub and feature requests in Canvas Community; REST/HTTPS/JSON/OAuth2 APIs; repository separation and CODEOWNERS; Test Plan, linting, review and QA gates; two-week deploy notes and beta testing; private Bugcrowd/security@instructure.com reporting and API change logs.
- Limits: public repository may not represent hosted-service practice; no complete requirements/architecture records, CI thresholds, SRE/rollback, SLOs, vulnerability SLAs, or QA metrics.
- Sources: https://github.com/instructure/canvas-lms | https://github.com/instructure/canvas-lms/blob/master/CONTRIBUTING.md | https://github.com/instructure/canvas-lms/blob/master/SECURITY.md | https://developerdocs.instructure.com/services/canvas | https://community.instructure.com/en/discussion/666834/canvas-deploy-notes-2026-10-07 | https://community.instructure.com/en/categories/canvas-release-notes

### OpenBoard
- Category: education software / interactive whiteboard.
- Documented lifecycle: no named methodology; issue/roadmap workflow with branches, PRs, versioned binaries and changelogs.
- Evidence: roadmap and feature-request template; Qt/C++/JavaScript/HTML/CSS modular source; qmake official release build and community CMake; contributor branch/PR and source-build guide; required thorough testing and detailed bug reports; versioned releases and active defect maintenance.
- Limits: no public formal SDLC, governance, traceability, comprehensive CI/test evidence, release sign-off, monitoring, or security policy; no SECURITY.md or published advisories in the cited repository.
- Sources: https://github.com/OpenBoard-org/OpenBoard | https://github.com/OpenBoard-org/OpenBoard/wiki/Roadmap | https://github.com/OpenBoard-org/OpenBoard/wiki/A-How-to-Guide-for-New-Contributors | https://github.com/OpenBoard-org/OpenBoard/wiki/Build-OpenBoard-from-source | https://github.com/OpenBoard-org/OpenBoard/releases | https://github.com/OpenBoard-org/OpenBoard/security | https://github.com/OpenBoard-org/OpenBoard/wiki/Changelog

### BigBlueButton
- Category: education technology / virtual classroom and web conferencing.
- Documented lifecycle: official FAQ explicitly names Planning -> Design -> Development -> Beta Testing -> Release Candidate -> General Release. It does not label this Agile, Scrum, Waterfall, or another standard method.
- Evidence: role-based user stories and quality goals in roadmap; React/TypeScript/WebRTC/GraphQL/PostgreSQL/Redis/FreeSWITCH/SFU architecture; design guide; source development, issue/specification, committer review; unit/integration/stress-test goals, peer testing, beta testing; beta/RC/general release and Ubuntu installer/health checks; private security reporting and HTTPS/checksum/JWT controls.
- Limits: versioned/longstanding FAQ may not reflect every current practice; public evidence lacks complete current CI, coverage, deployment automation, and vulnerability SLA.
- Sources: https://docs.bigbluebutton.org/support/road-map/ | https://docs.bigbluebutton.org/4.0/support/faq/ | https://docs.bigbluebutton.org/development/architecture/ | https://docs.bigbluebutton.org/development/guide/ | https://docs.bigbluebutton.org/development/design/ | https://github.com/bigbluebutton/bigbluebutton/blob/v3.0.x-develop/SECURITY.md | https://docs.bigbluebutton.org/administration/install/ | https://github.com/bigbluebutton/bigbluebutton/releases

## Recommendation rules for education projects

Use the records above as comparative evidence. A named SDLC must be selected from project factors, not by copying the most common project pattern. Prefer a hybrid when requirements evolve but learner safety, privacy, accessibility, institutional approval, or failure consequences require formal verification gates. Use heuristic scores only as decision support, not measured probability. Require human approval for the final requirements baseline, privacy/safeguarding interpretation, accessibility claims, security-critical design, SDLC selection, and production readiness.

Mark jurisdiction-specific legal claims, child-data obligations, accessibility compliance, school policy, procurement, and retention requirements `NEEDS-VALIDATION` unless the user provides authoritative evidence.
