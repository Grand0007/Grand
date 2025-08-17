import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.AZURE_STORAGE_CONNECTION_STRING = 'test-storage-connection'
process.env.AZURE_COSMOS_CONNECTION_STRING = 'test-cosmos-connection'
process.env.AZURE_OPENAI_API_KEY = 'test-openai-key'
process.env.AZURE_OPENAI_ENDPOINT = 'https://test-openai.openai.azure.com/'
process.env.AZURE_COMMUNICATION_CONNECTION_STRING = 'test-communication-connection'

// Mock Azure SDK modules
jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn(() => ({
      getContainerClient: jest.fn(() => ({
        createIfNotExists: jest.fn(),
        getBlockBlobClient: jest.fn(() => ({
          uploadData: jest.fn(),
          url: 'https://test-blob-url.com/file.pdf'
        }))
      }))
    }))
  }
}))

jest.mock('@azure/cosmos', () => ({
  CosmosClient: jest.fn(() => ({
    database: jest.fn(() => ({
      container: jest.fn(() => ({
        items: {
          create: jest.fn(),
          query: jest.fn(() => ({
            fetchAll: jest.fn().mockResolvedValue({ resources: [] })
          }))
        },
        item: jest.fn(() => ({
          read: jest.fn(),
          replace: jest.fn()
        }))
      }))
    }))
  }))
}))

jest.mock('@azure/openai', () => ({
  OpenAIClient: jest.fn(() => ({
    getChatCompletions: jest.fn()
  })),
  AzureKeyCredential: jest.fn()
}))

jest.mock('@azure/communication-email', () => ({
  EmailClient: jest.fn(() => ({
    beginSend: jest.fn()
  }))
}))

// Mock file reading functions
jest.mock('fs', () => ({
  readFileSync: jest.fn(() => Buffer.from('test file content')),
  unlinkSync: jest.fn()
}))

// Global test utilities
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Suppress console warnings in tests
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

beforeEach(() => {
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterEach(() => {
  console.warn = originalConsoleWarn
  console.error = originalConsoleError
})