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
        wlogger.info(`${req.method} ${req.path}`)
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

      // Dynamic app routing - serve static files from installed apps
      this.setupAppRouting(app)

      // Serve React frontend
      this.serveFrontend(app)

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
   * Setup dynamic routing for installed apps
   */
  setupAppRouting (app) {
    app.use('/apps/:scope/:appName', async (req, res, next) => {
      try {
        const { scope, appName } = req.params
        const packageName = `@${scope}/${appName}`

        // Get adapters instance
        const adapters = new Adapters({ config: this.config })
        await adapters.start()

        // Get build path for the app
        const buildPath = await adapters.npmService.getAppBuildPath(packageName)

        // Serve static files from the build directory
        const { access, stat } = await import('fs/promises')
        const { join } = await import('path')
        
        // Check if build directory exists
        await access(buildPath)

        // Remove the /apps/:scope/:appName prefix from the path
        const relativePath = req.path.replace(`/apps/${scope}/${appName}`, '') || '/'
        const filePath = join(buildPath, relativePath)

        // Try to serve the requested file
        try {
          const stats = await stat(filePath)
          if (stats.isFile()) {
            // File exists, serve it
            return res.sendFile(filePath)
          } else if (stats.isDirectory()) {
            // It's a directory, try index.html
            const indexPath = join(filePath, 'index.html')
            try {
              await access(indexPath)
              return res.sendFile(indexPath)
            } catch {
              // No index.html in directory
            }
          }
        } catch (fileErr) {
          // File doesn't exist, try index.html at root (for SPA routing)
          const indexPath = join(buildPath, 'index.html')
          try {
            await access(indexPath)
            return res.sendFile(indexPath)
          } catch {
            // index.html doesn't exist either
            return res.status(404).json({
              error: 'App not found'
            })
          }
        }
      } catch (err) {
        wlogger.error(`Error serving app ${req.params.scope}/${req.params.appName}:`, err)
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
    app.use(express.static(frontendPath))
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

