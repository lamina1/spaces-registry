// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ISpaceItem.sol";

/**
 * @dev Interface for Spaces compatible items
 */
interface ISettableUri is ISpaceItem {
    /**
     * @dev Set the URI for an item
     */
    function setItemURI(uint256 id, string memory uri) external;
}
