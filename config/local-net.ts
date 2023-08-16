
/**
 * Export `localNet` environment configuration.
 */

module.exports = {
    accounts: {
      mnemonic: 'fun inch jealous paddle impose cereal accident around inhale series twelve tiger'
    },
    hardhat: {
      paths: {
        deploy: 'deploy'
      }
    },
    network: {
      chainId: 1337,
      name: "localNet",
      url: "http://127.0.0.1:7545",
      // gas: "auto",
      gasPrice: 0
    }
  };
  