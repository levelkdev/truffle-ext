/* global web3 */

import _ from 'lodash'
import {
  constantFunctionNames,
  transactionFunctionNames
} from './abiParser'
import stateOutput from './stateOutput.js'
import transactionOutput from './transactionOutput.js'

async function contractState (contractInstance) {
  const fnNames = constantFunctionNames(contractInstance.abi)
  const results = await Promise.all(_.map(fnNames, (fnName) => {
    return contractInstance[fnName].call()
  }))
  let props = {}
  for (let i = 0; i < fnNames.length; i++) {
    props[fnNames[i]] = results[i]
  }
  const balance = web3.eth.getBalance(contractInstance.address).toNumber()
  const { address } = contractInstance
  const { contract_name: name } = contractInstance.constructor._json

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
    { state: async () => contractState(contractInstance) }
  )
}

function newContractFn (newFn) {
  return async function () {
    const c = await newFn.apply(this, Array.prototype.slice.call(arguments))
    return wrapContractInstance(c)
  }
}

function wrapContractArtifact (contractArtifact) {
  contractArtifact.new = newContractFn(contractArtifact.new)
  return contractArtifact
}

export function requireContract (contractArtifact) {
  return wrapContractArtifact(contractArtifact)
}
