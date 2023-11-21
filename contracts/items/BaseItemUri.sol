// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "../interfaces/ISettableUri.sol";

contract BaseItemUri is ERC1155, AccessControl, ERC1155URIStorage, ISettableUri {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(string memory _uri) ERC1155(_uri) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _setBaseURI(_uri);
    }

    // Allow the owner to set the base URI
    function setBaseURI(string memory newuri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setBaseURI(newuri);
    }

    // Implement ISettableUri
    function authorized(address account) public view override returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    function mint(address account, uint256 id, uint256 amount)
        public
        virtual
        onlyRole(MINTER_ROLE)
    {
       _mint(account, id, amount, bytes(''));
    }

    function setItemURI(uint256 id, string memory _uri) external onlyRole(MINTER_ROLE) {
        _setURI(id, _uri);
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
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return interfaceId == type(ISpaceItem).interfaceId || super.supportsInterface(interfaceId);
    }
}
