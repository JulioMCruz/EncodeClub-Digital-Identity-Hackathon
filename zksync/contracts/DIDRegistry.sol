// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DIDRegistry {

    struct DID {
        bytes32 jwtHash;
        address holder;
        address issuer;
    }

    mapping(address => DID) public dids;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: Only owner can execute this");
        _;
    }

    constructor() {
        owner = msg.sender; 
    }

    function addDID(
        address didAddress,
        string memory jwt,
        address holder,
        address issuer
    ) public onlyOwner {
        bytes32 jwtHash = keccak256(abi.encodePacked(jwt));
        DID memory newDID = DID({
            jwtHash: jwtHash,
            holder: holder,
            issuer: issuer
        });
        dids[didAddress] = newDID;
    }

    function verifyDID(
        string memory jwt,
        address didAddress,
        address holder,
        address issuer
    ) public view returns (bool) {
        bytes32 computedJwtHash = keccak256(abi.encodePacked(jwt));
        DID memory existingDID = dids[didAddress];
        return existingDID.jwtHash == computedJwtHash &&
               existingDID.holder == holder &&
               existingDID.issuer == issuer;
    }

    function getHolderAndIssuer(address didAddress) public view returns (address holder, address issuer) {
        DID memory existingDID = dids[didAddress];
        return (existingDID.holder, existingDID.issuer);
    }
}
