/*
  Use case: Save configuration setting
  This encapsulates the business logic for saving configuration settings.
*/

import Config from '../entities/config.js'
import wlogger from '../adapters/wlogger.js'

class SaveConfigUseCase {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error('Adapters instance required')
    }
    if (!this.adapters.levelDb) {
      throw new Error('LevelDb adapter required')
    }
  }

  /**
   * Save a configuration setting
   * @param {string} key - Configuration key
   * @param {Object} value - Configuration value
   * @returns {Promise<Object>} Saved configuration object
   */
  async execute (key, value) {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Config key is required and must be a string')
      }

      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Config value is required and must be an object')
      }

      // Create and validate config entity
      const config = new Config({ key, value })
      if (!config.isValid()) {
        throw new Error('Invalid config data')
      }

      wlogger.debug(`Saving config for key: ${key}`)
      await this.adapters.levelDb.saveConfig(key, value)

      wlogger.info(`Saved config for key: ${key}`)
      return config.toJSON()
    } catch (err) {
      wlogger.error('Error in SaveConfigUseCase:', err)
      throw err
    }
  }
}

export default SaveConfigUseCase
