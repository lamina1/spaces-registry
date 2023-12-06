// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "../interfaces/IStudioTemplate.sol";

contract BaseTemplate is Ownable, ERC1155, ERC1155URIStorage, IStudioTemplate {
    // Total number of items minted
    uint256 public totalItems;
    // Number of mints allowed per address
    uint256 public _maxmints;
    // Price of each mint
    uint256 public _price;
     // Map address to number of minted NFTs
    mapping(address => uint256) public addressMints;

    constructor(uint256 _maxMints, uint256 _mintPrice, string memory _uri) ERC1155(_uri) {
        _maxmints = _maxMints;
        _price = _mintPrice;
        _setBaseURI(_uri);
    }

    function setMaxmints(
        uint256 _maxMints
    ) external onlyOwner {
        _maxmints = _maxMints;
    }

    function setPrice(
        uint256 _mintPrice
    ) external onlyOwner {
        _price = _mintPrice;
    }

    // Implement IStudioTemplate
    function maxmints() external view returns (uint256) {
        return _maxmints;
    }

    function price() external view returns (uint256) {
        return _price;
    }

    function mint(string memory metadata_cid)
        external
        payable
    {
        // Check that the price is correct
        require(msg.value == _price, "Mint value is not correct");
        // Don't allow minting more than the limit
        require (addressMints[msg.sender] < _maxmints, "Mint limit reached for this address");

        uint256 id = _computeId(msg.sender);
        _mint(msg.sender, id, 1, bytes(''));
        _setURI(id, metadata_cid);
        emit Created(msg.sender, id);
        totalItems += 1;
        addressMints[msg.sender]++;
    }

    // Withdraw funds from the contract
    function withdraw(address dest) external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No balance to withdraw");
        payable(dest).transfer(amount);
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
        public view virtual returns (string memory) {
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
        virtual
        override(ERC1155)
        returns (bool)
    {
        return interfaceId == type(IStudioTemplate).interfaceId || super.supportsInterface(interfaceId);
    }
}