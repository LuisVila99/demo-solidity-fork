

/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { deployments, ethers } from 'hardhat';
import { ABI, Address } from 'hardhat-deploy/types';

/**
 * Deploy Swap fixture.
 */

export async function deploySwapFixture(): Promise<Contract> {
  const swapDeployment = await deployments.createFixture(
    async ({ deployments, getNamedAccounts }) => {
      const { proxyOwner } = await getNamedAccounts();

      return deployments.deploy('Swap', {
        contract: 'Swap',
        from: proxyOwner,
        log: true
      });
  })();

  return ethers.getContractAt(
    swapDeployment.abi as ABI,
    swapDeployment.address as Address
  );
}

/**
 * Get Swap fixture.
 */

export async function getSwapFixture(): Promise<Contract> {
  await deployments.fixture();

  const swapContractDeployment = await deployments.get('Swap');

  return ethers.getContractAt(
    swapContractDeployment.abi,
    swapContractDeployment.address
  );
}

/**
 * Types.
 */

export interface SwapFixtureData {

}
