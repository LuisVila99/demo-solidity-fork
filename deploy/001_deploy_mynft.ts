
/**
 * Module dependencies.
 */

import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Deploy function.
 */

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { proxyOwner } = await getNamedAccounts();
  
  await deployments.deploy('MyNFT', {
    contract: 'MyNFT',
    from: proxyOwner,
    log: true,
    gasLimit: 2000000,
    proxy: {
      execute: {
        init: {
          args: [],
          methodName: 'initialize'
        }
      },
      owner: proxyOwner,
      proxyContract: 'OpenZeppelinTransparentProxy'
    }
  });
};

/**
 * Export 'deployFunction'.
 */

export default deployFunction;

/**
 * Deploy function tags.
 */

deployFunction.tags = ['MyNFT'];
