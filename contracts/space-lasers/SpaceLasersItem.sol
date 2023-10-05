// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../items/MultipleItem.sol";

contract SpaceLasersItem is MultipleItem {
    constructor(string memory uri) MultipleItem(uri) {}
}
