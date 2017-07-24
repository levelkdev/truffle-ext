import _ from 'lodash'

function logEvents (events) {
  const evtsStr = _.map(events, (e) => {
    const argsStr = _.map(e.args, (val, param) => {
      return `    ${param}: ${val}\n`
    }).join('')
    return `
  ${e.event} (
${argsStr}  )
`
  }).join('')

  return `
  Events
  ------
  ${evtsStr}`
}

export default (tx) => {
  return logEvents(tx.logs)
}
