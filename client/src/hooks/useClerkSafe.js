/**
 * Safe wrappers around Clerk hooks for demo mode compatibility.
 *
 * When VITE_CLERK_PUBLISHABLE_KEY is not set, these hooks return
 * sensible demo defaults so components don't crash.
 *
 * When Clerk IS configured, these delegate to the real Clerk hooks.
 */

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Demo user fallback
const DEMO_USER = {
  firstName: 'Demo',
  fullName: 'Demo User',
  imageUrl: null,
  primaryEmailAddress: { emailAddress: 'demo@example.com' },
};

let realUseUser, realUseAuth, realUseClerk;

if (clerkPubKey) {
  const clerk = await import('@clerk/clerk-react');
  realUseUser = clerk.useUser;
  realUseAuth = clerk.useAuth;
  realUseClerk = clerk.useClerk;
}

export function useSafeUser() {
  if (clerkPubKey && realUseUser) {
    return realUseUser();
  }
  return { user: DEMO_USER, isLoaded: true, isSignedIn: true };
}

export function useSafeAuth() {
  if (clerkPubKey && realUseAuth) {
    return realUseAuth();
  }
  return { isSignedIn: true, isLoaded: true, getToken: async () => null };
}

export function useSafeClerk() {
  if (clerkPubKey && realUseClerk) {
    return realUseClerk();
  }
  return { signOut: async () => { window.location.href = '/'; } };
}
