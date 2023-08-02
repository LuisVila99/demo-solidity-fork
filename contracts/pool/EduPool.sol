// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./EduPoolBase.sol";
import "./EduPoolLiquidity.sol";
import "./EduPoolLoan.sol";

contract EduPool is EduPoolBase, EduPoolLiquidity, EduPoolLoan {

    // Public View functions

    function version() external pure returns (string memory) {
        return '0.1.0';
    }

    function name() public view returns (string memory) {
        return pool.name;
    }

    function stablecoin() public view returns (IERC20Upgradeable) {
        return pool.stablecoin;
    }

    /**
     * @notice Provides the obligation current status.
     *
     * @return string Obligation status code.
     */
    function status() public view returns (string memory) {
        return super._status();
    }

}