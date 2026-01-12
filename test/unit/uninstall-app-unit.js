/*
  Unit tests for the UninstallAppUseCase
*/

import chai from 'chai'
import sinon from 'sinon'
import UninstallAppUseCase from '../../src/use-cases/uninstall-app.js'

const assert = chai.assert

describe('#uninstall-app.js', () => {
  let sandbox
  let uut
  let mockAdapters

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockAdapters = {
      npmService: {
        uninstallPackage: sandbox.stub(),
        getInstalledApps: sandbox.stub(),
        saveInstalledApps: sandbox.stub()
      }
    }
    uut = new UninstallAppUseCase({
      adapters: mockAdapters
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#execute', () => {
    it('should uninstall app successfully', async () => {
      const scope = 'test'
      const appName = 'calculator-app'
      const packageName = `@${scope}/${appName}`

      const installedApps = [
        {
          name: packageName,
          version: '1.0.1',
          description: 'A simple calculator.',
          config: {}
        },
        {
          name: '@test/weather-app',
          version: '1.1.0',
          description: 'A simple weather app.',
          config: {}
        }
      ]

      // Mock external dependencies
      mockAdapters.npmService.uninstallPackage.resolves({ success: true })
      mockAdapters.npmService.getInstalledApps.resolves(installedApps)
      mockAdapters.npmService.saveInstalledApps.resolves()

      const result = await uut.execute(scope, appName)

      // Assert result
      assert.property(result, 'status')
      assert.equal(result.status, 'success')
      assert.property(result, 'message')

      // Verify adapters were called
      assert.isTrue(mockAdapters.npmService.uninstallPackage.calledWith(packageName))
      assert.isTrue(mockAdapters.npmService.getInstalledApps.calledOnce)
      assert.isTrue(mockAdapters.npmService.saveInstalledApps.calledOnce)

      // Verify that the app was removed from installed apps
      const savedApps = mockAdapters.npmService.saveInstalledApps.firstCall.args[0]
      assert.equal(savedApps.length, 1)
      assert.equal(savedApps[0].name, '@test/weather-app')
    })

    it('should throw error if uninstallation fails', async () => {
      const scope = 'test'
      const appName = 'calculator-app'
      const error = new Error('Uninstallation failed')

      mockAdapters.npmService.uninstallPackage.rejects(error)

      try {
        await uut.execute(scope, appName)
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Uninstallation failed')
      }
    })
  })
})

