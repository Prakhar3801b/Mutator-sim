# Project Development Rules

## Existing Codebase

- Treat the existing codebase as the source of truth.
- Inspect existing implementations before creating new ones.
- Preserve working functionality.
- Avoid unnecessary rewrites.
- Reuse existing components, utilities and services where appropriate.
- Follow the existing technology stack and architecture.

## Changes

Before making significant changes:

1. Explain what needs to change.
2. Identify the affected files.
3. Make the smallest appropriate change.
4. Verify that existing functionality is preserved.

## Dependencies

- Do not install unnecessary dependencies.
- Check whether existing dependencies already provide the required functionality.
- Do not replace frameworks or major libraries without justification.

## Security

- Never expose API keys, passwords, tokens or credentials.
- Never print the contents of `.env` files.
- Never commit secrets.
- Do not expose database credentials.
- Do not hard-code production secrets.

## Testing

After significant changes:

- Run the relevant tests.
- Run the build when appropriate.
- Check for TypeScript/type errors where applicable.
- Check for lint errors where applicable.
- Fix errors rather than hiding them.

## Communication

For major changes:

- Explain what you intend to change before doing it.
- Identify risks or assumptions.
- If requirements are ambiguous, ask rather than inventing major behavior.