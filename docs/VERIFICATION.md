# Verification record

Date: 18 October 2026 (Asia/Shanghai). Results describe this implementation, not reused A2 evidence.

## Environment

- Windows, Node.js 24.19.0 (bundled executable), Angular 22.2.3, TypeScript 6.0.
- Isolated MySQL 5.7.26 on localhost; no A2 schema was changed. Import tested in fresh temporary schemas.
- Navicat Premium Lite 18 installed at `D:/Applications/Navicat`; the vendor installer had a valid PremiumSoft CyberTech Limited signature. The user completed registration and connected successfully. User screenshot confirms the A3 events table has 12 rows.

## Completed checks

| Check | Observed result |
| --- | --- |
| API TypeScript compilation | Passed |
| Angular production build | Passed without compiler warnings; approximately 368 KB initial raw bundle (about 96 KB estimated transfer; photograph files load separately) |
| Input and weather unit tests + isolated MySQL/HTTP integration | 20 reported tests passed, 0 failed; see backend-test-output.txt |
| Real schema import | 12 events, 12 initial registrations, 5 categories |
| Core database protections | Normalized duplicate identity rejected; concurrent duplicate produces one record; invalid fractional quantity/negative amounts/date order/reference rejected; registered event cannot be deleted |
| Direct database administration | Event create/update/suspend/delete verified with SQL, changes visible through public APIs |
| Public data minimization | Registration responses omit email and phone; unused admin HTTP routes return 404 |
| Application account | SELECT plus registration INSERT; attempted event UPDATE denied |
| Event-date handling | Sydney date derivation checked at daylight-saving boundaries and UTC midnight boundaries |
| Microsoft Edge browser workflow | 12 checks passed, including distinct photographs/credits, image-failure fallback and the optional accessibility scan |
| Google Chrome browser workflow | 11 checks passed; accessibility scan not repeated in Chrome |
| Responsive layouts | Desktop 1440x1000 and mobile 390x844; no horizontal page overflow on home/search/detail/registration |
| Browser runtime | No captured page exceptions during successful suites |
| Images | All 13 local JPEG photo assets decode correctly; 10 visible cards use distinct photos, author/source credits load, failed photos use SVG fallback; desktop/mobile screenshots reviewed |
| Automated accessibility | No serious/critical axe violations in the four public pages in Edge; keyboard skip navigation checked |
| Live external weather | Event 1 returned an actual Open-Meteo forecast for 2026-10-23; a distant event returned an explicit unavailable state |

The backend integration run includes one parent test and its subtests in the runner's reported total. Counts are not claims of exhaustive coverage. Browser checks cover user flows, not individual assertions. Edge and Chrome both use Chromium; Firefox and Safari were not tested.

## Reproduction and package verification

The three whw343 packages were extracted to a fresh directory. Both API and client dependencies were reinstalled from the npm cache with `npm ci --offline`; both TypeScript/API and Angular builds passed. The extracted SQL was imported into another fresh isolated database. The extracted API served its adjacent built frontend and JavaScript assets, all 10 public event photographs and the attribution page, read 10 public events, created a registration and rejected its duplicate. All seven reproduction steps passed after the real-photograph update; see `PACKAGE-VERIFICATION.json`.

Both members' ZIP entry names and bytes were compared: they contain the same team sources. API and adminside SQL files also matched exactly. ZIP integrity checks passed and packages exclude `.env`, local credentials, node_modules and database runtime files. Offline installation used the development npm cache; another computer needs either Internet access or its own populated cache.

## Limits and remaining user actions

- Weather changes over time and needs network access; historical/far-future event forecasts are deliberately unavailable. The provider failure path is tested using an injected failing response.
- SQL trigger daylight-saving logic follows current Australia/Sydney rules; review it if rules change. MySQL versions newer than the tested 5.7.26 were not independently run.
- This is a local demonstration with fictional data, without authentication, payment or email sending. It is not configured for operating with real personal information.
- The user's later instructions remove custom web administration and cPanel; the original PDF differs. The replacement brief has not been independently read.
- No project template is filled, as requested. Any course video, individual confidential peer evaluation, course-required filename prefix, marker access and actual submission still need the members' truthful completion.
- Assistant commits do not prove two students' individual development contributions.

## Public repository and photo revision

At the user’s explicit request, GitHub visibility was changed and verified PUBLIC. Photographs were downloaded from Pexels’ original image CDN after checking original photo pages and the Pexels License. Source URLs, photographers and checksums are in the public photo manifest and PHOTO-SOURCES.md. No photo is claimed to depict an actual Harbourlight event. The seeded database and SQL image paths were updated; no event names or registration records were replaced by this migration.
