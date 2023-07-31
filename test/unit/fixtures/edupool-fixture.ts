

/**
 * Module dependencies.
 */

import { Contract, BigNumberish } from 'ethers';
import { deployments, ethers } from 'hardhat';
import { ABI, Address } from 'hardhat-deploy/types';

/**
 * Deploy EduPool fixture.
 */

export async function deployEduPoolFixture(): Promise<Contract> {
  const contractDeployment = await deployments.createFixture(async ({ deployments, getNamedAccounts }) => {
    const { proxyOwner: deployer } = await getNamedAccounts();

    return deployments.deploy('EduPool', {
      contract: 'EduPool',
      from: deployer,
      log: true    
    });
  })();

  return ethers.getContractAt(contractDeployment.abi as ABI, contractDeployment.address as Address);
}

/**
 * Get EduPool fixture.
 */

export async function getEduPoolFixture(): Promise<Contract> {
  await deployments.fixture();

  const contractDeployment = await deployments.get('EduPool');

  return ethers.getContractAt(contractDeployment.abi, contractDeployment.address);
}

/**
 * Types.
 */

export interface EduPoolFixtureData {
    name?: string;
    stablecoin?: string;
    borrower?: string;
    interestPeriod?: string | BigNumberish;
    interestRate?: string | BigNumberish;
}