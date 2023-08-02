// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/utils/math/MathUpgradeable.sol";
import './EduPoolBase.sol';

abstract contract EduPoolLoan is EduPoolBase {
    // Local variables

    // Events
    event Borrowed(
        string indexed name,
        address indexed borrower,
        uint256 amount
    );

    event Payed(
        string indexed name,
        address indexed borrower,
        uint256 amount,
        uint256 interest
    );

    // Modifiers

    // Public view functions

    function borrowed() public view returns (uint256) {
        return pool.borrowed;
    }

    function total() public view returns (uint256) {
        return pool.balance + pool.borrowed;
    }

    function interest(uint256 amount) public view returns (uint256) {
        uint256 elapsedTime = pool.accruedTimer == 0
            ? 1
            : MathUpgradeable.ceilDiv(
                block.timestamp - pool.accruedTimer,
                pool.interestPeriod
            );

        return (amount * pool.interestRate * elapsedTime) / 1 ether;
    }

    // Public write functions

    function borrow(uint256 amount) onlyActivePool onlyBorrower external {
        require( pool.balance >= amount, 'Not enough balance' );

        if (pool.accruedTimer == 0) {
            pool.accruedTimer = block.timestamp;
        }

        pool.stablecoin.transfer( _msgSender(), amount );
        pool.balance -= amount;
        pool.borrowed += amount;

        emit Borrowed( pool.name, _msgSender(), amount );
    }

    function pay(uint256 amount) onlyActivePool onlyBorrower external {
        require( amount > 0, 'Insufficient pay amount' );
        require( pool.borrowed >= amount, 'Pay amount cannot be bigger than borrowed amount' );

        uint256 interestAmount = interest(amount);
        pool.balance += amount + interestAmount;
        pool.borrowed -= amount;

        if (pool.borrowed == 0) {
            pool.accruedTimer = 0;
        }

        require(
            pool.stablecoin.transferFrom(
                pool.borrower,
                address(this),
                amount + interestAmount
            ),
            "Failed to complete the payment"
        );

        emit Payed(
            pool.name,
            pool.borrower,
            amount,
            interestAmount
        );
    }
}