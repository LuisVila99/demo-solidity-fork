
/**
 * Module dependencies.
 */

import '@openzeppelin/hardhat-upgrades';
import '@nomicfoundation/hardhat-chai-matchers';
import '@typechain/hardhat';
import 'hardhat-deploy';
import 'solidity-coverage';
import config from 'config';
import './tasks';
import { HardhatUserConfig } from "hardhat/config";
import { HttpNetworkUserConfig } from "hardhat/types";

/**
 * Networks configs.
 */

const networksConfigs: HttpNetworkUserConfig = {
  accounts: config.get('accounts'),
  ...config.get('network')
};

/**
 * Hardhat user config.
 */

const hardhatUserConfig: HardhatUserConfig = {
  namedAccounts: {
    proxyOwner: 0,
    other: 1
  },
  networks: {
    hardhat: config.get('accounts'),
    localNet: networksConfigs,
  },
  mocha: {
    timeout: 60000
  },
  paths: {
    deploy: config.get('hardhat.paths.deploy')
  },
  solidity: "0.8.16",
};

/**
 * Export `hardhatUserConfig`.
 */

export default hardhatUserConfig;
