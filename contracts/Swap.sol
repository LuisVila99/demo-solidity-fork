// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Swap is Initializable, OwnableUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    IERC721Upgradeable public myNft;
    IERC20Upgradeable public coin;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(IERC721Upgradeable _myNft, IERC20Upgradeable _coin) 
      initializer public {
        __Ownable_init();
        myNft = _myNft;
        coin = _coin;
    }

    function swapNftForCoin(uint256 tokenId) public {
        require(myNft.ownerOf(tokenId) == msg.sender, 
        "You must own the NFT to swap");
        
        myNft.safeTransferFrom(msg.sender, address(this), tokenId);

        // Transfer the specified amount of coins to the sender
        uint256 coinAmount = 100; // You can adjust this value as needed
        coin.safeTransfer(msg.sender, coinAmount);
    }


    function swapCoinForNFT(uint256 tokenId) public {

      uint256 coinAmount = 100; 
      coin.safeTransferFrom(msg.sender, address(this), coinAmount);

      myNft.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    function setMyNft(IERC721Upgradeable _myNft) public onlyOwner {
        myNft = _myNft;
    }

    function setCoin(IERC20Upgradeable _coin) public onlyOwner {
        coin = _coin;
    }
}
