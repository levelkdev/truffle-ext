import { test, given } from 'sazerac'
import {
  constantFunctionNames,
  transactionFunctionNames,
  getOutputType
} from './abiParser'

const mockAbi = [
  {
    constant: false,
    name: 'fnOne',
    type: 'function',
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    constant: true,
    name: 'fnTwo',
    type: 'function',
    outputs: [{ name: '', type: 'address' }]
  },
  { type: 'notFunction' }
]

test(constantFunctionNames, () => {
  given(mockAbi)
    .describe('when given abi')
    .should('should return names of functions that are constant')
    .expect(['fnTwo'])
})

test(transactionFunctionNames, () => {
  given(mockAbi)
    .describe('when given abi')
    .should('should return names of functions that are not constant')
    .expect(['fnOne'])
})

test(getOutputType, () => {
  given(mockAbi, 'fnOne')
    .describe('when given abi and function name')
    .should('should return output type')
    .expect('uint256')
})
