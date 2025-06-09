import { AtpAgent, type AtpSessionEvent, type AtpSessionData } from '@atproto/api';
import { writable, get } from 'svelte/store';
import { t } from '$lib/i18n';
import { getDatabase, type BlueskyAccount } from '$lib/database';
import { logger } from '$lib/utils/logger.js';

export interface LoginCredentials {
  server: string;
  handle: string;
  appPassword: string;
}

export interface BlueskySession {
  accessJwt: string;
  refreshJwt: string;
  handle: string;
  did: string;
  email?: string;
  emailConfirmed?: boolean;
  emailAuthFactor?: boolean;
  active?: boolean;
  status?: string;
}

export interface BlueskyUser {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  labels?: any[];
  createdAt?: string;
}

export const currentSession = writable<BlueskySession | null>(null);
export const currentUser = writable<BlueskyUser | null>(null);
export const isAuthenticated = writable<boolean>(false);
export const sessionError = writable<string | null>(null);

let agent: AtpAgent | null = null;
let sessionRefreshTimer: NodeJS.Timeout | null = null;

export const getAgent = (): AtpAgent => {
  if (!agent) {
    throw new Error('Bluesky agent not initialized');
  }
  return agent;
};

export const initBlueskyAgent = (server: string = 'https://bsky.social') => {
  agent = new AtpAgent({
    service: server,
    persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
      if (evt === 'create' || evt === 'update') {
        if (sess) {
          updateSessionInDatabase(sess);
        }
      }
    },
  });
  return agent;
};

const updateSessionInDatabase = async (session: AtpSessionData) => {
  try {
    const db = getDatabase();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now
    
    await db.execute(`
      UPDATE bluesky_accounts 
      SET access_jwt = ?, refresh_jwt = ?, session_expires_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE did = ?
    `, [session.accessJwt, session.refreshJwt, expiresAt, session.did]);
    
    currentSession.set({
      accessJwt: session.accessJwt,
      refreshJwt: session.refreshJwt,
      handle: session.handle,
      did: session.did,
      email: session.email,
      active: session.active
    });
    
    scheduleSessionRefresh();
  } catch (error) {
    logger.error('Failed to update session in database', error);
  }
};

export const loginWithCredentials = async (credentials: LoginCredentials): Promise<boolean> => {
  try {
    logger.info('🔐 Starting login attempt', {
      server: credentials.server,
      handle: credentials.handle,
      passwordLength: credentials.appPassword.length,
      timestamp: new Date().toISOString()
    });
    
    sessionError.set(null);
    
    if (!agent) {
      logger.info('📡 Initializing Bluesky agent with server', { server: credentials.server });
      initBlueskyAgent(credentials.server);
    }
    
    logger.info('🚀 Attempting to login with credentials');
    const response = await agent!.login({
      identifier: credentials.handle,
      password: credentials.appPassword,
    });
    
    logger.info('📨 Login response received', {
      success: response.success,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : []
    });
    
    if (response.success && response.data) {
      const session = response.data;
      logger.info('✅ Login successful, session data', {
        handle: session.handle,
        did: session.did,
        hasAccessJwt: !!session.accessJwt,
        hasRefreshJwt: !!session.refreshJwt,
        active: session.active
      });
      
      logger.info('👤 Fetching user profile');
      const profile = await agent!.getProfile({ actor: session.did });
      logger.info('📋 Profile fetched', {
        handle: profile.data.handle,
        displayName: profile.data.displayName,
        hasAvatar: !!profile.data.avatar
      });
      
      logger.info('💾 Saving account to database');
      await saveAccountToDatabase({
        handle: session.handle,
        did: session.did,
        server: credentials.server,
        access_jwt: session.accessJwt,
        refresh_jwt: session.refreshJwt,
        avatar_url: profile.data.avatar,
        is_current: true,
        session_expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      logger.info('💾 Account saved to database successfully');
      
      currentSession.set({
        accessJwt: session.accessJwt,
        refreshJwt: session.refreshJwt,
        handle: session.handle,
        did: session.did,
        email: session.email,
        active: session.active
      });
      
      currentUser.set({
        did: profile.data.did,
        handle: profile.data.handle,
        displayName: profile.data.displayName,
        description: profile.data.description,
        avatar: profile.data.avatar,
        banner: profile.data.banner,
        followersCount: profile.data.followersCount,
        followsCount: profile.data.followsCount,
        postsCount: profile.data.postsCount,
        createdAt: profile.data.createdAt
      });
      
      isAuthenticated.set(true);
      scheduleSessionRefresh();
      
      logger.info('🎉 Login process completed successfully');
      return true;
    }
    
    logger.warn('❌ Login failed: Response not successful or missing data');
    return false;
  } catch (error: any) {
    logger.error('💥 Login failed with error', {
      name: error.name,
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      headers: error.headers,
      stack: error.stack,
      fullError: error
    });
    
    // より詳細なエラーメッセージを設定
    let errorMessage = get(t)('auth.error.loginFailed');
    if (error.status === 401) {
      errorMessage = get(t)('auth.error.invalidCredentials');
    } else if (error.status === 400) {
      errorMessage = get(t)('auth.error.badRequest');
    } else if (error.status === 429) {
      errorMessage = get(t)('auth.error.tooManyRequests');
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = get(t)('auth.error.networkError');
    } else if (error.message) {
      errorMessage = get(t)('auth.error.generic', { message: error.message });
    }
    
    sessionError.set(errorMessage);
    return false;
  }
};

export const resumeSessionFromDatabase = async (): Promise<boolean> => {
  try {
    const db = getDatabase();
    const accounts = await db.select<BlueskyAccount[]>(`
      SELECT * FROM bluesky_accounts 
      WHERE is_current = 1 
      ORDER BY updated_at DESC 
      LIMIT 1
    `);
    
    if (accounts.length === 0) {
      return false;
    }
    
    const account = accounts[0];
    const expiresAt = new Date(account.session_expires_at);
    const now = new Date();
    
    if (expiresAt <= now) {
      // Session expired, try to refresh
      return await refreshSession(account);
    }
    
    // Session still valid, initialize agent and resume session
    initBlueskyAgent(account.server);
    await agent!.resumeSession({
      accessJwt: account.access_jwt,
      refreshJwt: account.refresh_jwt,
      handle: account.handle,
      did: account.did,
      active: true
    });
    
    const profile = await agent!.getProfile({ actor: account.did });
    
    currentSession.set({
      accessJwt: account.access_jwt,
      refreshJwt: account.refresh_jwt,
      handle: account.handle,
      did: account.did,
      active: true
    });
    
    currentUser.set({
      did: profile.data.did,
      handle: profile.data.handle,
      displayName: profile.data.displayName,
      description: profile.data.description,
      avatar: profile.data.avatar,
      banner: profile.data.banner,
      followersCount: profile.data.followersCount,
      followsCount: profile.data.followsCount,
      postsCount: profile.data.postsCount,
      createdAt: profile.data.createdAt
    });
    
    isAuthenticated.set(true);
    scheduleSessionRefresh();
    
    return true;
  } catch (error) {
    logger.error('Failed to resume session', error);
    sessionError.set(get(t)('auth.error.sessionRestoreFailed'));
    return false;
  }
};

export const refreshSession = async (account?: BlueskyAccount): Promise<boolean> => {
  try {
    if (!agent && account) {
      initBlueskyAgent(account.server);
      await agent!.resumeSession({
        accessJwt: account.access_jwt,
        refreshJwt: account.refresh_jwt,
        handle: account.handle,
        did: account.did,
        active: true
      });
    }
    
    if (!agent?.session) {
      return false;
    }
    
    const response = await agent.com.atproto.server.refreshSession();
    
    if (response.success && response.data) {
      // Session updated automatically via persistSession callback
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Session refresh failed', error);
    sessionError.set(get(t)('auth.error.sessionRefreshFailed'));
    await logout();
    return false;
  }
};

const scheduleSessionRefresh = () => {
  if (sessionRefreshTimer) {
    clearTimeout(sessionRefreshTimer);
  }
  
  // Refresh 30 minutes before expiration (1.5 hours from now)
  sessionRefreshTimer = setTimeout(() => {
    refreshSession();
  }, 90 * 60 * 1000);
};

export const logout = async () => {
  try {
    if (agent?.session) {
      const db = getDatabase();
      await db.execute('UPDATE bluesky_accounts SET is_current = 0 WHERE did = ?', [agent.session.did]);
    }
    
    if (sessionRefreshTimer) {
      clearTimeout(sessionRefreshTimer);
      sessionRefreshTimer = null;
    }
    
    agent = null;
    currentSession.set(null);
    currentUser.set(null);
    isAuthenticated.set(false);
    sessionError.set(null);
  } catch (error) {
    logger.error('Logout failed', error);
  }
};

const saveAccountToDatabase = async (account: Omit<BlueskyAccount, 'id'>) => {
  try {
    logger.info('💾 Starting database save operation');
    const db = getDatabase();
    
    logger.info('🔄 Setting all other accounts as not current');
    await db.execute('UPDATE bluesky_accounts SET is_current = 0');
    
    logger.info('💾 Inserting/updating account in database', {
      handle: account.handle,
      did: account.did,
      server: account.server,
      hasJwt: !!account.access_jwt,
      isCurrent: account.is_current
    });
    
    await db.execute(`
      INSERT OR REPLACE INTO bluesky_accounts 
      (handle, did, server, access_jwt, refresh_jwt, avatar_url, is_current, session_expires_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      account.handle,
      account.did,
      account.server,
      account.access_jwt,
      account.refresh_jwt,
      account.avatar_url,
      account.is_current ? 1 : 0,
      account.session_expires_at,
      account.created_at,
      account.updated_at
    ]);
    
    logger.info('✅ Account saved to database successfully');
  } catch (error) {
    logger.error('❌ Failed to save account to database', error);
    throw error;
  }
};

export const getAllAccounts = async (): Promise<BlueskyAccount[]> => {
  const db = getDatabase();
  return await db.select<BlueskyAccount[]>('SELECT * FROM bluesky_accounts ORDER BY updated_at DESC');
};

export const switchToAccount = async (did: string): Promise<boolean> => {
  try {
    const db = getDatabase();
    const accounts = await db.select<BlueskyAccount[]>('SELECT * FROM bluesky_accounts WHERE did = ?', [did]);
    
    if (accounts.length === 0) {
      return false;
    }
    
    const account = accounts[0];
    
    // Set all accounts as not current
    await db.execute('UPDATE bluesky_accounts SET is_current = 0');
    
    // Set this account as current
    await db.execute('UPDATE bluesky_accounts SET is_current = 1 WHERE did = ?', [did]);
    
    // Resume session
    return await resumeSessionFromDatabase();
  } catch (error) {
    logger.error('Failed to switch account', error);
    return false;
  }
};