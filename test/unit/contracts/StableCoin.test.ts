
/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { deployments, ethers, getNamedAccounts, getUnnamedAccounts } from 'hardhat';
import { expect } from 'chai';
import {deployStableCoinFixture} from '../fixtures/stablecoin-fixture';

/**
 * StableCoin tests.
 */

describe('StableCoin', () => {
  let stablecoinContract: Contract;
  const amount = ethers.formatUnits( 10, 'wei' );

  beforeEach(async () => {
    const { proxyOwner } = await getNamedAccounts();
    stablecoinContract = await deployStableCoinFixture(proxyOwner);
  });

  describe('initialize', () => {
    it('should the `StableCoin` contract only be able to be initialized once', async () => {
      await expect(stablecoinContract.initialize())
        .to.be.revertedWith('Initializable: contract is already initialized');
    });

    it('should the `StableCoin` contract initialization be valid', async () => {
      expect(await stablecoinContract.name()).to.equal('StableCoin');
      expect(await stablecoinContract.symbol()).to.equal('STB');
    });
  });

  describe('ownable', () => {
    it('should only the owner be able to transfer `StableCoin` contract ownership', async () => {
      const [alice, chuck] = await getUnnamedAccounts();
      const chuckWallet = await ethers.getSigner(chuck);

      await expect(stablecoinContract.connect(chuckWallet).transferOwnership(alice))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('should change the owner the `StableCoin` contract', async () => {
      const { proxyOwner } = await getNamedAccounts();
      const [alice] = await getUnnamedAccounts();
      const proxyOwnerWallet = await ethers.getSigner(proxyOwner);

      expect(await stablecoinContract.connect(proxyOwnerWallet).transferOwnership(alice))
        .to.emit(stablecoinContract, 'OwnershipTransferred')
        .withArgs(proxyOwner, alice);
    });
  });

  describe('upgradable', () => {
    it('should upgrade the `StableCoin` contract and call a newly added method', async () => {
      const { proxyOwner } = await getNamedAccounts();
      const stablecoinContractDeployment = await deployments.deploy('StableCoin', {
        contract: 'StableCoinMock',
        from: proxyOwner,
        proxy: {
          owner: proxyOwner,
          proxyContract: 'OpenZeppelinTransparentProxy'
        }
      });

      const stablecoinContractMock = await ethers.getContractAt(stablecoinContractDeployment.abi, stablecoinContractDeployment.address);

      expect(await stablecoinContractMock.isMocked()).to.equal(true);
      expect(await stablecoinContract.getAddress()).to.equal(await stablecoinContractMock.getAddress());
    });

    it('should upgrade the `StableCoin` contract and call an inherited method from the previous deploy', async () => {
      const { proxyOwner } = await getNamedAccounts();
      const stablecoinContractDeployment = await deployments.deploy('StableCoin', {
        contract: 'StableCoinMock',
        from: proxyOwner,
        proxy: {
          owner: proxyOwner,
          proxyContract: 'OpenZeppelinTransparentProxy'
        }
      });

      const stablecoinContractMock = await ethers.getContractAt(stablecoinContractDeployment.abi, stablecoinContractDeployment.address);

      expect(await stablecoinContractMock.version()).to.equal(1);
      expect(await stablecoinContract.getAddress()).to.equal(await stablecoinContractMock.getAddress());
    });
  });

  describe('mint', () => {
    it('should only the owner by allowed to mint `StableCoin`', async () => {
      const [alice, chuck] = await getUnnamedAccounts();
      const chuckWallet = await ethers.getSigner(chuck);

      await expect(stablecoinContract.connect(chuckWallet).mint(alice, amount))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('should mint `StableCoin`', async () => {
      const { proxyOwner } = await getNamedAccounts();
      const [alice] = await getUnnamedAccounts();
      const proxyOwnerWallet = await ethers.getSigner(proxyOwner);

      expect(stablecoinContract.connect(proxyOwnerWallet).mint(alice, amount))
        .to.emit(stablecoinContract, 'Transfer')
        .withArgs( ethers.ZeroAddress, alice, amount );
    });
  });

});
