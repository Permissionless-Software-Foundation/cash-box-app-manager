/*
  Express server for Pi Appliance Host Application.
  The architecture of the code follows the Clean Architecture pattern.
*/

// npm libraries
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Local libraries
import config from '../src/config/index.js'
import Controllers from '../src/controllers/index.js'
import wlogger from '../src/adapters/wlogger.js'
import Adapters from '../src/adapters/index.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class Server {
  constructor () {
    // Encapsulate dependencies
    this.controllers = new Controllers()
    this.config = config
    this.process = process
  }

  async startServer () {
    try {
      // Create an Express instance.
      const app = express()

      // MIDDLEWARE START
      app.use(express.json())
      app.use(express.urlencoded({ extended: true }))
      app.use(cors({ origin: '*' }))

      // Request logging middleware
      app.use((req, res, next) => {
        wlogger.info(`[Request] ${req.method} ${req.path} (originalUrl: ${req.originalUrl})`)
        next()
      })

      // Error handling middleware
      app.use((err, req, res, next) => {
        wlogger.error('Express error:', err)
        res.status(500).json({
          error: err.message || 'Internal server error'
        })
      })

      // Wait for any adapters to initialize.
      await this.controllers.initAdapters()

      // Wait for any use-libraries to initialize.
      await this.controllers.initUseCases()

      // Attach REST API controllers to the app.
      this.controllers.attachRESTControllers(app)

      // Serve API documentation
      this.serveApiDocs(app)
      wlogger.info('[Server] API docs middleware registered')

      // Dynamic app routing - serve static files from installed apps
      // IMPORTANT: Must be before serveFrontend to intercept /apps/ routes
      this.setupAppRouting(app)
      wlogger.info('[Server] App routing middleware registered')

      // Serve React frontend
      this.serveFrontend(app)
      wlogger.info('[Server] Static frontend middleware registered')

      // Health check endpoint
      app.get('/health', (req, res) => {
        res.json({
          status: 'ok',
          service: 'cash-box-app-manager',
          version: config.version
        })
      })

      // Root endpoint
      app.get('/', (req, res) => {
        res.sendFile(join(__dirname, '../client/build/index.html'))
      })

      // MIDDLEWARE END

      console.log(`Running server in environment: ${this.config.env}`)
      wlogger.info(`Running server in environment: ${this.config.env}`)

      this.server = app.listen(this.config.port, () => {
        console.log(`Server started on port ${this.config.port}`)
        wlogger.info(`Server started on port ${this.config.port}`)
      })

      return app
    } catch (err) {
      console.error('Could not start server. Error: ', err)
      wlogger.error('Could not start server. Error: ', err)

      console.log(
        'Exiting after 5 seconds. Depending on process manager to restart.'
      )
      await this.sleep(5000)
      this.process.exit(1)
    }
  }

  /**
   * Serve API documentation
   */
  serveApiDocs (app) {
    const docsPath = join(__dirname, '../docs/api')
    app.use('/api-docs', express.static(docsPath))
    // Serve index.html for /api-docs root path
    app.get('/api-docs', (req, res) => {
      res.sendFile(join(docsPath, 'index.html'))
    })
  }

  /**
   * Setup dynamic routing for installed apps
   */
  setupAppRouting (app) {
    // Use app.use with wildcard pattern to match all /apps/:scope/:appName paths
    app.use('/apps/:scope/:appName', async (req, res, next) => {
      wlogger.info(`[App Routing] Route handler called for ${req.method} ${req.path}, params:`, req.params)
      try {
        const { scope, appName } = req.params
        const packageName = `@${scope}/${appName}`

        wlogger.info(`[App Routing] Request to /apps/${scope}/${appName} - path: ${req.path}, originalUrl: ${req.originalUrl}, baseUrl: ${req.baseUrl}`)

        // Get adapters instance
        const adapters = new Adapters({ config: this.config })
        await adapters.start()

        // Get build path for the app
        const buildPath = await adapters.npmService.getAppBuildPath(packageName)
        wlogger.info(`[App Routing] Build path for ${packageName}: ${buildPath}`)

        // Serve static files from the build directory
        const { access, stat } = await import('fs/promises')
        const { join } = await import('path')

        // Check if build directory exists
        await access(buildPath)

        // Remove the /apps/:scope/:appName prefix from the path
        // Use originalUrl if path doesn't match (Express may strip prefix in some cases)
        const fullPath = req.path.includes(`/apps/${scope}/${appName}`)
          ? req.path
          : req.originalUrl.split('?')[0] // Remove query string if present
        const relativePath = fullPath.replace(`/apps/${scope}/${appName}`, '') || '/'
        // Normalize trailing slashes - remove trailing slash for path resolution
        const normalizedRelativePath = relativePath === '/' ? '/' : relativePath.replace(/\/$/, '') || '/'
        const filePath = join(buildPath, normalizedRelativePath)
        wlogger.info(`[App Routing] fullPath: ${fullPath}, relativePath: ${relativePath}, normalizedRelativePath: ${normalizedRelativePath}, filePath: ${filePath}`)

        // Try to serve the requested file
        try {
          const stats = await stat(filePath)
          if (stats.isFile()) {
            // File exists, serve it
            wlogger.info(`[App Routing] Serving file: ${filePath}`)
            return res.sendFile(filePath)
          } else if (stats.isDirectory()) {
            // It's a directory, try index.html
            const indexPath = join(filePath, 'index.html')
            try {
              await access(indexPath)
              wlogger.info(`[App Routing] Serving index.html from directory: ${indexPath}`)
              return res.sendFile(indexPath)
            } catch {
              // No index.html in directory, try root index.html as fallback
              const rootIndexPath = join(buildPath, 'index.html')
              try {
                await access(rootIndexPath)
                wlogger.info(`[App Routing] Serving root index.html: ${rootIndexPath}`)
                return res.sendFile(rootIndexPath)
              } catch {
                wlogger.error(`[App Routing] index.html not found in ${indexPath} or ${rootIndexPath}`)
                return res.status(404).json({
                  error: 'index.html not found'
                })
              }
            }
          }
        } catch (fileErr) {
          // File doesn't exist, try index.html at root (for SPA routing)
          const indexPath = join(buildPath, 'index.html')
          try {
            await access(indexPath)
            wlogger.info(`[App Routing] File not found, serving root index.html: ${indexPath}`)
            return res.sendFile(indexPath)
          } catch {
            // index.html doesn't exist either
            wlogger.error(`[App Routing] index.html not found at: ${indexPath}`)
            return res.status(404).json({
              error: 'App not found'
            })
          }
        }
      } catch (err) {
        wlogger.error(`[App Routing] Error serving app ${req.params.scope}/${req.params.appName}:`, err)
        if (err.code === 'ENOENT') {
          return res.status(404).json({
            error: 'App not found'
          })
        }
        next(err)
      }
    })
  }

  /**
   * Serve React frontend
   */
  serveFrontend (app) {
    const frontendPath = join(__dirname, '../client/build')
    // Only serve static files for paths that don't start with /apps/
    app.use((req, res, next) => {
      wlogger.info(`[Static Middleware] Request: ${req.method} ${req.path}`)
      if (req.path.startsWith('/apps/')) {
        wlogger.info(`[Static] Skipping static file serving for /apps/ route: ${req.path}`)
        return next()
      }
      wlogger.debug(`[Static] Serving static file for path: ${req.path}`)
      express.static(frontendPath)(req, res, next)
    })
  }

  sleep (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Start the server if this file is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = new Server()
  server.startServer().catch(err => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })
}

export default Server
