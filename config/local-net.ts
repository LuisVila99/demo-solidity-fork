
/**
 * Export `localNet` environment configuration.
 */

module.exports = {
    accounts: {
      mnemonic: 'ill shift duck clarify away country sleep demise style orange engine coast'
    },
    hardhat: {
      paths: {
        deploy: 'deploy'
      }
    },
    network: {
      chainId: 1337,
      name: "localNet",
      url: "http://127.0.0.1:7545"
    }
  };
  