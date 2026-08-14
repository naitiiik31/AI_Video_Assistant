import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { setGetToken } from './services/api';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import AnalyzeVideo from './pages/AnalyzeVideo';
import VideoDetail from './pages/VideoDetail';
import MyVideos from './pages/MyVideos';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// ─── Toast Config ───────────────────────────────────────────────────
const toastOptions = {
  duration: 4000,
  style: {
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    fontSize: '0.875rem',
  },
};

// ─── Clerk-Aware Wrappers ───────────────────────────────────────────
// These are safe stubs when Clerk is not configured.

let ClerkProviderWrapper = ({ children }) => <>{children}</>;
let ProtectedRoute = ({ children }) => <>{children}</>;
let AuthSyncWrapper = ({ children }) => <>{children}</>;

if (clerkPubKey) {
  // When Clerk is configured, dynamically attach the real providers.
  // The actual Clerk modules are imported at the top of specific pages
  // (SignIn.jsx, SignUp.jsx) which will error gracefully.
  // Here we use the globally imported module:
  const clerkModule = await import('@clerk/clerk-react');
  const { ClerkProvider, SignedIn, SignedOut, useAuth } = clerkModule;

  ClerkProviderWrapper = ({ children }) => (
    <ClerkProvider publishableKey={clerkPubKey}>{children}</ClerkProvider>
  );

  ProtectedRoute = ({ children }) => (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
    </>
  );

  // AuthSync injects the Clerk token into the API layer
  AuthSyncWrapper = ({ children }) => {
    const { getToken } = useAuth();
    setGetToken(getToken);
    return <>{children}</>;
  };
}

function App() {
  return (
    <ClerkProviderWrapper>
      <ThemeProvider>
        <BrowserRouter>
          <AuthSyncWrapper>
            <Toaster position="top-right" toastOptions={toastOptions} />

            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route
                path="/sign-in/*"
                element={clerkPubKey ? <SignIn /> : <Navigate to="/dashboard" replace />}
              />
              <Route
                path="/sign-up/*"
                element={clerkPubKey ? <SignUp /> : <Navigate to="/dashboard" replace />}
              />

              {/* Protected routes — wrapped in AppLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analyze" element={<AnalyzeVideo />} />
                <Route path="/my-videos" element={<MyVideos />} />
                <Route path="/videos/:id" element={<VideoDetail />} />
                <Route path="/settings" element={<Dashboard />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthSyncWrapper>
        </BrowserRouter>
      </ThemeProvider>
    </ClerkProviderWrapper>
  );
}

export default App;
