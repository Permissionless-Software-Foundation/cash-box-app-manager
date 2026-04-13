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
   * @api {get} /api/apps/installed Get installed apps
   * @apiPermission public
   * @apiName GetInstalledApps
   * @apiGroup Apps
   *
   * @apiDescription Get all currently installed applications
   *
   * @apiExample {curl} Example usage:
   *     curl -X GET http://localhost:3000/api/apps/installed
   *
   * @apiSuccess {Array} apps Array of installed app objects
   * @apiSuccess {String} apps.name Package name (e.g., "@scope/app-name")
   * @apiSuccess {String} apps.displayName App display name
   * @apiSuccess {String} apps.description App description
   * @apiSuccess {String} apps.version App version
   * @apiSuccess {String} apps.icon App icon path
   * @apiSuccess {String} apps.main App entry point
   *
   * @apiError (500) {String} status Error status
   * @apiError (500) {String} message Error message
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
   * @api {get} /api/apps/discover Discover available apps
   * @apiPermission public
   * @apiName DiscoverApps
   * @apiGroup Apps
   *
   * @apiDescription Discover available apps from npm registry that match the app keyword
   *
   * @apiExample {curl} Example usage:
   *     curl -X GET http://localhost:3000/api/apps/discover
   *
   * @apiSuccess {Array} apps Array of available app objects
   * @apiSuccess {String} apps.name Package name
   * @apiSuccess {String} apps.description App description
   * @apiSuccess {String} apps.version App version
   * @apiSuccess {Object} apps.versions Available versions
   *
   * @apiError (500) {String} status Error status
   * @apiError (500) {String} message Error message
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
   * @api {post} /api/apps/install/:scope/:appName Install app
   * @apiPermission public
   * @apiName InstallApp
   * @apiGroup Apps
   *
   * @apiDescription Install an application from npm registry
   *
   * @apiParam {String} scope App scope (without @ prefix)
   * @apiParam {String} appName App name
   *
   * @apiExample {curl} Example usage:
   *     curl -X POST http://localhost:3000/api/apps/install/my-scope/my-app
   *
   * @apiSuccess {String} status Success status
   * @apiSuccess {String} message Success message
   *
   * @apiError (400) {String} status Error status
   * @apiError (400) {String} message Error message
   *
   * @apiError (500) {String} status Error status
   * @apiError (500) {String} message Error message
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
   * @api {post} /api/apps/uninstall/:scope/:appName Uninstall app
   * @apiPermission public
   * @apiName UninstallApp
   * @apiGroup Apps
   *
   * @apiDescription Uninstall an application
   *
   * @apiParam {String} scope App scope (without @ prefix)
   * @apiParam {String} appName App name
   *
   * @apiExample {curl} Example usage:
   *     curl -X POST http://localhost:3000/api/apps/uninstall/my-scope/my-app
   *
   * @apiSuccess {String} status Success status
   * @apiSuccess {String} message Success message
   *
   * @apiError (400) {String} status Error status
   * @apiError (400) {String} message Error message
   *
   * @apiError (500) {String} status Error status
   * @apiError (500) {String} message Error message
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
