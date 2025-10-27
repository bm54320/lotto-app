import { auth } from "express-openid-connect";
import { expressjwt as jwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import dotenv from "dotenv";

/**
 * Auth helpers:
 *  - `oidc` — session based login for browser routes (views)
 *  - `requireM2M` — validates Auth0 M2M access token (RS256)
 *  - `ensureScope(scope)` — additionally checks a required scope
 */
dotenv.config();

if (!process.env.AUTH0_SECRET) {
  throw new Error("Missing AUTH0_SECRET in .env");
}
if (!process.env.AUTH0_ISSUER_BASE_URL) {
  throw new Error("Missing AUTH0_ISSUER_BASE_URL in .env");
}
if (!process.env.AUTH0_CLIENT_ID) {
  throw new Error("Missing AUTH0_CLIENT_ID in .env");
}
if (!process.env.AUTH0_CLIENT_SECRET) {
  throw new Error("Missing AUTH0_CLIENT_SECRET in .env");
}
if (!process.env.AUTH0_AUDIENCE) {
  throw new Error("Missing AUTH0_AUDIENCE in .env");
}

export const oidc = auth({
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET!,
  baseURL: process.env.AUTH0_BASE_URL ?? "https://lotto-app-f696.onrender.com/",
  clientID: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
  routes: {
    callback: "/callback",
    login: "/login",
    logout: "/logout",
    postLogoutRedirect: "/"
  }
});

export const requireM2M = jwt({
  // Validate access tokens issued by Auth0 (M2M)
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}/.well-known/jwks.json`,
  }) as any,
  audience: process.env.AUTH0_AUDIENCE!,
  issuer: `${process.env.AUTH0_ISSUER_BASE_URL}/`,
  algorithms: ["RS256"],
}).unless({ path: ["/"] });

export function ensureScope(scope: string) {
  return (req: any, res: any, next: any) => {
    const scopes = (req.auth?.payload?.scope as string | undefined)?.split(" ") ?? [];
    if (!scopes.includes(scope)) return res.status(403).json({ error: "insufficient_scope" });
    next();
  };
}
