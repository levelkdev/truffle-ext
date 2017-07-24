import _ from 'lodash'

function underline (str) {
  return _.map(str, () => {
    return '-'
  }).join('')
}

function outputProps (props) {
  return _.map(props, (val, prop) => {
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
