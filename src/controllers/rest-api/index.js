/*
  This index file for the Clean Architecture Controllers loads dependencies,
  creates instances, and attaches the controller to REST API endpoints for
  Express.
*/

import ConfigRouter from './config/index.js'
import config from '../../config/index.js'

class RESTControllers {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating REST Controller libraries.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating REST Controller libraries.'
      )
    }

    // Bind 'this' object to all subfunctions.
    this.attachRESTControllers = this.attachRESTControllers.bind(this)

    // Encapsulate dependencies
    this.config = config
  }

  attachRESTControllers (app) {
    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    const configRouter = new ConfigRouter(dependencies)
    configRouter.attach(app)
  }
}

export default RESTControllers
