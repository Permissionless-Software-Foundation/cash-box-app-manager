/*
  REST API Controller library for the /api/config routes
*/

class ConfigRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /config REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /config REST Controller.'
      )
    }

    // Bind 'this' object to all subfunctions
    this.getConfig = this.getConfig.bind(this)
    this.saveConfig = this.saveConfig.bind(this)
  }

  /**
   * @api {get} /api/config/:key Get configuration setting
   * @apiPermission public
   * @apiName GetConfig
   * @apiGroup Config
   *
   * @apiDescription Get a configuration setting by key
   *
   * @apiParam {String} key Configuration key
   *
   * @apiExample {curl} Example usage:
   *     curl -X GET http://localhost:3000/api/config/myConfigKey
   *
   * @apiSuccess {String} key Configuration key
   * @apiSuccess {Object} value Configuration value (object)
   *
   * @apiError (404) {String} status Error status
   * @apiError (404) {String} message Error message
   *
   * @apiError (400) {String} status Error status
   * @apiError (400) {String} message Error message
   *
   * @apiError (500) {String} status Error status
   * @apiError (500) {String} message Error message
   */
  async getConfig (req, res, next) {
    try {
      const { key } = req.params

      if (!key) {
        return res.status(400).json({
          status: 'error',
          message: 'Config key is required'
        })
      }

      const config = await this.useCases.getConfig.execute(key)

      if (config === null) {
        return res.status(404).json({
          status: 'error',
          message: 'Config not found'
        })
      }

      return res.status(200).json(config)
    } catch (err) {
      next(err)
    }
  }

  /**
   * @api {post} /api/config/:key Save configuration setting
   * @apiPermission public
   * @apiName SaveConfig
   * @apiGroup Config
   *
   * @apiDescription Save a configuration setting by key. The value must be an object.
   *
   * @apiParam {String} key Configuration key
   *
   * @apiBody {Object} value Configuration value (must be an object, not array or primitive)
   *
   * @apiExample {curl} Example usage:
   *     curl -X POST http://localhost:3000/api/config/myConfigKey \
   *       -H "Content-Type: application/json" \
   *       -d '{"setting1": "value1", "setting2": 42}'
   *
   * @apiSuccess {String} key Configuration key
   * @apiSuccess {Object} value Configuration value that was saved
   *
   * @apiError (400) {String} status Error status
   * @apiError (400) {String} message Error message
   *
   * @apiError (500) {String} status Error status
   * @apiError (500) {String} message Error message
   */
  async saveConfig (req, res, next) {
    try {
      const { key } = req.params
      const { value } = req.body

      if (!key) {
        return res.status(400).json({
          status: 'error',
          message: 'Config key is required'
        })
      }

      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return res.status(400).json({
          status: 'error',
          message: 'Config value is required and must be an object'
        })
      }

      const config = await this.useCases.saveConfig.execute(key, value)
      return res.status(200).json(config)
    } catch (err) {
      next(err)
    }
  }
}

export default ConfigRESTControllerLib
