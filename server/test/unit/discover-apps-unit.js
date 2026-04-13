/*
  Unit tests for the DiscoverAppsUseCase
*/

import chai from 'chai'
import sinon from 'sinon'
import DiscoverAppsUseCase from '../../src/use-cases/discover-apps.js'
import { mockDiscoveredApps } from './mocks/npm-service-mocks.js'

const assert = chai.assert

describe('#discover-apps.js', () => {
  let sandbox
  let uut
  let mockAdapters

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockAdapters = {
      npmService: {
        discoverApps: sandbox.stub()
      }
    }
    uut = new DiscoverAppsUseCase({
      adapters: mockAdapters
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#execute', () => {
    it('should discover apps successfully', async () => {
      // Mock external dependencies
      mockAdapters.npmService.discoverApps.resolves(mockDiscoveredApps)

      const result = await uut.execute()

      // Assert that result is an array
      assert.isArray(result)
      assert.equal(result.length, 3)

      // Assert that apps have required properties
      assert.property(result[0], 'name')
      assert.property(result[0], 'version')
      assert.property(result[0], 'description')

      // Verify adapter was called
      assert.isTrue(mockAdapters.npmService.discoverApps.calledOnce)
    })

    it('should throw error if adapter fails', async () => {
      const error = new Error('Failed to discover apps')
      mockAdapters.npmService.discoverApps.rejects(error)

      try {
        await uut.execute()
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Failed to discover apps')
      }
    })
  })
})
