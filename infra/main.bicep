param location string = resourceGroup().location
param sqlAdminLogin string = 'clubosadmin'
@secure()
param sqlAdminPassword string

var tags = {
  Project: 'ClubOS'
  Environment: 'Production'
}

// --- SQL Server & Database ---
resource sqlServer 'Microsoft.Sql/servers@2021-11-01' = {
  name: 'sql-clubos-${uniqueString(resourceGroup().id)}'
  location: location
  tags: tags
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
  }
}

resource sqlDb 'Microsoft.Sql/servers/databases@2021-11-01' = {
  parent: sqlServer
  name: 'ClubOSDB'
  location: location
  tags: tags
  sku: {
    name: 'GP_S_Gen5_1' // Serverless Gen5 1 vCore
    tier: 'GeneralPurpose'
  }
  properties: {
    autoPauseDelay: 60 // Auto-pause after 1 hour
    minCapacity: '0.5'
  }
}

// Allow Azure Services (App Service) to access SQL
resource sqlFirewall 'Microsoft.Sql/servers/firewallRules@2021-11-01' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// --- App Service Plan (Backend) ---
resource appServicePlan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: 'plan-clubos-backend'
  location: location
  tags: tags
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true // Required for Linux
  }
}

// --- App Service (Node.js API) ---
resource webApp 'Microsoft.Web/sites@2021-02-01' = {
  name: 'app-clubos-api-${uniqueString(resourceGroup().id)}'
  location: location
  tags: tags
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        {
          name: 'SQL_CONNECTION_STRING'
          value: 'Server=tcp:${sqlServer.name}.database.windows.net,1433;Initial Catalog=${sqlDb.name};Persist Security Info=False;User ID=${sqlAdminLogin};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1' // Zip deploy
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
      ]
    }
    httpsOnly: true
  }
}

// --- Static Web App (Frontend) ---
resource staticWebApp 'Microsoft.Web/staticSites@2021-02-01' = {
  name: 'stapp-clubos-admin-${uniqueString(resourceGroup().id)}'
  location: 'westeurope' // Static Web Apps global/limited regions
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

// --- Outputs ---
output sqlServerName string = sqlServer.name
output sqlDbName string = sqlDb.name
output webAppHostName string = webApp.properties.defaultHostName
output staticWebAppDefaultHostName string = staticWebApp.properties.defaultHostname
output staticWebAppName string = staticWebApp.name
