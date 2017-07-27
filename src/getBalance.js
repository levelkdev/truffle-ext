export default function getBalance (web3, address) {
  return web3.eth.getBalance(address).toNumber()
}
