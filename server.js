const express = require('express');
const axios = require('axios');
const url = require('url');
const app = express();

app.use(express.json()); // To parse JSON body requests

// Get Fixie URL from environment variables (for static IP)
const fixieUrl = process.env.FIXIE_URL;
const parsedUrl = new URL(fixieUrl); // Parsing the Fixie URL

// Route for Mobitel MSpace Base Size Query (Root URL "/mobitel")
app.get('/mobitel', async (req, res) => {
  const mobitelPayload = {
    applicationId: 'APP_008542',  // Mobitel Application ID
    password: 'd927d68199499f5e7114070bf88f9e6e',  // Mobitel password
  };

  try {
    const mobitelResponse = await axios.post('https://api.mspace.lk/subscription/query-base', mobitelPayload, {
      headers: { 'Content-Type': 'application/json' },
      proxy: {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        auth: {
          username: parsedUrl.username, // Fixie username
          password: parsedUrl.password, // Fixie password
        }
      }
    });

    const mobitelData = mobitelResponse.data;

    console.log('MSpace Base Size Response:', mobitelData);

    if (mobitelData.statusCode === 'S1000') {
      const { baseSize } = mobitelData;

      res.send(`
        <h1>Mobitel Base Size</h1>
        <h2>Base Size: ${baseSize}</h2>
      `);
    } else {
      const mobitelError = mobitelData.statusDetail || 'Unknown error';
      
      console.log('Error from MSpace:', mobitelError);

      res.status(400).send(`Error: ${mobitelError}`);
    }
  } catch (error) {
    console.error('Error fetching base size:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route for Dialog Ideamart Base Size Query (Root URL "/dialog")
app.get('/dialog', async (req, res) => {
  const dialogPayload = {
    applicationId: 'APP_066319',  // Dialog Application ID
    password: 'c182dd009972ed36c0734af861b596dc',  // Dialog password
  };

  try {
    const dialogResponse = await axios.post('https://api.dialog.lk/subscription/query-base', dialogPayload, {
      headers: { 'Content-Type': 'application/json' },
      proxy: {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        auth: {
          username: parsedUrl.username, // Fixie username
          password: parsedUrl.password, // Fixie password
        }
      }
    });

    const dialogData = dialogResponse.data;

    console.log('Dialog Base Size Response:', dialogData);

    if (dialogData.statusCode === 'S1000') {
      const { baseSize } = dialogData;

      res.send(`
        <h1>Dialog Base Size</h1>
        <h2>Base Size: ${baseSize}</h2>
      `);
    } else {
      const dialogError = dialogData.statusDetail || 'Unknown error';
      
      console.log('Error from Dialog:', dialogError);

      res.status(400).send(`Error: ${dialogError}`);
    }
  } catch (error) {
    console.error('Error fetching base size:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route for Dialog Subscription Status Query (Root URL "/check-status")
app.get('/check-status', async (req, res) => {
  const statusPayload = {
    applicationId: 'APP_066319',  // Dialog Application ID for status check
    password: 'c182dd009972ed36c0734af861b596dc',  // Dialog password for status check
    subscriberId: 'tel:94767544774' // Corrected Subscriber ID format
  //  version: '1.0',
 //   requesterId: 'tel:94767544774,
  };

  try {
    const statusResponse = await axios.post('https://api.dialog.lk/subscription/getStatus', statusPayload, {
      headers: { 'Content-Type': 'application/json' },
      proxy: {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        auth: {
          username: parsedUrl.username, // Fixie username
          password: parsedUrl.password, // Fixie password
        }
      }
    });

    const statusData = statusResponse.data;
    res.json(statusData);  // Send the status data as JSON

  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Route for Mobitel Subscription Status Query (Root URL "/check-mobitel-status")
app.get('/check-mobitel-status', async (req, res) => {
  const mobitelStatusPayload = {
    applicationId: 'APP_008542',  // Mobitel Application ID for status check
    password: 'd927d68199499f5e7114070bf88f9e6e',  // Mobitel password for status check
    subscriberId: 'tel:94713181860',  // Example Subscriber ID
//    version: '2.0',
 //   requesterId: 'tel:94713181860',
  };

  try {
    const mobitelStatusResponse = await axios.post('https://api.mspace.lk/subscription/getStatus', mobitelStatusPayload, {
      headers: { 'Content-Type': 'application/json' },
      proxy: {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        auth: {
          username: parsedUrl.username, // Fixie username
          password: parsedUrl.password, // Fixie password
        }
      }
    });

    const mobitelStatusData = mobitelStatusResponse.data;
    res.json(mobitelStatusData);  // Send the status data as JSON

  } catch (error) {
    console.error('Error fetching Mobitel subscription status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Root URL route
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Base Size Query Service</h1>
    <p>Use the following endpoints to get base sizes and subscription status:</p>
    <ul>
      <li><a href="/mobitel">Mobitel Base Size</a></li>
      <li><a href="/dialog">Dialog Base Size</a></li>
    </ul>
    <h2>Dialog Subscription Status</h2>
    <button onclick="checkSubscriptionStatus()">Check Subscription Status</button>
    <div id="statusResult"></div>
    <h2>Mobitel Subscription Status</h2>
    <button onclick="checkMobitelSubscriptionStatus()">Check Mobitel Subscription Status</button>
    <div id="mobitelStatusResult"></div>
    <script>
      async function checkSubscriptionStatus() {
        try {
          const response = await fetch('/check-status');
          const result = await response.json();
          document.getElementById('statusResult').innerHTML = \`
            <h3>Subscription Status</h3>
            <p>Version: \${result.version}</p>
            <p>Status: \${result.subscriptionStatus}</p>
            <p>Status Code: \${result.statusCode}</p>
            <p>Details: \${result.statusDetail}</p>
          \`;
        } catch (error) {
          document.getElementById('statusResult').innerHTML = '<p>Error fetching subscription status</p>';
          console.error('Error:', error);
        }
      }

      async function checkMobitelSubscriptionStatus() {
        try {
          const response = await fetch('/check-mobitel-status');
          const result = await response.json();
          document.getElementById('mobitelStatusResult').innerHTML = \`
            <h3>Mobitel Subscription Status</h3>
            <p>Version: \${result.version}</p>
            <p>Status: \${result.subscriptionStatus}</p>
            <p>Status Code: \${result.statusCode}</p>
            <p>Details: \${result.statusDetail}</p>
          \`;
        } catch (error) {
          document.getElementById('mobitelStatusResult').innerHTML = '<p>Error fetching Mobitel subscription status</p>';
          console.error('Error:', error);
        }
      }
    </script>
  `);
});




// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
