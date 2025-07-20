import { spawn, ChildProcess } from "child_process";
import { promisify } from "util";
import { PowerShell } from "node-powershell";

export interface PacCliConfig {
  cliPath: string; // Path to pac.exe or just "pac" if in PATH
  environmentUrl?: string;
  timeout?: number; // Command timeout in milliseconds
}

export interface ConnectorMetadata {
  name: string;
  displayName: string;
  description: string;
  iconBrand?: string;
  iconMedia?: string;
  properties: Record<string, any>;
}

export interface MCPConnectorConfig {
  serverUrl: string;
  serverCommand?: string;
  serverArgs?: string[];
  environment?: Record<string, string>;
  transport: "stdio" | "sse" | "streamable-http";
  name: string;
  description: string;
  iconPath?: string;
}

export class PacCliService {
  private config: PacCliConfig;

  constructor(config: PacCliConfig) {
    this.config = {
      timeout: 30000, // Default 30 second timeout
      ...config,
    };
  }

  private async executeCommand(
    command: string,
    args: string[] = [],
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.config.cliPath, [command, ...args], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      process.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      process.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      const timeout = setTimeout(() => {
        process.kill();
        reject(new Error(`Command timed out after ${this.config.timeout}ms`));
      }, this.config.timeout);

      process.on("close", (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });

      process.on("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async checkInstallation(): Promise<boolean> {
    try {
      await this.executeCommand("--version");
      return true;
    } catch {
      return false;
    }
  }

  async login(environmentUrl?: string): Promise<void> {
    const args = ["auth", "create"];
    if (environmentUrl) {
      args.push("--environment", environmentUrl);
    }
    await this.executeCommand(this.config.cliPath, args);
  }

  async logout(): Promise<void> {
    await this.executeCommand("auth", ["clear"]);
  }

  async listEnvironments(): Promise<string> {
    return await this.executeCommand("admin", ["list"]);
  }

  async createConnector(connectorConfig: MCPConnectorConfig): Promise<string> {
    // This would involve creating the connector definition files and then deploying
    // For now, this is a placeholder for the actual implementation
    const connectorDefinition =
      this.generateConnectorDefinition(connectorConfig);

    // Write connector definition to temporary file
    // Then use PAC CLI to deploy it
    // This is a simplified version - real implementation would be more complex

    return "Connector creation placeholder - implementation needed";
  }

  async updateConnector(
    connectorId: string,
    connectorConfig: MCPConnectorConfig,
  ): Promise<string> {
    // Update existing connector
    return "Connector update placeholder - implementation needed";
  }

  async deleteConnector(connectorId: string): Promise<string> {
    return await this.executeCommand("connector", [
      "delete",
      "--connector-id",
      connectorId,
    ]);
  }

  async listConnectors(): Promise<string> {
    return await this.executeCommand("connector", ["list"]);
  }

  async exportConnector(
    connectorId: string,
    outputPath: string,
  ): Promise<string> {
    return await this.executeCommand("connector", [
      "export",
      "--connector-id",
      connectorId,
      "--output-directory",
      outputPath,
    ]);
  }

  async testConnector(connectorId: string): Promise<string> {
    // Test the connector functionality
    return "Connector test placeholder - implementation needed";
  }

  private generateConnectorDefinition(config: MCPConnectorConfig): any {
    return {
      swagger: "2.0",
      info: {
        title: config.name,
        description: config.description,
        version: "1.0.0",
      },
      host: new URL(config.serverUrl).host,
      basePath: new URL(config.serverUrl).pathname || "/",
      schemes: [new URL(config.serverUrl).protocol.replace(":", "")],
      consumes: ["application/json"],
      produces: ["application/json"],
      paths: {
        "/mcp": {
          post: {
            summary: "Execute MCP Method",
            description: "Execute a Model Context Protocol method",
            operationId: "ExecuteMCPMethod",
            parameters: [
              {
                name: "method",
                in: "body",
                required: true,
                schema: {
                  type: "object",
                  properties: {
                    method: { type: "string" },
                    params: { type: "object" },
                  },
                },
              },
            ],
            responses: {
              "200": {
                description: "MCP method response",
                schema: { type: "object" },
              },
            },
          },
        },
      },
    };
  }

  async executePowerShellScript(script: string): Promise<string> {
    const ps = new PowerShell({
      pwsh: true, // Use PowerShell Core
    });

    try {
      const result = await ps.invoke(script);
      // Handle different result types from the PowerShell library
      if (typeof result === "string") {
        return result;
      } else if (result && typeof result === "object" && "stdout" in result) {
        return (result as any).stdout?.toString() || "";
      } else {
        return String(result || "");
      }
    } catch (error) {
      throw new Error(`PowerShell execution failed: ${error}`);
    } finally {
      ps.dispose();
    }
  }

  // Power Platform specific PowerShell commands
  async getPowerPlatformEnvironments(): Promise<any[]> {
    const script = `
      Import-Module Microsoft.PowerApps.Administration.PowerShell
      Get-AdminPowerAppEnvironment | ConvertTo-Json
    `;

    const result = await this.executePowerShellScript(script);
    return JSON.parse(result || "[]");
  }

  async getPowerAppConnectors(environmentName: string): Promise<any[]> {
    const script = `
      Import-Module Microsoft.PowerApps.Administration.PowerShell
      Get-AdminPowerAppConnector -EnvironmentName "${environmentName}" | ConvertTo-Json
    `;

    const result = await this.executePowerShellScript(script);
    return JSON.parse(result || "[]");
  }
}
