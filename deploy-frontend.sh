#!/bin/bash
set -e
cd club-os-admin/frontend

# Config
API_URL="https://app-clubos-api-qc56u4i55yxxy.azurewebsites.net/api"
TOKEN="51c37c084a48822a11dcea3e4566886345e16cf3fee04b25546e81c1d5fd79cd04-385d5ded-6105-40de-8abb-ad30c41ec2f5003210006d66c603"

echo "🔧 Configuring Frontend..."
echo "NEXT_PUBLIC_API_URL=$API_URL" > .env.local

echo "🏗️ Building Frontend..."
npm run build

echo "🚀 Deploying to Azure Static Web Apps..."
# Use npx to run swa CLI
npx @azure/static-web-apps-cli deploy ./out --deployment-token $TOKEN --env production --no-use-keychain

echo "🎉 Frontend Deployed!"
