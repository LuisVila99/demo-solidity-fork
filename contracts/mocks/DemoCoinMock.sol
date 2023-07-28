// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

/**
 * Contract dependencies.
 */

import "../DemoCoin.sol";

/// @title DemoCoinMock contract for DemoCoin.
contract DemoCoinMock is DemoCoin {
    /**
     * @notice Returns mock flag.
     */
    function isMocked() external pure returns (bool) {
        return true;
    }
}
