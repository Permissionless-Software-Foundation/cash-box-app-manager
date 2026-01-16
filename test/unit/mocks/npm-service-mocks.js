/*
  Mock data for npm-service adapter tests
*/

export const mockInstalledApps = [
  {
    name: '@test/calculator-app',
    version: '1.0.1',
    description: 'A simple calculator.',
    config: {
      displayName: 'Calculator',
      icon: '/apps/calculator-app/icon.png'
    }
  },
  {
    name: '@test/weather-app',
    version: '1.1.0',
    description: 'A simple weather app.',
    config: {
      displayName: 'Weather',
      icon: '/apps/weather-app/icon.png'
    }
  }
]

export const mockDiscoveredApps = [
  {
    name: '@test/calculator-app',
    version: '1.0.1',
    description: 'A simple calculator.'
  },
  {
    name: '@test/weather-app',
    version: '1.1.0',
    description: 'A simple weather app.'
  },
  {
    name: '@test/new-app',
    version: '2.0.0',
    description: 'A new app.'
  }
]

export const mockPackageJson = {
  name: '@test/calculator-app',
  version: '1.0.1',
  description: 'A simple calculator.'
}

export const mockAppConfig = {
  displayName: 'Calculator',
  icon: 'assets/icon.png'
}
