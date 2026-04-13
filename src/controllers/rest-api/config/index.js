/*
  Router for /api/config routes
*/

import express from 'express'
import ConfigController from './controller.js'

class ConfigRouter {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    this.useCases = localConfig.useCases

    // Bind 'this' object to all subfunctions
    this.attach = this.attach.bind(this)
  }

  attach (app) {
    const router = express.Router()
    const controller = new ConfigController({
      adapters: this.adapters,
      useCases: this.useCases
    })

    // Define routes
    router.get('/:key', controller.getConfig)
    router.post('/:key', controller.saveConfig)

    // Mount router
    app.use('/api/config', router)
  }
}

export default ConfigRouter
