import _ from 'lodash'
import {
  constantFunctionNames,
  transactionFunctionNames
} from './abiParser'
import formatState from './formatState'

async function contractState (contractInstance) {
  const fnNames = constantFunctionNames(contractInstance.abi)
  const results = await Promise.all(_.map(fnNames, (fnName) => {
    return contractInstance[fnName].call()
  }))
  let state = {}
  for (let i = 0; i < fnNames.length; i++) {
    state[fnNames[i]] = results[i]
  }
  return state
}

function wrapTxFunction (contractInstance, fnName) {
  const txFn = contractInstance[fnName]
  return async function () {
    let tx = await txFn.apply(this, Array.prototype.slice.call(arguments))
    const state = await contractState(contractInstance)
    return _.assign(tx, { state })
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

function wrapContractInstance (contractInstance, state) {
  return _.assign(
    contractInstance,
    transactionFns(contractInstance),
    {
      state: state,
      formattedState: formatState(contractInstance.abi, state)
    }
  )
}

function newContractFn (newFn) {
  return async function () {
    const c = await newFn.apply(this, Array.prototype.slice.call(arguments))
    const state = await contractState(c)
    return wrapContractInstance(c, state)
  }
}

function wrapContractArtifact (contractArtifact) {
  contractArtifact.new = newContractFn(contractArtifact.new)
  return contractArtifact
}

export function requireContract (contractArtifact) {
  return wrapContractArtifact(contractArtifact)
}

/*
export const types = {
  Address: 'address',
  Balance: 'balance',
  Number: 'number',
  Tx: 'tx'
}

const formatters = {
  [types.Address]: (v) => { return v },
  [types.Balance]: (v) => { return toEth(v.toNumber()) },
  [types.Number]: (v) => { return v.toNumber() }
}

function formatState (def, rawState) {
  let formatted = _.assign({}, rawState)
  _.forEach(rawState, (val, prop) => {
    formatted[prop] = formatters[def[prop]](val)
  })
  return formatted
}

function nonTxFnNames (def) {
  return fnNamesWithoutType(def, types.Tx)
}

function fnNamesWithoutType (def, t) {
  const fnNames = []
  _.forEach(def, (val, key) => {
    if (val !== t) {
      fnNames.push(key)
    }
  })
  return fnNames
}

function fnNamesByType (def, t) {
  const fnNames = []
  _.forEach(def, (val, key) => {
    if (val === t) {
      fnNames.push(key)
    }
  })
  return fnNames
}

function getExecFn (contractInstance, def, txFnName) {
  return async function () {
    const argsArray = Array.prototype.slice.call(arguments)
    console.log('CALLING TX FN: ', txFnName)
    console.log('args: ', argsArray)
    const txRes = await contractInstance[txFnName].apply(null, argsArray)
    const rawState = await contractState(contractInstance, def)
    return {
      tx: txRes,
      state: formatState(def, rawState),
      rawState
    }
  }
}

async function contractState (contractInstance, def) {
  const callFnNames = nonTxFnNames(def)
  const results = await Promise.all(_.map(callFnNames, (fnName) => {
    return contractInstance[fnName].call()
  }))
  let state = {}
  for (let i = 0; i < callFnNames.length; i++) {
    state[callFnNames[i]] = results[i]
  }
  return state
}

function transactionFns (contractInstance, def) {
  let exec = {}
  _.forEach(fnNamesByType(def, types.Tx), (txFnName) => {
    exec[txFnName] = getExecFn(contractInstance, def, txFnName)
  })
  return exec
}

export async function trest (contractInstance, def) {
  const rawState = await contractState(contractInstance, def)
  return {
    exec: transactionFns(contractInstance, def),
    state: formatState(def, rawState),
    rawState
  }
}

*/

/*
module.exports.call = async (callPromise) => {
  let returnVal = await callPromise

  const assertReturnValue = (expectedReturnVal) => {
    assert.equal(
      returnVal,
      expectedReturnVal,
      `expected ${expectedReturnVal} to be returned, but got ${returnVal}`
    )
  }

  return {
    returnValue: returnVal,
    assertReturnValue
  }
}

module.exports.tx = async (transactionPromise) => {
  let err, resp
  try {
    resp = await transactionPromise
  } catch (_err) {
    err = _err
  }

  const events = {}

  events.filter = (event) => {
    return _.filter(resp.logs, { event })
  }

  events.log = () => {
    _.forEach(resp.logs, (log) => {
      console.log(`${log.event}: `, log.args)
    })
  }

  const assertLogEvent = (eventParams) => {
    const filteredEvents = events.filter(eventParams.event)
    assert.equal(filteredEvents.length, 1, `expected 1 ${eventParams.event} event but got ${filteredEvents.length}`)
    const event = filteredEvents[0]
    _.forEach(_.keys(eventParams), (p) => {
      if (p !== 'event') {
        assert.equal(
          event.args[p],
          eventParams[p],
          `expected event property '${eventParams.event}.${p}' to be ${eventParams[p]}, ` +
            `but got ${event.args[p]}`
        )
      }
    })
  }

  const assertThrewError = () => {
    assert.equal(
      typeof err === 'undefined',
      false,
      `expected an error, but no error was thrown`
    )
  }

  return {
    response: resp,
    error: err,
    events,
    assertLogEvent,
    assertThrewError
  }
}
*/
