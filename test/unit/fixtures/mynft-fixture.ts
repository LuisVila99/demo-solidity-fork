

/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { deployments, ethers } from 'hardhat';
import { ABI, Address } from 'hardhat-deploy/types';

/**
 * Deploy MyNFT fixture.
 */

export async function deployMyNFTFixture(): Promise<Contract> {
  const mynftDeployment = await deployments.createFixture(
    async ({ deployments, getNamedAccounts }) => {
      const { proxyOwner } = await getNamedAccounts();

      return deployments.deploy('MyNFT', {
        contract: 'MyNFT',
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
    })();

  return ethers.getContractAt(
    mynftDeployment.abi as ABI, 
    mynftDeployment.address as Address
  );
}

/**
 * Get MyCurrency fixture.
 */

export async function getMyCurrencyFixture(): Promise<Contract> {
  await deployments.fixture();

  const mynftContractDeployment = await deployments.get('MyNFT');

  return ethers.getContractAt(
    mynftContractDeployment.abi,
    mynftContractDeployment.address
  );
}

/**
 * Types.
 */

export interface MyNFTFixtureData {

}
