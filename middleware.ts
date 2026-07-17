import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// M-02: In-memory rate limiter — 5 POST attempts per IP per 60 seconds.
// Uses a Map keyed by IP storing an array of request timestamps.
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds
const RATE_LIMIT_MAX = 5;               // max attempts per window

const rateLimitStore = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Get existing timestamps for this IP, filter out expired ones
  const timestamps = (rateLimitStore.get(ip) ?? []).filter(
    (ts) => ts > windowStart
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    // Still over limit — persist the pruned list and reject
    rateLimitStore.set(ip, timestamps);
    return true;
  }

  // Record this attempt and allow
  timestamps.push(now);
  rateLimitStore.set(ip, timestamps);
  return false;
}

// Inner auth guard (applied after the rate-limit check passes)
const authMiddleware = withAuth({
  pages: {
    signIn: "/login",
  },
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Apply rate limit only to the credentials login endpoint
  if (
    pathname === "/api/auth/callback/credentials" &&
    req.method === "POST"
  ) {
    // Prefer the real client IP forwarded by Cloudflare/proxy
    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  // Fall through to the NextAuth protection guard for all other routes
  return (authMiddleware as any)(req, {} as any);
}

// 🔥 protect semua route KECUALI login, landing, laporan publik, infografis laporan, dan root path (/)
export const config = {
  matcher: ["/((?!api|_next|favicon.ico|image|images|assets|landing|laporan-masyarakat|infografis-laporan|$).*)"],
};
