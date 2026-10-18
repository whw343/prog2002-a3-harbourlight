# Harbourlight API

Node.js/Express and MySQL back end for the public Angular website. Staff use Navicat rather than an administrative website. There are no administrative HTTP write endpoints.

## Local setup

Extract `clientside/`, `api/` and `adminside/` as sibling directories. Use Node.js 24.15 or newer within the Node 24 series (development used 24.19.0), npm and a MySQL server. MySQL 5.7.26 was tested; later versions have not been separately verified. Navicat is the database management client, not the server.

1. In Navicat, create a new empty database with utf8mb4 / utf8mb4_unicode_ci. Import `database/charityevents-a3.sql` using Run SQL File. The script contains tables, 12 fictional events, 12 registrations and validation triggers; it does not create, select or drop a database. Do not import over an existing A2 database.
2. Create a local application user. Grant SELECT on this database and INSERT on registrations. Use a separate management user for Navicat. Trigger creation during import needs suitable privileges.
3. Run `npm ci` in this directory. Copy `.env.example` to `.env` and set your database connection values. Never commit `.env`.
4. The package includes compiled `dist/`. Run `npm start`, then open `http://localhost:4201/`. The API serves the adjacent `clientside/dist/browser/` build. Keep both directories next to each other.
5. To rebuild TypeScript, run `npm run build`. For standalone Angular development run the client separately as described in its README.

## HTTP resources

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/health | Verifies database connectivity |
| GET | /api/events | Public active events; optional date, location, category query parameters, combined with AND |
| GET | /api/categories | Category options |
| GET | /api/organisations | Organisation options |
| GET | /api/events/:id | Event plus registrations newest first; suspended events return 404 |
| GET | /api/events/:id/weather | Open-Meteo event-day forecast or explicit unavailable state |
| POST | /api/events/:id/registrations | Creates a registration for an available event |

POST example body:

```json
{"fullName":"Example Guest","email":"guest@example.invalid","phone":"0400000000","ticketQuantity":2}
```

Successful creation returns 201 and the registration ID. Invalid input returns 400, missing event 404, duplicate registration or unavailable registration 409, unexpected service errors 500. Public responses omit email and phone. The POST response does not confirm payment or send email. Event ticket prices are informational; fundraising sample totals are not changed by registration.

Email is normalized with trim/lowercase and uniquely constrained with event ID. This is a course-level identity convention, not proof of a person's identity. Tickets are limited to whole numbers from 1 through 20. Past events can be viewed by direct link but cannot accept registrations. Registration closes at event end; suspended events are unavailable publicly.

All stored DATETIME values are UTC. `event_db.ts` compiles to `dist/event_db.js`, the Node database module. Sydney dates are displayed using Intl and the IANA Australia/Sydney zone. SQL triggers maintain the event start-local-date using current NSW daylight saving rules (first Sunday April/October); revisit this logic if legislation changes.

## Weather

The server requests Open-Meteo daily temperature and weather code for event coordinates and selects the event's Sydney calendar date. Cache duration is 15 minutes; upstream timeout is 7 seconds. Forecasts outside the 16-day window are explicitly unavailable. Failure does not block registration. External data requires Internet access. Attribution links appear next to the forecast.

## Validation

`npm test` runs input/weather tests without MySQL. `npm run test:db` runs real database/HTTP tests using `A3_TEST_CONFIG`, a path to a local JSON connection file. It must identify an account permitted to create and remove isolated test schemas/users. It never drops the user's application database. The default config path is the original development workspace's ignored `../.runtime/local-db.json`; provide your own config elsewhere on a different machine.

Both source and compiled code are supplied. Use actual database credentials; passwords and local database runtime files are deliberately absent from the package.
