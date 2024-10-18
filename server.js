const express = require('express');
const axios = require('axios');
const url = require('url');
const app = express();

app.use(express.json()); // To parse JSON body requests

// Get Fixie URL from environment variables (for static IP)
const fixieUrl = process.env.FIXIE_URL;
const parsedUrl = url.parse(fixieUrl);

// Route for Base Size Query (Root URL "/")
app.get('/', async (req, res) => {
  const payload = {
    applicationId: 'APP_008542',  // Your Application ID
    password: 'd927d68199499f5e7114070bf88f9e6e',  // Your password
  };

  try {
    const response = await axios.post('https://api.mspace.lk/subscription/query-base', payload, {
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      proxy: {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        auth: {
          username: parsedUrl.auth.split(':')[0], // Fixie username
          password: parsedUrl.auth.split(':')[1], // Fixie password
        }
      }
    });

    const responseData = response.data;
    console.log('MSpace Base Size Response:', responseData);

    if (responseData.statusCode === 'S1000') {
      const { baseSize } = responseData;
      res.send(`<h1>Base Size: ${baseSize}</h1>`);
    } else {
      console.log('Error from MSpace:', responseData.statusDetail);
      res.status(400).send(`Error: ${responseData.statusDetail}`);
    }
  } catch (error) {
    console.error('Error fetching base size:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route for Subscription Status Check
app.post('/checkStatus', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required to check subscription status' });
  }

  const statusPayload = {
    applicationId: 'APP_008542',  // Your Application ID
    password: 'd927d68199499f5e7114070bf88f9e6e',  // Your password
    subscriberId: `tel:94${phoneNumber.substring(1)}`,  // Format phone number
  };

  try {
    const response = await axios.post('https://api.mspace.lk/subscription/getStatus', statusPayload, {
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

    const responseData = response.data;
    console.log('MSpace Subscription Status Response:', responseData);

    if (responseData.statusCode === 'S1000') {
      const { subscriptionStatus } = responseData;
      res.status(200).json({ message: 'Subscription status retrieved', status: subscriptionStatus });
    } else {
      res.status(400).json({ error: responseData.statusDetail });
    }
  } catch (error) {
    console.error('Error during Subscription status check request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to Subscribe a User
app.post('/subscribe', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required to subscribe' });
  }

  const subscriptionPayload = {
    applicationId: 'APP_008542',  // Your Application ID
    password: 'd927d68199499f5e7114070bf88f9e6e',  // Your password
    subscriberId: `tel:94${phoneNumber.substring(1)}`,  // Format phone number
    action: '0',  // Action 0 for subscribe
  };

  try {
    const response = await axios.post('https://api.mspace.lk/subscription/send', subscriptionPayload, {
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

    const responseData = response.data;
    console.log('MSpace Subscription Response:', responseData);

    if (responseData.statusCode === 'S1000') {
      res.status(200).json({ message: 'Subscription successful!' });
    } else {
      res.status(400).json({ error: responseData.statusDetail });
    }
  } catch (error) {
    console.error('Error during Subscription request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
