
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

  describe("Methods", function () {
    it("Should mint one token to the contract owner",
      async function () {
        const { proxyOwner } = await getNamedAccounts();
        await mynftContract.safeMint(proxyOwner, 1);
        expect(await mynftContract.balanceOf(proxyOwner)).
          to.equal(1n);
      });

    it("Should fail minting the same token twice",
      async function () {
        const { proxyOwner } = await getNamedAccounts();
        await expect(mynftContract.safeMint(proxyOwner, 1)).
          to.be.revertedWith('ERC721: token already minted');
      });

    it("Transfer a token from one account to another", 
      async function () {
        const { proxyOwner } = await getNamedAccounts();
        const [account1] = await getUnnamedAccounts();
        await mynftContract.safeTransferFrom(proxyOwner, account1, 1);
        expect(await mynftContract.balanceOf(account1)).
          to.equal(1n);
        expect(await mynftContract.balanceOf(proxyOwner)).
          to.equal(0n);
      });
  });
});
