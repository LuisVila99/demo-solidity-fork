
/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { deployments, ethers, getNamedAccounts, getUnnamedAccounts } from 'hardhat';
import { expect } from 'chai';
import {deployMyCurrencyFixture} from '../fixtures/mycurrency-fixture';

/**
 * MyCurrency tests.
 */

describe('MyCurrency', () => {
  let mycurrencyContract: Contract;

  beforeEach(async () => {
    mycurrencyContract = await deployMyCurrencyFixture();
  });

  describe('initialize', () => {
    it('should the `MyCurrency` contract only be able to be initialized once', async () => {
      await expect(mycurrencyContract.initialize())
        .to.be.revertedWith('Initializable: contract is already initialized');
    });

    it('should the `MyCurrency` contract initialization be valid', async () => {
      expect(await mycurrencyContract.name()).to.equal('MyCurrency');
      expect(await mycurrencyContract.symbol()).to.equal('MCY');
    });
  });

  describe("deployment", function () {
    it("should set the right owner", async function () {
      const { proxyOwner } = await getNamedAccounts();
      expect(await mycurrencyContract.owner()).to.equal(proxyOwner); 
    });
  });
});
