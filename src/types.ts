/**
 * Shared types for SecureClient
 */

import { useNativeBridge } from "@ugursahinkaya/native-bridge";
import { SecureClient } from "./secure-client";
import { SecureFetchApiOperations,LogLevel } from "@ugursahinkaya/shared-types";
export interface SecureClientConfig<TOperations extends SecureFetchApiOperations> {
  authUrl: string;
  operations: TOperations;
  appToken?: string;
  autoInit?: boolean;
  logLevel?: LogLevel;
}
export interface LoginState {
  loading: boolean;
  error: string;
  success: boolean;
  isReady: boolean;
  loggedIn: boolean;
  userData?: UserData;
  hostElement: HTMLElement | null;
}

export interface State<TOperations extends Record<string, any> = Record<string, any>> extends LoginState {
  client: SecureClient<any> | null;
  listeners: Set<StateListener>;
  bridge: ReturnType<typeof useNativeBridge<NativeEvents, JsEvents>> | null;
  refreshToken?: string;
  domain?: string;
  token?: string;
  initialized: boolean;
  operations?: TOperations;
}

export interface UserData {
  firstName?: string;
  lastName?: string;
  userName?: string;
}

export interface LoginResponse {
  success: boolean;
  data?: UserData;
  error?: string;
}

export interface SecureClientAPI<TOperations extends Record<string, any> = Record<string, any>> {
  subscribe: (fn: StateListener) => () => void;
  getState: () => LoginState;
  init: (domain: string, token: string) => void;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  call: <K extends keyof TOperations>(process: K, data: any) => Promise<TOperations[K]>;
  fetch: (path: string, data: any, extraArgs?: Record<string, any>) => Promise<any>;
  dispatchEvent: (name: keyof JsEvents, detail: any) => void;
  setHostElement: (element: HTMLElement | null) => void;
}

export type StateListener = (state: LoginState) => void;

export type NativeEvents = {
  'init-secure-auth': { domain: string; token: string };
  'refresh-token-value': { token: string };
};

export type JsEvents = {
  'logout': Record<string, never>;
  'login-error': { error: string };
  'login-success': { userName: string; firstName: string; lastName: string; refreshToken: string };
  'get-refresh-token': Record<string, never>;
  'save-refresh-token': { token: string };
  'initialized': Record<string, never>;
};
