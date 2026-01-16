/*
  Use case: Discover available apps from npm registry
  This encapsulates the business logic for discovering apps.
*/

import wlogger from '../adapters/wlogger.js'

class DiscoverAppsUseCase {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error('Adapters instance required')
    }
    if (!this.adapters.npmService) {
      throw new Error('NpmService adapter required')
    }
  }

  /**
   * Discover available apps from npm registry
   * @returns {Promise<Array>} Array of available app objects
   */
  async execute () {
    try {
      wlogger.debug('Discovering apps from npm registry')
      const apps = await this.adapters.npmService.discoverApps()
      
      wlogger.info(`Discovered ${apps.length} apps from npm registry`)
      return apps
    } catch (err) {
      wlogger.error('Error in DiscoverAppsUseCase:', err)
      throw err
    }
  }
}

export default DiscoverAppsUseCase


