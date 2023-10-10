// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/ISpaceItem.sol";

contract BaseItem is ERC1155, AccessControl, ISpaceItem {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(string memory uri) ERC1155(uri) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function setURI(string memory newuri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    // Implement ISpaceItem
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

    // The following functions are overrides required by Solidity.

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
