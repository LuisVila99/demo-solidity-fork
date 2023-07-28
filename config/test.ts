
/**
 * Export `test` mode configuration.
 */

module.exports = {
    accounts: {
      mnemonic: 'test test test test test test test test test test test test'
    },
    hardhat: {
      paths: {
        deploy: 'deploy'
      }
    },
    network: {
      name: 'hardhat',
      url: 'http://localhost:8545'
    }
  };
  