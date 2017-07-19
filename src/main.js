const _ = require('lodash')

module.exports = (assert) => {
  const ethCall = async (callPromise) => {
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

  const ethTransaction = async (transactionPromise) => {
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

  return { ethCall, ethTransaction }
}
