const express = require('express');
const axios = require('axios');
const url = require('url');
const app = express();

app.use(express.json()); // To parse JSON body requests

// Get Fixie URL from environment variables (for static IP)
const fixieUrl = process.env.FIXIE_URL;
const parsedUrl = url.parse(fixieUrl);

const express = require('express');
const axios = require('axios');
const url = require('url');
const app = express();

app.use(express.json()); // To parse JSON body requests

// Get Fixie URL from environment variables (for static IP)
const fixieUrl = process.env.FIXIE_URL;
const parsedUrl = url.parse(fixieUrl);

const express = require('express');
const axios = require('axios');
const app = express();

const parsedUrl = new URL(process.env.FIXIE_URL); // Ensure your Fixie URL is set in the environment variables

// Route for Base Size Query (Root URL "/")
app.get('/', async (req, res) => {
  const mobitelPayload = {
    applicationId: 'APP_008542',  // Mobitel Application ID
    password: 'd927d68199499f5e7114070bf88f9e6e',  // Mobitel password
  };

  const dialogPayload = {
    applicationId: 'APP_066319',  // Dialog Application ID
    password: 'c182dd009972ed36c0734af861b596dc',  // Dialog password
  };

  try {
    const mobitelResponse = await axios.post('https://api.mspace.lk/subscription/query-base', mobitelPayload, {
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

    const dialogResponse = await axios.post('https://api.dialog.lk/subscription/query-base', dialogPayload, {
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

    const mobitelData = mobitelResponse.data;
    const dialogData = dialogResponse.data;

    console.log('MSpace Base Size Response:', mobitelData);
    console.log('Dialog Base Size Response:', dialogData);

    if (mobitelData.statusCode === 'S1000' && dialogData.statusCode === 'S1000') {
      const { baseSize: mobitelBaseSize } = mobitelData;
      const { baseSize: dialogBaseSize } = dialogData;

      res.send(`
        <h1>Base Sizes</h1>
        <h2>Mobitel Base Size: ${mobitelBaseSize}</h2>
        <h2>Dialog Base Size: ${dialogBaseSize}</h2>
      `);
    } else {
      const mobitelError = mobitelData.statusDetail || 'Unknown error';
      const dialogError = dialogData.statusDetail || 'Unknown error';
      
      console.log('Error from MSpace:', mobitelError);
      console.log('Error from Dialog:', dialogError);

      res.status(400).send(`
        <h1>Errors</h1>
        <p>Mobitel Error: ${mobitelError}</p>
        <p>Dialog Error: ${dialogError}</p>
      `);
    }
  } catch (error) {
    console.error('Error fetching base sizes:', error);
    res.status(500).send('Internal Server Error');
  }
});






//Check Subscribtion Status
app.post('/checkStatus', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber || !phoneNumber.match(/^07\d{8}$/)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  const subscriberId = `tel:94${phoneNumber.substring(1)}`;
  const statusPayload = 
  
{
  "applicationId": "APP_008542",
  "password": "d927d68199499f5e7114070bf88f9e6e",
  "version": "2.0",
  "requesterId": `subscriberId`,
  "subscriberId": `subscriberId`,

}

  console.log('Status Payload:', statusPayload);

  try {
    const response = await axios.post('https://api.mspace.lk/subscription/getStatus', statusPayload, {
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      proxy: {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        auth: {
          username: parsedUrl.auth.split(':')[0],
          password: parsedUrl.auth.split(':')[1],
        },
      },
    });

    console.log('Full API Response:', response.data);

    if (response.data.statusCode === 'S1000') {
      const { subscriptionStatus } = response.data;
      if (subscriptionStatus === 'UNREGISTERED') {
        res.status(200).json({ message: 'User is unregistered', status: subscriptionStatus });
      } else {
        res.status(200).json({ message: 'Subscription status retrieved', status: subscriptionStatus });
      }
    } else {
      res.status(400).json({ error: response.data.statusDetail });
    }
  } catch (error) {
    console.error('Error during Subscription status check request:', error.response ? error.response.data : error.message);
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
 //   subscriberId: `tel:94${phoneNumber.substring(1)}`,  // Format phone number
 //   action: '0',  // Action 1 for subscribe
 //   version: "2.0",
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
