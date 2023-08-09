
/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { deployments,
         ethers, 
         getNamedAccounts, 
         getUnnamedAccounts } from 'hardhat';
import { expect } from 'chai';
import { deployMyNFTFixture } from '../fixtures/mynft-fixture';

/**
 * MyCurrency tests.
 */

describe('MyNFT', () => {
  let mynftContract: Contract;

  beforeEach(async () => {
    mynftContract = await deployMyNFTFixture();
  });

  describe('Initialize', () => {
    it('Should the `MyCurrency` contract only be able to be initialized once', 
    async () => {
      await expect(mynftContract.initialize())
        .to.be.revertedWith('Initializable: contract is already initialized');
    });

    it('Should the `MyCurrency` contract initialization be valid', 
    async () => {
      expect(await mynftContract.name()).to.equal('MyNFT');
      expect(await mynftContract.symbol()).to.equal('NFT');
    });
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { proxyOwner } = await getNamedAccounts();
      expect(await mynftContract.owner()).to.equal(proxyOwner); 
    });
  });
});
