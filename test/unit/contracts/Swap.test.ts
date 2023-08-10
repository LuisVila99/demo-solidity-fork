
/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { getNamedAccounts, 
         getUnnamedAccounts } from 'hardhat';
import { expect } from 'chai';
import { deployMyNFTFixture } from '../fixtures/mynft-fixture';

/**
 * MyNFT tests.
 */

describe('Swap', () => {
  let swapContract: Contract;

  beforeEach(async () => {
    swapContract = await deployMyNFTFixture();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { proxyOwner } = await getNamedAccounts();
      expect(await swapContract.owner()).to.equal(proxyOwner); 
    });
  });
});
