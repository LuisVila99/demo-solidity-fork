
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
  
  await deployments.deploy('EduPool', {
    contract: 'EduPool',
    from: proxyOwner,
    log: true,
    nonce: 'pending',
    skipIfAlreadyDeployed: true
  });
};

/**
 * Export 'deployFunction'.
 */

export default deployFunction;

/**
 * Deploy function tags.
 */

deployFunction.tags = ['EduPool'];
