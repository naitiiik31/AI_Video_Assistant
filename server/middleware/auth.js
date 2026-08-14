/**
 * Authentication middleware with Clerk + demo mode fallback.
 *
 * When CLERK_SECRET_KEY is not set, the app runs in "demo mode":
 * - All routes are accessible without authentication
 * - A hardcoded demo user ID is used for data isolation
 *
 * When CLERK_SECRET_KEY IS set, full Clerk authentication is enforced.
 */

const DEMO_USER_ID = "demo_user_001";
const isClerkConfigured = !!process.env.CLERK_SECRET_KEY;

let clerkMiddlewareFn = null;
let requireAuthFn = null;
let getAuthFn = null;

if (isClerkConfigured) {
  try {
    const clerkModule = await import("@clerk/express");
    clerkMiddlewareFn = clerkModule.clerkMiddleware;
    requireAuthFn = clerkModule.requireAuth;
    getAuthFn = clerkModule.getAuth;
    console.log("✅ Clerk authentication enabled");
  } catch (e) {
    console.warn("⚠️ Clerk module not available, falling back to demo mode");
  }
} else {
  console.log("⚠️ CLERK_SECRET_KEY not set — running in DEMO MODE (no authentication)");
}

/**
 * Clerk middleware — initializes Clerk on all requests.
 * In demo mode, this is a no-op passthrough.
 */
export const clerkAuth = isClerkConfigured && clerkMiddlewareFn
  ? clerkMiddlewareFn()
  : (req, res, next) => next();

/**
 * requireAuth middleware — returns 401 if no authenticated user.
 * In demo mode, this is a no-op passthrough.
 */
export const protectRoute = isClerkConfigured && requireAuthFn
  ? requireAuthFn()
  : (req, res, next) => next();

/**
 * Extract the authenticated user's Clerk ID from the request.
 * In demo mode, returns a fixed demo user ID.
 */
export const getUserId = (req) => {
  if (isClerkConfigured && getAuthFn) {
    const auth = getAuthFn(req);
    return auth?.userId || null;
  }
  return DEMO_USER_ID;
};
