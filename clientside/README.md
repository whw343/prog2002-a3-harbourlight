# Harbourlight public website

Angular 22.2.3, TypeScript 6, HTML templates and CSS. This is modern Angular, not AngularJS. Includes a production build in `dist/browser/` for local running alongside the API, as well as complete source and a dependency lockfile.

## Run the supplied build

Extract this directory next to `api/`. Configure and start the API according to its README, then open `http://localhost:4201/`. Do not double-click index.html: the application needs HTTP and MySQL-backed API requests. The API serves this build, so the client has no second production server to launch.

## Rebuild or develop

Use a supported Node version: ^22.22.3, ^24.15.0 or >=26.0.0. Development used Node 24.19.0. Run `npm ci`, then `npm run build`. To use Angular's development server, run `npm start` and open `http://localhost:4200/`; the proxy forwards `/api/**` to port 4201.

On the original development machine, default Node 24.11.0 is below the Angular build requirement. A compatible executable exists at `C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`. Use it explicitly with `node_modules/@angular/cli/bin/ng.js build` if the system Node has not been upgraded. The source package does not depend on this machine-specific path.

Runtime API configuration is in `public/config.js` (source) and `dist/browser/config.js` (built). The default `/api` works with the sibling API server and the development proxy. Pages use hash routes so refreshing a detail or registration link works without extra server rewrite rules.

## Pages

- Home: community introduction and all available current/future events.
- Search: date, venue/city and category filters; AND combination, clear filters, shareable query state and error recovery.
- Event: details, fundraising progress, latest-first registration list and event-day weather.
- Register: selected event summary, validation, ticket quantity/total, database-backed confirmation and return to detail.

The main banner and all 12 seeded events use locally stored licensed Pexels photographs. These are theme photographs, not records of the fictional events. Sources, authors and license links are in PHOTO-SOURCES.md and the public photo-credits.html page. Original SVG artwork remains as a failure fallback. No remote fonts or remotely loaded photographs are needed. Text output uses Angular's safe interpolation. Local form validation is backed by API validation and database constraints.

## Browser checks

After starting the API, run `npm run test:e2e`. Playwright uses installed Microsoft Edge by default. Set `A3_BROWSER_CHANNEL=chrome` for installed Chrome, or change the script's launch options if using downloaded Playwright browsers. `A3_BASE_URL` defaults to http://localhost:4201. Optional `AXE_PATH` points to an installed axe-core script for accessibility checks.

The script makes one fictional registration with a unique `browser.*@example.invalid` address. Use a test database or remove your own test entry after verification. Screenshots/results go to the sibling `tmp/browser/` directory unless `A3_BROWSER_OUTPUT` is supplied.
