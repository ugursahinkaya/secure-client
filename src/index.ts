import { GenericRouter } from "@ugursahinkaya/generic-router";
import { SecureFetch } from "@ugursahinkaya/secure-fetch";
import {
  SecureFetchApiOperations,
  LogLevel,
} from "@ugursahinkaya/shared-types";
import { Logger } from "@ugursahinkaya/logger";

export class SecureAuth<
  TOperations extends SecureFetchApiOperations,
> extends GenericRouter<TOperations> {
  protected api?: SecureFetch<SecureFetchApiOperations>;
  protected authLogger: Logger;
  public authUrl: string;
  public fetchApiInit: () => void;
  constructor(args: {
    authUrl: string;
    operations: TOperations;
    autoInit?: boolean;
    logLevel?: LogLevel;
  }) {
    super(args.operations, args.logLevel);
    this.authUrl = args.authUrl;
    this.authLogger = new Logger("secure-auth", args.logLevel);
    const fetchApiOperations = {
      ...args.operations,
      readyToFetch: () => {
        this.authLogger.debug("readyToFetch", "fetchApiOperations");

        this.call("loginOrRegister");
      },
    } as SecureFetchApiOperations;
    this.fetchApiInit = () => {
      this.api = new SecureFetch(
        args.authUrl,
        fetchApiOperations,
        args.logLevel
      );
    };
    if (args.autoInit !== false) {
      this.fetchApiInit();
    }
  }
  async refresh(token: string) {
    this.authLogger.debug(token, "refresh");
    return this.api
      ? this.api.refresh(token)
      : this.authLogger.error(
        "You must call secureAuth.fetchApiInit() when autoInit=false"
      );
  }
  queryTokenValue() {
    return this.api
      ? this.api.queryTokenValue()
      : this.authLogger.error(
        "You must call secureAuth.fetchApiInit() when autoInit=false"
      );
  }
  async resetPassword(userName: string) {
    return this.api
      ? this.api.fetch(`${this.authUrl}/resetPassword`, { userName })
      : this.authLogger.error(
        "You must call secureAuth.fetchApiInit() when autoInit=false"
      );
  }
  async register(
    userName: string,
    firstName: string,
    lastName: string,
    password: string,
    password2: string
  ) {
    this.authLogger.debug(userName, "register");
    return this.api
      ? this.api.fetch(`${this.authUrl}/register`, {
        userName,
        firstName,
        lastName,
        password,
        password2,
      })
      : this.authLogger.error(
        "You must call secureAuth.fetchApiInit() when autoInit=false"
      );
  }
  async changePassword(userName: string, password: string, password2: string) {
    this.authLogger.debug(userName, "changePassword");

    return this.api
      ? this.api.fetch(`${this.authUrl}/changePassword`, {
        userName,
        password,
        password2,
      })
      : this.authLogger.error(
        "You must call secureAuth.fetchApiInit() when autoInit=false"
      );
  }
  async validate(userName: string, smsToken: string, validationToken: string) {
    this.authLogger.debug(userName, "validate");

    return this.api
      ? this.api.fetch(`${this.authUrl}/validate`, {
        userName,
        smsToken,
        validationToken,
      })
      : this.authLogger.error(
        "You must call secureAuth.fetchApiInit() when autoInit=false"
      );
  }
  whoIs = async (queryToken: string) => {
    this.authLogger.debug(queryToken, "whoIs");

    return this.api
      ? await this.api.fetch(`${this.authUrl}/getUserData`, {
        userQueryToken: queryToken,
      })
      : this.authLogger.error(
        "You must call secureAuth.fetchApiInit() when autoInit=false"
      );
  };
  async checkUserName(userName: string, register: boolean) {
    this.authLogger.debug(userName, `checkUserName register:${register}`);

    const res = this.api
      ? await this.api.fetch(`${this.authUrl}/checkUserName`, {
        userName,
        register,
      })
      : this.authLogger.error(
        "You must call secureAuth.fetchApiInit() when autoInit=false"
      );
    if (res.data === "invalid_user") {
      delete res.data;
      res.error = "Hatalı kullanıcı adı";
      this.authLogger.debug(res.error, "checkUserName");
    }
    return res;
  }
  async logout() {
    this.authLogger.debug("", `logout`);

    this.api
      ? await this.api.fetch(`${this.authUrl}/logout`, {})
      : this.authLogger.error(
        "You must call secureAuth.fetchApiInit() when autoInit=false"
      );
    await this.call("loggedOut", { channel: "rest", secure: true });
    this.authLogger.debug("logged out", `logout`);
  }
  async login(userName: string, password: string) {
    this.authLogger.debug(userName, `login`);

    const loginRes = this.api
      ? await this.api.fetch(`${this.authUrl}/login`, {
        userName,
        password,
      })
      : this.authLogger.error(
        "You must call secureAuth.fetchApiInit() when autoInit=false"
      );
    this.authLogger.debug(loginRes, [`login`, "reslut"]);

    if (loginRes.error) {
      await this.call(
        "loginError",
        { channel: "rest", secure: true },
        loginRes.error
      );
      this.authLogger.error(loginRes.error, "login");

      return loginRes;
    }
    if (loginRes.queryToken) {
      await this.call("loggedIn", loginRes.queryToken);
    }

    if (loginRes.process) {
      await this.call(
        loginRes.process,
        { channel: "rest", secure: true },
        loginRes
      );
      this.authLogger.debug(loginRes.process, ["login", "process"]);
    }
    return loginRes;
  }
}
