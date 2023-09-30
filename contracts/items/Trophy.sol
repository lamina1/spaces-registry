// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../soulbound/ERC5633.sol";
import "./BaseItem.sol";

contract Trophy is BaseItem, ERC5633 {
    constructor(string memory uri) BaseItem(uri) {}

    // Implement ISpaceItem
    function mint(address account, uint256, uint256, bytes memory data)
        public
        override(BaseItem)
        onlyRole(MINTER_ROLE)
    {
        // Compute id
        uint256 id = _computeId(account);
        // Mint
        _mint(account, id, 1, data);
        // Set as soulbound
        _setSoulbound(id, true);
    }

    // Compute the id of a unique item
    // This is the hash of account, block timestamp
    function _computeId(address account) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(account, block.timestamp)));
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        override(ERC1155, ERC5633)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(BaseItem, ERC5633)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
