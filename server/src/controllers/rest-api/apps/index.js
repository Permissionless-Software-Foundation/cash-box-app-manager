/*
  Router for /api/apps routes
*/

import express from 'express'
import AppsController from './controller.js'

class AppsRouter {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    this.useCases = localConfig.useCases

    // Bind 'this' object to all subfunctions
    this.attach = this.attach.bind(this)
  }

  attach (app) {
    const router = express.Router()
    const controller = new AppsController({
      adapters: this.adapters,
      useCases: this.useCases
    })

    // Define routes
    router.get('/installed', controller.getInstalledApps)
    router.get('/discover', controller.discoverApps)
    router.post('/install/:scope/:appName', controller.installApp)
    router.post('/uninstall/:scope/:appName', controller.uninstallApp)

    // Mount router
    app.use('/api/apps', router)
  }
}

export default AppsRouter
