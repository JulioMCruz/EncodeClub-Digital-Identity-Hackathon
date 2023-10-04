import React, { useState } from "react";

function SignVC() {

    const [signedVc, setSignedVC] = useState(null);

    const signButtonClick = async(e) => {

        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3001/sign-vcdata',{
                method: 'GET',
            }
            
            )

            const jwtstring = await response.text();

            setSignedVC(jwtstring);

        } catch(error) {
            console.log('Error signing VC:', error)
        }

    }




  return (
    <div>
     
      <button onClick={signButtonClick}>Sign Verifiable Credentials With Wallet Signature</button>

      {signedVc && <pre>{JSON.stringify(signedVc, null, 2)}</pre>}
    </div>
  );
}

export default SignVC;