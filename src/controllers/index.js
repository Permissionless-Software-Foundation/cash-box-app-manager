/*
  This is a top-level library that encapsulates all the Controllers.
  The concept of Controllers comes from Clean Architecture.
*/

import Adapters from '../adapters/index.js'
import UseCases from '../use-cases/index.js'
import RESTControllers from './rest-api/index.js'
import config from '../config/index.js'

class Controllers {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.config = config

    // Initialize adapters
    this.adapters = new Adapters({
      config: this.config
    })

    // Initialize use cases
    this.useCases = new UseCases({
      adapters: this.adapters
    })

    // Initialize REST controllers
    this.restControllers = new RESTControllers({
      adapters: this.adapters,
      useCases: this.useCases
    })

    // Bind 'this' object to all subfunctions
    this.initAdapters = this.initAdapters.bind(this)
    this.initUseCases = this.initUseCases.bind(this)
    this.attachRESTControllers = this.attachRESTControllers.bind(this)
  }

  async initAdapters () {
    try {
      await this.adapters.start()
      return true
    } catch (err) {
      console.error('Error initializing adapters:', err)
      throw err
    }
  }

  async initUseCases () {
    // Use cases are already initialized in constructor
    return true
  }

  attachRESTControllers (app) {
    this.restControllers.attachRESTControllers(app)
  }
}

export default Controllers
