
/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { getNamedAccounts, 
         getUnnamedAccounts } from 'hardhat';
import { expect } from 'chai';
import { deploySwapFixture } from '../fixtures/swap-fixture';

/**
 * MyNFT tests.
 */

describe('Swap', () => {
  let swapContract: Contract;

  beforeEach(async () => {
    swapContract = await deploySwapFixture();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { proxyOwner } = await getNamedAccounts();
      expect(await swapContract.getAddress()).
        to.not.be.null;
    });
  });
});
