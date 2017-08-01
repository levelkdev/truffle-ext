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

let web3

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

  const results = await Promise.all(
    _.map(fnCalls, (fn) => {
      return contractInstance[fn.name].call.apply(null, fn.args || [])
    })
  )
  fnCalls = _.map(fnCalls, (v, i) => {
    fnCalls[i].result = results[i]
    return fnCalls[i]
  })

  const balance = getBalance(web3, contractInstance.address)
  const { address } = contractInstance
  const { contract_name: name } = contractInstance.constructor._json
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
    {
      state: async (opts = {}) => contractState(contractInstance, opts),
      logAllEvents: () => { logAllEvents(contractInstance) }
    }
  )
}

function wrapContractFn (fn) {
  return async function () {
    const c = await fn.apply(this, Array.prototype.slice.call(arguments))
    return wrapContractInstance(c)
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

export default (_web3) => {
  web3 = _web3
  return { requireContract }
}
