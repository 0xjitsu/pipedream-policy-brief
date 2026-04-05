# Contributing to Pipedream Policy Brief

Thank you for your interest in contributing. This dashboard tracks the Philippine
energy crisis and informs policy recommendations for government officials.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<you>/mbc_policy_brief.git`
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`
5. Create a feature branch: `git checkout -b feature/your-feature`

## Development Guidelines

- Read `CLAUDE.md` for project conventions and architecture
- All source URLs must link to specific pages, not generic homepages
- Use Unicode characters directly — never `\uXXXX` escape sequences
- Test your build: `npm run build` must pass clean before submitting a PR
- PRs should target the `test` branch, not `main` (unless hotfix)

## Data Contributions

The most impactful contributions are:
- **Verified source URLs** for claims that currently lack specific citations
- **Gas station status data** from DOE weekly reports or citizen observations
- **API integrations** for real-time fuel price or station availability data
- **Translations** (Filipino/Tagalog localization)

## Code Style

- TypeScript strict mode
- Tailwind CSS for all styling (no inline styles)
- Data files in `src/data/` — keep content separate from render logic
- Follow existing patterns in `src/components/sections/` for new sections

## Contributor License Agreement (CLA)

By submitting a pull request, you agree to the following:

1. You grant the maintainer (0xjitsu) a perpetual, worldwide, non-exclusive,
   royalty-free license to use, reproduce, modify, and distribute your
   contributions under any license.
2. You confirm that you have the right to grant this license.
3. This CLA enables dual-licensing: open source (AGPL v3) for community use,
   and commercial licensing for proprietary/enterprise use.

## Reporting Issues

- **Broken source links**: Open an issue with the URL and what it should point to
- **Data corrections**: Open an issue with the correct data and its source
- **Feature requests**: Open an issue describing the use case
- **Security**: Email directly — do not open a public issue
