// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./MyCurrency.sol";

contract MyCurrencyV2 is MyCurrency {
  function newVersion() pure public returns(string memory) {
    return "v2";
  }
}
