/*
  This is a top-level library that encapsulates all the Use Cases.
  The concept of Use Cases comes from Clean Architecture.
*/

import GetConfigUseCase from './get-config.js'
import SaveConfigUseCase from './save-config.js'

class UseCases {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Use Cases library.'
      )
    }

    this.getConfig = new GetConfigUseCase({
      adapters: this.adapters
    })
    this.saveConfig = new SaveConfigUseCase({
      adapters: this.adapters
    })
  }
}

export default UseCases
