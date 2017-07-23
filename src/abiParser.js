import _ from 'lodash'

export const constantFunctionNames = (abi) => {
  return _.map(_.filter(abi, { type: 'function', constant: true }), o => o.name)
}

export const transactionFunctionNames = (abi) => {
  return _.map(_.filter(abi, { type: 'function', constant: false }), o => o.name)
}

export const getOutputType = (abi, fnName) => {
  return _.find(abi, { name: fnName }).outputs[0].type
}
