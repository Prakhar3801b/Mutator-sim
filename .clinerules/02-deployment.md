# Deployment Rules

## Deployment Architecture

The intended production architecture is:

- Frontend → Vercel
- Backend → Render

## Before Deployment

Verify:

- Frontend framework and build configuration
- Backend framework and start command
- Frontend environment variables
- Backend environment variables
- Production API URL
- CORS configuration
- Database connectivity
- Production port configuration
- Frontend-to-backend communication
- Build and runtime dependencies

## Environment Variables

- Never expose secret values.
- Never print `.env` contents.
- Never commit `.env` files.
- Use platform environment-variable settings for production secrets.
- Frontend variables must only contain values that are safe to expose to the browser.
- Backend secrets must remain server-side.

## Production URLs

- Do not leave localhost URLs in production configuration.
- Do not replace development URLs blindly.
- Verify that the frontend points to the deployed backend.
- Verify that the backend allows requests from the deployed frontend.

## Deployment Changes

Before modifying deployment configuration:

1. Inspect the existing configuration.
2. Explain the required changes.
3. Make the smallest necessary changes.
4. Test locally where possible.
5. Verify the production configuration.

## Safety

Never:

- Delete production data.
- Delete the database.
- Commit credentials.
- Disable security controls merely to make deployment work.
- Replace working configuration without understanding its purpose.