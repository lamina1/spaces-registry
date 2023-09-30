// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../items/UniqueItem.sol";

contract RandomLaser is UniqueItem {
    constructor(string memory uri) UniqueItem(uri) {}
}
