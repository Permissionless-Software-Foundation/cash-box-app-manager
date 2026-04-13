/*
  Unit tests for the InstallAppUseCase
*/

import chai from 'chai'
import sinon from 'sinon'
import InstallAppUseCase from '../../src/use-cases/install-app.js'
import { mockPackageJson, mockAppConfig } from './mocks/npm-service-mocks.js'

const assert = chai.assert

describe('#install-app.js', () => {
  let sandbox
  let uut
  let mockAdapters

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockAdapters = {
      npmService: {
        installPackage: sandbox.stub(),
        readPackageJson: sandbox.stub(),
        readAppConfig: sandbox.stub(),
        getInstalledApps: sandbox.stub(),
        saveInstalledApps: sandbox.stub()
      }
    }
    uut = new InstallAppUseCase({
      adapters: mockAdapters
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#execute', () => {
    it('should install app successfully', async () => {
      const scope = 'test'
      const appName = 'calculator-app'
      const packageName = `@${scope}/${appName}`

      // Mock external dependencies
      mockAdapters.npmService.installPackage.resolves({ success: true })
      mockAdapters.npmService.readPackageJson.resolves(mockPackageJson)
      mockAdapters.npmService.readAppConfig.resolves(mockAppConfig)
      mockAdapters.npmService.getInstalledApps.resolves([])
      mockAdapters.npmService.saveInstalledApps.resolves()

      const result = await uut.execute(scope, appName)

      // Assert result
      assert.property(result, 'status')
      assert.equal(result.status, 'success')
      assert.property(result, 'message')
      assert.property(result, 'app')

      // Verify adapters were called
      assert.isTrue(mockAdapters.npmService.installPackage.calledWith(packageName))
      assert.isTrue(mockAdapters.npmService.readPackageJson.calledWith(packageName))
      assert.isTrue(mockAdapters.npmService.readAppConfig.calledWith(packageName))
      assert.isTrue(mockAdapters.npmService.getInstalledApps.calledOnce)
      assert.isTrue(mockAdapters.npmService.saveInstalledApps.calledOnce)
    })

    it('should update existing app if already installed', async () => {
      const scope = 'test'
      const appName = 'calculator-app'
      const packageName = `@${scope}/${appName}`

      const existingApps = [
        {
          name: packageName,
          version: '1.0.0',
          description: 'Old description',
          config: {}
        }
      ]

      mockAdapters.npmService.installPackage.resolves({ success: true })
      mockAdapters.npmService.readPackageJson.resolves(mockPackageJson)
      mockAdapters.npmService.readAppConfig.resolves(mockAppConfig)
      mockAdapters.npmService.getInstalledApps.resolves(existingApps)
      mockAdapters.npmService.saveInstalledApps.resolves()

      const result = await uut.execute(scope, appName)

      assert.equal(result.status, 'success')
      // Verify that saveInstalledApps was called with updated app
      const savedApps = mockAdapters.npmService.saveInstalledApps.firstCall.args[0]
      assert.equal(savedApps.length, 1)
      assert.equal(savedApps[0].version, mockPackageJson.version)
    })

    it('should throw error if installation fails', async () => {
      const scope = 'test'
      const appName = 'calculator-app'
      const error = new Error('Installation failed')

      mockAdapters.npmService.installPackage.rejects(error)

      try {
        await uut.execute(scope, appName)
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Installation failed')
      }
    })
  })
})
