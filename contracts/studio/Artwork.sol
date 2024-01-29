// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../items/BaseTemplate.sol";

contract Artwork is BaseTemplate {
    constructor(uint256 _maxMints, uint256 _mintPrice, string memory _uri) BaseTemplate(_maxMints, _mintPrice, _uri) {}
}
