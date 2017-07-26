/* global jest */

import { assert } from 'chai'
import _ from 'lodash'
import { test, given } from 'sazerac'
import props from './props'
import * as getBalance from '../getBalance'

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
  }
]

test(props, () => {
  given(mockFnCalls)
    .describe('when given an array of fn calls')
    .assert('should return map indexed by fn call names', (ret) => {
      assert.deepEqual(_.keys(ret), ['mock_call_0', 'mock_call_1'])
    })
    .assert('should return raw result for non address types', (ret) => {
      assert.deepEqual(ret['mock_call_0'], 'mock_res_0')
    })
    .assert('should return balance and address for address type result', (ret) => {
      assert.deepEqual(ret['mock_call_1'].address, 'mock_res_1')
      assert.deepEqual(ret['mock_call_1'].balance, 'mock_balance')
    })
})
