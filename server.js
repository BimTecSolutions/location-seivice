const express = require('express');
const axios = require('axios');
const url = require('url');  // Import the URL module
const app = express();

app.use(express.json()); // To parse JSON body requests

// Get Fixie URL from environment variables
const fixieUrl = process.env.FIXIE_URL; // This should be set by Heroku when you add Fixie
const parsedUrl = url.parse(fixieUrl);

// Route for Subscription Request
app.post('/subscribe', async (req, res) => {
  const { phoneNumber } = req.body;  // Getting phoneNumber from the request

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required for subscription' });
  }

  // Prepare the subscription request payload
  const subscriptionPayload = {
    applicationId: 'APP_008542',  // Your Application ID
    password: 'd927d68199499f5e7114070bf88f9e6e',  // Your password
    subscriberId: `tel:94${phoneNumber.substring(1)}`,  // Format phone number
    action: '0',  // Subscription action
  };

  console.log('Sending Subscription Request:', subscriptionPayload);

  try {
    // Send POST request to MSpace Subscription API via Fixie proxy
    const subscriptionResponse = await axios.post('https://api.mspace.lk/subscription/send', subscriptionPayload, {
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      proxy: {
        host: parsedUrl.hostname,  // Use Fixie proxy hostname
        port: parsedUrl.port,      // Use Fixie proxy port
        auth: {
          username: parsedUrl.auth.split(':')[0], // Fixie username
          password: parsedUrl.auth.split(':')[1], // Fixie password
        }
      }
    });

    const subscriptionData = subscriptionResponse.data;
    console.log('MSpace Subscription Response:', subscriptionData);

    if (subscriptionData.statusCode === 'S1000') {
      // Subscription successful, proceed to LBS location request
      const { requesterId, subscriberId } = subscriptionPayload;
      
      const locationPayload = {
        applicationId: 'APP_008542',  // Your Application ID
        password: 'd927d68199499f5e7114070bf88f9e6e',  // Your password
        version: '2.0',
        requesterId: requesterId,  // Using the same phone number from subscription
        subscriberId: subscriberId,  // Same as above
        serviceType: 'IMMEDIATE'
      };

      // Send POST request to MSpace LBS API via Fixie proxy
      const locationResponse = await axios.post('https://api.mspace.lk/lbs/request', locationPayload, {
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        proxy: {
          host: parsedUrl.hostname,
          port: parsedUrl.port,
          auth: {
            username: parsedUrl.auth.split(':')[0],
            password: parsedUrl.auth.split(':')[1],
          }
        }
      });

      const locationData = locationResponse.data;
      console.log('MSpace LBS Response:', locationData);

      if (locationData.statusCode === 'S1000') {
        const { latitude, longitude } = locationData;
        return res.json({ latitude, longitude }); // Return the coordinates
      } else {
        return res.status(400).json({ error: locationData.statusDetail });
      }
    } else {
      // Handle subscription failure
      console.log('Error from MSpace Subscription:', subscriptionData);
      return res.status(400).json({ error: subscriptionData.statusDetail });
    }
  } catch (error) {
    console.error('Error during Subscription or LBS request:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
