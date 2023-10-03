/* SPDX-License-Identifier: MIT */

pragma solidity ^0.8.6;

contract EthereumDIDRegistry {

  mapping(address => address) public owners;
  mapping(address => mapping(bytes32 => mapping(address => uint))) public delegates;
  mapping(address => uint) public changed;
  mapping(address => uint) public nonce;

  modifier onlyOwner(address identity, address actor) {
    require (actor == identityOwner(identity), "bad_actor");
    _;
  }

  event DIDOwnerChanged(
    address indexed identity,
    address owner,
    uint previousChange
  );

  event DIDDelegateChanged(
    address indexed identity,
    bytes32 delegateType,
    address delegate,
    uint validTo,
    uint previousChange
  );

  
struct DIDMethod {
    string method;
    address issuerAddress;
    bool isRegistered;
}

mapping(address => DIDMethod) public issuerRegistry;

event DIDMethodRegistered(address indexed issuer, string method);

function registerDIDMethod(string memory method) public {
    require(!issuerRegistry[msg.sender].isRegistered, "Issuer has already registered a DID method.");
    issuerRegistry[msg.sender] = DIDMethod({
        method: method,
        issuerAddress: msg.sender,
        isRegistered: true
    });
    // Emit an event (to be defined) for the DID method registration
    emit DIDMethodRegistered(msg.sender, method);
}


struct VerifiableCredential {
    string jwt;
    address issuer;
    bool isClaimed;
}

mapping(address => VerifiableCredential) public credentialRegistry;

event CredentialClaimed(address indexed holder, string jwt, address issuer);


function claimCredential(string memory jwt, address issuer, bytes memory signature) public {
    // Check if the holder has already claimed a credential
    require(!credentialRegistry[msg.sender].isClaimed, "Holder has already claimed a credential.");

    // Check if the issuer is registered
    require(issuerRegistry[issuer].isRegistered, "Issuer is not registered.");

    // Verify the signature
    bytes32 hash = keccak256(abi.encodePacked(jwt, msg.sender));
    bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    address signer = ecrecover(prefixedHash, uint8(signature[64]) + 27, bytes32(bytes20(signature)), bytes32(bytes12(signature[32:])));
    require(signer == msg.sender, "Invalid signature.");

    // Process the claim
    credentialRegistry[msg.sender] = VerifiableCredential({
        jwt: jwt,
        issuer: issuer,
        isClaimed: true
    });
    
    emit CredentialClaimed(msg.sender, jwt, issuer);
}

    require(!credentialRegistry[msg.sender].isClaimed, "Holder has already claimed a credential.");
    require(issuerRegistry[issuer].isRegistered, "Issuer is not registered.");
    credentialRegistry[msg.sender] = VerifiableCredential({
        jwt: jwt,
        issuer: issuer,
        isClaimed: true
    });
    
    emit CredentialClaimed(msg.sender, jwt, issuer);
}

function verifyCredential(address holder, string memory jwt, address issuer) public view returns(bool) {
    VerifiableCredential memory vc = credentialRegistry[holder];
    return (vc.isClaimed && keccak256(abi.encodePacked(vc.jwt)) == keccak256(abi.encodePacked(jwt)) && vc.issuer == issuer);
}

event DIDAttributeChanged(
    address indexed identity,
    bytes32 name,
    bytes value,
    uint validTo,
    uint previousChange
  );

  function identityOwner(address identity) public view returns(address) {
     address owner = owners[identity];
     if (owner != address(0x00)) {
       return owner;
     }
     return identity;
  }

  function checkSignature(address identity, uint8 sigV, bytes32 sigR, bytes32 sigS, bytes32 hash) internal returns(address) {
    address signer = ecrecover(hash, sigV, sigR, sigS);
    require(signer == identityOwner(identity), "bad_signature");
    nonce[signer]++;
    return signer;
  }

  function validDelegate(address identity, bytes32 delegateType, address delegate) public view returns(bool) {
    uint validity = delegates[identity][keccak256(abi.encode(delegateType))][delegate];
    return (validity > block.timestamp);
  }

  function changeOwner(address identity, address actor, address newOwner) internal onlyOwner(identity, actor) {
    owners[identity] = newOwner;
    emit DIDOwnerChanged(identity, newOwner, changed[identity]);
    changed[identity] = block.number;
  }

  function changeOwner(address identity, address newOwner) public {
    changeOwner(identity, msg.sender, newOwner);
  }

  function changeOwnerSigned(address identity, uint8 sigV, bytes32 sigR, bytes32 sigS, address newOwner) public {
    bytes32 hash = keccak256(abi.encodePacked(bytes1(0x19), bytes1(0), this, nonce[identityOwner(identity)], identity, "changeOwner", newOwner));
    changeOwner(identity, checkSignature(identity, sigV, sigR, sigS, hash), newOwner);
  }

  function addDelegate(address identity, address actor, bytes32 delegateType, address delegate, uint validity) internal onlyOwner(identity, actor) {
    delegates[identity][keccak256(abi.encode(delegateType))][delegate] = block.timestamp + validity;
    emit DIDDelegateChanged(identity, delegateType, delegate, block.timestamp + validity, changed[identity]);
    changed[identity] = block.number;
  }

  function addDelegate(address identity, bytes32 delegateType, address delegate, uint validity) public {
    addDelegate(identity, msg.sender, delegateType, delegate, validity);
  }

  function addDelegateSigned(address identity, uint8 sigV, bytes32 sigR, bytes32 sigS, bytes32 delegateType, address delegate, uint validity) public {
    bytes32 hash = keccak256(abi.encodePacked(bytes1(0x19), bytes1(0), this, nonce[identityOwner(identity)], identity, "addDelegate", delegateType, delegate, validity));
    addDelegate(identity, checkSignature(identity, sigV, sigR, sigS, hash), delegateType, delegate, validity);
  }

  function revokeDelegate(address identity, address actor, bytes32 delegateType, address delegate) internal onlyOwner(identity, actor) {
    delegates[identity][keccak256(abi.encode(delegateType))][delegate] = block.timestamp;
    emit DIDDelegateChanged(identity, delegateType, delegate, block.timestamp, changed[identity]);
    changed[identity] = block.number;
  }

  function revokeDelegate(address identity, bytes32 delegateType, address delegate) public {
    revokeDelegate(identity, msg.sender, delegateType, delegate);
  }

  function revokeDelegateSigned(address identity, uint8 sigV, bytes32 sigR, bytes32 sigS, bytes32 delegateType, address delegate) public {
    bytes32 hash = keccak256(abi.encodePacked(bytes1(0x19), bytes1(0), this, nonce[identityOwner(identity)], identity, "revokeDelegate", delegateType, delegate));
    revokeDelegate(identity, checkSignature(identity, sigV, sigR, sigS, hash), delegateType, delegate);
  }

  function setAttribute(address identity, address actor, bytes32 name, bytes memory value, uint validity ) internal onlyOwner(identity, actor) {
    emit DIDAttributeChanged(identity, name, value, block.timestamp + validity, changed[identity]);
    changed[identity] = block.number;
  }

  function setAttribute(address identity, bytes32 name, bytes memory value, uint validity) public {
    setAttribute(identity, msg.sender, name, value, validity);
  }

  function setAttributeSigned(address identity, uint8 sigV, bytes32 sigR, bytes32 sigS, bytes32 name, bytes memory value, uint validity) public {
    bytes32 hash = keccak256(abi.encodePacked(bytes1(0x19), bytes1(0), this, nonce[identityOwner(identity)], identity, "setAttribute", name, value, validity));
    setAttribute(identity, checkSignature(identity, sigV, sigR, sigS, hash), name, value, validity);
  }

  function revokeAttribute(address identity, address actor, bytes32 name, bytes memory value ) internal onlyOwner(identity, actor) {
    emit DIDAttributeChanged(identity, name, value, 0, changed[identity]);
    changed[identity] = block.number;
  }

  function revokeAttribute(address identity, bytes32 name, bytes memory value) public {
    revokeAttribute(identity, msg.sender, name, value);
  }

  function revokeAttributeSigned(address identity, uint8 sigV, bytes32 sigR, bytes32 sigS, bytes32 name, bytes memory value) public {
    bytes32 hash = keccak256(abi.encodePacked(bytes1(0x19), bytes1(0), this, nonce[identityOwner(identity)], identity, "revokeAttribute", name, value));
    revokeAttribute(identity, checkSignature(identity, sigV, sigR, sigS, hash), name, value);
  }

}
function verifyCredential(address holder) public view returns (bool isHolderValid, bool isIssuerValid) {
    VerifiableCredential memory credential = credentialRegistry[holder];
    
    // Check if the holder has claimed a credential
    if (!credential.isClaimed) {
        return (false, false);
    }

    // Check if the issuer is registered
    if (!issuerRegistry[credential.issuer].isRegistered) {
        return (true, false);
    }

    return (true, true);
}