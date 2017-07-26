import _ from 'lodash'

export const filterAbiFunctions = (abi, opts = {}) => {
  const { isConstant, hasInputs } = opts
  let filterPred = (fn) => {
    if (fn.type !== 'function') {
      return false
    }
    if (isConstant !== undefined && fn.constant !== isConstant) {
      return false
    }
    if (hasInputs !== undefined) {
      if (hasInputs === true && (!fn.inputs || fn.inputs.length === 0)) {
        return false
      }
      if (hasInputs === false && fn.inputs && fn.inputs.length > 0) {
        return false
      }
    }
    return true
  }
  return _.filter(abi, filterPred)
}

export const findAbiFunction = (abi, fnName) => {
  return _.find(abi, { name: fnName })
}

export const constantFunctionNames = (abi) => {
  return _.map(filterAbiFunctions(abi, { isConstant: true }), o => o.name)
}

export const transactionFunctionNames = (abi) => {
  return _.map(filterAbiFunctions(abi, { isConstant: false }), o => o.name)
}

export const getOutputType = (abi, fnName) => {
  return findAbiFunction(abi, fnName).outputs[0].type
}
