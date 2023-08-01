// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './EduPoolBase.sol';

abstract contract EduPoolLiquidity is EduPoolBase {

    // Modifiers

    modifier onlyIssuer {
        require( pool.issuers[_msgSender()] != 0, "Sender is not an issuer" );
        _;
    }

    // Events

    event Provided(
        string indexed name,
        address indexed issuer,
        uint256 amount
    );

    event Withdrawn(
        string indexed name,
        address indexed issuer,
        uint256 amount
    );

    // Public view functions

    function balanceOf(address issuer) public view returns (uint256) {
        return pool.issuers[ issuer ];
    }

    function balance() public view returns (uint256) {
        return pool.balance;
    }

    // Public write functions

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

    function withdraw( uint256 amount ) external onlyActivePool onlyIssuer {
        require( pool.issuers[_msgSender()] >= amount, "Not enough issuer balance" );
        require( pool.balance >= amount, "Not enough pool balance" );

        pool.stablecoin.transfer( _msgSender(), amount );
        pool.issuers[_msgSender()] -= amount;
        pool.balance -= amount;

        emit Withdrawn( pool.name, _msgSender(), amount );
    }
}