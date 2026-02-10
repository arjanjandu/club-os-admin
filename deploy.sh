#!/bin/bash
set -e

# Config
RG_NAME="rg-clubos-dev"
LOCATION="uksouth"
REPO_NAME="club-os-admin"
SQL_PASSWORD="SecurePassword123!" # Change this!

echo "🚀 Starting Deployment for Club OS..."

# 1. GitHub Repo
echo "📦 Creating GitHub Repo..."
gh repo create $REPO_NAME --public --source=. --remote=origin --push || echo "Repo might exist, skipping..."

# 2. Azure Resource Group
echo "☁️ Creating Resource Group: $RG_NAME..."
az group create --name $RG_NAME --location $LOCATION

# 3. Deploy Bicep
echo "🏗️ Deploying Infrastructure (this takes ~5-10 mins)..."
az deployment group create \
  --resource-group $RG_NAME \
  --template-file infra/main.bicep \
  --parameters sqlAdminPassword=$SQL_PASSWORD

# 4. Get Outputs
echo "🔍 Retrieving Deployment Outputs..."
WEBAPP_HOST=$(az deployment group show --resource-group $RG_NAME --name main --query properties.outputs.webAppHostName.value -o tsv)
WEBAPP_NAME=${WEBAPP_HOST%%.*}
STATIC_WEBAPP_NAME=$(az deployment group show --resource-group $RG_NAME --name main --query properties.outputs.staticWebAppName.value -o tsv)
SQL_SERVER=$(az deployment group show --resource-group $RG_NAME --name main --query properties.outputs.sqlServerName.value -o tsv)

echo "✅ Infrastructure Deployed!"
echo "----------------------------------------"
echo "API Endpoint: https://$WEBAPP_HOST"
echo "SQL Server: $SQL_SERVER.database.windows.net"
echo "Static Web App: $STATIC_WEBAPP_NAME"
echo "----------------------------------------"

# 5. Deploy Backend Code (Zip Deploy for speed)
echo "🚀 Deploying Backend Code..."
cd backend
npm install --production
zip -r ../backend.zip .
az webapp deployment source config-zip --resource-group $RG_NAME --name $WEBAPP_NAME --src ../backend.zip
cd ..

# 6. Deploy Frontend (Build & Deploy to Static Web App via Token or GH Actions)
# Ideally GH Actions does this.
echo "⚠️ Frontend Deployment: Please push to GitHub and check Actions tab."
echo "   (Static Web App requires a token for manual deploy, usually handled by workflow)"

echo "🎉 Deployment Sequence Complete!"
