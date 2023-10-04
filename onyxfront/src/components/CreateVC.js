import React, { useState } from 'react';

function CreateVC() {

  // this is to save the userdata
  const [responseMessage, setResponseMessage] = useState(null);

  // this is to save the vc
  const [vcMessage, setvcMessage] = useState(null);

  const [vcData, setVCData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip: '',
  });

  const handlevcInputChange = (event) => {
    event.preventDefault();
    const {name, value } = event.target;
    setVCData({...vcData, [name]:value})
  };

  const handleButtonClick = async (e) => {
    e.preventDefault();
    try {

      console.log(vcData)
      const response = await fetch('http://localhost:3001/post-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vcData),

      })
      const data = await response.json();
      setResponseMessage(data);

    } catch (error) {
      console.error('Error sending data:', error);
    }

    try {

      const response = await fetch('http://localhost:3001/get-data', {
        method: 'GET',
      })
      const data = await response.json();
      setvcMessage(data);

    } catch (error) {
      console.error('Error sending data:', error);
    }

  };

  return (

    <div className="App">

      <form>
      <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={vcData.name}
          onChange={handlevcInputChange}
          required
        /><br /><br />
          <label htmlFor="address">Address:</label>
        <input
          type="text"
          id="address"
          name="address"
          value={vcData.address}
          onChange={handlevcInputChange}
          required
        /><br /><br />

        <label htmlFor="city">City:</label>
        <input
          type="text"
          id="city"
          name="city"
          value={vcData.city}
          onChange={handlevcInputChange}
          required
        /><br /><br />

        <label htmlFor="state">State:</label>
        <input
          type="text"
          id="state"
          name="state"
          value={vcData.state}
          onChange={handlevcInputChange}
          required
        /><br /><br />

        <label htmlFor="country">Country:</label>
        <input
          type="text"
          id="country"
          name="country"
          value={vcData.country}
          onChange={handlevcInputChange}
          required
        /><br /><br />

        <label htmlFor="zip">Zip Code:</label>
        <input
          type="text"
          id="zip"
          name="zip"
          value={vcData.zip}
          onChange={handlevcInputChange}
          required
        /><br /><br />


        <button onClick={handleButtonClick}>Create a Verfiable Credential</button>
      </form>


      {responseMessage && <pre>{JSON.stringify(responseMessage, null, 2)}</pre>}
      {vcMessage && <pre>{JSON.stringify(vcMessage, null, 2)}</pre>}

    </div>
  );
}


export default CreateVC;
