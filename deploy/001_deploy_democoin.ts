
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
  
  await deployments.deploy('DemoCoin', {
    contract: 'DemoCoin',
    from: proxyOwner,
    log: true,
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

deployFunction.tags = ['DemoCoin'];
