
/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { deployments, ethers, getNamedAccounts, getUnnamedAccounts } from 'hardhat';
import { expect } from 'chai';
import { getStableCoinFixture } from '../fixtures/stablecoin-fixture';
import { deployEduPoolFixture, EduPoolFixtureData } from '../fixtures/edupool-fixture';

/**
 * EduPool tests.
 */

describe('EduPool', () => {
  let contract: Contract;
  let stablecoinContract: Contract;
  const poolName = 'JohnDoe Student Loan';
  const interestPeriod = '60';
  const interestRate =  ethers.parseEther('0.05');

  before(async () => {
    stablecoinContract = await getStableCoinFixture();
  });

  beforeEach(async () => {
    contract = await deployEduPoolFixture();
  });

  describe('initialize', () => {
    it('should the `EduPool` contract not be initializable', async () => {
      const [alice] = await getUnnamedAccounts();

      await expect(
        contract.initialize(
          poolName,
          await stablecoinContract.getAddress(),
          alice,
          interestPeriod,
          interestRate
        )
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

});
