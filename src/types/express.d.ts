import { User } from "express-openid-connect";

declare global {
  namespace Express {
    interface Request {
      oidc?: {
        user?: User;
        isAuthenticated?: () => boolean;
      };
    }
  }
}

