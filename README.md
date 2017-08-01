# truffle-ext

Extends truffle artifacts to provide state and event logging

## Installation

`yarn install`

## Usage

import the `truffle-ext` function and call it with your `web3` instance. Use the `requireContract` function by passing it a truffle contract artifact.

```js
  import truffleExt from 'truffle-ext'
  const { requireContract } = truffleExt(web3)
  const MyContract = requireContract(
    artifacts.require('./MyContract.sol')
  )
```

The returned contract instance provides the same functions as the truffle artifact. For example, call `.new()` to deploy a new instance of the contract

```js
  const myContract = await MyContract.new()
```

You can also use `.at()` or `.deployed()`

### State Logging

Use the asynchronous `state()` function to get current contract state

```js    
  let state = await myContract.state()
```

The state object provides an `output()` function, which returns human readable output for the state object

```js
  console.log(state.output())
```

```
  # example output

  MyContract
  -----------------
  Address:     0x8a7dcafdda1707289a40a6bd701a6b8fb788cd34
  Balance:     0
  Calls:
    fooInt(): 0
    fooAddress(): 
      Address: 0xc32de2edac1bec88174b15dc0b6c412b4b23c302
      Balance: 48080040500000000000
    bar(): true
```

Options can be passed to the `state()` function to make multiple parameterized calls
    
```js
  state = await myToken.state({
    calls: [
      ['balanceOf', '0x6704fbfcd5ef766b287262fa2281c105d57246a6'],
      ['balanceOf', '0x9e1ef1ec212f5dffb41d35d9e5c14054f26c6560'],
      ['balanceOf', '0xce42bdb34189a93c55de250e011c68faee374dd3']
    ]
  })
  console.log(state.output())
```

```
  # example output

  MyToken
  ----------
  Address:     0x6b9857484ce82c9cc053b18c07841631b8e74fe2
  Balance:     150000000000000000000
  Calls:
    name(): My Token
    totalSupply(): 50000000000000000000
    decimals(): 18
    symbol(): TKN
    balanceOf(0x6704fbfcd5ef766b287262fa2281c105d57246a6): 50000000000000000000
    balanceOf(0x9e1ef1ec212f5dffb41d35d9e5c14054f26c6560): 50000000000000000000
    balanceOf(0xce42bdb34189a93c55de250e011c68faee374dd3): 50000000000000000000
```

### Transaction Logging

Execute transactions as you would with truffle

```js
  let tx = await myContract.updateSomeState(1000)
```

Transactions return an object that provides an `output()` function to get human readable output for the events that were called during the transaction

```js
  console.log(tx.output())
```

```
  # example output

  Events
  ------
  
  SomeStateUpdated (
    stateValue: 1000
  )

  OtherStateUpdated (
    someOtherState: true
  )
```

### Event logging

Log all events for an instance of a contract by calling `logAllEvents()`

```js
  myContract.logAllEvents()
```

Or log all events for all contract instances by calling `truffleExt` with `logEvents: true` option

```js
  const { requireContract } = truffleExt(web3, { logEvents: true })
```

```
  # example output

  MyContract.SomeEvent (
    fooAddress: 0xf9c1705fd0945258023af32ddc911bbedb6ca123
    barInt: 0
  )

  OtherContract.SomeOtherEvent (
    foo: false
  )
```
