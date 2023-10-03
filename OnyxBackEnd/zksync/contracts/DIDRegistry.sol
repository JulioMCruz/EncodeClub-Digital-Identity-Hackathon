// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DIDRegistry {

    struct DID {
        address holder;
        address issuer;
        bytes32 jwtHash;
        bool isValid;
        string didMethod;
    }

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: Only owner can execute this");
        _;
    }

    constructor() {
        owner = msg.sender; 
    }

    mapping(address => DID) public dids;

    function addDID(
        address didAddress, 
        address _holder, 
        address _issuer, 
        bytes32 _jwtHash, 
        string memory _didMethod, 
        bytes memory signature
    ) public onlyOwner {
        require(dids[didAddress].holder == address(0), "DID already exists");
        require(verifySignature(_issuer, _jwtHash, signature), "Invalid Signature");

        dids[didAddress] = DID(_holder, _issuer, _jwtHash, true, _didMethod);
    }

    function verifyDID(address didAddress, address _holder, address _issuer) public view returns (bool) {
        DID memory did = dids[didAddress];
        return did.isValid 
        && did.holder == _holder 
        && did.issuer == _issuer;
    }

    function invalidateDID(address didAddress) public {
        require(dids[didAddress].holder == msg.sender || dids[didAddress].issuer == msg.sender, "Not authorized");
        dids[didAddress].isValid = false;
    }

    function getJwtHash(address didAddress) public view returns (bytes32) {
        return dids[didAddress].jwtHash;
    }

    function verifySignature(address signer, bytes32 _hash, bytes memory signature) internal pure returns (bool) {
        bytes32 r;
        bytes32 s;
        uint8 v;

        if (signature.length != 65) {
            return false;
        }

        // Divide the signature into r, s and v variables
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        // Version of signature should be 27 or 28
        if (v < 27) {
            v += 27;
        }

        // If version is correct and signer is the one who signed the hashed data
        if (v != 27 && v != 28) {
            return false;
        } else {
            // ECDSA recovery to fetch the address which signed the hashed data
            return signer == ecrecover(keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)
            ), v, r, s);
        }
    }
}