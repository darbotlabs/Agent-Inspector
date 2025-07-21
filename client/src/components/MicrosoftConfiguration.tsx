import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useMicrosoftIntegration } from "@/lib/microsoft";
import { MicrosoftIntegrationSettings } from "@/lib/microsoft/config";
import {
  Cloud,
  User,
  Settings,
  Shield,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  Loader2,
} from "lucide-react";

interface MicrosoftConfigurationProps {
  onClose?: () => void;
}

export const MicrosoftConfiguration: React.FC<MicrosoftConfigurationProps> = ({
  onClose,
}) => {
  const {
    isAuthenticated,
    isLoading,
    error,
    userInfo,
    settings,
    login,
    logout,
    updateSettings,
    clearError,
  } = useMicrosoftIntegration();

  const [tempSettings, setTempSettings] =
    useState<MicrosoftIntegrationSettings>(settings);

  const handleSettingsChange = (
    key: keyof MicrosoftIntegrationSettings,
    value: any,
  ) => {
    setTempSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleAuthChange = (key: string, value: string) => {
    setTempSettings((prev) => ({
      ...prev,
      auth: { ...prev.auth, [key]: value },
    }));
  };

  const handleCopilotStudioChange = (key: string, value: string) => {
    setTempSettings((prev) => ({
      ...prev,
      copilotStudio: { ...prev.copilotStudio, [key]: value },
    }));
  };

  const saveSettings = () => {
    updateSettings(tempSettings);
    clearError();
  };

  const resetSettings = () => {
    setTempSettings(settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Microsoft Integration</h2>
          <p className="text-muted-foreground">
            Configure Microsoft services, Power Platform, and Copilot Studio
            integration
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="auth" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="copilot">Copilot Studio</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Microsoft Authentication
              </CardTitle>
              <CardDescription>
                Configure Azure AD/Entra ID authentication for Microsoft
                services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enabled"
                  checked={tempSettings.isEnabled}
                  onCheckedChange={(checked) =>
                    handleSettingsChange("isEnabled", checked as boolean)
                  }
                />
                <Label htmlFor="enabled">Enable Microsoft Integration</Label>
              </div>

              {tempSettings.isEnabled && (
                <>
                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="tenantId">Tenant ID</Label>
                      <Input
                        id="tenantId"
                        value={tempSettings.auth.tenantId}
                        onChange={(e) =>
                          handleAuthChange("tenantId", e.target.value)
                        }
                        placeholder="00000000-0000-0000-0000-000000000000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientId">
                        Client ID (Application ID)
                      </Label>
                      <Input
                        id="clientId"
                        value={tempSettings.auth.clientId}
                        onChange={(e) =>
                          handleAuthChange("clientId", e.target.value)
                        }
                        placeholder="00000000-0000-0000-0000-000000000000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="redirectUri">Redirect URI</Label>
                      <Input
                        id="redirectUri"
                        value={tempSettings.auth.redirectUri || ""}
                        onChange={(e) =>
                          handleAuthChange("redirectUri", e.target.value)
                        }
                        placeholder={`${window.location.origin}/oauth/microsoft/callback`}
                      />
                    </div>
                  </div>

                  {isAuthenticated && userInfo && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">
                          Authenticated
                        </span>
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{userInfo.name || userInfo.username}</span>
                        </div>
                        {userInfo.tenantId && (
                          <div className="mt-1">
                            <span className="text-xs">
                              Tenant: {userInfo.tenantId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!isAuthenticated ? (
                      <Button
                        onClick={login}
                        disabled={
                          isLoading ||
                          !tempSettings.auth.tenantId ||
                          !tempSettings.auth.clientId
                        }
                        className="flex items-center gap-2"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogIn className="h-4 w-4" />
                        )}
                        Sign In to Microsoft
                      </Button>
                    ) : (
                      <Button
                        onClick={logout}
                        variant="outline"
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                        Sign Out
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="copilot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Copilot Studio Configuration
              </CardTitle>
              <CardDescription>
                Configure Power Platform environment for MCP connector creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="environmentUrl">Environment URL</Label>
                <Input
                  id="environmentUrl"
                  value={tempSettings.copilotStudio.environmentUrl}
                  onChange={(e) =>
                    handleCopilotStudioChange("environmentUrl", e.target.value)
                  }
                  placeholder="https://your-env.crm.dynamics.com"
                />
              </div>

              <div>
                <Label htmlFor="environmentId">Environment ID</Label>
                <Input
                  id="environmentId"
                  value={tempSettings.copilotStudio.environmentId}
                  onChange={(e) =>
                    handleCopilotStudioChange("environmentId", e.target.value)
                  }
                  placeholder="00000000-0000-0000-0000-000000000000"
                />
              </div>

              <div>
                <Label htmlFor="connectorName">Default Connector Name</Label>
                <Input
                  id="connectorName"
                  value={tempSettings.copilotStudio.connectorName || ""}
                  onChange={(e) =>
                    handleCopilotStudioChange("connectorName", e.target.value)
                  }
                  placeholder="Agent MCP Inspector Connector"
                />
              </div>

              <div>
                <Label htmlFor="description">Default Description</Label>
                <Input
                  id="description"
                  value={tempSettings.copilotStudio.description || ""}
                  onChange={(e) =>
                    handleCopilotStudioChange("description", e.target.value)
                  }
                  placeholder="Custom MCP connector created with Agent MCP Inspector"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Advanced configuration for PAC CLI and PowerShell integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pacCliPath">PAC CLI Path</Label>
                <Input
                  id="pacCliPath"
                  value={tempSettings.pacCliPath || ""}
                  onChange={(e) =>
                    handleSettingsChange("pacCliPath", e.target.value)
                  }
                  placeholder="pac (if in PATH) or /path/to/pac.exe"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Path to the Power Platform CLI executable
                </p>
              </div>

              <div>
                <Label>OAuth Scopes</Label>
                <div className="text-sm text-muted-foreground">
                  <div>• {tempSettings.auth.scopes.join(", ")}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Scopes requested during authentication
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={resetSettings}>
          Reset
        </Button>
        <Button onClick={saveSettings}>Save Configuration</Button>
      </div>
    </div>
  );
};
