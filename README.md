# APJ Certification replica

Faithful static capture of http://www.apjcertification.com/ on 19 October 2026.
Preserves all 44 discovered public pages, original Twenty Twenty-One styles, navigation, logos, images, partner carousel, and two application PDFs. Internal navigation and assets are local.

## Run

Requires Node.js 18 or later. No dependencies to install.

```sh
npm start
```

Open http://127.0.0.1:4173. Run `npm run check` to check local page references.

## Files

- `dist/`: complete static website; editable HTML, CSS, JS, images and PDFs.
- `mirror.mjs`: public-source capture script (uses curl).
- `mirror-report.json`: source inventory and download status.
- `.openai/hosting.json`: private Sites hosting configuration.

## Limits

The public website does not expose its WordPress database, administration, or email backend. Contact forms preserve the fields and validate required data. On submission they clearly state that nothing was sent and offer an email draft addressed to the site's published contact address. Actual mail delivery requires a separately configured backend.

Four ancillary plugin image URLs were unavailable at the source (two Gravatar sharing sprites and two carousel cursor/loading images). Unavailable decoration references are replaced by native CSS fallbacks; all page content images and downloadable documents are included. Original source text, including blank or minimal source pages, is preserved.

Do not run the capture script over edited content without a backup: it refreshes captured files. The form adapter and local refinements should be retained after any future refresh.
