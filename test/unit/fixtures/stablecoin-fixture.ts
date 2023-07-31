

/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { deployments, ethers } from 'hardhat';
import { ABI, Address } from 'hardhat-deploy/types';

/**
 * Deploy StableCoin fixture.
 */

export async function deployStableCoinFixture(data: StableCoinFixtureData = {}): Promise<Contract> {
  const stablecoinDeployment = await deployments.createFixture(async ({ deployments, getNamedAccounts }) => {
    const { proxyOwner } = await getNamedAccounts();

    return deployments.deploy('StableCoin', {
      contract: 'StableCoin',
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

  return ethers.getContractAt(stablecoinDeployment.abi as ABI, stablecoinDeployment.address as Address);
}

/**
 * Get StableCoin fixture.
 */

export async function getStableCoinFixture(): Promise<Contract> {
  await deployments.fixture();

  const stablecoinContractDeployment = await deployments.get('DemoCoin');

  return ethers.getContractAt(stablecoinContractDeployment.abi, stablecoinContractDeployment.address);
}

/**
 * Types.
 */

export interface StableCoinFixtureData {

}