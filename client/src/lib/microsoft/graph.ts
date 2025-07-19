import { Client } from "@microsoft/microsoft-graph-client";
import { MicrosoftAuthService } from "./auth";

export class MicrosoftGraphClient {
  private graphClient: Client;
  private authService: MicrosoftAuthService;

  constructor(authService: MicrosoftAuthService) {
    this.authService = authService;

    this.graphClient = Client.init({
      authProvider: async (done) => {
        try {
          const token = await this.authService.getAccessToken();
          done(null, token);
        } catch (error) {
          done(error as Error, null);
        }
      },
    });
  }

  async getMe() {
    try {
      const user = await this.graphClient.api("/me").get();
      return user;
    } catch (error) {
      console.error("Failed to get user info:", error);
      throw error;
    }
  }

  async getMyTeams() {
    try {
      const teams = await this.graphClient.api("/me/joinedTeams").get();
      return teams;
    } catch (error) {
      console.error("Failed to get user teams:", error);
      throw error;
    }
  }

  async getMyCalendarEvents(startTime?: string, endTime?: string) {
    try {
      let query = this.graphClient.api("/me/events");

      if (startTime && endTime) {
        query = query.filter(
          `start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`,
        );
      }

      const events = await query.get();
      return events;
    } catch (error) {
      console.error("Failed to get calendar events:", error);
      throw error;
    }
  }

  async getMyFiles() {
    try {
      const files = await this.graphClient.api("/me/drive/root/children").get();
      return files;
    } catch (error) {
      console.error("Failed to get user files:", error);
      throw error;
    }
  }

  async searchFiles(query: string) {
    try {
      const searchResults = await this.graphClient
        .api(`/me/drive/root/search(q='${query}')`)
        .get();
      return searchResults;
    } catch (error) {
      console.error("Failed to search files:", error);
      throw error;
    }
  }

  async getTeamChannels(teamId: string) {
    try {
      const channels = await this.graphClient
        .api(`/teams/${teamId}/channels`)
        .get();
      return channels;
    } catch (error) {
      console.error("Failed to get team channels:", error);
      throw error;
    }
  }

  async getChannelMessages(teamId: string, channelId: string) {
    try {
      const messages = await this.graphClient
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .get();
      return messages;
    } catch (error) {
      console.error("Failed to get channel messages:", error);
      throw error;
    }
  }

  async sendChannelMessage(teamId: string, channelId: string, message: string) {
    try {
      const response = await this.graphClient
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .post({
          body: {
            content: message,
          },
        });
      return response;
    } catch (error) {
      console.error("Failed to send channel message:", error);
      throw error;
    }
  }

  // Power Platform specific endpoints (if available)
  async getPowerPlatformEnvironments() {
    try {
      // This would require Power Platform API permissions
      const environments = await this.graphClient
        .api("https://api.powerplatform.com/v1/environments")
        .get();
      return environments;
    } catch (error) {
      console.error("Failed to get Power Platform environments:", error);
      throw error;
    }
  }
}
