
/**
 * Module dependencies.
 */

import { Contract } from 'ethers';
import { deployments, ethers, getNamedAccounts, getUnnamedAccounts } from 'hardhat';
import { expect } from 'chai';

/**
 * SVT tests.
 */

describe('DemoCoin', () => {
  let dmcContract: Contract;
  const dmcFixture = deployments.createFixture(async ({ deployments, getNamedAccounts }) => {
    const { proxyOwner } = await getNamedAccounts();

    await deployments.fixture();

    const dmcContractDeployment = await deployments.deploy('DemoCoin', {
      contract: 'DemoCoin',
      from: proxyOwner,
      log: true,
      proxy: {
        execute: {
          init: {
            args: [],
            methodName: 'initialize'
          }
        },
        owner: proxyOwner,
        proxyContract: 'OpenZeppelinTransparentProxy'
      }
    });
    
    return ethers.getContractAt(dmcContractDeployment.abi, dmcContractDeployment.address);
  });

  beforeEach(async () => {
    dmcContract = await dmcFixture();
  });

  describe('initialize', () => {
    it('should the `DemoCoin` contract only be able to be initialized once', async () => {
      await expect(dmcContract.initialize())
        .to.be.revertedWith('Initializable: contract is already initialized');
    });

    it('should the `DemoCoin` contract initialization be valid', async () => {
      expect(await dmcContract.name()).to.equal('DemoCoin');
      expect(await dmcContract.symbol()).to.equal('DMC');
    });
  });

  describe('ownable', () => {
    it('should only the owner be able to transfer `DemoCoin` contract ownership', async () => {
      const [alice, chuck] = await getUnnamedAccounts();
      const chuckWallet = await ethers.getSigner(chuck);

      await expect(dmcContract.connect(chuckWallet).transferOwnership(alice))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('should change the owner the `DemoCoin` contract', async () => {
      const { proxyOwner } = await getNamedAccounts();
      const [alice] = await getUnnamedAccounts();
      const proxyOwnerWallet = await ethers.getSigner(proxyOwner);

      expect(await dmcContract.connect(proxyOwnerWallet).transferOwnership(alice))
        .to.emit(dmcContract, 'OwnershipTransferred')
        .withArgs(proxyOwner, alice);
    });
  });

  describe('upgradable', () => {
    it('should upgrade the `DemoCoin` contract and call a newly added method', async () => {
      const { proxyOwner } = await getNamedAccounts();
      const dmcContractDeployment = await deployments.deploy('DemoCoin', {
        contract: 'DemoCoinMock',
        from: proxyOwner,
        proxy: {
          owner: proxyOwner,
          proxyContract: 'OpenZeppelinTransparentProxy'
        }
      });

      const dmcContractMock = await ethers.getContractAt(dmcContractDeployment.abi, dmcContractDeployment.address);

      expect(await dmcContractMock.isMocked()).to.equal(true);
      expect(await dmcContract.getAddress()).to.equal(await dmcContractMock.getAddress());
    });

    it('should upgrade the `DemoCoin` contract and call an inherited method from the previous deploy', async () => {
      const { proxyOwner } = await getNamedAccounts();
      const proxyOwnerWallet = await ethers.getSigner(proxyOwner);
      const [alice] = await getUnnamedAccounts();
      const dmcContractDeployment = await deployments.deploy('DemoCoin', {
        contract: 'DemoCoinMock',
        from: proxyOwner,
        proxy: {
          owner: proxyOwner,
          proxyContract: 'OpenZeppelinTransparentProxy'
        }
      });

      const dmcContractMock = await ethers.getContractAt(dmcContractDeployment.abi, dmcContractDeployment.address);

      expect(await dmcContractMock.version()).to.equal(1);
      expect(await dmcContract.getAddress()).to.equal(await dmcContractMock.getAddress());
    });
  });

});
