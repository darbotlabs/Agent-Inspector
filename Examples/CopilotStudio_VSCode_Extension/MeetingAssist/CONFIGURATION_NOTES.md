# MeetingAssist Configuration Notes

## ⚠️ IMPORTANT: Sensitive Data Removed

This folder has been sanitized to remove sensitive environment data. All configuration files now use **Contoso** sample data and placeholders for actual connection information.

## Changes Made

### 1. Connection Configuration (`.mcs/conn.json`)

- **Dataverse Endpoint**: Changed to `https://contoso.crm.dynamics.com/`
- **Account Email**: Changed to `admin@contoso.com`
- **Environment ID, Account ID, Tenant ID, Agent ID**: Replaced with placeholder comments

### 2. Change Token (`.mcs/changetoken.txt`)

- Replaced actual token with placeholder and sample format

### 3. Settings (`settings.mcs.yml`)

- **Schema Name**: Changed from `dystudio_meetMaster` to `contoso_meetMaster`

### 4. Action Connection References

All action files updated to use placeholders:

- Google Calendar connections
- Microsoft Dataverse connections
- Microsoft Teams connections
- Office 365 Outlook connections
- Connected agent bot schemas

## Configuration Required Before Use

To use this agent, you'll need to:

1. **Update `.mcs/conn.json`** with your actual:

   - Environment ID (36-character GUID)
   - Account ID (composite ID format)
   - Tenant ID (36-character GUID)
   - Agent ID (36-character GUID)
   - Agent Management Endpoint URL

2. **Update action connection references** in `/actions/` folder:

   - Replace `YOUR_*_CONNECTION_HERE` with actual connection references
   - Format: `yourSchema.shared_connector.connectionId`

3. **Update bot schema names** in connected agent actions:

   - Replace `YOUR_*_BOT_SCHEMA_HERE` with actual bot schema names

4. **Generate new change token** by republishing the agent

## Security Best Practices

- Never commit actual connection IDs or tokens to version control
- Use environment variables or secure vaults for sensitive configuration
- Regularly rotate credentials and tokens
- Monitor access logs for unauthorized usage

## Sample Connection Reference Formats

```yaml
# Google Calendar
connectionReference: contoso_meetMaster.shared_googlecalendar.956e87df53754df9b82aff1a7e29e85c

# Dataverse
connectionReference: contoso_meetMaster.shared_commondataserviceforapps.4ac1a72703c54a48bc67df40c7e37051

# Teams
connectionReference: contoso_meetMaster.shared_teams.shared-teams-f3c6ad2e-4fd5-48a0-90f3-b5c29df8077e

# Office 365
connectionReference: contoso_meetMaster.shared_office365.741423257b8d4c799d10dc425cd41697
```

## Support

For questions about configuration, refer to Microsoft Copilot Studio documentation or contact your system administrator.
