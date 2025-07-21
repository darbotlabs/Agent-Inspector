import {
  PublicClientApplication,
  Configuration,
  AccountInfo,
  AuthenticationResult,
  SilentRequest,
  PopupRequest,
  EndSessionRequest,
} from "@azure/msal-browser";
import { MicrosoftConfig, MicrosoftGraphScope } from "./config";

export class MicrosoftAuthService {
  private msalInstance: PublicClientApplication;
  private config: MicrosoftConfig;

  constructor(config: MicrosoftConfig) {
    this.config = config;

    const msalConfig: Configuration = {
      auth: {
        clientId: config.clientId,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
        redirectUri: config.redirectUri,
      },
      cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
      },
    };

    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  async initialize(): Promise<void> {
    await this.msalInstance.initialize();
  }

  async loginPopup(
    scopes?: MicrosoftGraphScope[],
  ): Promise<AuthenticationResult> {
    const loginRequest: PopupRequest = {
      scopes: scopes || this.config.scopes,
      prompt: "select_account",
    };

    try {
      const response = await this.msalInstance.loginPopup(loginRequest);
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async acquireTokenSilent(
    scopes?: MicrosoftGraphScope[],
  ): Promise<AuthenticationResult> {
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error("No accounts found");
    }

    const silentRequest: SilentRequest = {
      scopes: scopes || this.config.scopes,
      account: accounts[0],
    };

    try {
      const response =
        await this.msalInstance.acquireTokenSilent(silentRequest);
      return response;
    } catch (error) {
      console.error("Silent token acquisition failed:", error);
      throw error;
    }
  }

  async acquireTokenPopup(
    scopes?: MicrosoftGraphScope[],
  ): Promise<AuthenticationResult> {
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error("No accounts found");
    }

    const tokenRequest: PopupRequest = {
      scopes: scopes || this.config.scopes,
      account: accounts[0],
    };

    try {
      const response = await this.msalInstance.acquireTokenPopup(tokenRequest);
      return response;
    } catch (error) {
      console.error("Token acquisition failed:", error);
      throw error;
    }
  }

  async getAccessToken(scopes?: MicrosoftGraphScope[]): Promise<string> {
    try {
      const response = await this.acquireTokenSilent(scopes);
      return response.accessToken;
    } catch (error) {
      // If silent fails, try popup
      const response = await this.acquireTokenPopup(scopes);
      return response.accessToken;
    }
  }

  async logout(): Promise<void> {
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      const logoutRequest: EndSessionRequest = {
        account: accounts[0],
      };
      await this.msalInstance.logoutPopup(logoutRequest);
    }
  }

  getCurrentAccount(): AccountInfo | null {
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  isLoggedIn(): boolean {
    return this.msalInstance.getAllAccounts().length > 0;
  }

  getAccountInfo(): AccountInfo | null {
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }
}
