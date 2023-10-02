
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

contract DIDCredentialRegistry {
    // Issuer's DID (set during contract deployment)
    address public issuer;
    string public issuerDID;

    // Mapping to store DIDs claimed by holders
    mapping(string => address) private didToHolder;
    mapping(string => bytes) private didSignatures; // Mapping DID to its signature by the issuer

    // Event to be emitted when a DID is claimed
    event DIDClaimed(string did, address holder);
    
    // Contract initialization with the issuer's DID
    constructor(string memory _issuerDID) {
        issuer = msg.sender;
        issuerDID = _issuerDID;
    }

    // Function for the issuer to sign DIDs
    function signDID(string memory did, bytes memory signature) public {
        require(msg.sender == issuer, "Only the issuer can sign DIDs");
        didSignatures[did] = signature;
    }
    
    // Function for the holder to claim a DID
    function claimDID(string memory did, bytes memory signature) public {
        require(didToHolder[did] == address(0), "DID already claimed");

        // Verify the signature to ensure the DID is intended for the holder
        bytes32 hash = keccak256(abi.encodePacked(did, msg.sender));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        
    bytes32 r;
    bytes32 s;
    uint8 v;

    // Split the signature into r, s, and v variables
    assembly {
        r := mload(add(signature, 0x20))
        s := mload(add(signature, 0x40))
        v := byte(0, mload(add(signature, 0x60)))
    }

    // Adjust the v value (since Ethereum uses a different v standard)
    if (v < 27) {
        v += 27;
    }

    address signer = ecrecover(prefixedHash, v, r, s)
    ;
        require(signer == msg.sender, "Invalid signature.");

        didToHolder[did] = msg.sender;
        emit DIDClaimed(did, msg.sender);
    }

    // Function for verifiers to verify the holder and issuer of a DID
    function verifyDID(string memory did, address holder) public view returns (bool isValid) {
        bytes memory issuerSignature = didSignatures[did];
        bytes32 hash = keccak256(abi.encodePacked(did));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        
    bytes32 r_issuer;
    bytes32 s_issuer;
    uint8 v_issuer;

    // Split the issuerSignature into r, s, and v variables
    assembly {
        r_issuer := mload(add(issuerSignature, 0x20))
        s_issuer := mload(add(issuerSignature, 0x40))
        v_issuer := byte(0, mload(add(issuerSignature, 0x60)))
    }

    // Adjust the v_issuer value (since Ethereum uses a different v standard)
    if (v_issuer < 27) {
        v_issuer += 27;
    }

    address didIssuer = ecrecover(prefixedHash, v_issuer, r_issuer, s_issuer)
    ;
        
        return (didToHolder[did] == holder && didIssuer == issuer);
    }
}
