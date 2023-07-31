// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

/**
 * Contract dependencies.
 */

import "../StableCoin.sol";

/// @title StableCoinMock contract for StableCoin.
contract StableCoinMock is StableCoin {
    /**
     * @notice Returns mock flag.
     */
    function isMocked() external pure returns (bool) {
        return true;
    }
}
