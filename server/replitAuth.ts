import GoogleStrategy from "passport-google-oauth20";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Environment variables GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required");
}

if (!process.env.APP_DOMAINS) {
  throw new Error("Environment variable APP_DOMAINS not provided");
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Helper function to upsert user from Google profile
async function upsertUserFromGoogle(profile: any) {
  const googleId = `google_${profile.id}`;
  await storage.upsertUser({
    id: googleId,
    email: profile.emails?.[0]?.value || '',
    firstName: profile.name?.givenName || '',
    lastName: profile.name?.familyName || '',
    profileImageUrl: profile.photos?.[0]?.value || '',
  });
  return googleId;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Setup Google OAuth Strategy
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const callbackURL = process.env.NODE_ENV === 'production'
    ? `https://${process.env.APP_DOMAINS!.split(",")[0]}/api/callback/google`
    : `http://${process.env.APP_DOMAINS!.split(",")[0]}/api/callback/google`;

  const googleStrategy = new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userId = await upsertUserFromGoogle(profile);
        const user = {
          id: userId,
          email: profile.emails?.[0]?.value,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          profileImageUrl: profile.photos?.[0]?.value,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: Date.now() + 3600 * 1000, // 1 hour from now
        };
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  );
  passport.use('google', googleStrategy);

  // Google OAuth routes
  app.get("/api/login", (req, res, next) => {
    passport.authenticate('google', {
      scope: ["profile", "email"],
    })(req, res, next);
  });

  app.get("/api/callback/google", (req, res, next) => {
    passport.authenticate('google', {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if token has expired
  if (user.expires_at && Date.now() > user.expires_at) {
    return res.status(401).json({ message: "Session expired, please login again" });
  }

  return next();
};
