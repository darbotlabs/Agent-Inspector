import {
  ConfidentialClientApplication,
  Configuration,
  ClientCredentialRequest,
} from "@azure/msal-node";

export interface ServerMicrosoftConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
}

export class MicrosoftServerAuthService {
  private msalInstance: ConfidentialClientApplication;
  private config: ServerMicrosoftConfig;

  constructor(config: ServerMicrosoftConfig) {
    this.config = config;

    const msalConfig: Configuration = {
      auth: {
        clientId: config.clientId,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
        clientSecret: config.clientSecret,
      },
    };

    this.msalInstance = new ConfidentialClientApplication(msalConfig);
  }

  async getAccessToken(): Promise<string> {
    const clientCredentialRequest: ClientCredentialRequest = {
      scopes: this.config.scopes,
    };

    try {
      const response = await this.msalInstance.acquireTokenByClientCredential(
        clientCredentialRequest,
      );
      if (!response || !response.accessToken) {
        throw new Error("Failed to acquire access token");
      }
      return response.accessToken;
    } catch (error) {
      console.error("Failed to acquire token:", error);
      throw error;
    }
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      // Simple validation by trying to use the token
      const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
