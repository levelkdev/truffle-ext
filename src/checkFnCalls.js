import _ from 'lodash'
import { findAbiFunction } from './abiParser'

const errMsgBase = 'state call error:'

export default (calls, abi) => {
  _.forEach(calls, (call) => {
    const fnDef = findAbiFunction(abi, call.name)
    if (!fnDef) {
      throw new Error(`${errMsgBase} ${call.name} was not found in the abi`)
    }
    if (fnDef.inputs.length !== call.args.length) {
      throw new Error(
        `${errMsgBase} ${call.name} expects ${fnDef.inputs.length} arguments ` +
          `but received ${call.args.length}`
      )
    }
    if (!fnDef.constant) {
      throw new Error(
        `${errMsgBase} ${call.name} cannot be executed as a state call ` +
          `because it modifies contract state`
      )
    }
  })
  return true
}
