
/**
 * Module dependencies.
 */

import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Deploy function.
 */

const deployFunction: DeployFunction = 
  async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, ethers, getNamedAccounts } = hre;
    const { proxyOwner } = await getNamedAccounts();

    const nftInfo = await deployments.get("MyNFT");
    const currencyInfo = await deployments.get("MyCurrency");
    
    await deployments.deploy('Swap',
      {
        contract: 'Swap',
        from: proxyOwner,
        log: true,
        nonce: 'pending',
        skipIfAlreadyDeployed: true,
        args: [nftInfo.address,
               currencyInfo.address]
      });
  };

/**
 * Export 'deployFunction'.
 */

export default deployFunction;

/**
 * Deploy function tags.
 */

deployFunction.tags = ['Swap'];
