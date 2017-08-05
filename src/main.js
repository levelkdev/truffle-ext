import _ from 'lodash'
import {
  findAbiFunction,
  filterAbiFunctions,
  transactionFunctionNames
} from './abiParser'
import { transactionOutput } from './eventsOutput'
import getBalance from './getBalance'
import stateProps from './state/props'
import stateOutput from './state/output'
import checkFnCalls from './checkFnCalls'
import logAllEvents from './logAllEvents'

let web3, opts

function callFromArgs () {
  return {
    name: arguments[0],
    args: Array.prototype.slice.call(arguments, 1)
  }
}

async function contractState (contractInstance, opts = {}) {
  if (!opts.calls) {
    opts.calls = []
  }

  const { address } = contractInstance
  const name = getContractName(contractInstance)

  const fnDefs = filterAbiFunctions(contractInstance.abi, {
    isConstant: true,
    hasInputs: false
  })

  if (opts.calls.length > 0) {
    opts.calls = _.map(opts.calls, (call) => callFromArgs.apply(null, call))
    checkFnCalls(opts.calls, contractInstance.abi)
    opts.calls = _.map(opts.calls, (call) => _.assign(call, findAbiFunction(call.name)))
  }

  let fnCalls = _.concat(fnDefs, opts.calls)

  let results
  results = await Promise.all(
    _.map(fnCalls, (fn) => {
      return contractInstance[fn.name].call.apply(contractInstance, fn.args || [])
    })
  )
  fnCalls = _.map(fnCalls, (v, i) => {
    fnCalls[i].result = results[i]
    return fnCalls[i]
  })

  const balance = getBalance(web3, contractInstance.address)
  const props = stateProps(web3, fnCalls)

  return {
    balance,
    props,
    output: () => stateOutput(name, address, balance, props)
  }
}

function wrapTxFunction (contractInstance, fnName) {
  const txFn = contractInstance[fnName]
  return async function () {
    const tx = await txFn.apply(contractInstance, Array.prototype.slice.call(arguments))
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
    {
      state: async (opts = {}) => contractState(contractInstance, opts),
      logAllEvents: () => { logAllEvents(contractInstance) }
    }
  )
}

function wrapContractFn (fn) {
  return async function () {
    const c = await fn.apply(this, Array.prototype.slice.call(arguments))
    const contractInstance = wrapContractInstance(c)
    if (opts.logEvents) {
      contractInstance.logAllEvents()
    }
    return contractInstance
  }
}

function wrapContractArtifact (contractArtifact) {
  _.forEach(['new', 'at', 'deployed'], (fnName) => {
    contractArtifact[fnName] = wrapContractFn(contractArtifact[fnName])
  })
  return contractArtifact
}

function requireContract (contractArtifact) {
  return wrapContractArtifact(contractArtifact)
}

function getContractName (contractInstance) {
  return contractInstance.constructor._json.contract_name
}

export default (_web3, _opts = {}) => {
  web3 = _web3
  opts = _opts
  return { requireContract }
}
