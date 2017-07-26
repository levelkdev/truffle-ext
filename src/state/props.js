import getBalance from '../getBalance'

function getFormattedResult (fnCall) {
  let { result } = fnCall
  if (fnCall.outputs && fnCall.outputs[0] && fnCall.outputs[0].type === 'address') {
    result = {
      address: result,
      balance: getBalance(result)
    }
  }
  return result
}

export default (fnCalls) => {
  let props = {}
  for (let i = 0; i < fnCalls.length; i++) {
    const fnCall = fnCalls[i]
    if (fnCall.args) {
      if (!props[fnCall.name]) {
        props[fnCall.name] = { calls: [] }
      }
      props[fnCall.name].calls.push({
        args: fnCall.args,
        result: getFormattedResult(fnCall)
      })
    } else {
      props[fnCall.name] = getFormattedResult(fnCall)
    }
  }
  return props
}
