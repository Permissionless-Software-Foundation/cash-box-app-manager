/*
  Use case: Uninstall an app
  This encapsulates the business logic for uninstalling apps.
*/

import wlogger from '../adapters/wlogger.js'

class UninstallAppUseCase {
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
   * Uninstall an app
   * @param {string} scope - App scope (e.g., "my-apps")
   * @param {string} appName - App name (e.g., "calculator-app")
   * @returns {Promise<Object>} Uninstallation result
   */
  async execute (scope, appName) {
    try {
      const packageName = `@${scope}/${appName}`
      wlogger.info(`Uninstalling app: ${packageName}`)

      // Uninstall the package
      await this.adapters.npmService.uninstallPackage(packageName)

      // Get current installed apps
      const installedApps = await this.adapters.npmService.getInstalledApps()

      // Remove app from installed apps
      const filteredApps = installedApps.filter(app => app.name !== packageName)

      // Save installed apps
      await this.adapters.npmService.saveInstalledApps(filteredApps)

      wlogger.info(`Successfully uninstalled app: ${packageName}`)
      return {
        status: 'success',
        message: 'App uninstalled successfully.'
      }
    } catch (err) {
      wlogger.error(`Error uninstalling app ${scope}/${appName}:`, err)
      throw err
    }
  }
}

export default UninstallAppUseCase

