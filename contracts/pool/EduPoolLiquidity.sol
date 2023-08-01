// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './EduPoolBase.sol';

abstract contract EduPoolLiquidity is EduPoolBase {

    event Provided(
        string indexed name,
        address indexed provider,
        uint256 amount
    );

    function provide(uint256 amount) external onlyActivePool {
        require(
            pool.stablecoin.transferFrom(
                _msgSender(),
                address(this),
                amount
            ),
            'Failed to complete the operation'
        );

        pool.issuers[_msgSender()] += amount;
        pool.balance += amount;

        emit Provided( pool.name, _msgSender(), amount );
    }

    function balanceOf(address issuer) public view returns (uint256) {
        return pool.issuers[ issuer ];
    }

    function balance() public view returns (uint256) {
        return pool.balance;
    }
}