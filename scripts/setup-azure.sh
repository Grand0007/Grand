#!/bin/bash

# AI Resume Builder - Azure Resources Setup Script
# This script creates all necessary Azure resources for the application

set -e

# Configuration
RESOURCE_GROUP="ai-resume-builder-rg"
LOCATION="East US"
COSMOS_ACCOUNT="ai-resume-cosmosdb"
STORAGE_ACCOUNT="airesumestorage"
OPENAI_ACCOUNT="ai-resume-openai"
COMMUNICATION_SERVICE="ai-resume-communication"
STATIC_WEB_APP="ai-resume-builder-app"

echo "🚀 Setting up AI Resume Builder Azure Resources..."
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first."
    exit 1
fi

# Login check
if ! az account show &> /dev/null; then
    echo "🔐 Please login to Azure CLI first:"
    az login
fi

echo "1️⃣ Creating Resource Group..."
az group create --name $RESOURCE_GROUP --location "$LOCATION"
echo "✅ Resource Group created successfully"
echo ""

echo "2️⃣ Creating Cosmos DB Account..."
az cosmosdb create \
  --name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --kind GlobalDocumentDB \
  --locations regionName="$LOCATION" failoverPriority=0 isZoneRedundant=False \
  --default-consistency-level Session \
  --enable-free-tier true

echo "📊 Creating Cosmos DB Database..."
az cosmosdb sql database create \
  --account-name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --name ResumeBuilderDB

echo "📋 Creating Cosmos DB Containers..."
az cosmosdb sql container create \
  --account-name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --database-name ResumeBuilderDB \
  --name users \
  --partition-key-path "/id" \
  --throughput 400

az cosmosdb sql container create \
  --account-name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --database-name ResumeBuilderDB \
  --name resumes \
  --partition-key-path "/user_id" \
  --throughput 400

az cosmosdb sql container create \
  --account-name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --database-name ResumeBuilderDB \
  --name job-analyses \
  --partition-key-path "/resume_id" \
  --throughput 400

echo "✅ Cosmos DB setup completed"
echo ""

echo "3️⃣ Creating Storage Account..."
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot

echo "📁 Creating Blob Containers..."
az storage container create \
  --name resumes \
  --account-name $STORAGE_ACCOUNT \
  --public-access off

az storage container create \
  --name enhanced-resumes \
  --account-name $STORAGE_ACCOUNT \
  --public-access off

echo "✅ Storage Account setup completed"
echo ""

echo "4️⃣ Creating OpenAI Cognitive Service..."
az cognitiveservices account create \
  --name $OPENAI_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --kind OpenAI \
  --sku S0 \
  --custom-domain $OPENAI_ACCOUNT

echo "✅ OpenAI Service created successfully"
echo ""

echo "5️⃣ Creating Communication Service..."
az communication create \
  --name $COMMUNICATION_SERVICE \
  --resource-group $RESOURCE_GROUP \
  --location Global \
  --data-location UnitedStates

echo "✅ Communication Service created successfully"
echo ""

echo "6️⃣ Retrieving Connection Strings..."

# Get Cosmos DB connection string
COSMOS_CONNECTION=$(az cosmosdb keys list --name $COSMOS_ACCOUNT --resource-group $RESOURCE_GROUP --type connection-strings --query 'connectionStrings[0].connectionString' -o tsv)

# Get Storage Account connection string
STORAGE_CONNECTION=$(az storage account show-connection-string --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query 'connectionString' -o tsv)

# Get OpenAI API key and endpoint
OPENAI_KEY=$(az cognitiveservices account keys list --name $OPENAI_ACCOUNT --resource-group $RESOURCE_GROUP --query 'key1' -o tsv)
OPENAI_ENDPOINT="https://$OPENAI_ACCOUNT.openai.azure.com/"

# Get Communication Service connection string
COMMUNICATION_CONNECTION=$(az communication list-key --name $COMMUNICATION_SERVICE --resource-group $RESOURCE_GROUP --query 'primaryConnectionString' -o tsv)

echo ""
echo "🎉 All Azure resources have been created successfully!"
echo ""
echo "📝 Copy these values to your .env.local file:"
echo "==============================================="
echo "AZURE_COSMOS_CONNECTION_STRING=\"$COSMOS_CONNECTION\""
echo "AZURE_STORAGE_CONNECTION_STRING=\"$STORAGE_CONNECTION\""
echo "AZURE_OPENAI_API_KEY=\"$OPENAI_KEY\""
echo "AZURE_OPENAI_ENDPOINT=\"$OPENAI_ENDPOINT\""
echo "AZURE_COMMUNICATION_CONNECTION_STRING=\"$COMMUNICATION_CONNECTION\""
echo ""
echo "🔐 Don't forget to:"
echo "1. Generate a secure JWT_SECRET"
echo "2. Set up your domain in Azure Communication Services"
echo "3. Deploy a GPT-4 model in your OpenAI resource"
echo ""
echo "💡 Next steps:"
echo "1. Copy the environment variables above to your .env.local file"
echo "2. Run 'npm install' to install dependencies"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "🌐 Resource Group: $RESOURCE_GROUP"
echo "📍 Location: $LOCATION"
echo ""
echo "Happy coding! 🚀"