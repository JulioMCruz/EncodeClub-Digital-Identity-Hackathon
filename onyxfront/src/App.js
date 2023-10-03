import { ConnectWallet } from "@thirdweb-dev/react";
import "./styles/Home.css";

import CreateVC from "./components/CreateVC";
import SignVC from "./components/SignVC";

import CreateVP from "./components/CreateVP";
import SignVP from "./components/SignVP";

export default function Home() {
  return (
    <main className="main">
      <div className="container">
        <div className="header">
          <h1 className="title">
            Digital Identity
            <br>
            </br>
            <span className="gradient-text-1">
              J.P. Morgan Hackathon
            </span>
          </h1>

          <p className="description">
            Raise charitable funds with your verified digital identity
          </p>

          <div className="connect">
            <ConnectWallet
              modalSize = "wide"
              dropdownPosition={{
                side: "bottom",
                align: "center",
              }}
            />
          </div>
        </div>

          <div className = "grid">
          <div className = "card">
            <p className = "card-title">
              Create a Verified Credential
            </p>
            <CreateVC />
          </div>
          <div className = "card">
            <p className = "card-title">
              Sign a Verified Credential
            </p>
            <SignVC />
          </div>
          <div className = "card">
            <p className = "card-title">
              Create a Verified Presentation
            </p>
            <CreateVP />
          </div>
          <div className = "card">
            <p className = "card-title">
              Sign a Verified Presentation
            </p>
            <SignVP />
          </div>
        </div>
        
      </div>
    </main>
  );
}
