import { test, given } from 'sazerac'
import { stateCall } from './main'

test(stateCall, () => {
  given('mock_fn', 'arg_0', 'arg_1').expect({
    name: 'mock_fn',
    args: ['arg_0', 'arg_1']
  })
})
