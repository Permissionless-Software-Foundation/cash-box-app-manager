/*
  Integration tests for the /api/apps endpoints
*/

import chai from 'chai'
import http from 'http'
import Server from '../../bin/server.js'

const assert = chai.assert

// Helper function to make HTTP requests
function makeRequest (options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          resolve({ status: res.statusCode, data: parsed })
        } catch (err) {
          resolve({ status: res.statusCode, data: body })
        }
      })
    })
    req.on('error', reject)
    if (data) {
      req.write(JSON.stringify(data))
    }
    req.end()
  })
}

describe('#apps-api-integration.js', () => {
  let server
  const baseUrl = 'http://localhost:3000'
  const baseUrlObj = new URL(baseUrl)

  before(async () => {
    // Start the server
    server = new Server()
    await server.startServer()
    // Wait a bit for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000))
  })

  after(async () => {
    // Close the server
    if (server && server.server) {
      await new Promise((resolve) => {
        server.server.close(() => {
          resolve()
        })
      })
    }
  })

  describe('GET /api/apps/installed', () => {
    it('should return installed apps', async () => {
      const options = {
        hostname: baseUrlObj.hostname,
        port: baseUrlObj.port,
        path: '/api/apps/installed',
        method: 'GET'
      }

      const response = await makeRequest(options)

      assert.equal(response.status, 200)
      assert.isArray(response.data)
    })
  })

  describe('GET /api/apps/discover', () => {
    it('should return discovered apps', async () => {
      const options = {
        hostname: baseUrlObj.hostname,
        port: baseUrlObj.port,
        path: '/api/apps/discover',
        method: 'GET'
      }

      const response = await makeRequest(options)

      assert.equal(response.status, 200)
      assert.isArray(response.data)
    })
  })

  describe('POST /api/apps/install/:scope/:appName', () => {
    it('should return error for invalid app', async () => {
      const options = {
        hostname: baseUrlObj.hostname,
        port: baseUrlObj.port,
        path: '/api/apps/install/invalid/does-not-exist',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }

      const response = await makeRequest(options)

      // Should return error status (either 400 or 500)
      assert.isTrue(response.status >= 400)
      assert.property(response.data, 'status')
      assert.equal(response.data.status, 'error')
    })
  })

  describe('POST /api/apps/uninstall/:scope/:appName', () => {
    it('should return error for non-existent app', async () => {
      const options = {
        hostname: baseUrlObj.hostname,
        port: baseUrlObj.port,
        path: '/api/apps/uninstall/invalid/does-not-exist',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }

      const response = await makeRequest(options)

      // Should return error status
      assert.isTrue(response.status >= 400)
      assert.property(response.data, 'status')
      assert.equal(response.data.status, 'error')
    })
  })
})

