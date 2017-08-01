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

export function eventOutput (eventName, eventArgs) {
  const argsStr = _.map(eventArgs, (val, param) => {
    return `    ${param}: ${val}\n`
  }).join('')
  return argsOutput(eventName, argsStr)
}

export function eventsOutput (events) {
  const evtsStr = _.map(events, e => eventOutput(e.event, e.args)).join('')

  return `
  Events
  ------
  ${evtsStr}`
}

export function transactionOutput (tx) {
  return eventsOutput(tx.logs)
}
