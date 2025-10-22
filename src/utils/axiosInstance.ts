import axios, { AxiosHeaders } from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://stating-alnico.m.frappe.cloud/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// Configuration
const TEST_DELAY = 0; // 3 seconds
const ENABLE_DELAY = __DEV__; // Only enable in development

// List of endpoints that should have delay (empty = all endpoints)
const DELAY_ENDPOINTS: any[] = [
  // '/method/login',
  // '/resource/Project',
  // '/resource/Task',
  // Add specific endpoints you want to delay, or leave empty for all
];

const shouldDelay = (url: string = '') => {
  if (!ENABLE_DELAY) return false;
  if (DELAY_ENDPOINTS.length === 0) return true;
  return DELAY_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  // Ensure headers exist
  if (!config.headers) {
    config.headers = {} as AxiosHeaders;
  }

  // Build cookie string
  let cookieString = '';
  if (config.headers['Cookie']) {
    cookieString = `-H "Cookie: ${config.headers['Cookie']}"`;
  }

  // Build all other headers
  const headerString = Object.entries(config.headers)
    .filter(([key]) => key.toLowerCase() !== 'cookie')
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(' ');

  // Build data string if present
  const dataString = config.data ? `-d '${JSON.stringify(config.data)}'` : '';

  // Build curl command
  const curlCommand = `curl -X ${config.method?.toUpperCase()} "${config.baseURL}${config.url}" ${headerString} ${cookieString} ${dataString}`;

  console.log('➡️ Request curl:', curlCommand);

  return config;
});

// Response interceptor
axiosInstance.interceptors.response.use(
  async (response) => {
    // Add delay before returning response
    if (shouldDelay(response.config.url)) {
      console.log(`⏳ Adding ${TEST_DELAY}ms delay before response for: ${response.config.url}`);
      await new Promise<void>((resolve) => setTimeout(resolve, TEST_DELAY));
    }

    console.log('✅ Response:', {
      url: response.config.url,
      status: response.status,
      headers: response.headers,
      cookies: response.headers['set-cookie'] || null,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    // Add delay before returning error
    if (shouldDelay(error.config?.url)) {
      console.log(`⏳ Adding ${TEST_DELAY}ms delay before error response for: ${error.config?.url}`);
      await new Promise<void>((resolve) => setTimeout(resolve, TEST_DELAY));
    }

    if (error.response) {
      // Extract Frappe-specific error details
      const frappeError = extractFrappeError(error.response.data);
      
      console.log('❌ Frappe API Error:', {
        url: error.response.config.url,
        status: error.response.status,
        statusText: error.response.statusText,
        errorType: frappeError.exc_type || 'Unknown',
        errorMessage: frappeError.exception || frappeError.message || 'Unknown error',
        fullError: frappeError,
        requestData: error.response.config.data,
        headers: error.response.headers,
      });

      // Create a more descriptive error with Frappe details
      const enhancedError = new Error(
        `Frappe ${frappeError.exc_type || 'Error'}: ${frappeError.exception || frappeError.message || 'Unknown error'}`
      );
      enhancedError.name = 'FrappeAPIError';
      (enhancedError as any).frappeError = frappeError;
      (enhancedError as any).status = error.response.status;
      (enhancedError as any).url = error.response.config.url;
      
      return Promise.reject(enhancedError);
    } else {
      console.log('❌ Network Error:', {
        message: error.message,
        code: error.code,
        config: error.config,
      });
      return Promise.reject(error);
    }
  }
);

// Helper function to extract Frappe error details
function extractFrappeError(errorData: any) {
  if (!errorData) {
    return { message: 'No error data received' };
  }

  // Try to parse _server_messages if it exists
  if (errorData._server_messages) {
    try {
      const serverMessages = JSON.parse(errorData._server_messages);
      if (Array.isArray(serverMessages) && serverMessages.length > 0) {
        const firstMessage = JSON.parse(serverMessages[0]);
        return {
          message: firstMessage.message,
          title: firstMessage.title,
          indicator: firstMessage.indicator,
          ...errorData
        };
      }
    } catch (e) {
      console.warn('Failed to parse _server_messages:', e);
    }
  }

  // Return the original error data with additional parsing
  return {
    message: errorData.message || errorData.exception || 'Unknown Frappe error',
    exception: errorData.exception,
    exc_type: errorData.exc_type,
    exc: errorData.exc,
    _server_messages: errorData._server_messages,
    ...errorData
  };
}

export default axiosInstance;