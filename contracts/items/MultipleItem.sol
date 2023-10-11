// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./BaseItem.sol";

contract MultipleItem is BaseItem, ERC1155URIStorage {
    uint256 public totalItems;

    constructor(string memory _uri) BaseItem(_uri) {
        _setBaseURI(_uri);
        totalItems = 0;
    }

    // Implement ISpaceItem
    function mint(address account, uint256 laserId, uint256 amount)
        public
        override(BaseItem)
        onlyRole(MINTER_ROLE)
    {
        // Generate a unique item up to amount
        for (uint256 i = 0; i < amount; i++) {
            uint256 id = _computeId(account, i);
            _mint(account, id, 1, bytes(''));
            string memory metadata = string(abi.encodePacked(Strings.toString(laserId), '.json'));
            _setURI(id, metadata);
        }
        totalItems += amount;
    }

    // Compute the id of a unique item
    // This is the hash of account, total items, block timestamp and idx (in case multiple items are minted at once)
    // NOTE: total items was added to ensure computation of ID changes on every call
    // Otherwise, gas estimation can be broken in chains that are "lazy", such as AVAX
    // In those chains, new blocks are not created until there is a transaction, so for purposes
    // of gas estimation, the block timestamp is the one from the last block
    // Without total items, this means that consecutive calls of mint to the same address would yield
    // the same ID when estimating gas, and would therefore return a lower gas estimation, since the item with ID
    // was already minted before. This would cause the transaction to fail when actually executed, since the ID
    // would be correctly computed with the block timestamp from that moment.
    function _computeId(address account, uint256 idx) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(account, totalItems, block.timestamp, idx)));
    }

    // The following functions are overrides required by Solidity.

    function uri(uint256 id)
        override(ERC1155, ERC1155URIStorage)
        public view returns (string memory) {
        return super.uri(id);
    }

    function _setURI(uint256 tokenId, string memory tokenURI)
        override(ERC1155URIStorage)
        internal
    {
        return super._setURI(tokenId, tokenURI);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, BaseItem)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
