import { test, given } from 'sazerac'
import checkFnCalls from './checkFnCalls'

const mockCalls = [
  { name: 'mock_fn_0', args: ['pizza', 'cheese'] },
  { name: 'mock_fn_0', args: ['pepperoni', 'mushroom'] },
  { name: 'mock_fn_1', args: ['bread'] }
]

const mockAbiNoErrs = [
  {
    constant: true,
    name: 'mock_fn_0',
    type: 'function',
    inputs: ['bytes32', 'bytes32'],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    constant: true,
    name: 'mock_fn_1',
    type: 'function',
    inputs: ['bytes32'],
    outputs: [{ name: '', type: 'address' }]
  }
]

const mockAbiArityErr = [
  {
    constant: true,
    name: 'mock_fn_1',
    type: 'function',
    inputs: ['bytes32', 'bytes32', 'bytes32'],
    outputs: [{ name: '', type: 'uint256' }]
  }
]

const mockAbiTxErr = [
  {
    constant: false,
    name: 'mock_fn_1',
    type: 'function',
    inputs: ['bytes32'],
    outputs: [{ name: '', type: 'uint256' }]
  }
]

const errMsgBase = 'state call error:'

test(checkFnCalls, () => {
  given(mockCalls, mockAbiNoErrs)
    .describe('when given calls with args that match the abi')
    .should('should not throw any errors')
    .expect(true)

  given([mockCalls[2]], mockAbiArityErr)
    .expectError(`${errMsgBase} mock_fn_1 expects 3 arguments but received 1`)

  given([mockCalls[2]], mockAbiTxErr)
    .expectError(`${errMsgBase} mock_fn_1 cannot be executed as a state call because it modifies contract state`)

  given([mockCalls[2]], [])
    .expectError(`${errMsgBase} mock_fn_1 was not found in the abi`)
})
