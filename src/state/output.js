import _ from 'lodash'

function underline (str) {
  return _.map(str, () => {
    return '-'
  }).join('')
}

function formatVal (val) {
  if (val) {
    if (val.address) {
      val = `(
        Address: ${val.address}
        Balance: ${val.balance}
      )`
    }
  }
  return val
}

function expandProps (props) {
  let expandedProps = {}
  _.forEach(props, (val, prop) => {
    if (val.calls) {
      _.forEach(val.calls, (call) => {
        const argsStr = call.args.join(',')
        expandedProps[`${prop}(${argsStr})`] = call.result
      })
    } else {
      expandedProps[prop] = val
    }
  })
  return expandedProps
}

function outputProps (props) {
  props = expandProps(props)
  return _.map(props, (val, prop) => {
    val = formatVal(val)
    return `    ${prop}: ${val}`
  }).join('\n')
}

export default (name, address, balance, props) => {
  return `
  ${name}
  ${underline(name)}
  Address:     ${address}
  Balance:     ${balance}
  Props:
${outputProps(props)}
`
}
