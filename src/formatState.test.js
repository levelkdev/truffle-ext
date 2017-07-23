/* global jest */

import { test, given } from 'sazerac'
import formatState from './formatState'

import formatters from './stateFormatters'

const mockAbi = [
  {
    constant: true,
    name: 'fnOne',
    type: 'function',
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    constant: true,
    name: 'fnTwo',
    type: 'function',
    outputs: [{ name: '', type: 'address' }]
  }
]

const mockState = {
  fnOne: 'mock_val_1',
  fnTwo: 'mock_val_2'
}

formatters.uint256 = jest.fn(() => 'mock_formatted_uint256')
formatters.address = jest.fn(() => 'mock_formatted_address')

test(formatState, () => {
  given(mockAbi, mockState)
    .describe('when given abi and raw state')
    .should('should return formatted state')
    .expect({
      fnOne: 'mock_formatted_uint256',
      fnTwo: 'mock_formatted_address'
    })
})
