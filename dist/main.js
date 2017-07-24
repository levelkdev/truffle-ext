'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = _interopDefault(require('lodash'));

const filterAbiFunctions = function filterAbiFunctions(abi) {
  let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const isConstant = opts.isConstant,
        hasInputs = opts.hasInputs;

  let filterPred = fn => {
    if (fn.type !== 'function') {
      return false;
    }
    if (isConstant !== undefined && fn.constant !== isConstant) {
      return false;
    }
    if (hasInputs !== undefined) {
      if (hasInputs === true && (!fn.inputs || fn.inputs.length === 0)) {
        return false;
      }
      if (hasInputs === false && fn.inputs && fn.inputs.length > 0) {
        return false;
      }
    }
    return true;
  };
  return _.filter(abi, filterPred);
};



const transactionFunctionNames = abi => {
  return _.map(filterAbiFunctions(abi, { isConstant: false }), o => o.name);
};

function underline(str) {
  return _.map(str, () => {
    return '-';
  }).join('');
}

function formatVal(val) {
  if (val && val.address) {
    val = `(
      Address: ${val.address}
      Balance: ${val.balance}
    )`;
  }
  return val;
}

function outputProps(props) {
  return _.map(props, (val, prop) => {
    val = formatVal(val);
    return `    ${prop}: ${val}`;
  }).join('\n');
}

var stateOutput = ((name, address, balance, props) => {
  return `
  ${name}
  ${underline(name)}
  Address:     ${address}
  Balance:     ${balance}
  Props:
${outputProps(props)}
`;
});

function logEvents(events) {
  const evtsStr = _.map(events, e => {
    const argsStr = _.map(e.args, (val, param) => {
      return `    ${param}: ${val}\n`;
    }).join('');
    return `
  ${e.event} (
${argsStr}  )
`;
  }).join('');

  return `
  Events
  ------
  ${evtsStr}`;
}

var transactionOutput = (tx => {
  return logEvents(tx.logs);
});

let contractState = (() => {
  var _ref = _asyncToGenerator(function* (contractInstance) {
    const fns = filterAbiFunctions(contractInstance.abi, {
      isConstant: true,
      hasInputs: false
    });
    const results = yield Promise.all(_.map(fns, function (fn) {
      return contractInstance[fn.name].call();
    }));
    let props = {};
    for (let i = 0; i < fns.length; i++) {
      let result = results[i];
      if (fns[i].outputs && fns[i].outputs[0] && fns[i].outputs[0].type === 'address') {
        result = {
          address: result,
          balance: getBalance(result)
        };
      }
      props[fns[i].name] = result;
    }
    const balance = getBalance(contractInstance.address);
    const address = contractInstance.address;
    const name = contractInstance.constructor._json.contract_name;


    return {
      balance,
      props,
      output: function output() {
        return stateOutput(name, address, balance, props);
      }
    };
  });

  return function contractState(_x) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/* global web3 */

function getBalance(address) {
  return web3.eth.getBalance(address).toNumber();
}

function wrapTxFunction(contractInstance, fnName) {
  const txFn = contractInstance[fnName];
  return _asyncToGenerator(function* () {
    let tx = yield txFn.apply(this, Array.prototype.slice.call(arguments));
    return _.assign(tx, { output: function output() {
        return transactionOutput(tx);
      } });
  });
}

function transactionFns(contractInstance) {
  const txFnNames = transactionFunctionNames(contractInstance.abi);
  let txFns = {};
  _.forEach(txFnNames, fnName => {
    txFns[fnName] = wrapTxFunction(contractInstance, fnName);
  });
  return txFns;
}

function wrapContractInstance(contractInstance) {
  return _.assign(contractInstance, transactionFns(contractInstance), { state: (() => {
      var _ref3 = _asyncToGenerator(function* () {
        return contractState(contractInstance);
      });

      return function state() {
        return _ref3.apply(this, arguments);
      };
    })() });
}

function wrapContractFn(fn) {
  return _asyncToGenerator(function* () {
    const c = yield fn.apply(this, Array.prototype.slice.call(arguments));
    return wrapContractInstance(c);
  });
}

function wrapContractArtifact(contractArtifact) {
  _.forEach(['new', 'at'], fnName => {
    contractArtifact[fnName] = wrapContractFn(contractArtifact[fnName]);
  });
  return contractArtifact;
}

function requireContract(contractArtifact) {
  return wrapContractArtifact(contractArtifact);
}

exports.requireContract = requireContract;
//# sourceMappingURL=main.js.map
