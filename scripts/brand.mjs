export function brandPage(html) {
  return html.replace(/<img\b[^>]*src=["']\/wp-content\/uploads\/2022\/12\/apjcert-logo\.png["'][^>]*>/g,
    '<img width="400" height="88" src="/brand/apj-logo.svg" class="custom-logo" alt="APJ Certification — Assurance through expertise" decoding="async">')
    .replace(/<link\b[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>/g, '')
    .replace(/<link rel="stylesheet" href="\/brand\/brand.css">/g, '')
    .replace('</head>', '<link rel="icon" type="image/svg+xml" href="/brand/favicon.svg"><link rel="stylesheet" href="/brand/brand.css"></head>');
}
