// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../items/UniqueTrophy.sol";

contract Nyric is UniqueTrophy {
    constructor(string memory _uri) UniqueTrophy(_uri) {}
}
