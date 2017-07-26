import _ from 'lodash'

function underline (str) {
  return _.map(str, () => {
    return '-'
  }).join('')
}

function formatVal (val) {
  if (val && val.address) {
    val = `(
      Address: ${val.address}
      Balance: ${val.balance}
    )`
  }
  return val
}

function outputProps (props) {
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
