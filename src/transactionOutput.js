import _ from 'lodash'

function argsOutput (evt, args) {
  if (!args) {
    return `
  ${evt} ()
`
  } else {
    return `
  ${evt} (
${args}  )
`
  }
}

function logEvents (events) {
  const evtsStr = _.map(events, (e) => {
    const argsStr = _.map(e.args, (val, param) => {
      return `    ${param}: ${val}\n`
    }).join('')
    return argsOutput(e.event, argsStr)
  }).join('')

  return `
  Events
  ------
  ${evtsStr}`
}

export default (tx) => {
  return logEvents(tx.logs)
}
