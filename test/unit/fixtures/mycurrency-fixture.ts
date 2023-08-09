

/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { deployments, ethers } from 'hardhat';
import { ABI, Address } from 'hardhat-deploy/types';

/**
 * Deploy MyCurrency fixture.
 */

export async function deployMyCurrencyFixture(): Promise<Contract> {
  const mycurrencyDeployment = await deployments.createFixture(async ({ deployments, getNamedAccounts }) => {
    const { proxyOwner } = await getNamedAccounts();

    return deployments.deploy('MyCurrency', {
      contract: 'MyCurrency',
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

  return ethers.getContractAt(mycurrencyDeployment.abi as ABI, mycurrencyDeployment.address as Address);
}

/**
 * Get MyCurrency fixture.
 */

export async function getMyCurrencyFixture(): Promise<Contract> {
  await deployments.fixture();

  const mycurrencyContractDeployment = await deployments.get('MyCurrency');

  return ethers.getContractAt(mycurrencyContractDeployment.abi, mycurrencyContractDeployment.address);
}

/**
 * Types.
 */

export interface MyCurrencyFixtureData {

}
