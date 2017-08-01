import _ from 'lodash'
import { filterAbiEvents } from './abiParser'
import { eventOutput } from './eventsOutput'

export default function (contractInstance) {
  const { contract_name: contractName } = contractInstance.constructor._json
  _.forEach(filterAbiEvents(contractInstance.abi), (evt) => {
    contractInstance[evt.name]().watch((err, resp) => {
      if (err) {
        console.log(`${contractName} event error: `, err)
      }
      console.log(eventOutput(`${contractName}.${evt.name}`, resp.args))
    })
  })
}
