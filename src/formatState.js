import _ from 'lodash'
import { getOutputType } from './abiParser'
import formatters from './stateFormatters'

export default (abi, rawState) => {
  let formattedState = {}
  _.forEach(rawState, (val, prop) => {
    const outputType = getOutputType(abi, prop)
    const formatter = formatters[outputType]
    if (!formatter) {
      throw new Error(`No formatter found for ${outputType}`)
    }
    formattedState[prop] = formatter(val)
  })
  return formattedState
}
