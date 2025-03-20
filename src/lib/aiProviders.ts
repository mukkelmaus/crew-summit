import { AIProvider } from './types';
import { AppError, ErrorType, withErrorHandling } from './errorHandler';

// Sample AI provider configurations
export const defaultAIProviders: AIProvider[] = [
  {
    id: 'openai-1',
    name: 'OpenAI API',
    type: 'openai',
    apiEndpoint: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
  },
  {
    id: 'anthropic-1',
    name: 'Anthropic API',
    type: 'anthropic',
    apiEndpoint: 'https://api.anthropic.com',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    defaultModel: 'claude-3-haiku-20240307',
  },
  {
    id: 'mistral-1',
    name: 'Mistral API',
    type: 'mistral',
    apiEndpoint: 'https://api.mistral.ai/v1',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
    defaultModel: 'mistral-small-latest',
  },
];

// Function to call AI provider API
export async function callAIProvider(
  provider: AIProvider, 
  model: string, 
  messages: Array<{role: string, content: string}>,
  apiKey: string
) {
  if (!apiKey) {
    throw new AppError('API key is required', ErrorType.VALIDATION);
  }

  return withErrorHandling(async () => {
    let endpoint = '';
    let body = {};
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    switch (provider.type) {
      case 'openai':
        endpoint = `${provider.apiEndpoint}/chat/completions`;
        headers = {
          ...headers,
          'Authorization': `Bearer ${apiKey}`
        };
        body = {
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        };
        break;
        
      case 'anthropic':
        endpoint = `${provider.apiEndpoint}/v1/messages`;
        headers = {
          ...headers,
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        };
        body = {
          model,
          messages,
          max_tokens: 1000
        };
        break;
        
      case 'mistral':
        endpoint = `${provider.apiEndpoint}/chat/completions`;
        headers = {
          ...headers,
          'Authorization': `Bearer ${apiKey}`
        };
        body = {
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        };
        break;
        
      case 'custom':
        // Handle custom provider
        endpoint = provider.apiEndpoint;
        headers = {
          ...headers,
          'Authorization': `Bearer ${apiKey}`
        };
        body = {
          model,
          messages,
          // Add any additional parameters required by the custom provider
        };
        break;
        
      default:
        throw new AppError(`Unsupported provider type: ${provider.type}`, ErrorType.VALIDATION);
    }

    // Make the API call
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AppError(
        `API error: ${errorData.error?.message || response.statusText}`, 
        ErrorType.API, 
        { status: response.status, errorData }
      );
    }

    return await response.json();
  });
}

// Function to validate API key
export async function validateAPIKey(provider: AIProvider, apiKey: string): Promise<boolean> {
  try {
    // Simple validation test with a basic request
    const testMessages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, is my API key working?' }
    ];
    
    await callAIProvider(provider, provider.defaultModel, testMessages, apiKey);
    return true;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
}
