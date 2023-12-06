// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @dev Interface for Studio compatible templates
 */
interface IStudioTemplate {
    event Created(address indexed account, uint256 indexed id);

    /**
     * @dev Number of mints per address
     */
    function maxmints() external view returns (uint256);

    /**
     * @dev Price of each mint
     */
    function price() external view returns (uint256);

    /**
     * @dev Mint an item using this template
     */
    function mint(string memory metadata_cid) external payable;
}
