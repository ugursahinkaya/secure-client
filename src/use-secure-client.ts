import { SecureClient } from "./secure-client";
import { useNativeBridge } from "@ugursahinkaya/native-bridge";
import type { OperationsRecord } from "@ugursahinkaya/shared-types";
import type {
  SecureClientAPI,
  LoginState,
  LoginResponse,
  UserData,
  StateListener,
  NativeEvents,
  JsEvents,
  State
} from "./types";

/**
 * useSecureClient - Composable for E2E encrypted client with state management
 * Combines HTTP client, auth, state, and native bridge communication
 * 
 * @template TOperations - Process name to return type mapping
 * @example
 * type MyOperations = {
 *   'get-user': UserData;
 *   'save-settings': { success: boolean };
 * };
 * const client = useSecureClient<MyOperations>();
 * const user = await client.call('get-user', {});
 */
export function useSecureClient<TOperations extends Record<string, any> = Record<string, any>>(): SecureClientAPI<TOperations> {
  // Singleton state
  if (!state.initialized) {
    initializeState();
  }

  return {
    subscribe,
    getState,
    init,
    login,
    logout,
    call: call as <K extends keyof TOperations>(process: K, data: any) => Promise<TOperations[K]>,
    fetch: apiCall,
    dispatchEvent,
    setHostElement
  };
}

// ============================================================================
// State Management
// ============================================================================



const state: State = {
  client: null,
  listeners: new Set(),
  bridge: null,
  refreshToken: undefined,
  initialized: false,
  loading: false,
  error: '',
  token: undefined,
  success: false,
  isReady: false,
  loggedIn: false,
  userData: undefined,
  hostElement: null
};

function initializeState(): void {
  if (state.initialized) {
    return; // Prevent duplicate initialization
  }
  
  state.bridge = useNativeBridge<NativeEvents, JsEvents>();
  
  // Handle refresh token from native
  state.bridge.on('refresh-token-value', ({ token }) => {
    state.refreshToken = token;
  });

  // Handle client initialization from native
  state.bridge.on('init-secure-auth', ({ domain, token }) => {
    init(domain, token);
  });

  state.initialized = true;
}

function updateState(updates: Partial<State>): void {
  Object.assign(state, updates);
  state.listeners.forEach(fn => {
    try {
      fn(getState());
    } catch (error) {
      console.error('Error in state listener:', error);
    }
  });
}

function getState(): LoginState {
  const { client, listeners, bridge, refreshToken, initialized, domain, token, ...loginState } = state;
  return { ...loginState };
}

function subscribe(fn: StateListener): () => void {
  state.listeners.add(fn);
  fn(getState());
  return () => state.listeners.delete(fn);
}

// ============================================================================
// Native Bridge
// ============================================================================

function sendToNative<K extends keyof JsEvents>(event: K, payload: JsEvents[K]): void {
  if (!state.bridge) {
    console.warn(`Cannot send event '${String(event)}': Native bridge not initialized`);
    return;
  }
  state.bridge.send(event, payload);
}

// ============================================================================
// Event Dispatching
// ============================================================================

function dispatchEvent(name: keyof JsEvents, detail: any): void {
  // Dispatch to DOM
  if (state.hostElement) {
    try {
      const event = new CustomEvent(name, { detail, bubbles: true, composed: true });
      state.hostElement.dispatchEvent(event);
    } catch (error) {
      console.error(`Failed to dispatch event '${String(name)}':`, error);
    }
  }

  // Dispatch to native
  try {
    sendToNative(name, detail);
  } catch (error) {
    console.error(`Failed to send to native '${String(name)}':`, error);
  }
}

function setHostElement(element: HTMLElement | null): void {
  updateState({ hostElement: element });
}

// ============================================================================
// Client Operations
// ============================================================================

function init(domain: string, token: string): void {
  if (state.client) {
    return;
  }

  if (!domain || !token) {
    console.error('Domain and token are required for initialization');
    updateState({ error: 'Domain and token are required' });
    return;
  }

  updateState({ domain, token });
  
  state.client = new SecureClient<any>({
    authUrl: domain,
    appToken: token,
    autoInit: true,
    operations: {
      getRefreshToken: () => state.refreshToken,
      saveRefreshToken: async (token: string) => {
        sendToNative('save-refresh-token', { token });
      },
      welcome: async () => handleWelcome(),
      readyToFetch: () => updateState({ isReady: true }),
      loginOrRegister: () => updateState({ isReady: true })
    } as OperationsRecord,
    logLevel: 'warn'
  });

  sendToNative('get-refresh-token', {});
  dispatchEvent("initialized", {});
}

async function call<T = any>(process: string, data: any, depth = 0): Promise<T> {
  if (!state.client) {
    throw new Error('Client not initialized');
  }

  if (depth > 3) {
    throw new Error('Maximum recursion depth exceeded in call chain');
  }

  const res = await apiCall('/', { path: process, data });

  if (res.process) {
    return call<T>(res.process, res.data, depth + 1);
  }

  return res as T;
}

async function apiCall(path: string, data: any, extraArgs?: Record<string, any>): Promise<any> {
  if (!state.client) {
    throw new Error('Client not initialized');
  }

  updateState({ loading: true, error: '', success: false });

  try {
    const res = await state.client.fetch(path, data, extraArgs);
    updateState({ loading: false, error: '', success: true });
    return res;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'API call failed';
    updateState({ loading: false, error: errorMessage, success: false });
    throw error;
  }
}

// ============================================================================
// Authentication
// ============================================================================

async function login(username: string, password: string): Promise<LoginResponse> {
  if (!state.domain) {
    updateState({ loading: false, error: 'Domain is required' });
    return { success: false, error: 'Domain is required' };
  }

  if (!state.client) {
    updateState({ loading: false, error: 'Client not initialized' });
    return { success: false, error: 'Client not initialized' };
  }

  updateState({ loading: true, error: '', success: false });

  try {
    const data = await state.client.login(username, password);

    if (data.error) {
      updateState({ loading: false, error: data.error });
      dispatchEvent('login-error', { error: data.error });
      return { success: false, error: data.error };
    }

    if (data.userName) {
      const { firstName, lastName, userName, refreshToken } = data;
      const userData: UserData = { firstName, lastName, userName };

      updateState({
        success: true,
        loading: false,
        loggedIn: true,
        userData
      });

      dispatchEvent('login-success', { firstName, lastName, userName, refreshToken });
      return { success: true, data: userData };
    }

    updateState({ loading: false, error: 'Login failed' });
    return { success: false, error: 'Login failed' };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    updateState({ loading: false, error: errorMessage });
    dispatchEvent('login-error', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

async function logout(): Promise<void> {
  if (state.client) {
    try {
      await state.client.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    state.client = null; // Clear client reference
  }

  updateState({
    loading: false,
    error: '',
    success: false,
    loggedIn: false,
    userData: undefined
  });

  dispatchEvent('logout', {});
  
  // Re-init only if domain and token are available
  if (state.domain && state.token) {
    init(state.domain, state.token);
  }
}

async function handleWelcome(): Promise<void> {
  if (!state.client) {
    return;
  }

  try {
    const { firstName, lastName, userName, refreshToken: rToken } = await state.client.whoami();
    
    updateState({
      isReady: true,
      loggedIn: true,
      userData: { firstName, lastName, userName }
    });

    dispatchEvent('login-success', { userName, firstName, lastName, refreshToken: rToken });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Welcome failed';
    updateState({ error: errorMessage, isReady: false });
  }
}
