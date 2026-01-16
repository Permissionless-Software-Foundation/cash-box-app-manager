/*
  This is a top-level library that encapsulates all the additional Adapters.
  The concept of Adapters comes from Clean Architecture.
*/

import NpmService from './npm-service.js'
import LevelDbAdapter from './level-db.js'
import config from '../config/index.js'

class Adapters {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.config = config
    this.npmService = new NpmService({
      config: this.config
    })
    this.levelDb = new LevelDbAdapter({
      config: this.config
    })
  }

  async start () {
    try {
      // Initialize Level DB
      await this.levelDb.start()
      console.log('Adapters started.')
      return true
    } catch (err) {
      console.error('Error in adapters/index.js/start()')
      throw err
    }
  }
}

export default Adapters
