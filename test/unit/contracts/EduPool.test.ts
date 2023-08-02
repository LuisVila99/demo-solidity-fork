/**
 * Module dependencies.
 */

import { Contract } from "ethers";
import { ethers, getNamedAccounts, getUnnamedAccounts } from "hardhat";
import { expect } from "chai";
import { getStableCoinFixture } from "../fixtures/stablecoin-fixture";
import {
  deployEduPoolFixture,
  deployProxyFixture,
} from "../fixtures/edupool-fixture";
import { proxy } from "../../../typechain-types/@openzeppelin/contracts-upgradeable";
import exp from "constants";

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

  // HELPER FUNCTIONS

  async function deployAndActivate(borrower: string): Promise<Contract> {
    const aliceWallet = await ethers.getSigner(borrower);

    const proxyContract = await deployProxyFixture({
      name: poolName,
      stablecoin: await stablecoinContract.getAddress(),
      borrower: borrower,
      interestPeriod: interestPeriod,
      interestRate: interestRate,
    });

    await proxyContract.connect(aliceWallet).activate();

    return proxyContract;
  }

  async function mintAndApprove(owner: string, from: string, to: string) {
    const ownerWallet = await ethers.getSigner(owner);
    const fromWallet = await ethers.getSigner(from);

    await stablecoinContract.connect(ownerWallet).mint(from, amount);
    await stablecoinContract.connect(fromWallet).approve(to, amount);
  }

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
      expect(await proxyContract.version()).to.equal("0.1.0");
      expect(await proxyContract.stablecoin()).to.equal(
        await stablecoinContract.getAddress()
      );
      expect(await proxyContract.status()).to.equal("pending");
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

      const chuckWallet = await ethers.getSigner(chuck);

      const proxyContract = await deployAndActivate(alice);
      await mintAndApprove(proxyOwner, chuck, await proxyContract.getAddress());

      expect(await proxyContract.connect(chuckWallet).provide(amount))
        .to.emit(proxyContract, "Provided")
        .withArgs(poolName, chuck, amount);
    });

    it("providing liquidity should update the 'EduPool' balance and issuer balance", async () => {
      const { proxyOwner } = await getNamedAccounts();
      const [alice, chuck] = await getUnnamedAccounts();

      const chuckWallet = await ethers.getSigner(chuck);

      const proxyContract = await deployAndActivate(alice);
      await mintAndApprove(proxyOwner, chuck, await proxyContract.getAddress());

      const initialBalance = await proxyContract.balance();
      const initialBalanceIssuer = await proxyContract.balanceOf(chuck);

      await proxyContract.connect(chuckWallet).provide(amount);

      expect(await proxyContract.balance()).to.equal(initialBalance + amount);
      expect(await proxyContract.balanceOf(chuck)).to.equal(
        initialBalanceIssuer + amount
      );
    });

    it("should be able to withdraw `StableCoin` from `EduPool`", async () => {
      const { proxyOwner } = await getNamedAccounts();
      const [alice, chuck] = await getUnnamedAccounts();

      const chuckWallet = await ethers.getSigner(chuck);

      const proxyContract = await deployAndActivate(alice);
      await mintAndApprove(proxyOwner, chuck, await proxyContract.getAddress());

      await proxyContract.connect(chuckWallet).provide(amount);

      expect(await proxyContract.connect(chuckWallet).withdraw(amount))
        .to.emit(proxyContract, "Wtidrawn")
        .withArgs(poolName, chuck, amount);
    });

    it("should not be able to withdraw not available `StableCoin` balance from `EduPool`", async () => {
      const { proxyOwner } = await getNamedAccounts();
      const [alice, chuck] = await getUnnamedAccounts();

      const chuckWallet = await ethers.getSigner(chuck);

      const proxyContract = await deployAndActivate(alice);
      await mintAndApprove(proxyOwner, chuck, await proxyContract.getAddress());

      await proxyContract.connect(chuckWallet).provide(amount);

      await expect(
        proxyContract.connect(chuckWallet).withdraw(amount * 2)
      ).to.be.revertedWith("Not enough issuer balance");
    });
  });

  describe("loans", () => {
    it("should only allow the borrower to borrow from `EduPool`", async () => {
      const { proxyOwner } = await getNamedAccounts();
      const [alice, chuck] = await getUnnamedAccounts();

      const chuckWallet = await ethers.getSigner(chuck);

      const proxyContract = await deployAndActivate(alice);
      await mintAndApprove(proxyOwner, chuck, await proxyContract.getAddress());

      await proxyContract.connect(chuckWallet).provide(amount);

      await expect(
        proxyContract.connect(chuckWallet).borrow(amount)
      ).to.be.revertedWith("Caller is not the borrower");
    });

    it("should allow the borrower to borrow from `EduPool`", async () => {
      const { proxyOwner } = await getNamedAccounts();
      const [alice, chuck] = await getUnnamedAccounts();

      const aliceWallet = await ethers.getSigner(alice);
      const chuckWallet = await ethers.getSigner(chuck);

      const proxyContract = await deployAndActivate(alice);
      await mintAndApprove(proxyOwner, chuck, await proxyContract.getAddress());

      await proxyContract.connect(chuckWallet).provide(amount);

      expect(await proxyContract.connect(aliceWallet).borrow(amount))
        .to.emit(proxyContract, "Borrowed")
        .withArgs(poolName, alice, amount);
    });

    it("should not allow borrowing more than available balance", async () => {
      const { proxyOwner } = await getNamedAccounts();
      const [alice, chuck] = await getUnnamedAccounts();

      const aliceWallet = await ethers.getSigner(alice);
      const chuckWallet = await ethers.getSigner(chuck);

      const proxyContract = await deployAndActivate(alice);
      await mintAndApprove(proxyOwner, chuck, await proxyContract.getAddress());

      await proxyContract.connect(chuckWallet).provide(amount);
      const borrowAmount = ethers.formatUnits(
        await proxyContract.balance(),
        "wei"
      );

      await expect(
        proxyContract.connect(aliceWallet).borrow(borrowAmount * 2)
      ).to.be.revertedWith("Not enough balance");
    });

    it("should only allow the borrower to pay into `EduPool`", async () => {
      const { proxyOwner } = await getNamedAccounts();
      const [alice, chuck] = await getUnnamedAccounts();

      const chuckWallet = await ethers.getSigner(chuck);

      const proxyContract = await deployAndActivate(alice);
      await mintAndApprove(proxyOwner, chuck, await proxyContract.getAddress());

      await proxyContract.connect(chuckWallet).provide(amount);

      await expect(
        proxyContract.connect(chuckWallet).pay(amount)
      ).to.be.revertedWith("Caller is not the borrower");
    });

    it("should allow the borrower to pay into `EduPool`", async () => {
      const { proxyOwner } = await getNamedAccounts();
      const [alice, chuck] = await getUnnamedAccounts();

      const ownerWallet = await ethers.getSigner(proxyOwner);
      const aliceWallet = await ethers.getSigner(alice);
      const chuckWallet = await ethers.getSigner(chuck);

      const proxyContract = await deployAndActivate(alice);
      await mintAndApprove(proxyOwner, chuck, await proxyContract.getAddress());

      await proxyContract.connect(chuckWallet).provide(amount);
      await proxyContract.connect(aliceWallet).borrow(amount);
      await stablecoinContract.connect(ownerWallet).mint(alice, amount);

      const interestAmount = ethers.formatUnits(
        await proxyContract.interest(amount),
        "wei"
      );
      await stablecoinContract
        .connect(aliceWallet)
        .approve(await proxyContract.getAddress(), amount + interestAmount);

      expect(await proxyContract.borrowed()).to.equal(amount);
      expect(await proxyContract.total()).to.equal(amount);
      expect(await proxyContract.connect(aliceWallet).pay(amount))
        .to.emit(proxyContract, "Payed")
        .withArgs(poolName, alice, amount, interestAmount);
    });
  });
});
