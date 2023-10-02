// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "./interfaces/ISpaceItem.sol";
import "./libraries/StringUtils.sol";

/* Type definitions */

// An Achievement is a milestone that can be reached by users in a Space
struct Achievement {
    // The number of points needed to unlock the achievement
    uint256 points;
    // The minimum duration of time needed to unlock the achievement
    uint256 duration;
    // The item that is minted when the achievement is reached
    ISpaceItem item;
    // The id of the item that is minted when the achievement is reached
    // NOTE: 0 indicates a unique item
    uint256 itemId;
    // The amount that is minted
    uint256 amount;
}

// A Space is an experience that users can interact with
// This represents basic information about a Space
struct SpaceInfo {
    // The name of the Space
    string name;
    // The url of the Space
    string url;
    // The url of the icon for the Space
    string icon;
    // Is the space active
    bool active;
}

// A Space is an experience that users can interact with
// This represents a Space with all its achievements and an optional trophy 
struct Space {
    // The Space info
    SpaceInfo info;
    // Who is the owner of the Space
    address owner;
    // The list of achievements in the Space
    // NOTE: if desired, the first achievement could represent a starting point for an user
    // by setting points and duration to 0
    Achievement[] achievements;
    // The trophy that is minted when all achievements are reached
    // NOTE: Set to address 0 if not used
    ISpaceItem trophy;
}

///////////////////////////////////
// Errors
error NameTooShort(string name);
error NameTooLong(string name);
error UrlTooShort(string name);
error UrlTooLong(string name);

contract SpaceRegistry is Ownable, Pausable {
    ///////////////////////////////////
    // State

    using Counters for Counters.Counter;
    using StringUtils for string;

    // Space registration price
    uint256 public price;

    // Space id is a increasing counter
    Counters.Counter private _spaceIds;

    // Spaces
    mapping(uint256 => Space) private _spaces;

    // A map of addresses that are authorised to mint items
    mapping(address => bool) public minters;

    ///////////////////////////////////
    // Events
    event SpaceRegistered(uint256 indexed id, string name, string url, bool active);
    event SpaceActive(uint256 indexed id, bool active);
    event AchievementUnlocked(uint256 indexed spaceId, uint256 indexed achievementIdx, address indexed account);
    event TrophyWon(uint256 indexed spaceId, address indexed account);

    ///////////////////////////////////
    // Constructor
    constructor(
        uint256 _price
    ) {
        // Set the price
        price = _price;
    }

    ///////////////////////////////////
    // Modifiers
    modifier onlyMinter() {
        _checkMinter();
        _;
    }

    /**
     * @dev Throws if the sender is not a minter.
     */
    function _checkMinter() internal view virtual {
        require(minters[msg.sender], "SpaceRegistry: caller is not a minter");
    }

    /**
     * @dev Throws if the sender is not the space owner or the contract Owner.
     */
    function _checkOwnerOrSpaceOwner(uint256 spaceId) internal view virtual {
        require(
            msg.sender == owner() || msg.sender == _spaces[spaceId].owner,
            "SpaceRegistry: caller is not Space owner or contract Owner"
        );
    }

    ///////////////////////////////////
    // Owner write functions

    // Authorises a minter, who can mint items
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
    }

    // Revoke minter permission for an address.
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
    }

    // Set the price of space registration
    function setPrice(uint256 _price) external onlyOwner {
        price = _price;
    }

    // Pause registrations
    function pause() external onlyOwner {
        _pause();
    }

    // Unpause registrations
    function unpause() external onlyOwner {
        _unpause();
    }

    ///////////////////////////////////
    // Public write functions

    // Register a new space
    // Can be called by anyone
    // NOTE: caller must be an authorized owner of all ISpaceItem contracts referenced in the achievements and trophy
    // as defined in the ISpaceItem interface
    function registerSpace(
        SpaceInfo calldata info,
        Achievement[] calldata achievements,
        ISpaceItem trophy
    )
        external
        payable
        whenNotPaused
    {
        // Check price
        require(msg.value == price, "Registration value is not correct");

        // Validate trophy if set
        if (address(trophy) != address(0)) {
            require(checkItem(address(trophy)), "Trophy is not a valid ISpaceItem");
            require(trophy.authorized(msg.sender), "sender is not authorized owner of Trophy");
        }

        // Validate achievements
        for (uint256 i = 0; i < achievements.length; i++) {
            require(checkItem(address(achievements[i].item)), "Achievement item is not a valid ISpaceItem");
            require(achievements[i].item.authorized(msg.sender), "sender is not authorized owner of Achievement item");
        }

        // Validate name
        // NOTE: some UTF-8 codes are more than 1 char
        uint256 strLen = info.name.strlen();
        // Check len
        if (strLen < 1) {
            revert NameTooShort(info.name);
        }
        if (strLen > 255) {
            revert NameTooLong(info.name);
        }

        // Validate url
        // NOTE: some UTF-8 codes are more than 1 char
        strLen = info.url.strlen();
        // Check len
        if (strLen < 1) {
            revert UrlTooShort(info.url);
        }
        if (strLen > 255) {
            revert UrlTooLong(info.url);
        }

        // Create space
        uint256 spaceId = _spaceIds.current();
        _spaceIds.increment();
        _spaces[spaceId].info = info;
        _spaces[spaceId].owner = msg.sender;
        // Copy achievements
        for (uint256 i = 0; i < achievements.length; i++) {
            _spaces[spaceId].achievements.push(achievements[i]);
        }
        _spaces[spaceId].trophy = trophy;

        // Emit event
        emit SpaceRegistered(spaceId, info.name, info.url, info.active);
    }

    // Enable/disable a space
    // Can be called by the space owner or the contract owner
    function setActive(uint256 spaceId, bool active) external {
        _checkOwnerOrSpaceOwner(spaceId);
        _spaces[spaceId].info.active = active;
        emit SpaceActive(spaceId, active);
    }

    // Mint the achievement of a Space
    // Can be called by minters
    function mintAchievement(uint256 spaceId, uint256 achievementIdx, address account, bytes memory data) external onlyMinter {
        // Make sure space is active and achievement exists
        require(_spaces[spaceId].info.active, "Space is not active");
        require(achievementIdx < _spaces[spaceId].achievements.length, "Achievement index out of bounds");
        // Get the achievemnt
        Achievement memory achievement = _spaces[spaceId].achievements[achievementIdx];
        // Mint the item
        achievement.item.mint(account, achievement.itemId, achievement.amount, data);
        // Emit event
        emit AchievementUnlocked(spaceId, achievementIdx, account);
    }

    // Mint the trophy of a Space
    // Can be called by minters
    function mintTrophy(uint256 spaceId, address account, bytes memory data) external onlyMinter {
        // Make sure space is active and trophy exists
        require(_spaces[spaceId].info.active, "Space is not active");
        require(address(_spaces[spaceId].trophy) != address(0), "Space has no trophy");
        // Mint the trophy
        _spaces[spaceId].trophy.mint(account, 0, 1, data);
        // Emit event
        emit TrophyWon(spaceId, account);
    }

    ///////////////////////////////////
    // Public Read functions
    function totalSpaces() public view returns (uint256) {
        return _spaceIds.current();
    }

    function getAchievement(uint256 spaceId, uint256 idx) public view returns (Achievement memory) {
        return _spaces[spaceId].achievements[idx];
    }

    ///////////////////////////////////
    // Internal functions

    function checkItem(address item) internal view returns (bool) {
        return ERC165Checker.supportsInterface(item, type(ISpaceItem).interfaceId);
    }
}
