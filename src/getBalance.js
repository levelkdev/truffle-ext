export default async (web3, address) => {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(address, function (err, result) {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}
