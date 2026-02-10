@description('The location for all resources.')
param location string = resourceGroup().location

@description('The name of the SQL Server.')
param sqlServerName string = 'sql-clubos-${uniqueString(resourceGroup().id)}'

@description('The name of the SQL Database.')
param sqlDBName string = 'clubos-db'

@description('The admin username for SQL Server.')
param sqlAdminLogin string = 'clubosadmin'

@description('The admin password for SQL Server.')
@secure()
param sqlAdminPassword string

@description('The name of the App Service Plan.')
param appServicePlanName string = 'plan-clubos-${uniqueString(resourceGroup().id)}'

@description('The name of the Web App (Backend).')
param webAppName string = 'app-clubos-api-${uniqueString(resourceGroup().id)}'

@description('The name of the Static Web App (Frontend).')
param staticWebAppName string = 'stapp-clubos-admin-${uniqueString(resourceGroup().id)}'

// SQL Server
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
  }
}

// SQL Database (Serverless)
resource sqlDB 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: sqlDBName
  location: location
  sku: {
    name: 'GP_S_Gen5_1'
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 1
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 2147483648 // 2GB
  }
}

// Allow Azure Services to access SQL
resource allowAzureServices 'Microsoft.Sql/servers/firewallRules@2022-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// App Service Plan (Linux)
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// Web App (Backend)
resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        {
          name: 'DB_SERVER'
          value: sqlServer.properties.fullyQualifiedDomainName
        }
        {
          name: 'DB_USER'
          value: sqlAdminLogin
        }
        {
          name: 'DB_PASSWORD'
          value: sqlAdminPassword
        }
        {
          name: 'DB_NAME'
          value: sqlDBName
        }
      ]
    }
  }
}

// Static Web App (Frontend)
resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: staticWebAppName
  location: 'westeurope' // Static Web Apps have limited regions
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    repositoryUrl: 'https://github.com/arjanjandu/club-os-admin'
    branch: 'main'
    provider: 'GitHub'
  }
}

output backendUrl string = 'https://${webApp.properties.defaultHostName}'
output frontendUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
