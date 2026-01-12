/*
  REST API Controller library for the /api/apps routes
*/

import wlogger from '../../../adapters/wlogger.js'

class AppsRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /apps REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /apps REST Controller.'
      )
    }

    // Bind 'this' object to all subfunctions
    this.getInstalledApps = this.getInstalledApps.bind(this)
    this.discoverApps = this.discoverApps.bind(this)
    this.installApp = this.installApp.bind(this)
    this.uninstallApp = this.uninstallApp.bind(this)
    this.handleError = this.handleError.bind(this)
  }

  /**
   * GET /api/apps/installed
   * Get all installed apps
   */
  async getInstalledApps (req, res) {
    try {
      const apps = await this.useCases.getInstalledApps.execute()
      return res.status(200).json(apps)
    } catch (err) {
      return this.handleError(err, req, res)
    }
  }

  /**
   * GET /api/apps/discover
   * Discover available apps from npm registry
   */
  async discoverApps (req, res) {
    try {
      const apps = await this.useCases.discoverApps.execute()
      return res.status(200).json(apps)
    } catch (err) {
      return this.handleError(err, req, res)
    }
  }

  /**
   * POST /api/apps/install/:scope/:appName
   * Install an app
   */
  async installApp (req, res) {
    try {
      const { scope, appName } = req.params

      if (!scope || !appName) {
        return res.status(400).json({
          status: 'error',
          message: 'Scope and appName are required'
        })
      }

      const result = await this.useCases.installApp.execute(scope, appName)
      return res.status(200).json(result)
    } catch (err) {
      return this.handleError(err, req, res)
    }
  }

  /**
   * POST /api/apps/uninstall/:scope/:appName
   * Uninstall an app
   */
  async uninstallApp (req, res) {
    try {
      const { scope, appName } = req.params

      if (!scope || !appName) {
        return res.status(400).json({
          status: 'error',
          message: 'Scope and appName are required'
        })
      }

      const result = await this.useCases.uninstallApp.execute(scope, appName)
      return res.status(200).json(result)
    } catch (err) {
      return this.handleError(err, req, res)
    }
  }

  handleError (err, req, res) {
    wlogger.error('Error in AppsRESTController:', err)
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Internal server error'
    })
  }
}

export default AppsRESTControllerLib

