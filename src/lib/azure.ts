import { BlobServiceClient } from '@azure/storage-blob';
import { CosmosClient } from '@azure/cosmos';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { EmailClient } from '@azure/communication-email';

// Azure Storage Configuration
export const getBlobServiceClient = () => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('Azure Storage connection string not configured');
  }
  return BlobServiceClient.fromConnectionString(connectionString);
};

// Azure Cosmos DB Configuration
export const getCosmosClient = () => {
  const connectionString = process.env.AZURE_COSMOS_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('Azure Cosmos DB connection string not configured');
  }
  return new CosmosClient(connectionString);
};

export const getCosmosDatabase = () => {
  const client = getCosmosClient();
  return client.database('ResumeBuilderDB');
};

export const getCosmosContainer = (containerName: string) => {
  const database = getCosmosDatabase();
  return database.container(containerName);
};

// Azure OpenAI Configuration
export const getOpenAIClient = () => {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  
  if (!apiKey || !endpoint) {
    throw new Error('Azure OpenAI credentials not configured');
  }
  
  return new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
};

// Azure Communication Services Configuration
export const getEmailClient = () => {
  const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('Azure Communication Services connection string not configured');
  }
  return new EmailClient(connectionString);
};

// Container Names
export const CONTAINERS = {
  USERS: 'users',
  RESUMES: 'resumes',
  JOB_ANALYSES: 'job-analyses',
} as const;

// Blob Container Names
export const BLOB_CONTAINERS = {
  RESUMES: 'resumes',
  ENHANCED_RESUMES: 'enhanced-resumes',
} as const;