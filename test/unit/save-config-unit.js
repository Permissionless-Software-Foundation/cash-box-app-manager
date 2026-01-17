/*
  Unit tests for the SaveConfigUseCase
*/

import chai from 'chai'
import sinon from 'sinon'
import SaveConfigUseCase from '../../src/use-cases/save-config.js'

const assert = chai.assert

describe('#save-config.js', () => {
  let sandbox
  let uut
  let mockAdapters

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockAdapters = {
      levelDb: {
        saveConfig: sandbox.stub().resolves()
      }
    }
    uut = new SaveConfigUseCase({
      adapters: mockAdapters
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#execute', () => {
    it('should save config successfully', async () => {
      const mockKey = 'test-key'
      const mockValue = { setting1: 'value1', setting2: 'value2' }

      // Mock external dependencies
      mockAdapters.levelDb.saveConfig.resolves()

      const result = await uut.execute(mockKey, mockValue)

      // Assert that result has expected structure
      assert.isObject(result)
      assert.property(result, 'key')
      assert.property(result, 'value')
      assert.equal(result.key, mockKey)
      assert.deepEqual(result.value, mockValue)

      // Verify adapter was called with correct parameters
      assert.isTrue(mockAdapters.levelDb.saveConfig.calledOnce)
      assert.equal(mockAdapters.levelDb.saveConfig.getCall(0).args[0], mockKey)
      assert.deepEqual(mockAdapters.levelDb.saveConfig.getCall(0).args[1], mockValue)
    })

    it('should throw error if key is missing', async () => {
      const mockValue = { setting: 'value' }

      try {
        await uut.execute(null, mockValue)
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Config key is required and must be a string')
      }
    })

    it('should throw error if key is not a string', async () => {
      const mockValue = { setting: 'value' }

      try {
        await uut.execute(123, mockValue)
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Config key is required and must be a string')
      }
    })

    it('should throw error if value is missing', async () => {
      const mockKey = 'test-key'

      try {
        await uut.execute(mockKey, null)
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Config value is required and must be an object')
      }
    })

    it('should throw error if value is not an object', async () => {
      const mockKey = 'test-key'

      try {
        await uut.execute(mockKey, 'not-an-object')
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Config value is required and must be an object')
      }
    })

    it('should throw error if value is an array', async () => {
      const mockKey = 'test-key'

      try {
        await uut.execute(mockKey, [1, 2, 3])
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Config value is required and must be an object')
      }
    })

    it('should throw error if adapter fails', async () => {
      const mockKey = 'test-key'
      const mockValue = { setting: 'value' }
      const error = new Error('Database error')
      mockAdapters.levelDb.saveConfig.rejects(error)

      try {
        await uut.execute(mockKey, mockValue)
        assert.fail('Should have thrown an error')
      } catch (err) {
        assert.equal(err.message, 'Database error')
      }
    })

    it('should save config with empty object value', async () => {
      const mockKey = 'test-key'
      const mockValue = {}

      mockAdapters.levelDb.saveConfig.resolves()

      const result = await uut.execute(mockKey, mockValue)

      assert.isObject(result)
      assert.equal(result.key, mockKey)
      assert.deepEqual(result.value, mockValue)
      assert.isTrue(mockAdapters.levelDb.saveConfig.calledOnce)
    })

    it('should save config with nested object value', async () => {
      const mockKey = 'test-key'
      const mockValue = {
        nested: {
          deep: {
            value: 'test'
          }
        },
        array: [1, 2, 3],
        string: 'value'
      }

      mockAdapters.levelDb.saveConfig.resolves()

      const result = await uut.execute(mockKey, mockValue)

      assert.isObject(result)
      assert.equal(result.key, mockKey)
      assert.deepEqual(result.value, mockValue)
      assert.isTrue(mockAdapters.levelDb.saveConfig.calledOnce)
    })
  })
})
