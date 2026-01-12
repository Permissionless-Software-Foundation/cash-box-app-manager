/*
  Unit tests for the GetInstalledAppsUseCase
*/

import chai from 'chai'
import sinon from 'sinon'
import GetInstalledAppsUseCase from '../../src/use-cases/get-installed-apps.js'
import { mockInstalledApps } from './mocks/npm-service-mocks.js'

const assert = chai.assert

describe('#get-installed-apps.js', () => {
  let sandbox
  let uut
  let mockAdapters

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockAdapters = {
      npmService: {
        getInstalledApps: sandbox.stub()
      }
    }
    uut = new GetInstalledAppsUseCase({
      adapters: mockAdapters
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#execute', () => {
    it('should get installed apps successfully', async () => {
      // Mock external dependencies
      mockAdapters.npmService.getInstalledApps.resolves(mockInstalledApps)

      const result = await uut.execute()

      // Assert that result is an array
      assert.isArray(result)
      assert.equal(result.length, 2)

      // Assert that apps have required properties
      assert.property(result[0], 'name')
      assert.property(result[0], 'version')
      assert.property(result[0], 'description')
      assert.property(result[0], 'config')

      // Verify adapter was called
      assert.isTrue(mockAdapters.npmService.getInstalledApps.calledOnce)
    })

    it('should filter out invalid apps', async () => {
      const invalidApps = [
        ...mockInstalledApps,
        { name: 'invalid-app' }, // Missing version
        { version: '1.0.0' } // Missing name
      ]

      mockAdapters.npmService.getInstalledApps.resolves(invalidApps)

      const result = await uut.execute()

      // Should only return valid apps
      assert.isArray(result)
      assert.equal(result.length, 2)
    })

    it('should throw error if adapter fails', async () => {
      const error = new Error('Failed to read installed apps')
      mockAdapters.npmService.getInstalledApps.rejects(error)

      try {
        await uut.execute()
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Failed to read installed apps')
      }
    })
  })
})

