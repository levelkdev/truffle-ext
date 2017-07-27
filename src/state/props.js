import getBalance from '../getBalance'

function getFormattedResult (web3, fnCall) {
  let { result } = fnCall
  if (fnCall.outputs && fnCall.outputs[0] && fnCall.outputs[0].type === 'address') {
    result = {
      address: result,
      balance: getBalance(web3, result)
    }
  }
  return result
}

export default (web3, fnCalls) => {
  let props = {}
  for (let i = 0; i < fnCalls.length; i++) {
    const fnCall = fnCalls[i]
    if (fnCall.args) {
      if (!props[fnCall.name]) {
        props[fnCall.name] = { calls: [] }
      }
      props[fnCall.name].calls.push({
        args: fnCall.args,
        result: getFormattedResult(web3, fnCall)
      })
    } else {
      props[fnCall.name] = getFormattedResult(web3, fnCall)
    }
  }
  return props
}
