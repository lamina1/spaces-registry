// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../soulbound/ERC5633.sol";
import "./BaseItem.sol";

contract UniqueTrophy is BaseItem, ERC1155URIStorage, ERC5633 {
    uint256 public totalItems;

    constructor(string memory _uri) BaseItem(_uri) {
        _setBaseURI(_uri);
        totalItems = 0;
    }

    // Allow the owner to set the base URI
    function setBaseURI(string memory newuri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setBaseURI(newuri);
    }

    // Implement ISpaceItem
    function mint(address account, uint256, uint256)
        public
        override(BaseItem)
        onlyRole(MINTER_ROLE)
    {
        // Compute id
        uint256 id = _computeId(account);
        // Mint
        _mint(account, id, 1, bytes(''));
        // Set as soulbound
        _setSoulbound(id, true);
        totalItems += 1;
    }

    // Allow minter to set item URI
    function setItemURI(uint256 id, string memory metadata) public onlyRole(MINTER_ROLE) {
        _setURI(id, metadata);
    }

    // Compute the id of a unique item
    // This is the hash of account, total items and block timestamp
    // NOTE: total items was added to ensure computation of ID changes on every call
    // Otherwise, gas estimation can be broken in chains that are "lazy", such as AVAX
    // In those chains, new blocks are not created until there is a transaction, so for purposes
    // of gas estimation, the block timestamp is the one from the last block
    // Without total items, this means that consecutive calls of mint to the same address would yield
    // the same ID when estimating gas, and would therefore return a lower gas estimation, since the item with ID
    // was already minted before. This would cause the transaction to fail when actually executed, since the ID
    // would be correctly computed with the block timestamp from that moment.
    function _computeId(address account) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(account, totalItems, block.timestamp)));
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

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        override(ERC1155, ERC5633)
        internal
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(BaseItem, ERC1155, ERC5633)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
