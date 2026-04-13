/*
  This is a top-level library that encapsulates all the Use Cases.
  The concept of Use Cases comes from Clean Architecture.
*/

import GetInstalledAppsUseCase from './get-installed-apps.js'
import DiscoverAppsUseCase from './discover-apps.js'
import InstallAppUseCase from './install-app.js'
import UninstallAppUseCase from './uninstall-app.js'
import GetConfigUseCase from './get-config.js'
import SaveConfigUseCase from './save-config.js'

class UseCases {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Use Cases library.'
      )
    }

    // Instantiate use cases
    this.getInstalledApps = new GetInstalledAppsUseCase({
      adapters: this.adapters
    })
    this.discoverApps = new DiscoverAppsUseCase({
      adapters: this.adapters
    })
    this.installApp = new InstallAppUseCase({
      adapters: this.adapters
    })
    this.uninstallApp = new UninstallAppUseCase({
      adapters: this.adapters
    })
    this.getConfig = new GetConfigUseCase({
      adapters: this.adapters
    })
    this.saveConfig = new SaveConfigUseCase({
      adapters: this.adapters
    })
  }
}

export default UseCases
