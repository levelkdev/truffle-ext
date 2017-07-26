import _ from 'lodash'
import {
  filterAbiFunctions,
  transactionFunctionNames
} from './abiParser'
import transactionOutput from './transactionOutput'
import getBalance from './getBalance'
import stateProps from './state/props'
import stateOutput from './state/output'

async function contractState (contractInstance, opts) {
  const fns = filterAbiFunctions(contractInstance.abi, {
    isConstant: true,
    hasInputs: false
  })
  const results = await Promise.all(_.map(fns, (fn) => {
    return contractInstance[fn.name].call()
  }))
  const fnCalls = _.map(fns, (v, i) => {
    fns[i].result = results[i]
    return fns[i]
  })
  const balance = getBalance(contractInstance.address)
  const { address } = contractInstance
  const { contract_name: name } = contractInstance.constructor._json
  const props = stateProps(fnCalls)

  return {
    balance,
    props,
    output: () => stateOutput(name, address, balance, props)
  }
}

function wrapTxFunction (contractInstance, fnName) {
  const txFn = contractInstance[fnName]
  return async function () {
    let tx = await txFn.apply(this, Array.prototype.slice.call(arguments))
    return _.assign(
      tx,
      { output: () => transactionOutput(tx) }
    )
  }
}

function transactionFns (contractInstance) {
  const txFnNames = transactionFunctionNames(contractInstance.abi)
  let txFns = {}
  _.forEach(txFnNames, (fnName) => {
    txFns[fnName] = wrapTxFunction(contractInstance, fnName)
  })
  return txFns
}

function wrapContractInstance (contractInstance) {
  return _.assign(
    contractInstance,
    transactionFns(contractInstance),
    { state: async (opts = {}) => contractState(contractInstance, opts) }
  )
}

function wrapContractFn (fn) {
  return async function () {
    const c = await fn.apply(this, Array.prototype.slice.call(arguments))
    return wrapContractInstance(c)
  }
}

function wrapContractArtifact (contractArtifact) {
  _.forEach(['new', 'at'], (fnName) => {
    contractArtifact[fnName] = wrapContractFn(contractArtifact[fnName])
  })
  return contractArtifact
}

export function requireContract (contractArtifact) {
  return wrapContractArtifact(contractArtifact)
}
