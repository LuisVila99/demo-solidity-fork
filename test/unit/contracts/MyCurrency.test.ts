
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

  describe('Initialize', () => {
    it('Should the `MyCurrency` contract only be able to be initialized once', async () => {
      await expect(mycurrencyContract.initialize())
        .to.be.revertedWith('Initializable: contract is already initialized');
    });

    it('Should the `MyCurrency` contract initialization be valid', async () => {
      expect(await mycurrencyContract.name()).to.equal('MyCurrency');
      expect(await mycurrencyContract.symbol()).to.equal('MCY');
    });
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { proxyOwner } = await getNamedAccounts();
      expect(await mycurrencyContract.owner()).to.equal(proxyOwner); 
    });
  });

  describe('Upgrade', () => {
    it('Should upgrade the `MyCurrency` keeping proxy address', async () => {
      const { proxyOwner } = await getNamedAccounts();
      const currencyContractDeployment = await deployments.deploy('MyCurrency', {
        contract: 'MyCurrencyV2',
        from: proxyOwner,
        proxy: {
          owner: proxyOwner,
          proxyContract: 'OpenZeppelinTransparentProxy'
        }
      });

      const currencyContractDeploymentUpgraded = await ethers.getContractAt(
        currencyContractDeployment.abi, 
        currencyContractDeployment.address
      );

      expect(await mycurrencyContract.getAddress()).
        to.equal(await currencyContractDeploymentUpgraded.getAddress());
    });

    it('Should call newly added method on upgraded contract', async () => {
      const { proxyOwner } = await getNamedAccounts();
      const currencyContractDeployment = await deployments.deploy('MyCurrency', {
        contract: 'MyCurrencyV2',
        from: proxyOwner,
        proxy: {
          owner: proxyOwner,
          proxyContract: 'OpenZeppelinTransparentProxy'
        }
      });

      const currencyContractDeploymentUpgraded = await ethers.getContractAt(
        currencyContractDeployment.abi, 
        currencyContractDeployment.address
      );

      expect(await currencyContractDeploymentUpgraded.newVersion())
        .to.equal("v2");
    });
  });
});
