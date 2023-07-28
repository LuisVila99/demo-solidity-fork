

/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { deployments, ethers } from 'hardhat';
import { ABI, Address } from 'hardhat-deploy/types';

/**
 * Deploy DMC fixture.
 */

export async function deployDmcFixture(data: DMCFixtureData = {}): Promise<Contract> {
  const dmcDeployment = await deployments.createFixture(async ({ deployments, getNamedAccounts }) => {
    const { proxyOwner } = await getNamedAccounts();

    return deployments.deploy('DemoCoin', {
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
  })();

  return ethers.getContractAt(dmcDeployment.abi as ABI, dmcDeployment.address as Address);
}

/**
 * Get DMC fixture.
 */

export async function getDmcFixture(): Promise<Contract> {
  await deployments.fixture();

  const dmcContractDeployment = await deployments.get('DemoCoin');

  return ethers.getContractAt(dmcContractDeployment.abi, dmcContractDeployment.address);
}

/**
 * Types.
 */

export interface DMCFixtureData {

}