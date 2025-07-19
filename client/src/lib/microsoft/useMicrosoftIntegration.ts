import { useState, useEffect, useCallback } from "react";
import { MicrosoftAuthService } from "./auth";
import { MicrosoftGraphClient } from "./graph";
import {
  MicrosoftIntegrationSettings,
  DEFAULT_MICROSOFT_CONFIG,
} from "./config";
import { AccountInfo } from "@azure/msal-browser";

interface UseMicrosoftIntegrationReturn {
  isEnabled: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userInfo: AccountInfo | null;
  authService: MicrosoftAuthService | null;
  graphClient: MicrosoftGraphClient | null;
  settings: MicrosoftIntegrationSettings;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (newSettings: Partial<MicrosoftIntegrationSettings>) => void;
  clearError: () => void;
}

const SETTINGS_STORAGE_KEY = "agent-mcp-inspector-microsoft-settings";

export function useMicrosoftIntegration(): UseMicrosoftIntegrationReturn {
  const [settings, setSettings] = useState<MicrosoftIntegrationSettings>(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return stored
      ? { ...DEFAULT_MICROSOFT_CONFIG, ...JSON.parse(stored) }
      : DEFAULT_MICROSOFT_CONFIG;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<AccountInfo | null>(null);
  const [authService, setAuthService] = useState<MicrosoftAuthService | null>(
    null,
  );
  const [graphClient, setGraphClient] = useState<MicrosoftGraphClient | null>(
    null,
  );

  // Initialize Microsoft services when settings change
  useEffect(() => {
    if (
      settings.isEnabled &&
      settings.auth.tenantId &&
      settings.auth.clientId
    ) {
      const newAuthService = new MicrosoftAuthService(settings.auth);
      newAuthService
        .initialize()
        .then(() => {
          setAuthService(newAuthService);
          setGraphClient(new MicrosoftGraphClient(newAuthService));

          // Check if user is already logged in
          const account = newAuthService.getCurrentAccount();
          if (account) {
            setIsAuthenticated(true);
            setUserInfo(account);
          }
        })
        .catch((err) => {
          setError(`Failed to initialize Microsoft services: ${err.message}`);
        });
    } else {
      setAuthService(null);
      setGraphClient(null);
      setIsAuthenticated(false);
      setUserInfo(null);
    }
  }, [settings.isEnabled, settings.auth.tenantId, settings.auth.clientId]);

  const updateSettings = useCallback(
    (newSettings: Partial<MicrosoftIntegrationSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(updatedSettings),
      );
    },
    [settings],
  );

  const login = useCallback(async () => {
    if (!authService) {
      setError("Microsoft authentication service not initialized");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.loginPopup();
      setIsAuthenticated(true);
      setUserInfo(result.account);
    } catch (err: any) {
      setError(`Login failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  const logout = useCallback(async () => {
    if (!authService) return;

    setIsLoading(true);
    setError(null);

    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUserInfo(null);
    } catch (err: any) {
      setError(`Logout failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isEnabled: settings.isEnabled,
    isAuthenticated,
    isLoading,
    error,
    userInfo,
    authService,
    graphClient,
    settings,
    login,
    logout,
    updateSettings,
    clearError,
  };
}
