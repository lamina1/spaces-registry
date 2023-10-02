// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @dev Interface for Spaces compatible items
 */
interface ISpaceItem {
    /**
     * @dev Checks if the address is an authorized owner of the item
     */
    function authorized(address account) external view returns (bool);

    /**
     * @dev Mint an item
     *      If item is unique, id should be computed randomly in the mint function.
     *      The registry will call mint with id set to 0 in this case.
     */
    function mint(address account, uint256 id, uint256 amount, bytes memory data) external;
}
