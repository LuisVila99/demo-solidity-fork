// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

/**
 * Contract dependencies.
 */

import "../../pool/EduPool.sol";

/// @title EduPoolMock contract for EduPool.
contract EduPoolMock is EduPool {
    /**
     * @notice Returns mock flag.
     */
    function isMocked() external pure returns (bool) {
        return true;
    }
}
