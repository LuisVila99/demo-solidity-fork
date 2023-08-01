/**
 * Module dependencies.
 */

import { Contract } from "ethers";
import { ethers, getNamedAccounts, getUnnamedAccounts } from "hardhat";
import { expect } from "chai";
import { getStableCoinFixture } from "../fixtures/stablecoin-fixture";
import {
  deployEduPoolFixture,
  EduPoolFixtureData,
  deployProxyFixture,
} from "../fixtures/edupool-fixture";

/**
 * EduPool tests.
 */

describe("EduPool", () => {
  let contract: Contract;
  let stablecoinContract: Contract;
  const poolName = "JohnDoe Student Loan";
  const interestPeriod = "60";
  const interestRate = ethers.parseEther("0.05");
  const amount = ethers.formatUnits(10, "wei");

  before(async () => {
    stablecoinContract = await getStableCoinFixture();
  });

  beforeEach(async () => {
    contract = await deployEduPoolFixture();
  });

  describe("initialize", () => {
    it("should the `EduPool` contract not be initializable", async () => {
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

    it("should the `EduPool` contract allow for a proxy to initialize", async () => {
      const { deployer } = await getNamedAccounts();
      const [alice] = await getUnnamedAccounts();

      const proxyContract = await deployProxyFixture({
        name: poolName,
        stablecoin: await stablecoinContract.getAddress(),
        borrower: alice,
        interestPeriod: interestPeriod,
        interestRate: interestRate,
      });

      expect(await proxyContract.name()).to.equal(poolName);
    });
  });

  describe("activate", () => {
    it("should only allow activation of `EduPool` by borrower", async () => {
      const [alice, chuck] = await getUnnamedAccounts();
      const chuckWallet = await ethers.getSigner(chuck);
      const proxyContract = await deployProxyFixture({
        name: poolName,
        stablecoin: await stablecoinContract.getAddress(),
        borrower: alice,
        interestPeriod: interestPeriod,
        interestRate: interestRate,
      });

      await expect(
        proxyContract.connect(chuckWallet).activate()
      ).to.be.revertedWith("Caller is not the borrower");
    });

    it("should activate `EduPool`", async () => {
      const [alice] = await getUnnamedAccounts();
      const aliceWallet = await ethers.getSigner(alice);
      const proxyContract = await deployProxyFixture({
        name: poolName,
        stablecoin: await stablecoinContract.getAddress(),
        borrower: alice,
        interestPeriod: interestPeriod,
        interestRate: interestRate,
      });

      expect(await proxyContract.connect(aliceWallet).activate()).to.emit(
        proxyContract,
        "Active"
      );
    });
  });

  describe("liquidity", () => {
    it("should be able to provide `StableCoin` to `EduPool`", async () => {
      const { proxyOwner } = await getNamedAccounts();
      const [alice, chuck] = await getUnnamedAccounts();

      const proxyOwnerWallet = await ethers.getSigner(proxyOwner);
      const aliceWallet = await ethers.getSigner(alice);
      const chuckWallet = await ethers.getSigner(chuck);

      const proxyContract = await deployProxyFixture({
        name: poolName,
        stablecoin: await stablecoinContract.getAddress(),
        borrower: alice,
        interestPeriod: interestPeriod,
        interestRate: interestRate,
      });

      await proxyContract.connect(aliceWallet).activate();
      await stablecoinContract.connect(proxyOwnerWallet).mint(chuck, amount);
      await stablecoinContract
        .connect(chuckWallet)
        .approve(await proxyContract.getAddress(), amount);

      expect(await proxyContract.connect(chuckWallet).provide(amount))
        .to.emit(proxyContract, "Provided")
        .withArgs(poolName, chuck, amount);
    });

    it("should update the 'EduPool' balance and issuer balance", async () => {
      const { proxyOwner } = await getNamedAccounts();
      const [alice, chuck] = await getUnnamedAccounts();

      const proxyOwnerWallet = await ethers.getSigner(proxyOwner);
      const aliceWallet = await ethers.getSigner(alice);
      const chuckWallet = await ethers.getSigner(chuck);

      const proxyContract = await deployProxyFixture({
        name: poolName,
        stablecoin: await stablecoinContract.getAddress(),
        borrower: alice,
        interestPeriod: interestPeriod,
        interestRate: interestRate,
      });

      const initialBalance = await proxyContract.balance();
      const initialBalanceIssuer = await proxyContract.balanceOf(chuck);

      await proxyContract.connect(aliceWallet).activate();
      await stablecoinContract.connect(proxyOwnerWallet).mint(chuck, amount);
      await stablecoinContract
        .connect(chuckWallet)
        .approve(await proxyContract.getAddress(), amount);
      await proxyContract.connect(chuckWallet).provide(amount);

      expect(await proxyContract.balance()).to.equal(initialBalance + amount);
      expect(await proxyContract.balanceOf(chuck)).to.equal(
        initialBalanceIssuer + amount
      );
    });
  });
});
