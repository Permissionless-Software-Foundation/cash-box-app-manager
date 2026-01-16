/*
  NpmService adapter - handles npm registry interactions and npm commands
*/

import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile, writeFile, access } from 'fs/promises'
import { join } from 'path'
import npmRegistryFetch from 'npm-registry-fetch'
import wlogger from './wlogger.js'
import config from '../config/index.js'

const execAsync = promisify(exec)

class NpmService {
  constructor (localConfig = {}) {
    this.config = localConfig.config || config
    this.installedAppsFile = localConfig.installedAppsFile || this.config.installedAppsFile
    this.discoverCache = null
    this.discoverCacheTime = null
  }

  /**
   * Get all installed apps from installed-apps.json
   * @returns {Promise<Array>} Array of installed app objects
   */
  async getInstalledApps () {
    try {
      const filePath = join(process.cwd(), this.installedAppsFile)
      await access(filePath)
      const data = await readFile(filePath, 'utf-8')
      return JSON.parse(data)
    } catch (err) {
      if (err.code === 'ENOENT') {
        // File doesn't exist, return empty array
        return []
      }
      wlogger.error('Error reading installed apps:', err)
      throw err
    }
  }

  /**
   * Save installed apps to installed-apps.json
   * @param {Array} apps - Array of app objects
   */
  async saveInstalledApps (apps) {
    try {
      const filePath = join(process.cwd(), this.installedAppsFile)
      await writeFile(filePath, JSON.stringify(apps, null, 2), 'utf-8')
    } catch (err) {
      wlogger.error('Error saving installed apps:', err)
      throw err
    }
  }

  /**
   * Discover apps from npm registry
   * @returns {Promise<Array>} Array of available app objects
   */
  async discoverApps () {
    try {
      // Check cache
      const now = Date.now()
      if (this.discoverCache && this.discoverCacheTime &&
          (now - this.discoverCacheTime) < this.config.discoverCacheTTL) {
        wlogger.debug('Returning cached discover results')
        return this.discoverCache
      }

      // Search npm registry for packages with the keyword
      const searchUrl = `/-/v1/search?text=keywords:${this.config.appKeyword}&size=250`
      const response = await npmRegistryFetch(searchUrl)
      const data = await response.json()

      // Transform results to app format
      const apps = data.objects.map(obj => ({
        name: obj.package.name,
        version: obj.package.version,
        description: obj.package.description || ''
      }))

      // Cache results
      this.discoverCache = apps
      this.discoverCacheTime = now

      wlogger.info(`Discovered ${apps.length} apps from npm registry`)
      return apps
    } catch (err) {
      wlogger.error('Error discovering apps:', err)
      throw err
    }
  }

  /**
   * Install an npm package
   * @param {string} packageName - Full package name (e.g., "@scope/app-name")
   * @returns {Promise<Object>} Installation result
   */
  async installPackage (packageName) {
    try {
      wlogger.info(`Installing package: ${packageName}`)
      const { stdout, stderr } = await execAsync(`npm install ${packageName}`, {
        cwd: process.cwd(),
        timeout: 300000 // 5 minutes timeout
      })

      if (stderr && !stderr.includes('npm WARN')) {
        wlogger.warn(`npm install stderr: ${stderr}`)
      }

      wlogger.info(`Successfully installed ${packageName}`)
      return { success: true, stdout, stderr }
    } catch (err) {
      wlogger.error(`Error installing package ${packageName}:`, err)
      throw err
    }
  }

  /**
   * Uninstall an npm package
   * @param {string} packageName - Full package name (e.g., "@scope/app-name")
   * @returns {Promise<Object>} Uninstallation result
   */
  async uninstallPackage (packageName) {
    try {
      wlogger.info(`Uninstalling package: ${packageName}`)
      const { stdout, stderr } = await execAsync(`npm uninstall ${packageName}`, {
        cwd: process.cwd(),
        timeout: 60000 // 1 minute timeout
      })

      if (stderr && !stderr.includes('npm WARN')) {
        wlogger.warn(`npm uninstall stderr: ${stderr}`)
      }

      wlogger.info(`Successfully uninstalled ${packageName}`)
      return { success: true, stdout, stderr }
    } catch (err) {
      wlogger.error(`Error uninstalling package ${packageName}:`, err)
      throw err
    }
  }

  /**
   * Read package.json from node_modules
   * @param {string} packageName - Full package name
   * @returns {Promise<Object>} Package.json content
   */
  async readPackageJson (packageName) {
    try {
      const packagePath = join(process.cwd(), 'node_modules', packageName, 'package.json')
      const data = await readFile(packagePath, 'utf-8')
      return JSON.parse(data)
    } catch (err) {
      wlogger.error(`Error reading package.json for ${packageName}:`, err)
      throw err
    }
  }

  /**
   * Read app.config.json from node_modules
   * @param {string} packageName - Full package name
   * @returns {Promise<Object|null>} App config or null if not found
   */
  async readAppConfig (packageName) {
    try {
      const configPath = join(process.cwd(), 'node_modules', packageName, 'app.config.json')
      await access(configPath)
      const data = await readFile(configPath, 'utf-8')
      return JSON.parse(data)
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Config file doesn't exist, return null
        return null
      }
      wlogger.error(`Error reading app.config.json for ${packageName}:`, err)
      throw err
    }
  }

  /**
   * Get the build directory path for an installed app
   * @param {string} packageName - Full package name
   * @returns {Promise<string>} Path to build directory
   */
  async getAppBuildPath (packageName) {
    try {
      const packageJson = await this.readPackageJson(packageName)

      // Check for common build directories
      const possibleDirs = ['dist', 'build', 'public']
      const basePath = join(process.cwd(), 'node_modules', packageName)

      for (const dir of possibleDirs) {
        const dirPath = join(basePath, dir)
        try {
          await access(dirPath)
          return dirPath
        } catch {
          // Directory doesn't exist, try next
        }
      }

      // If no build directory found, return base path
      return basePath
    } catch (err) {
      wlogger.error(`Error getting build path for ${packageName}:`, err)
      throw err
    }
  }
}

export default NpmService
