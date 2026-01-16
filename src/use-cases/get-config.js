/*
  Use case: Get configuration setting
  This encapsulates the business logic for retrieving configuration settings.
*/

import Config from '../entities/config.js'
import wlogger from '../adapters/wlogger.js'

class GetConfigUseCase {
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
   * Get a configuration setting by key
   * @param {string} key - Configuration key
   * @returns {Promise<Object|null>} Configuration value or null if not found
   */
  async execute (key) {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Config key is required and must be a string')
      }

      wlogger.debug(`Getting config for key: ${key}`)
      const value = await this.adapters.levelDb.getConfig(key)

      if (value === null) {
        wlogger.debug(`Config not found for key: ${key}`)
        return null
      }

      // Create and validate config entity
      const config = new Config({ key, value })
      if (!config.isValid()) {
        wlogger.warn(`Invalid config data for key: ${key}`)
        throw new Error('Invalid config data stored in database')
      }

      wlogger.info(`Retrieved config for key: ${key}`)
      return config.toJSON()
    } catch (err) {
      wlogger.error('Error in GetConfigUseCase:', err)
      throw err
    }
  }
}

export default GetConfigUseCase

