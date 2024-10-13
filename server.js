const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json()); // To parse JSON body requests

// Route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the MSpace Location Service API!');
});

// Route for Location Request
app.post('/location', async (req, res) => {
  const { phoneNumber, requesterId, subscriberId } = req.body;

  // Check if all required fields are provided
  if (!phoneNumber || !requesterId || !subscriberId) {
    return res.status(400).json({ error: 'Phone number, requesterId, and subscriberId are required' });
  }

  // Preparing request payload for MSpace API
  const payload = {
    applicationId: 'APP_001768',  // Your Application ID
    password: '729fdf8ea178cdea9857eeb9a059fd6e',  // Your password
    version: '2.0',
    requesterId: requesterId,
    subscriberId: subscriberId,
    serviceType: 'IMMEDIATE'
  };

  try {
    // Send POST request to MSpace LBS API
    const response = await axios.post('https://api.mspace.lk/lbs/request', payload, {
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });

    const responseData = response.data;

    // Check if the API request was successful
    if (responseData.statusCode === 'S1000') {
      const { latitude, longitude } = responseData;
      res.json({ latitude, longitude });
    } else {
      res.status(400).json({ error: responseData.statusDetail });
    }
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
