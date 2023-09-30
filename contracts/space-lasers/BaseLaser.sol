// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../items/FungibleItem.sol";

contract BaseLaser is FungibleItem {
    constructor(string memory uri) FungibleItem(uri) {}
}
