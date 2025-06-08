import { writable, derived } from 'svelte/store';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { 
  isAuthenticated as blueskyIsAuthenticated, 
  resumeSessionFromDatabase, 
  initBlueskyAgent,
  currentSession,
  sessionError
} from '$lib/auth/bluesky';

// Re-export for convenience
export { isAuthenticated } from '$lib/auth/bluesky';
import { initDatabase } from '$lib/database';

export const authInitialized = writable(false);
export const authLoading = writable(true);

// Derived store to determine if user should be redirected to login
export const shouldRedirectToLogin = derived(
  [blueskyIsAuthenticated, authInitialized],
  ([authenticated, initialized]) => initialized && !authenticated
);

// Derived store to determine if user should be redirected to home
export const shouldRedirectToHome = derived(
  [blueskyIsAuthenticated, authInitialized],
  ([authenticated, initialized]) => initialized && authenticated
);

export const initAuth = async (): Promise<void> => {
  try {
    authLoading.set(true);
    
    // Initialize database first
    await initDatabase();
    
    // Initialize Bluesky agent with default server
    initBlueskyAgent();
    
    // Try to resume session from database
    const sessionResumed = await resumeSessionFromDatabase();
    
    if (!sessionResumed) {
      // No valid session found, user needs to login
      blueskyIsAuthenticated.set(false);
    }
    
    authInitialized.set(true);
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    blueskyIsAuthenticated.set(false);
    authInitialized.set(true);
  } finally {
    authLoading.set(false);
  }
};

export const requireAuth = (): void => {
  const unsubscribe = shouldRedirectToLogin.subscribe((shouldRedirect) => {
    if (shouldRedirect) {
      goto('/login', { replaceState: true });
    }
  });
  
  // Clean up subscription after first check
  setTimeout(() => unsubscribe(), 0);
};

export const redirectIfAuthenticated = (): void => {
  const unsubscribe = shouldRedirectToHome.subscribe((shouldRedirect) => {
    if (shouldRedirect) {
      goto('/', { replaceState: true });
    }
  });
  
  // Clean up subscription after first check
  setTimeout(() => unsubscribe(), 0);
};

// Auth guard for protecting routes
export const authGuard = {
  requireAuth: () => {
    return derived(
      [blueskyIsAuthenticated, authInitialized],
      ([authenticated, initialized]) => {
        if (!initialized) {
          return { allowed: false, loading: true };
        }
        
        if (!authenticated) {
          goto('/login', { replaceState: true });
          return { allowed: false, loading: false };
        }
        
        return { allowed: true, loading: false };
      }
    );
  },
  
  redirectIfAuthenticated: () => {
    return derived(
      [blueskyIsAuthenticated, authInitialized],
      ([authenticated, initialized]) => {
        if (!initialized) {
          return { shouldRedirect: false, loading: true };
        }
        
        if (authenticated) {
          goto('/', { replaceState: true });
          return { shouldRedirect: true, loading: false };
        }
        
        return { shouldRedirect: false, loading: false };
      }
    );
  }
};

// Session error handling
sessionError.subscribe((error) => {
  if (error && error.includes('セッション')) {
    // Session expired or invalid, redirect to login
    goto('/login?error=session_expired', { replaceState: true });
  }
});