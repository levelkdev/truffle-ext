import getBalance from '../getBalance'

export default (fnCalls) => {
  let props = {}
  for (let i = 0; i < fnCalls.length; i++) {
    let result = fnCalls[i].result
    if (fnCalls[i].outputs && fnCalls[i].outputs[0] && fnCalls[i].outputs[0].type === 'address') {
      result = {
        address: result,
        balance: getBalance(result)
      }
    }
    props[fnCalls[i].name] = result
  }
  return props
}
