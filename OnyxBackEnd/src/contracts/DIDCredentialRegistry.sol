
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

contract DIDCredentialRegistry {
    // Issuer's DID (set during contract deployment)
    address public issuer;
    string public issuerDID;

    // Mapping to store DIDs claimed by holders
    mapping(string => address) private didToHolder;
    
    // Event to be emitted when a DID is claimed
    event DIDClaimed(string did, address holder);
    
    // Contract initialization with the issuer's DID
    constructor(string memory _issuerDID) {
        issuer = msg.sender;
        issuerDID = _issuerDID;
    }
    
    // Function for the holder to claim a DID
    function claimDID(string memory did) public {
        require(didToHolder[did] == address(0), "DID already claimed");
        didToHolder[did] = msg.sender;
        emit DIDClaimed(did, msg.sender);
    }

    // Function for verifiers to verify the holder and issuer of a DID
    function verifyDID(string memory did, address holder) public view returns (bool isValid) {
        return (didToHolder[did] == holder && issuer == msg.sender);
    }
}
