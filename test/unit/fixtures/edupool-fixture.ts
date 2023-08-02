/**
 * Module dependencies.
 */

import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract, BigNumberish } from "ethers";
import { deployments, ethers, upgrades } from "hardhat";
import { ABI, Address } from "hardhat-deploy/types";

/**
 * Deploy EduPool fixture.
 */

export async function deployEduPoolFixture(): Promise<Contract> {
  const contractDeployment = await deployments.createFixture(
    async ({ deployments, getNamedAccounts }) => {
      const { proxyOwner: deployer } = await getNamedAccounts();

      return deployments.deploy("EduPool", {
        contract: "EduPool",
        from: deployer,
        log: true,
      });
    }
  )();

  return ethers.getContractAt(
    contractDeployment.abi as ABI,
    contractDeployment.address as Address
  );
}

/**
 * Get EduPool fixture.
 */

export async function getEduPoolFixture(): Promise<Contract> {
  await deployments.fixture();

  const contractDeployment = await deployments.get("EduPool");

  return ethers.getContractAt(
    contractDeployment.abi,
    contractDeployment.address
  );
}

/**
 * Deploy Proxy to EduPool fixture
 *
 * @param data The EduPool initialization data
 * @returns the deployed cproxy contract
 */
export async function deployProxyFixture(
  data: EduPoolFixtureData
): Promise<Contract> {
  const contractDeployment = await deployments.createFixture(
    async ({ upgrades }) => {
      return await upgrades.deployProxy(
        await ethers.getContractFactory("EduPool"),
        [
          data.name,
          data.stablecoin,
          data.borrower,
          data.interestPeriod,
          data.interestRate,
        ],
        { kind: "transparent" }
      );
    }
  )();

  return contractDeployment;
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
