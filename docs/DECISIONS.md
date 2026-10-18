# Confirmed decisions

User confirmed on 18 October 2026:

- Stack: HTML, TypeScript, CSS, Node.js, Angular 22 or newer, MySQL, Express and Weather API.
- Three packages per member: clientside, adminside, api; both members receive the same team application.
- No assessment template needs filling. Technical setup, testing and deployment documentation remain necessary.
- User supplied deadline: 19 October 2026 at 24:00. Timezone was not specified; no timezone conversion is assumed.
- Delivery locations: `D:/OneDrive - Southern Cross University/桌面/web 2/a3/满` and `D:/OneDrive - Southern Cross University/桌面/web 2/a3/肖`.
- Public registration creation is mandatory.

These decisions supersede conflicting tentative choices in REQUIREMENTS-AND-PLAN.zh-CN.md. Modern Angular is distinct from the rubric's AngularJS bonus. No bonus is presumed.

Implementation baseline: retain Harbourlight's fictional charity identity and schema concepts, rebuild the public frontend in Angular, extend the Node/MySQL backend. Existing A2 files stay untouched.

Runtime verified: bundled Node 24.19.0; Angular 22.2.3 available on official npm registry. Use the bundled Node explicitly because system Node 24.11.0 is below Angular 22's minimum 24.15.0 in the Node 24 family.

No authentication is required by the brief. Public/admin routes are separated for data presentation, not authorization. Only fictional records are suitable for the public demonstration. Authentication would be required for real operation.

## Subsequent scope change: Navicat administration

The user states that their latest assessment requirements permit Navicat to replace the custom administrative website. This is a user-supplied update; the replacement assessment document has not been provided. The previously reviewed PDF requires a custom web administration interface, so that PDF is retained as historical evidence rather than silently reinterpreted.

Current implementation scope follows the user's latest instruction:

- Use Navicat connected to MySQL for staff event administration and database inspection.
- Stop development of the Angular admin website. Existing scaffold is unfinished and is not a deliverable or completion evidence.
- Continue the Angular 22 public website, Express/Node API, registration persistence and Open-Meteo integration.
- Preserve database constraints when edits are made directly in Navicat: application-only validation is insufficient. Database enforcement and direct-SQL verification must be included in subsequent implementation.
- Three-package arrangement remains: clientside source, api source, and database administration materials. Retain `usernameA3-adminside.zip` as the previously requested third filename unless the user specifies a replacement; its README must explicitly identify Navicat materials rather than a web application.
- The database administration package contains final SQL, relationship documentation, inspection queries and Navicat workflow instructions, with no saved credentials or connection exports.
- Database administration through Navicat does not replace the public website API or the MySQL server. Deployment scope is superseded by the subsequent update below.
- Review and remove or restrict unnecessary unauthenticated administrative HTTP write routes before public deployment, because staff administration no longer depends on those routes.

Current repository contains preliminary source only. Build, integration verification, database enforcement, Navicat connection, packaging and deployment have not been completed.

## Subsequent scope change: cPanel removed

The user states that the latest requirements no longer require cPanel, and explicitly directs this project to abandon cPanel. The replacement document has not been supplied; this is recorded as a user-provided requirement, not as a claim about the previously reviewed PDF.

- Remove SCU cPanel deployment, account setup and per-member cPanel verification from the current work and acceptance criteria.
- No alternative hosting platform is required by the user at this point. Do not add a replacement deployment obligation.
- Complete a locally runnable Angular public website, Node/Express API and MySQL database managed using Navicat.
- Validate installation, database import, startup and complete public workflows from the final packages.
- Prepare the same three team packages separately for both requested delivery folders. The third package contains SQL and Navicat materials, not a custom web administration application.
- Existing cPanel references and build helpers in preliminary files are historical scaffolding, not current requirements. Remove or revise them when finalizing the packages.

Current acceptance: repeatable local setup, working query/registration/weather flows, database integrity, and verified packages. No cPanel completion or online deployment is claimed.

## Implementation checkpoint

The public Angular application, Node API, database constraints, local running configuration and three package types have now been implemented. The user successfully connected Navicat and opened the 12-row event table. Backend tests, Edge/Chrome workflows and an extracted-package reinstall/build/import/HTTP check have passed; see VERIFICATION.md and PACKAGE-VERIFICATION.json for scope and limitations. No student recording, peer evaluation or actual course submission is claimed.
