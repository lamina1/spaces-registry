// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./BaseItem.sol";

contract UniqueItem is BaseItem {
    constructor(string memory uri) BaseItem(uri) {}

    // Implement ISpaceItem
    function mint(address account, uint256, uint256 amount, bytes memory data)
        public
        override(BaseItem)
        onlyRole(MINTER_ROLE)
    {
        // Generate a unique item up to amount
        for (uint256 i = 0; i < amount; i++) {
            _mint(account, _computeId(account, i), 1, data);
        }
    }

    // Compute the id of a unique item
    // This is the hash of account, block timestamp and idx (in case multiple items are minted at once)
    function _computeId(address account, uint256 idx) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(account, block.timestamp, idx)));
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(BaseItem)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
