// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../items/Trophy.sol";

contract SpaceLasersTrophy is Trophy {
    constructor(string memory uri) Trophy(uri) {}
}
