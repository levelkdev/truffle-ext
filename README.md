# trestjs

extends truffle to output contract state

## installation

`yarn install`

## dev

`yarn build` - builds and outputs bundle to `dist/`
`yarn test` - runs tests
`yarn lint` - runs [standardjs](https://standardjs.com/) linter

## usage

```js
// import requireContract and use it to instantiate a trestjs contract
// from truffle artifacts
import { requireContract } from 'trestjs'
const MyContract = requireContract(
  artifacts.require('./MyContract.sol')
)

contract('MyContract', () => {
  it('works!', async () => {
    // use trestjs object the same as truffle objects,
    // call .new() to deploy a new instance of the contract for example
    const myContract = await MyContract.new()

    // trestjs provides an asynchronous state() function to get current
    // contract state
    let state = await myContract.state()

    // and the state object provides an output() function, which returns
    // human readable output for the state object
    console.log(state.output())

    // transactions return an object that provides an output() function to
    // get human readable output for the transaction
    let tx = await myContract.doSomething(1000)
    console.log(tx.output())

    // call state after a transaction to get the updated state
    state = await myContract.state()
    console.log(state.output())

    // send options to state() function to make multiple parameterized calls
    // to a function
    state = await myContract.state({
      calls: [
        ['balanceOf', '0x6704fbfcd5ef766b287262fa2281c105d57246a6'],
        ['balanceOf', '0x9e1ef1ec212f5dffb41d35d9e5c14054f26c6560'],
        ['balanceOf', '0xce42bdb34189a93c55de250e011c68faee374dd3']
      ]
    })
    console.log(state.output())

    //
  })
})
```
