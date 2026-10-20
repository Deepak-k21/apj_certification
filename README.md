# APJ Certification replica

APJ website with the original public pages preserved and a new training catalogue, registration workflow, D1 storage and Razorpay integration. Includes 90 reference training entries from TVE and 12 APJ Foundation / Lead Implementer enquiry entries. All five existing training URLs now have content; `/training/` is the main catalogue and `/training-registration/` is the registration flow.

## Run

Requires Node.js 22.13 or later (Node 24 for the SQLite-based tests).

```sh
npm ci
npm run training:build
npm run dev
```

Open the printed local URL, normally http://127.0.0.1:5173. Run `npm run check` to validate all 46 HTML routes and `npm test` for registration/payment tests.

Build with `npm run build`. For a new local checkout, apply `drizzle/0000_big_black_knight.sql` once using the local D1 command in `PAYMENT-SETUP.md` or the Sites starter documentation. `npm start` serves the built Worker. Local preview and hosted D1 databases are separate.

## Files

- `public/`: original website pages/assets and training frontend.
- `data/catalog.json`: complete course catalogue; `data/offerings.json`: confirmed prices and sessions (currently unconfigured).
- `scripts/build-training.mjs`: renders training pages and regenerates the HTML route map.
- `lib/training-core.mjs`: registration validation, D1 persistence, Razorpay order/verification/webhook handling.
- `app/api/training/[...path]/route.ts`: hosted server endpoints.
- `db/schema.ts` and `drizzle/`: database schema and migration.
- `dist/`: generated deployment build; edit source, then rebuild.
- `PAYMENT-SETUP.md`: merchant activation and remaining live-test requirements.
- `research/IMPLEMENTATION-NOTES.md`: reference analysis and scope decisions.
- `mirror.mjs`: public-source capture script (uses curl).
- `mirror-report.json`: source inventory and download status.
- `.openai/hosting.json`: private Sites hosting configuration.

## Limits

The public website does not expose its WordPress database, administration, or email backend. Contact forms preserve the fields and validate required data. On submission they clearly state that nothing was sent and offer an email draft addressed to the site's published contact address. Actual mail delivery requires a separately configured backend.

Four ancillary plugin image URLs were unavailable at the source (two Gravatar sharing sprites and two carousel cursor/loading images). Unavailable decoration references are replaced by native CSS fallbacks; all page content images and downloadable documents are included. Original source text, including blank or minimal source pages, is preserved.

The original enquiry/contact forms remain email-draft adapters. New training registrations are stored server-side and are not sent as email automatically. Razorpay is implemented but intentionally disabled until actual course offers and merchant credentials are configured. No live gateway transaction has been verified. No third-party accreditation is asserted as APJ's own.

Do not run the old capture script over the full-stack project; it is retained for provenance only. It targets `dist/` and is no longer the application build command.
