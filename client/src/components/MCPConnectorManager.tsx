import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Plug,
  CheckCircle2,
  AlertCircle,
  Upload,
  TestTube2,
  Trash2,
  Plus,
  Edit,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useMicrosoftIntegration } from "@/lib/microsoft";

interface MCPConnector {
  id: string;
  name: string;
  displayName: string;
  description: string;
  serverUrl: string;
  transport: "stdio" | "sse" | "streamable-http";
  serverCommand?: string;
  serverArgs?: string[];
  environment?: Record<string, string>;
  iconPath?: string;
  status: "draft" | "deployed" | "error" | "testing";
  version: string;
  createdAt: string;
  updatedAt: string;
}

interface ConnectorFormData {
  name: string;
  displayName: string;
  description: string;
  serverUrl: string;
  transport: "stdio" | "sse" | "streamable-http";
  serverCommand: string;
  serverArgs: string;
  environment: string; // JSON string
  iconPath: string;
  version: string;
}

const initialFormData: ConnectorFormData = {
  name: "",
  displayName: "",
  description: "",
  serverUrl: "",
  transport: "sse",
  serverCommand: "",
  serverArgs: "",
  environment: "{}",
  iconPath: "",
  version: "1.0.0",
};

export const MCPConnectorManager: React.FC = () => {
  const { isAuthenticated, settings } = useMicrosoftIntegration();
  const [connectors, setConnectors] = useState<MCPConnector[]>([]);
  const [selectedConnector, setSelectedConnector] =
    useState<MCPConnector | null>(null);
  const [formData, setFormData] = useState<ConnectorFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load connectors from localStorage for demo purposes
  useEffect(() => {
    const stored = localStorage.getItem("agent-mcp-inspector-connectors");
    if (stored) {
      setConnectors(JSON.parse(stored));
    }
  }, []);

  const saveConnectors = (updatedConnectors: MCPConnector[]) => {
    localStorage.setItem(
      "agent-mcp-inspector-connectors",
      JSON.stringify(updatedConnectors),
    );
    setConnectors(updatedConnectors);
  };

  const handleFormChange = (field: keyof ConnectorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Connector name is required";
    if (!formData.displayName.trim()) return "Display name is required";
    if (!formData.description.trim()) return "Description is required";

    if (
      formData.transport === "sse" ||
      formData.transport === "streamable-http"
    ) {
      if (!formData.serverUrl.trim())
        return "Server URL is required for SSE and HTTP transports";
      try {
        new URL(formData.serverUrl);
      } catch {
        return "Server URL must be a valid URL";
      }
    }

    if (formData.transport === "stdio") {
      if (!formData.serverCommand.trim())
        return "Server command is required for stdio transport";
    }

    try {
      if (formData.environment.trim()) {
        JSON.parse(formData.environment);
      }
    } catch {
      return "Environment variables must be valid JSON";
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const connector: MCPConnector = {
        id: isEditing ? selectedConnector!.id : `conn_${Date.now()}`,
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        serverUrl: formData.serverUrl,
        transport: formData.transport,
        serverCommand: formData.serverCommand || undefined,
        serverArgs: formData.serverArgs
          ? formData.serverArgs.split(" ")
          : undefined,
        environment: formData.environment
          ? JSON.parse(formData.environment)
          : undefined,
        iconPath: formData.iconPath || undefined,
        status: "draft",
        version: formData.version,
        createdAt: isEditing
          ? selectedConnector!.createdAt
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedConnectors = isEditing
        ? connectors.map((c) => (c.id === connector.id ? connector : c))
        : [...connectors, connector];

      saveConnectors(updatedConnectors);
      setSuccess(
        isEditing
          ? "Connector updated successfully"
          : "Connector created successfully",
      );
      setIsFormOpen(false);
      setIsEditing(false);
      setFormData(initialFormData);
      setSelectedConnector(null);
    } catch (err) {
      setError(`Failed to save connector: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (connector: MCPConnector) => {
    setFormData({
      name: connector.name,
      displayName: connector.displayName,
      description: connector.description,
      serverUrl: connector.serverUrl,
      transport: connector.transport,
      serverCommand: connector.serverCommand || "",
      serverArgs: connector.serverArgs?.join(" ") || "",
      environment: JSON.stringify(connector.environment || {}, null, 2),
      iconPath: connector.iconPath || "",
      version: connector.version,
    });
    setSelectedConnector(connector);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDelete = (connectorId: string) => {
    const updatedConnectors = connectors.filter((c) => c.id !== connectorId);
    saveConnectors(updatedConnectors);
    setSuccess("Connector deleted successfully");
  };

  const handleDeploy = async (connector: MCPConnector) => {
    if (!isAuthenticated) {
      setError("Please authenticate with Microsoft first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // This would integrate with the PAC CLI service
      // For demo purposes, we'll simulate the deployment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const updatedConnectors = connectors.map((c) =>
        c.id === connector.id
          ? {
              ...c,
              status: "deployed" as const,
              updatedAt: new Date().toISOString(),
            }
          : c,
      );
      saveConnectors(updatedConnectors);
      setSuccess(
        `Connector "${connector.displayName}" deployed successfully to ${settings.copilotStudio.environmentUrl}`,
      );
    } catch (err) {
      setError(`Deployment failed: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async (connector: MCPConnector) => {
    setIsLoading(true);
    setError(null);

    try {
      // This would actually test the MCP server connection
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const updatedConnectors = connectors.map((c) =>
        c.id === connector.id ? { ...c, status: "testing" as const } : c,
      );
      saveConnectors(updatedConnectors);

      // Simulate test results
      setTimeout(() => {
        const finalConnectors = connectors.map((c) =>
          c.id === connector.id
            ? {
                ...c,
                status:
                  Math.random() > 0.2
                    ? ("deployed" as const)
                    : ("error" as const),
              }
            : c,
        );
        saveConnectors(finalConnectors);
      }, 2000);
    } catch (err) {
      setError(`Test failed: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: MCPConnector["status"]) => {
    const variants = {
      draft: {
        variant: "outline" as const,
        icon: Edit,
        color: "text-gray-600",
      },
      deployed: {
        variant: "default" as const,
        icon: CheckCircle2,
        color: "text-green-600",
      },
      error: {
        variant: "destructive" as const,
        icon: AlertCircle,
        color: "text-red-600",
      },
      testing: {
        variant: "secondary" as const,
        icon: TestTube2,
        color: "text-blue-600",
      },
    };

    const { variant, icon: Icon, color } = variants[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Plug className="h-6 w-6" />
            MCP Connector Manager
          </h2>
          <p className="text-muted-foreground">
            Create and manage MCP connectors for Microsoft Copilot Studio
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(initialFormData);
            setIsEditing(false);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Connector
        </Button>
      </div>

      {!isAuthenticated && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Microsoft authentication is required to deploy connectors to Copilot
            Studio. Please configure and authenticate in the Microsoft
            Integration tab.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? "Edit Connector" : "Create New Connector"}
            </CardTitle>
            <CardDescription>
              Configure your MCP server as a Copilot Studio connector
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="connection">Connection</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Connector Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      placeholder="my-mcp-connector"
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) =>
                        handleFormChange("displayName", e.target.value)
                      }
                      placeholder="My MCP Connector"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    placeholder="Describe what this connector does..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) =>
                        handleFormChange("version", e.target.value)
                      }
                      placeholder="1.0.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="iconPath">Icon Path</Label>
                    <Input
                      id="iconPath"
                      value={formData.iconPath}
                      onChange={(e) =>
                        handleFormChange("iconPath", e.target.value)
                      }
                      placeholder="https://example.com/icon.png"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="connection" className="space-y-4">
                <div>
                  <Label htmlFor="transport">Transport Type *</Label>
                  <Select
                    value={formData.transport}
                    onValueChange={(value: any) =>
                      handleFormChange("transport", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sse">
                        Server-Sent Events (SSE)
                      </SelectItem>
                      <SelectItem value="streamable-http">
                        Streamable HTTP
                      </SelectItem>
                      <SelectItem value="stdio">Standard I/O</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.transport === "sse" ||
                  formData.transport === "streamable-http") && (
                  <div>
                    <Label htmlFor="serverUrl">Server URL *</Label>
                    <Input
                      id="serverUrl"
                      value={formData.serverUrl}
                      onChange={(e) =>
                        handleFormChange("serverUrl", e.target.value)
                      }
                      placeholder="https://your-mcp-server.com"
                    />
                  </div>
                )}

                {formData.transport === "stdio" && (
                  <>
                    <div>
                      <Label htmlFor="serverCommand">Server Command *</Label>
                      <Input
                        id="serverCommand"
                        value={formData.serverCommand}
                        onChange={(e) =>
                          handleFormChange("serverCommand", e.target.value)
                        }
                        placeholder="node"
                      />
                    </div>
                    <div>
                      <Label htmlFor="serverArgs">Server Arguments</Label>
                      <Input
                        id="serverArgs"
                        value={formData.serverArgs}
                        onChange={(e) =>
                          handleFormChange("serverArgs", e.target.value)
                        }
                        placeholder="server.js --config config.json"
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div>
                  <Label htmlFor="environment">
                    Environment Variables (JSON)
                  </Label>
                  <Textarea
                    id="environment"
                    value={formData.environment}
                    onChange={(e) =>
                      handleFormChange("environment", e.target.value)
                    }
                    placeholder="{}"
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Environment variables to pass to the MCP server (JSON
                    format)
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  setIsEditing(false);
                  setFormData(initialFormData);
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isEditing ? "Update Connector" : "Create Connector"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {connectors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plug className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No connectors yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first MCP connector to get started with Copilot
                Studio integration
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Connector
              </Button>
            </CardContent>
          </Card>
        ) : (
          connectors.map((connector) => (
            <Card key={connector.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {connector.displayName}
                      {getStatusBadge(connector.status)}
                    </CardTitle>
                    <CardDescription>{connector.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(connector)}
                      disabled={isLoading}
                    >
                      <TestTube2 className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(connector)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeploy(connector)}
                      disabled={!isAuthenticated || isLoading}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Deploy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(connector.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Transport:</span>
                    <br />
                    <Badge variant="outline">
                      {connector.transport.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Version:</span>
                    <br />
                    {connector.version}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <br />
                    {new Date(connector.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span>
                    <br />
                    {new Date(connector.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                {connector.serverUrl && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      <span className="font-medium">Server URL:</span>
                      <a
                        href={connector.serverUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {connector.serverUrl}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
