import React, { useState } from 'react';

function CreateVP() {

  const [vpMessage, setvpMessage] = useState(null);

  const handleButtonClick = async (e) => {
    e.preventDefault();
    try {

      const response = await fetch('http://localhost:3001/create-vpdata', {
        method: 'GET',
      })
      const data = await response.json();
      setvpMessage(data);

    } catch (error) {
      console.error('Error sending data:', error);
    }
  
  };

  return (

    <div>
       <button onClick={handleButtonClick}>Create Verifiable Presentation</button>
      {vpMessage && <pre>{JSON.stringify(vpMessage, null, 2)}</pre>}
    </div>
  );
}


export default CreateVP;
