/*
  Use case: Get all installed apps
  This encapsulates the business logic for retrieving installed apps.
*/

import App from '../entities/app.js'
import wlogger from '../adapters/wlogger.js'

class GetInstalledAppsUseCase {
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
   * Get all installed apps
   * @returns {Promise<Array>} Array of installed app objects
   */
  async execute () {
    try {
      wlogger.debug('Getting installed apps')
      const appsData = await this.adapters.npmService.getInstalledApps()
      
      // Convert to App entities and validate
      const apps = appsData.map(data => {
        const app = new App(data)
        if (!app.isValid()) {
          wlogger.warn(`Invalid app data: ${JSON.stringify(data)}`)
          return null
        }
        return app.toJSON()
      }).filter(app => app !== null)

      wlogger.info(`Retrieved ${apps.length} installed apps`)
      return apps
    } catch (err) {
      wlogger.error('Error in GetInstalledAppsUseCase:', err)
      throw err
    }
  }
}

export default GetInstalledAppsUseCase


