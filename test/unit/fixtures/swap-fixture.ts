

/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { deployments, ethers } from 'hardhat';
import { ABI, Address } from 'hardhat-deploy/types';
import { deployMyNFTFixture } from './mynft-fixture';
import { deployMyCurrencyFixture } from './mycurrency-fixture';

/**
 * Deploy Swap fixture.
 */

export async function deploySwapFixture(): Promise<Contract> {

  const nftContract = await deployMyNFTFixture();
  const nftAddress = await nftContract.getAddress();
  const currencyContract = await deployMyCurrencyFixture();
  const currencyAddress = await currencyContract.getAddress();

  const swapDeployment = await deployments.createFixture(
    async ({ deployments, getNamedAccounts }) => {
      const { proxyOwner } = await getNamedAccounts();

      return deployments.deploy('Swap', {
        contract: 'Swap',
        from: proxyOwner,
        args: [nftAddress, currencyAddress],
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
