/*
  Use case: Install an app
  This encapsulates the business logic for installing apps.
*/

import App from '../entities/app.js'
import wlogger from '../adapters/wlogger.js'

class InstallAppUseCase {
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
   * Install an app
   * @param {string} scope - App scope (e.g., "my-apps")
   * @param {string} appName - App name (e.g., "calculator-app")
   * @returns {Promise<Object>} Installation result
   */
  async execute (scope, appName) {
    try {
      const packageName = `@${scope}/${appName}`
      wlogger.info(`Installing app: ${packageName}`)

      // Install the package
      await this.adapters.npmService.installPackage(packageName)

      // Read package.json and app.config.json
      const packageJson = await this.adapters.npmService.readPackageJson(packageName)
      const appConfig = await this.adapters.npmService.readAppConfig(packageName)

      // Create app metadata
      const appData = {
        name: packageName,
        version: packageJson.version,
        description: packageJson.description || '',
        config: appConfig || {}
      }

      // Validate app
      const app = new App(appData)
      if (!app.isValid()) {
        throw new Error(`Invalid app structure for ${packageName}`)
      }

      // Get current installed apps
      const installedApps = await this.adapters.npmService.getInstalledApps()

      // Check if app is already installed
      const existingIndex = installedApps.findIndex(a => a.name === packageName)
      if (existingIndex >= 0) {
        // Update existing app
        installedApps[existingIndex] = appData
      } else {
        // Add new app
        installedApps.push(appData)
      }

      // Save installed apps
      await this.adapters.npmService.saveInstalledApps(installedApps)

      wlogger.info(`Successfully installed app: ${packageName}`)
      return {
        status: 'success',
        message: 'App installed successfully.',
        app: appData
      }
    } catch (err) {
      wlogger.error(`Error installing app ${scope}/${appName}:`, err)
      throw err
    }
  }
}

export default InstallAppUseCase
