# Architecture and scope

The team application has one public Angular frontend, one Express API and one MySQL database. Staff administration takes place in Navicat. This scope follows the user's later requirements, which replace the original brief's custom admin website and cPanel deployment. The revised brief itself has not been supplied. This project does not claim that the original PDF omitted those requirements.

```text
Public browser (Angular + HTML + TypeScript + CSS)
  -> HTTP GET/POST /api
  -> Express validation and event_db.js
  -> MySQL (foreign keys, unique registration identity, validation triggers)

Navicat -> same MySQL database -> website sees edits on its next API request

Weather route -> Open-Meteo daily forecast -> event-date selection -> 15-minute cache
```

| Entity | Relationship and purpose |
| --- | --- |
| organisations | One organisation owns many events |
| categories | One category classifies many events |
| events | Event schedule, local start-date, place/coordinates, price, campaign and suspension state |
| registrations | Many registrations belong to one event; unique event + normalized email; restricted event deletion |

Registration is the only public write operation. API database credentials have SELECT plus registration INSERT; a separate local Navicat account manages the A3 schema. No account, credential or real personal data is included in the source packages. The demonstration has no user authentication, payment processing or email delivery.

The registration insert locks the event row while eligibility is checked and commits only after insertion. Concurrent duplicate requests are rejected by a database unique constraint. Foreign keys stop deletion of an event that already has registrations. Triggers apply essential validation even to direct Navicat edits. The decimal ticket field is intentionally checked for whole-number values before acceptance.

The API does not expose the Navicat manager's credentials or provide an HTTP substitute for staff database access. Contact details are not in public registration lists. Publicly displaying a participant name still exposes that name; the form explains this, and all seed/contact examples are fictional.

Technology references: [Angular compatibility](https://angular.dev/reference/versions), [Open-Meteo forecast API](https://open-meteo.com/en/docs), [Navicat Premium Lite](https://www.navicat.com/en/products/navicat-premium-lite.html). Checked during implementation on 18 October 2026.

Git commits made by Codex are labelled as assistant contributions. They are not evidence that either student individually wrote the code. Students must truthfully describe actual contributions and understand the submitted work.
