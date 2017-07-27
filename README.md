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
  it('', async () => {
    // use trestjs object the same as truffle objects,
    // call .new() to deploy a new instance of the contract for example
    const cs = await MyContract.new()

    // trestjs provides an asynchronous state() function to get current
    // contract state
    let state = await cs.state()

    // and the state object provides an output() function, which returns
    // clean reporting output for the state object
    console.log(state.output())
  })
})
```
