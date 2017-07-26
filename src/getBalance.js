/* global web3 */

export default function getBalance (address) {
  return web3.eth.getBalance(address).toNumber()
}
