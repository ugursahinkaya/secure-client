import { GenericRouter } from "@ugursahinkaya/generic-router";
import { SecureFetch } from "@ugursahinkaya/secure-fetch";
import { SecureFetchApiOperations } from "@ugursahinkaya/shared-types";
import { Logger } from "@ugursahinkaya/logger";
import { ErrorMessages, ApiEndpoints } from "./constants";
import { SecureClientConfig } from "./types";

/**
 * SecureClient - E2E encrypted HTTP client for secure communication
 * Handles authentication, API calls, and encrypted data transfer
 */
export class SecureClient<TOperations extends SecureFetchApiOperations> extends GenericRouter<TOperations> {
  protected api?: SecureFetch<SecureFetchApiOperations>;
  protected clientLogger: Logger;
  protected appToken?: string;
  public authUrl: string;
  public fetchApiInit: () => void;

  constructor(config: SecureClientConfig<TOperations>) {
    super(config.operations, config.logLevel);
    this.authUrl = config.authUrl;
    this.clientLogger = new Logger("secure-client", config.logLevel);
    this.appToken = config.appToken;
    
    this.fetchApiInit = () => {
      this.api = new SecureFetch({
        appToken: this.appToken,
        serverDomain: config.authUrl,
        operations: config.operations as SecureFetchApiOperations,
        logLevel: config.logLevel
      });
    };

    if (config.autoInit !== false) {
      this.fetchApiInit();
    }
  }

  /**
   * Get current query token value
   */
  queryTokenValue(): string | undefined {
    if (!this.api) {
      this.clientLogger.error(ErrorMessages.CLIENT_NOT_INITIALIZED);
      return undefined;
    }
    return this.api.queryTokenValue();
  }

  /**
   * Make encrypted HTTP request
   */
  async fetch(path: string, data: any, extraArgs?: Record<string, any>): Promise<any> {
    this.clientLogger.debug(data, ["fetch", path]);
    
    if (!this.api) {
      this.clientLogger.error(ErrorMessages.CLIENT_NOT_INITIALIZED);
      throw new Error(ErrorMessages.CLIENT_NOT_INITIALIZED);
    }

    return this.api.fetch(`${this.authUrl}${path}`, data, "POST", extraArgs);
  }

  // Auth-related methods
  
  async resetPassword(userName: string): Promise<any> {
    return this.fetch(ApiEndpoints.RESET_PASSWORD, { userName });
  }

  async register(
    userName: string,
    firstName: string,
    lastName: string,
    password: string,
    password2: string
  ): Promise<any> {
    return this.fetch(ApiEndpoints.REGISTER, { userName, firstName, lastName, password, password2 });
  }

  async whoami(): Promise<any> {
    return this.fetch(ApiEndpoints.WHOAMI, {});
  }

  async changePassword(userName: string, password: string, password2: string): Promise<any> {
    return this.fetch(ApiEndpoints.CHANGE_PASSWORD, { userName, password, password2 });
  }

  async validate(userName: string, smsToken: string, validationToken: string): Promise<any> {
    return this.fetch(ApiEndpoints.VALIDATE, { userName, smsToken, validationToken });
  }

  async whoIs(queryToken: string): Promise<any> {
    return this.fetch(ApiEndpoints.GET_USER_DATA, { userQueryToken: queryToken });
  }

  async checkUserName(userName: string, register: boolean): Promise<any> {
    return this.fetch(ApiEndpoints.CHECK_USERNAME, { userName, register });
  }

  async logout(): Promise<void> {
    this.clientLogger.debug("", "logout");
    
    if (!this.api) {
      this.clientLogger.error(ErrorMessages.CLIENT_NOT_INITIALIZED);
      return;
    }

    await this.api.fetch(`${this.authUrl}${ApiEndpoints.LOGOUT}`, {});
    await this.call("loggedOut", { channel: "rest", secure: true });
    this.clientLogger.debug("logged out", "logout");
  }

  async login(userName: string, password: string): Promise<any> {
    this.clientLogger.debug(userName, "login");
    
    if (!this.api) {
      const error = ErrorMessages.CLIENT_NOT_INITIALIZED;
      this.clientLogger.error(error);
      return { error };
    }

    const loginRes = await this.api.fetch(`${this.authUrl}${ApiEndpoints.LOGIN}`, { userName, password });
    this.clientLogger.debug(loginRes, ["login", "result"]);

    if (loginRes.error) {
      await this.call("loginError", { channel: "rest", secure: true }, loginRes.error);
      this.clientLogger.error(loginRes.error, "login");
      return loginRes;
    }

    if (loginRes.queryToken) {
      await this.call("loggedIn", loginRes.queryToken);
    }

    if (loginRes.process) {
      await this.call(loginRes.process, { channel: "rest", secure: true }, loginRes);
      this.clientLogger.debug(loginRes.process, ["login", "process"]);
    }

    return loginRes;
  }

  async refresh(token: string): Promise<any> {
    this.clientLogger.debug(token, "refresh");
    
    if (!this.api) {
      this.clientLogger.error(ErrorMessages.CLIENT_NOT_INITIALIZED);
      throw new Error(ErrorMessages.CLIENT_NOT_INITIALIZED);
    }

    return this.api.refresh(token);
  }
}
