import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // L-01: Security headers applied to all routes.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://unpkg.com",
              "img-src 'self' data: blob: http://localhost:8000 http://127.0.0.1:8000 https://unpkg.com https://*.tile.openstreetmap.org",
              "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
              "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 https://nominatim.openstreetmap.org",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;