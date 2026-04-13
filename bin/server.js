/*
  Express server for Cash Box App Manager.
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

      // Wait for any adapters to initialize.
      await this.controllers.initAdapters()

      // Wait for any use-libraries to initialize.
      await this.controllers.initUseCases()

      // Attach REST API controllers to the app.
      this.controllers.attachRESTControllers(app)

      // Serve API documentation
      this.serveApiDocs(app)
      wlogger.info('[Server] API docs middleware registered')

      // Health check endpoint
      app.get('/health', (req, res) => {
        res.json({
          status: 'ok',
          service: 'cash-box-app-manager',
          version: config.version
        })
      })

      // Root endpoint — UI is provided separately (e.g. remote-admin)
      app.get('/', (req, res) => {
        res.json({
          service: 'cash-box-app-manager',
          version: config.version,
          docs: '/api-docs',
          configApi: '/api/config'
        })
      })

      // 404 — after all routes
      app.use((req, res) => {
        res.status(404).json({
          status: 'error',
          message: 'Not found'
        })
      })

      // Error handler — must be last; only runs when next(err) is called or an error is thrown from sync middleware
      app.use((err, req, res, next) => {
        wlogger.error('Express error:', err)
        if (res.headersSent) {
          return next(err)
        }
        res.status(500).json({
          status: 'error',
          message: err.message || 'Internal server error'
        })
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
