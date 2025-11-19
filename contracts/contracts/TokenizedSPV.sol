// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title TokenizedSPV
 * @dev ERC-20 token representing LP interests in an SPV
 * Implements transfer restrictions, whitelisting, and lockup periods
 */
contract TokenizedSPV is ERC20, Ownable, Pausable {
    // Whitelist mapping
    mapping(address => bool) public whitelist;
    
    // Lockup periods (unlock timestamp)
    mapping(address => uint256) public lockups;
    
    // Current NAV (Net Asset Value)
    uint256 public currentNAV;
    
    // Distribution tracking
    mapping(address => uint256) public pendingDistributions;
    uint256 public totalDistributed;
    
    // Events
    event TransferRestricted(address indexed from, address indexed to, uint256 value, string reason);
    event TokensMinted(address indexed to, uint256 value);
    event TokensBurned(address indexed from, uint256 value);
    event DistributionPaid(address indexed to, uint256 value);
    event WhitelistUpdated(address indexed account, bool whitelisted);
    event LockupUpdated(address indexed account, uint256 unlockTime);
    event NAVUpdated(uint256 newNAV);
    
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        // Owner is automatically whitelisted
        whitelist[initialOwner] = true;
    }
    
    /**
     * @dev Mint tokens (admin only)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(whitelist[to], "Recipient not whitelisted");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Burn tokens (admin only)
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }
    
    /**
     * @dev Burn all tokens (for liquidation)
     */
    function burnAll() external onlyOwner {
        // This would need to iterate through holders
        // For gas efficiency, consider using a different approach
        revert("Use individual burn calls");
    }
    
    /**
     * @dev Override transfer to enforce restrictions
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        _checkTransferRestrictions(msg.sender, to, amount);
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to enforce restrictions
     */
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        _checkTransferRestrictions(from, to, amount);
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Check if transfer is allowed
     */
    function canTransfer(address from, address to, uint256 value) public view returns (bool, string memory) {
        if (!whitelist[to]) {
            return (false, "Recipient not whitelisted");
        }
        
        if (lockups[from] > 0 && block.timestamp < lockups[from]) {
            return (false, "Tokens are locked");
        }
        
        return (true, "");
    }
    
    /**
     * @dev Internal function to check transfer restrictions
     */
    function _checkTransferRestrictions(address from, address to, uint256 amount) internal view {
        require(whitelist[to], "Recipient not whitelisted");
        
        if (lockups[from] > 0) {
            require(block.timestamp >= lockups[from], "Tokens are locked");
        }
    }
    
    /**
     * @dev Update whitelist (admin only)
     */
    function updateWhitelist(address account, bool whitelisted) external onlyOwner {
        whitelist[account] = whitelisted;
        emit WhitelistUpdated(account, whitelisted);
    }
    
    /**
     * @dev Set lockup period (admin only)
     */
    function setLockup(address account, uint256 unlockTime) external onlyOwner {
        lockups[account] = unlockTime;
        emit LockupUpdated(account, unlockTime);
    }
    
    /**
     * @dev Check if account is locked
     */
    function isLocked(address account) public view returns (bool) {
        return lockups[account] > 0 && block.timestamp < lockups[account];
    }
    
    /**
     * @dev Update NAV (admin only)
     */
    function updateNAV(uint256 newNAV) external onlyOwner {
        currentNAV = newNAV;
        emit NAVUpdated(newNAV);
    }
    
    /**
     * @dev Get NAV per token
     */
    function getNAVPerToken() public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return 0;
        return (currentNAV * 1e18) / supply;
    }
    
    /**
     * @dev Record distribution (admin only)
     * Note: Actual payment happens off-chain, this just records the event
     */
    function recordDistribution(uint256 totalAmount) external onlyOwner {
        uint256 supply = totalSupply();
        require(supply > 0, "No tokens minted");
        
        uint256 perToken = (totalAmount * 1e18) / supply;
        totalDistributed += totalAmount;
        
        // In a full implementation, this would calculate and store per-holder amounts
        // For now, we just emit the event
    }
    
    /**
     * @dev Pause contract (admin only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (admin only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}

