import { ConnectWallet } from "@thirdweb-dev/react";
import "./styles/Home.css";
import { Web3Provider } from "zksync-web3";
import React, { useEffect, useState } from "react";
import CreateVC from "./components/CreateVC";
import SignVC from "./components/SignVC";
import CreateVP from "./components/CreateVP";
import SignVP from "./components/SignVP";
import { ethers } from 'ethers';

// import DIDRegistryContract from "./components/Contract/Contract";
import DIDRegistry from './components/Contract/DIDRegistry.json';
const contractAddress = "0xee514cd1FD1cdAEC4fC17b3e252457d6BE5C2114";


export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [issuer, setIssuer] = useState("");

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');

  useEffect(() => {
    if (window.ethereum) {
        const web3Provider = new Web3Provider(window.ethereum);
        setProvider(web3Provider);
        const signerInstance = web3Provider.getSigner();
        setSigner(signerInstance);
    } else {
        console.log('Please install MetaMask!');
    }
}, []);

useEffect(() => {
  if (signer) {
      signer.getAddress().then(address => {
          setAccount(address);
      });
  }
}, [signer]);

  const extractEthereumAddress = (didString) => {
    const parts = didString.split(':');
    return parts[parts.length - 1];
  };

  const didAddress = 'did:ethr:maticnum:0x1882a5b515439a06961c10B72AAa099d96FB470F';
  const didHolder = 'did:ethr:maticnum:0x62F68c8265288E0D4c64C84BF9bf01FCeC5e0B47';
  const didIssuer = 'did:ethr:maticnum:0x7E4C14E35399d582859E2304F7E3163955A441b9'; 
  const cleanDidAddress = extractEthereumAddress(didAddress);
  const cleanDidHolder = extractEthereumAddress(didHolder);
  const cleanDidIssuer = extractEthereumAddress(didIssuer);
  const didmethod = 'did:ethr:maticnum'

  const jwt = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3Mjc5ODYzMTcsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJQUk9PRl9PRl9BRERSRVNTIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7Im5hbWUiOiJ0ZXN0IiwiYWRkcmVzcyI6InRlc3QiLCJjaXR5IjoidGVzdCIsInN0YXRlIjoiMiIsImNvdW50cnkiOiJ0ZXN0IiwiemlwIjoidGVzdCJ9LCJjcmVkZW50aWFsU2NoZW1hIjp7ImlkIjoiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2pwbW9yZ2FuY2hhc2Uvb255eC1zc2ktc2RrL21haW4vc3JjL3NlcnZpY2VzL2NvbW1vbi9zY2hlbWFzL2RlZmluaXRpb25zL3Byb29mT2ZBZGRyZXNzLmpzb24iLCJ0eXBlIjoiSnNvblNjaGVtYVZhbGlkYXRvcjIwMTgifX0sInN1YiI6ImRpZDpldGhyOm1hdGljbnVtOjB4NjJGNjhjODI2NTI4OEUwRDRjNjRDODRCRjliZjAxRkNlQzVlMEI0NyIsImp0aSI6ImRpZDpldGhyOm1hdGljbnVtOjB4MTg4MmE1YjUxNTQzOWEwNjk2MWMxMEI3MkFBYTA5OWQ5NkZCNDcwRiIsIm5iZiI6MTY5NjM2MzkxNywiaXNzIjoiZGlkOmV0aHI6bWF0aWNudW06MHg3RTRDMTRFMzUzOTlkNTgyODU5RTIzMDRGN0UzMTYzOTU1QTQ0MWI5In0.WIGW75TKPqtsU8lXwY2NuXlT1_NFbxmAddIoereA3fJWbLqLxE9155nQJod81I7We6x4sZnCHNR_jat63oGdPQ'



  const handleButtonClick = async () => {

     const didRegistry = new ethers.Contract(contractAddress, DIDRegistry.abi, provider);
      const contractOwner = await didRegistry.owner();
      setIssuer(contractOwner);
      console.log("Contract owner:", contractOwner);
  
  };

  const AddDID = async () => {

    console.log(signer)
    console.log(cleanDidAddress)
    console.log(didmethod)
    console.log(jwt)

    if (signer) {
      const didRegistry = new ethers.Contract(contractAddress, DIDRegistry.abi, signer);
      try {
          const result = await didRegistry.addDID(cleanDidAddress, jwt, cleanDidHolder,cleanDidIssuer);
          
          console.log("Transaction Result:", result);
      } catch (error) {
          console.error("Error in addDID:", error);
      }
  }
};


  return (
    <main className="main">
      <div className="container">
        <div className="header">
          <h1 className="title">
            Digital Identity
            <br></br>
            <span className="gradient-text-1">J.P. Morgan Hackathon</span>
          </h1>

          <p className="description">
            Raise charitable funds with your verified digital identity
          </p>
          <p className="description">
            Issuer Contract Addresss: {issuer}
          </p>
   

          <div className="connect">
            <ConnectWallet
              modalSize="wide"
              dropdownPosition={{
                side: "bottom",
                align: "center",
              }}
            />
          </div>
          <div>
            <button onClick={handleButtonClick}>Display Issuer Address</button>
          </div>
          <div>
            <button onClick={AddDID}>Add DID</button>
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <p className="card-title">Create a Verified Credential</p>
            <CreateVC />
          </div>
          <div className="card">
            <p className="card-title">Sign a Verified Credential</p>
            <SignVC />
          </div>
          <div className="card">
            <p className="card-title">Create a Verified Presentation</p>
            <CreateVP />
          </div>
          <div className="card">
            <p className="card-title">Sign a Verified Presentation</p>
            <SignVP />
          </div>
        </div>
      </div>
    </main>
  );
}
