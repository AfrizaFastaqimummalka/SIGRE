import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = (
  process.env.DJANGO_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

const refreshTokenPromises = new Map();

function getJwtExpiration(jwt) {
  const payload = JSON.parse(
    Buffer.from(jwt.split(".")[1], "base64url").toString("utf8")
  );

  if (!payload.exp) {
    throw new Error("JWT tidak memiliki claim exp");
  }

  return Number(payload.exp) * 1000;
}

async function refreshAccessToken(token) {
  const oldRefresh = token.refreshToken;

  if (!oldRefresh) {
    return { ...token, error: "RefreshTokenMissing" };
  }

  if (refreshTokenPromises.has(oldRefresh)) {
    const newTokens = await refreshTokenPromises.get(oldRefresh);
    if (newTokens.error) return { ...token, error: newTokens.error };
    return { ...token, ...newTokens };
  }

  const promise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: oldRefresh }),
        cache: "no-store",
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(`Refresh token gagal (${res.status}): ${message}`);
      }

      const refreshedTokens = await res.json();

      return {
        accessToken: refreshedTokens.access,
        accessTokenExpires: getJwtExpiration(refreshedTokens.access),
        refreshToken: refreshedTokens.refresh ?? oldRefresh,
        error: undefined,
      };
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return { error: "RefreshTokenExpired" };
    } finally {
      setTimeout(() => refreshTokenPromises.delete(oldRefresh), 10000);
    }
  })();

  refreshTokenPromises.set(oldRefresh, promise);

  const result = await promise;
  if (result.error) return { ...token, error: result.error };
  return { ...token, ...result };
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Username atau Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const identifier = credentials?.identifier?.trim();
        const password = credentials?.password;

        if (!identifier || !password) return null;

        try {
          const res = await fetch(`${API_URL}/api/auth/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password }),
            cache: "no-store",
          });

          if (!res.ok) {
            const message = await res.text();
            console.error(`Login Django gagal (${res.status}): ${message}`);
            return null;
          }

          const data = await res.json();

          if (!data?.access || !data?.refresh || !data?.user) {
            console.error("Respons login Django tidak lengkap.");
            return null;
          }

          return {
            id: data.user.id,
            name: data.user.nama_lengkap,
            email: data.user.email,
            nama_lengkap: data.user.nama_lengkap,
            accessToken: data.access,
            refreshToken: data.refresh,
            accessTokenExpires: getJwtExpiration(data.access),
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nama_lengkap = user.nama_lengkap;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        token.error = undefined;
        return token;
      }

      // Sesi belum pernah login. Jangan mencoba refresh token undefined.
      if (
        !token.accessToken ||
        !token.refreshToken ||
        !token.accessTokenExpires
      ) {
        return token;
      }

      if (Date.now() < Number(token.accessTokenExpires) - 60000) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.nama_lengkap = token.nama_lengkap;
      }

      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return new URL(url, baseUrl).toString();

      try {
        const target = new URL(url);
        const base = new URL(baseUrl);
        if (target.origin === base.origin) return url;
      } catch {
        // Gunakan baseUrl jika URL tidak valid.
      }

      return baseUrl;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 0,
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
