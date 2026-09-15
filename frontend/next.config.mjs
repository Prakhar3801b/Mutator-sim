/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Backend origin is injected per environment:
    //  - Production (Vercel): BACKEND_ORIGIN=https://<render-service>.onrender.com
    //  - Local development:   falls back to http://localhost:8000
    const backendOrigin = process.env.BACKEND_ORIGIN;

    // Per deployment rules: never leave localhost URLs in production config.
    // Fail the production build loudly instead of silently proxying to localhost.
    if (!backendOrigin) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "BACKEND_ORIGIN is not set. Set it to the deployed backend URL " +
            "(e.g. https://<render-service>.onrender.com) in the Vercel " +
            "project environment variables (Production AND Preview)."
        );
      }
      console.warn(
        "BACKEND_ORIGIN not set — falling back to http://localhost:8000 for local development."
      );
    }

    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin || "http://localhost:8000"}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
