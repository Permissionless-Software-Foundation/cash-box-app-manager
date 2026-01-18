/**
 * API configuration
 * Points directly to the backend server on port 3633
 */
export const API_BASE_URL = 'http://localhost:3633'

/**
 * Helper function to build API URLs
 * @param {string} endpoint - API endpoint (e.g., '/api/apps/installed')
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${API_BASE_URL}${cleanEndpoint}`
}
