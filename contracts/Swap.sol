// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./MyNFT.sol";
import "./MyCurrency.sol"; 

contract Swap {
    MyNFT public erc721Contract;
    MyCurrency public erc20Contract;
    uint256 public exchangeRate;

    constructor(address _erc721Address, address _erc20Address) {
        erc721Contract = MyNFT(_erc721Address);
        erc20Contract = MyCurrency(_erc20Address);
        exchangeRate = 10;
    }

    function purchaseToken(uint256 tokenId) external {
        require(erc721Contract.ownerOf(tokenId) == address(this),
        "Token not available for purchase");
        require(erc20Contract.balanceOf(msg.sender) >= exchangeRate, 
        "Insufficient ERC20 balance");
        
        erc20Contract.transferFrom(msg.sender, address(this), exchangeRate); 
        erc721Contract.transferFrom(address(this), msg.sender, tokenId); 
    }


    function sellToken(uint256 tokenId) external {
        require(erc721Contract.ownerOf(tokenId) == msg.sender, 
        "You don't own this token");

        erc20Contract.transfer(msg.sender, exchangeRate);
        erc721Contract.transferFrom(msg.sender, address(this), tokenId);
    }
}
