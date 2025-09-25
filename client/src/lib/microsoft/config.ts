export interface MicrosoftConfig {
  tenantId: string;
  clientId: string;
  clientSecret?: string; // Only for server-side auth
  scopes: string[];
  redirectUri?: string;
}

export interface CopilotStudioConfig {
  environmentUrl: string;
  environmentId: string;
  connectorName?: string;
  description?: string;
}

export interface MicrosoftIntegrationSettings {
  isEnabled: boolean;
  auth: MicrosoftConfig;
  copilotStudio: CopilotStudioConfig;
  pacCliPath?: string;
}

// Default Microsoft integration settings
export const DEFAULT_MICROSOFT_CONFIG: MicrosoftIntegrationSettings = {
  isEnabled: false,
  auth: {
    tenantId: "",
    clientId: "",
    scopes: [
      "https://graph.microsoft.com/.default",
      "https://api.powerplatform.com/user_impersonation",
    ],
    redirectUri:
      typeof window !== "undefined" && window?.location?.origin
        ? window.location.origin + "/oauth/microsoft/callback"
        : process.env.SSR_REDIRECT_URI ||
          "http://localhost/oauth/microsoft/callback",
  },
  copilotStudio: {
    environmentUrl: "",
    environmentId: "",
    connectorName: "Agent MCP Inspector Connector",
    description: "Custom MCP connector created with Agent MCP Inspector",
  },
  pacCliPath: "pac", // Assumes PAC CLI is in PATH
};

export const MICROSOFT_GRAPH_SCOPES = {
  USER_READ: "User.Read",
  TEAMS_READ: "Team.ReadBasic.All",
  CALENDARS_READ: "Calendars.Read",
  FILES_READ: "Files.Read.All",
  POWER_PLATFORM: "https://api.powerplatform.com/user_impersonation",
} as const;

export type MicrosoftGraphScope =
  (typeof MICROSOFT_GRAPH_SCOPES)[keyof typeof MICROSOFT_GRAPH_SCOPES];
