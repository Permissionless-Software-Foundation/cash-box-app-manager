/*
  App entity - represents an installed or available app.
  This is a domain model following Clean Architecture principles.
*/

class App {
  constructor (data) {
    this.name = data.name // e.g., "@scope/app-name"
    this.version = data.version
    this.description = data.description || ''
    this.config = data.config || {}
    this.displayName = this.config.displayName || this.name
    this.icon = this.config.icon || ''
  }

  /**
   * Validates the app structure
   * @returns {boolean} True if valid
   */
  isValid () {
    if (!this.name || !this.version) {
      return false
    }

    // Name must be a string
    if (typeof this.name !== 'string') {
      return false
    }

    // Name should follow npm scope format: @scope/package-name
    if (!this.name.match(/^@[^/]+\/[^/]+$/)) {
      return false
    }

    // Version must be a string
    if (typeof this.version !== 'string') {
      return false
    }

    return true
  }

  /**
   * Extract scope from package name
   * @returns {string} Scope (e.g., "my-apps")
   */
  getScope () {
    const match = this.name.match(/^@([^/]+)\//)
    return match ? match[1] : ''
  }

  /**
   * Extract app name from package name
   * @returns {string} App name (e.g., "calculator-app")
   */
  getAppName () {
    const match = this.name.match(/^@[^/]+\/(.+)$/)
    return match ? match[1] : ''
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain app object
   */
  toJSON () {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      config: this.config
    }
  }
}

export default App


