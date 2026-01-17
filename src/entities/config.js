/*
  Config entity - represents a configuration setting.
  This is a domain model following Clean Architecture principles.
*/

class Config {
  constructor (data) {
    this.key = data.key
    this.value = data.value || {}
  }

  /**
   * Validates the config structure
   * @returns {boolean} True if valid
   */
  isValid () {
    if (!this.key || typeof this.key !== 'string') {
      return false
    }

    // Key must be a non-empty string
    if (this.key.trim().length === 0) {
      return false
    }

    // Value must be an object
    if (typeof this.value !== 'object' || this.value === null || Array.isArray(this.value)) {
      return false
    }

    return true
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain config object
   */
  toJSON () {
    return {
      key: this.key,
      value: this.value
    }
  }
}

export default Config
