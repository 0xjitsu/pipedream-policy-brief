# Security Policy

## Reporting

This project handles only public policy data and free public-API content.
Blast radius for any vulnerability is small, but disclosures are still
welcome.

Send reports to **bernadettemisa403@gmail.com** with subject prefix
`[Pipedream Policy Brief — Security]`.

Best-effort response time: 7 days. Best-effort fix time: 30 days.
No bounty program — this is a public-good project.

## In scope

- Authentication bypass on `/api/daily/refresh` or other cron endpoints
- Secret leakage in client bundle or API responses
- Cross-site scripting in news feed, narrative, or any user-rendered content
- Supply-chain vulnerabilities in npm dependencies
- Server-side request forgery in scraper fallbacks

## Out of scope

- Inaccuracy of scraped data (use the source citation linked in each card)
- Lighthouse score deficits
- Third-party API rate-limit responses
- Theoretical issues with no reproducible exploit

## Coordinated disclosure

Please give us a reasonable window to fix before public disclosure. We
will credit reporters who request it in the CHANGELOG.

## Dependencies

`npm audit` runs on every CI build. We patch high/critical vulnerabilities
in the same week they're disclosed.
