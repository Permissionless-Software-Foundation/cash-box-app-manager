/*
  Level DB adapter - handles configuration storage in Level database
*/

import { Level } from 'level'
import { join } from 'path'
import wlogger from './wlogger.js'
import config from '../config/index.js'

class LevelDbAdapter {
  constructor (localConfig = {}) {
    this.config = localConfig.config || config
    this.dbPath = localConfig.dbPath || join(process.cwd(), 'data', 'config-db')
    this.db = null
  }

  /**
   * Initialize the Level database connection
   */
  async start () {
    try {
      if (!this.db) {
        wlogger.info(`Opening Level DB at: ${this.dbPath}`)
        this.db = new Level(this.dbPath, { valueEncoding: 'json' })
        wlogger.info('Level DB initialized successfully')
      }
      return true
    } catch (err) {
      wlogger.error('Error initializing Level DB:', err)
      throw err
    }
  }

  /**
   * Close the Level database connection
   */
  async close () {
    try {
      if (this.db) {
        await this.db.close()
        this.db = null
        wlogger.info('Level DB closed successfully')
      }
    } catch (err) {
      wlogger.error('Error closing Level DB:', err)
      throw err
    }
  }

  /**
   * Get a configuration value by key
   * @param {string} key - Configuration key
   * @returns {Promise<Object|null>} Configuration value or null if not found
   */
  async getConfig (key) {
    try {
      if (!this.db) {
        throw new Error('Level DB not initialized. Call start() first.')
      }

      const value = await this.db.get(key).catch(err => {
        if (err.code === 'LEVEL_NOT_FOUND') {
          return null
        }
        throw err
      })

      wlogger.debug(`Retrieved config for key: ${key}`)
      return value
    } catch (err) {
      wlogger.error(`Error getting config for key ${key}:`, err)
      throw err
    }
  }

  /**
   * Save a configuration value by key
   * @param {string} key - Configuration key
   * @param {Object} value - Configuration value
   * @returns {Promise<void>}
   */
  async saveConfig (key, value) {
    try {
      if (!this.db) {
        throw new Error('Level DB not initialized. Call start() first.')
      }

      // Validate that value is an object
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error('Config value must be an object')
      }

      await this.db.put(key, value)
      wlogger.debug(`Saved config for key: ${key}`)
    } catch (err) {
      wlogger.error(`Error saving config for key ${key}:`, err)
      throw err
    }
  }

  /**
   * Get all configuration keys
   * @returns {Promise<Array<string>>} Array of configuration keys
   */
  async getAllKeys () {
    try {
      if (!this.db) {
        throw new Error('Level DB not initialized. Call start() first.')
      }

      const keys = []
      for await (const key of this.db.keys()) {
        keys.push(key)
      }
      return keys
    } catch (err) {
      wlogger.error('Error getting all config keys:', err)
      throw err
    }
  }

  /**
   * Delete a configuration value by key
   * @param {string} key - Configuration key
   * @returns {Promise<void>}
   */
  async deleteConfig (key) {
    try {
      if (!this.db) {
        throw new Error('Level DB not initialized. Call start() first.')
      }

      await this.db.del(key)
      wlogger.debug(`Deleted config for key: ${key}`)
    } catch (err) {
      wlogger.error(`Error deleting config for key ${key}:`, err)
      throw err
    }
  }
}

export default LevelDbAdapter

