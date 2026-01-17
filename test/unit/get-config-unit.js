/*
  Unit tests for the GetConfigUseCase
*/

import chai from 'chai'
import sinon from 'sinon'
import GetConfigUseCase from '../../src/use-cases/get-config.js'

const assert = chai.assert

describe('#get-config.js', () => {
  let sandbox
  let uut
  let mockAdapters

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockAdapters = {
      levelDb: {
        getConfig: sandbox.stub()
      }
    }
    uut = new GetConfigUseCase({
      adapters: mockAdapters
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#execute', () => {
    it('should get config successfully', async () => {
      const mockKey = 'test-key'
      const mockValue = { setting1: 'value1', setting2: 'value2' }

      // Mock external dependencies
      mockAdapters.levelDb.getConfig.resolves(mockValue)

      const result = await uut.execute(mockKey)

      // Assert that result has expected structure
      assert.isObject(result)
      assert.property(result, 'key')
      assert.property(result, 'value')
      assert.equal(result.key, mockKey)
      assert.deepEqual(result.value, mockValue)

      // Verify adapter was called with correct key
      assert.isTrue(mockAdapters.levelDb.getConfig.calledOnce)
      assert.equal(mockAdapters.levelDb.getConfig.getCall(0).args[0], mockKey)
    })

    it('should return null when config not found', async () => {
      const mockKey = 'non-existent-key'

      // Mock adapter to return null (not found)
      mockAdapters.levelDb.getConfig.resolves(null)

      const result = await uut.execute(mockKey)

      // Should return null
      assert.isNull(result)

      // Verify adapter was called
      assert.isTrue(mockAdapters.levelDb.getConfig.calledOnce)
    })

    it('should throw error if key is missing', async () => {
      try {
        await uut.execute(null)
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Config key is required and must be a string')
      }
    })

    it('should throw error if key is not a string', async () => {
      try {
        await uut.execute(123)
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Config key is required and must be a string')
      }
    })

    it('should throw error if adapter fails', async () => {
      const mockKey = 'test-key'
      const error = new Error('Database error')
      mockAdapters.levelDb.getConfig.rejects(error)

      try {
        await uut.execute(mockKey)
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Database error')
      }
    })

    it('should throw error if stored config value is invalid', async () => {
      const mockKey = 'test-key'
      // Invalid value (not an object)
      const mockValue = 'invalid-value'

      mockAdapters.levelDb.getConfig.resolves(mockValue)

      try {
        await uut.execute(mockKey)
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Invalid config data stored in database')
      }
    })
  })
})
