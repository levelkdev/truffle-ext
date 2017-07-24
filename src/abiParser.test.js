import { test, given } from 'sazerac'
import {
  filterAbiFunctions,
  constantFunctionNames,
  transactionFunctionNames,
  getOutputType
} from './abiParser'

const mockAbi = [
  {
    constant: false,
    name: 'fnOne',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    constant: true,
    name: 'fnTwo',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    constant: true,
    name: 'fnThree',
    type: 'function',
    inputs: ['address', 'uint256'],
    outputs: [{ name: '', type: 'address' }]
  },
  { type: 'notFunction' }
]

test(constantFunctionNames, () => {
  given(mockAbi)
    .describe('when given abi')
    .should('should return names of functions that are constant')
    .expect(['fnTwo', 'fnThree'])
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

test(filterAbiFunctions, () => {
  given(mockAbi, { isConstant: true })
    .describe('when given abi and isConstant=true')
    .should('should return only constant fns')
    .expect([mockAbi[1], mockAbi[2]])

  given(mockAbi, { isConstant: false })
    .describe('when given abi and isConstant=false')
    .should('should return only non constant fns')
    .expect([mockAbi[0]])

  given(mockAbi, { hasInputs: true })
    .describe('when given abi and hasInputs=false')
    .should('should return only fns with inputs')
    .expect([mockAbi[2]])

  given(mockAbi, { hasInputs: false })
    .describe('when given abi and hasInputs=false')
    .should('should return only fns without inputs')
    .expect([mockAbi[0], mockAbi[1]])

  given(mockAbi)
    .describe('when given no options')
    .should('should return all functions')
    .expect([mockAbi[0], mockAbi[1], mockAbi[2]])
})
