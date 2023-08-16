// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./MyNFT.sol";
import "./MyCurrency.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Swap is Ownable {
    MyNFT public erc721Contract;
    MyCurrency public erc20Contract;
    uint16 public exchangeRate;

    constructor(address _erc721Address, address _erc20Address) {
        erc721Contract = MyNFT(_erc721Address);
        erc20Contract = MyCurrency(_erc20Address);
        exchangeRate = 100;
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
        address tokenOwner = erc721Contract.ownerOf(tokenId);

        require(tokenOwner == msg.sender || erc721Contract.getApproved(tokenId) == msg.sender,
        "Sender not the owner of the token");

        erc721Contract.transferFrom(msg.sender, address(this), tokenId);
        erc20Contract.transfer(msg.sender, exchangeRate);
    }


    function setExchangeRate(uint16 _exchangeRate) public onlyOwner { 
        exchangeRate = _exchangeRate;
    }


    function checkExchangeRate() public view returns (uint16) {
        return exchangeRate;
    }
}
