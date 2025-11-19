// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ComplianceEngine
 * @dev Interface for compliance checks (KYC/AML)
 * In production, this would interact with an oracle or off-chain service
 */
contract ComplianceEngine {
    // KYC status mapping
    mapping(address => bool) public kycVerified;
    
    // AML status mapping
    mapping(address => bool) public amlCleared;
    
    // Jurisdiction mapping
    mapping(address => string) public jurisdictions;
    
    address public admin;
    
    event KYCVerified(address indexed account, bool verified);
    event AMLChecked(address indexed account, bool passed);
    event JurisdictionUpdated(address indexed account, string jurisdiction);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Verify KYC status
     */
    function verifyKYC(address account) external onlyAdmin {
        kycVerified[account] = true;
        emit KYCVerified(account, true);
    }
    
    /**
     * @dev Check AML status
     */
    function checkAML(address account) external onlyAdmin {
        amlCleared[account] = true;
        emit AMLChecked(account, true);
    }
    
    /**
     * @dev Check if account is compliant
     */
    function isCompliant(address account) external view returns (bool) {
        return kycVerified[account] && amlCleared[account];
    }
    
    /**
     * @dev Set jurisdiction
     */
    function setJurisdiction(address account, string memory jurisdiction) external onlyAdmin {
        jurisdictions[account] = jurisdiction;
        emit JurisdictionUpdated(account, jurisdiction);
    }
    
    /**
     * @dev Get jurisdiction
     */
    function getJurisdiction(address account) external view returns (string memory) {
        return jurisdictions[account];
    }
}

