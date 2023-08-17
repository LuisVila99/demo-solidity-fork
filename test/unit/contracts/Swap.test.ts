
/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { getNamedAccounts, 
         getUnnamedAccounts,
         deployments,
         ethers } from 'hardhat';
import { expect } from 'chai';
import { deploySwapFixture } from '../fixtures/swap-fixture';
import { ABI, Address } from 'hardhat-deploy/types';

/**
 * MyNFT tests.
 */

describe('Swap', () => {
  let swapContract: Contract;

  beforeEach(async () => {
    swapContract = await deploySwapFixture();
  });

  describe("Deployment", function () {
    it("Should set the right owner", 
    async function () {
      expect(await swapContract.getAddress()).
        to.not.be.null;
    });
  });

  describe("Swap", function () {
    it("Should allow to trade a MyNFT token for 100 MyCurrency",
    async function () {
      const { proxyOwner } = await getNamedAccounts();
      const signer = await ethers.provider.getSigner(proxyOwner);

      const nftInfo = await deployments.get("MyNFT");
      const nftContract = await ethers.getContractAt(
        nftInfo.abi as ABI,
        nftInfo.address as Address
      )
      const myCurrencyInfo = await deployments.get("MyCurrency");
      const myCurrencyContract = await ethers.getContractAt(
        myCurrencyInfo.abi as ABI,
        myCurrencyInfo.address as Address
      )

      await nftContract.safeMint(signer, 10);
      await myCurrencyContract.mint(
                                    swapContract.getAddress(), 
                                    200
                                    );

      const tx = await nftContract.setApprovalForAll(swapContract, true);
      await tx.wait();
      await swapContract.connect(signer).sellToken(10);

      expect(await nftContract.balanceOf(signer))
        .to.equal(0n);
      expect(await myCurrencyContract.balanceOf(signer))
        .to.equal(100n);
      expect(await nftContract.balanceOf(swapContract.getAddress()))
        .to.equal(1n);
      expect(await myCurrencyContract.balanceOf(swapContract.getAddress()))
        .to.equal(100n);
    })

    it("Should allow to check the contract's current exchange rate",
    async function () {
      expect(await swapContract.checkExchangeRate())
        .to.equal(100);
    })

    it("Should allow contract owner to change the exchange rate",
    async function () {
      await swapContract.setExchangeRate(200);
      expect(await swapContract.checkExchangeRate())
        .to.equal(200);
    })

    it("Should not allow non-owners to change the exchange rate", async function () {
      const [ownerAccount, nonOwnerAccount] = await getUnnamedAccounts();
      let nonOwnerSigner = await ethers.getSigner(nonOwnerAccount);
      await expect(swapContract.connect(nonOwnerSigner).setExchangeRate(200))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

  })
});
