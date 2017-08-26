/* global jest, describe, it */

import { assert } from 'chai'
import _ from 'lodash'
import props from './props'
import * as getBalance from '../getBalance'

const web3 = {}
getBalance.default = jest.fn(() => 'mock_balance')

const mockFnCalls = [
  {
    result: 'mock_res_0',
    outputs: [{ type: 'uint256' }],
    name: 'mock_call_0'
  },
  {
    result: 'mock_res_1',
    outputs: [{ type: 'address' }],
    name: 'mock_call_1'
  },
  {
    result: 'mock_call_2_res_0',
    args: ['arg_1'],
    name: 'mock_call_2'
  },
  {
    result: 'mock_call_2_res_1',
    args: ['arg_2'],
    name: 'mock_call_2'
  },
  {
    result: 'mock_res_3',
    outputs: [{ type: 'address' }],
    args: ['arg_1'],
    name: 'mock_call_3'
  }
]

describe('when given an array of fn calls', () => {
  it('should return map indexed by fn call names', () => {
    return props(web3, mockFnCalls).then((ret) => {
      assert.deepEqual(_.keys(ret), [
        'mock_call_0',
        'mock_call_1',
        'mock_call_2',
        'mock_call_3'
      ])
    })
  })

  it('should return calls array for functions with args', () => {
    return props(web3, mockFnCalls).then((ret) => {
      assert.deepEqual(ret['mock_call_2'].calls, [
        { args: ['arg_1'], result: 'mock_call_2_res_0' },
        { args: ['arg_2'], result: 'mock_call_2_res_1' }
      ])
    })
  })

  it('should return raw result for non address types', () => {
    return props(web3, mockFnCalls).then((ret) => {
      assert.deepEqual(ret['mock_call_0'], 'mock_res_0')
    })
  })

  it('should return balance and address for address type result', () => {
    return props(web3, mockFnCalls).then((ret) => {
      assert.deepEqual(ret['mock_call_1'].address, 'mock_res_1')
      assert.deepEqual(ret['mock_call_1'].balance, 'mock_balance')
    })
  })

  it('should return balance and address for address type within ' +
            ' functions with args results',
  () => {
    return props(web3, mockFnCalls).then((ret) => {
      assert.deepEqual(ret['mock_call_3'].calls[0].result.address, 'mock_res_3')
      assert.deepEqual(ret['mock_call_3'].calls[0].result.balance, 'mock_balance')
    })
  })
})
