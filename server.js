const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json()); // To parse JSON body requests

// Modify the root URL handler to query MSpace and display base size
app.get('/', async (req, res) => {
  // Prepare the request payload for MSpace subscription query-base
  const payload = {
    applicationId: 'APP_000201',  // Your new Application ID
    password: '39a8d1cb245029d0560619a2b388669c',  // Your new password
  };

  try {
    // Send POST request to MSpace to query the base size
    const response = await axios.post('https://api.mspace.lk/subscription/query-base', payload, {
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });

    const responseData = response.data;
    console.log('MSpace Response:', responseData); // Log the MSpace response

    // Check if the API request was successful
    if (responseData.statusCode === 'S1000') {
      const { baseSize } = responseData;
      res.send(`Base Size: ${baseSize}`); // Display the base size in the response
    } else {
      // Handle error status codes
      console.log('Error from MSpace:', responseData); // Log the error details
      res.status(400).send(`Error: ${responseData.statusDetail}`);
    }
  } catch (error) {
    // Log any error during the API request
    console.error('Error fetching base size:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route for Location Request
app.post('/location', async (req, res) => {
  // Log the incoming request body
  console.log('Incoming Request:', req.body);

  const { phoneNumber, requesterId, subscriberId } = req.body;

  // Check if all required fields are provided
  if (!phoneNumber || !requesterId || !subscriberId) {
    return res.status(400).json({ error: 'Phone number, requesterId, and subscriberId are required' });
  }

  // Prepare the request payload for MSpace API
  const payload = {
    applicationId: 'APP_001768',  // Your Application ID
    password: '729fdf8ea178cdea9857eeb9a059fd6e',  // Your password
    version: '2.0',
    requesterId: requesterId,  // Dynamic from request
    subscriberId: subscriberId,  // Dynamic from request
    serviceType: 'IMMEDIATE'
  };

  console.log('Payload to MSpace:', payload); // Log the payload

  try {
    // Send POST request to MSpace LBS API
    const response = await axios.post('https://api.mspace.lk/lbs/request', payload, {
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });

    const responseData = response.data;
    console.log('MSpace Response:', responseData); // Log the MSpace response

    // Check if the API request was successful
    if (responseData.statusCode === 'S1000') {
      const { latitude, longitude } = responseData;
      res.json({ latitude, longitude }); // Return the coordinates
    } else {
      // Handle error status codes
      console.log('Error from MSpace:', responseData); // Log the error details
      res.status(400).json({ error: responseData.statusDetail });
    }
  } catch (error) {
    // Log any error during the API request
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
