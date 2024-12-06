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


// Route for OTP Request (Root URL "/request-otp")
app.get('/request-otp', async (req, res) => {
  const otpRequestPayload = {
    applicationId: 'APP_008542',  // MSpace Application ID
    password: 'd927d68199499f5e7114070bf88f9e6e',  // MSpace password
    subscriberId: 'tel:94713181860',  // Example Subscriber ID
    applicationHash: 'abcdefgh',
    applicationMetaData: {
      client: 'MOBILEAPP',
      device: 'Samsung S10',
      os: 'android 8',
      appCode: 'https://play.google.com/store/apps/details?id=lk'
    }
  };

  try {
    const otpRequestResponse = await axios.post('https://api.mspace.lk/otp/request', otpRequestPayload, {
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

    const otpRequestData = otpRequestResponse.data;
    res.json(otpRequestData);  // Send the OTP request data as JSON

  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route for OTP Verification (Root URL "/verify-otp")
app.post('/verify-otp', async (req, res) => {
  const { referenceNo, otp } = req.body;
  const otpVerifyPayload = {
    applicationId: 'APP_008542',  // MSpace Application ID
    password: 'd927d68199499f5e7114070bf88f9e6e',  // MSpace password
    referenceNo,  // Reference number from OTP request
    otp  // OTP entered by user
  };

  try {
    const otpVerifyResponse = await axios.post('https://api.mspace.lk/otp/verify', otpVerifyPayload, {
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

    const otpVerifyData = otpVerifyResponse.data;
    res.json(otpVerifyData);  // Send the OTP verification data as JSON

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route for Location Request (Root URL "/request-location")
app.get('/request-location', async (req, res) => {
  const locationRequestPayload = {
    applicationId: 'APP_008542',  // MSpace Application ID
    password: 'd927d68199499f5e7114070bf88f9e6e',  // MSpace password
    version: '2.0',
    requesterId: 'tel:94713181860',  // Example Requester ID
    subscriberId: 'tel:94713181860',  // Example Subscriber ID
    serviceType: 'IMMEDIATE'
  };

  try {
    const locationRequestResponse = await axios.post('https://api.mspace.lk/lbs/request', locationRequestPayload, {
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

    const locationRequestData = locationRequestResponse.data;
    res.json(locationRequestData);  // Send the location request data as JSON

  } catch (error) {
    console.error('Error fetching location data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route for sending subscription action
app.post('/send-subscription-action', async (req, res) => {
  const subscriptionActionPayload = {
    applicationId: 'APP_008542',  // Mobitel Application ID
    password: 'd927d68199499f5e7114070bf88f9e6e',  // Mobitel password
    subscriberId: 'tel:94713181860',  // Example Subscriber ID
    action: '1'
  };

  try {
    const subscriptionActionResponse = await axios.post('https://api.mspace.lk/subscription/send', subscriptionActionPayload, {
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

    const subscriptionActionData = subscriptionActionResponse.data;
    res.json(subscriptionActionData);  // Send the response data as JSON

  } catch (error) {
    console.error('Error sending subscription action:', error);
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

   
    <h2>OTP Request and Verification</h2>
    <button onclick="requestOTP()">Request OTP</button>
    <div id="otpRequestResult"></div>
    <form id="otpForm" style="display:none;" onsubmit="return verifyOTP(event)">
      <input type="text" id="otp" name="otp" placeholder="Enter OTP" required>
      <button type="submit">Verify OTP</button>
    </form>
    <div id="otpVerifyResult"></div>

    
    <h2>Mobitel Location Request</h2>
    <button onclick="requestLocation()">Request Location</button>
    <div id="locationResult"></div>
    

  <h1>Send POST Request</h1>
  <button id="sendRequest">Send Request</button>
  <h2>Response:</h2>
  <pre id="output">Waiting for response...</pre>
 
    
    <script>

     async function requestOTP() {
        try {
          const response = await fetch('/request-otp');
          const result = await response.json();
          document.getElementById('otpRequestResult').innerHTML = \`
            <h3>OTP Requested</h3>
            <p>Reference No: \${result.referenceNo}</p>
            <p>Status Code: \${result.statusCode}</p>
            <p>Details: \${result.statusDetail}</p>
          \`;
          document.getElementById('otpForm').style.display = 'block';
        } catch (error) {
          document.getElementById('otpRequestResult').innerHTML = '<p>Error requesting OTP</p>';
          console.error('Error:', error);
        }
      }
      
      async function verifyOTP(event) {
        event.preventDefault();
        const otp = document.getElementById('otp').value;
        const referenceNo = document.querySelector('#otpRequestResult p:nth-child(2)').innerText.split(': ')[1];
        try {
          const response = await fetch('/verify-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              referenceNo,
              otp
            })
          });
          const result = await response.json();
          document.getElementById('otpVerifyResult').innerHTML = \`
            <h3>OTP Verification</h3>
            <p>Status Code: \${result.statusCode}</p>
            <p>Details: \${result.statusDetail}</p>
          \`;
        } catch (error) {
          document.getElementById('otpVerifyResult').innerHTML = '<p>Error verifying OTP</p>';
          console.error('Error:', error);
        }
      }

      
      async function requestLocation() {
        try {
          const response = await fetch('/request-location');
          const result = await response.json();
          document.getElementById('locationResult').innerHTML = \`
            <h3>Location Data</h3>
            <p>Version: \${result.version}</p>
            <p>Message ID: \${result.messageID}</p>
            <p>Latitude: \${result.latitude}</p>
            <p>Longitude: \${result.longitude}</p>
            <p>Subscriber State: \${result.subscriberState}</p>
            <p>Timestamp: \${result.timestamp}</p>
            <p>Status Code: \${result.statusCode}</p>
            <p>Details: \${result.statusDetail}</p>
          \`;
        } catch (error) {
          document.getElementById('locationResult').innerHTML = '<p>Error fetching location data</p>';
          console.error('Error:', error);
        }
      }

//////////////////////////////////

   const requestData = {
      applicationId: "APP_999999",
      password: "95904999aa8edb0c038b3295fdd271de",
      subscriberId: "tel:94716177301",
      action: "0"
    };

    // URL of the API endpoint
    const url = "https://api.mspace.lk/subscription/send";

    // Function to send the POST request and display the response
    async function sendPostRequest() {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8", // Ensures the correct content type
          },
          body: JSON.stringify(requestData), // Convert the data to JSON string
        });

        if (response.ok) {
          const responseData = await response.json(); // Parse the JSON response
          console.log("Success:", responseData);

          // Display the response data in a user-friendly format
          const outputElement = document.getElementById("output");
          outputElement.textContent = JSON.stringify(responseData, null, 2); // Pretty-print JSON
        } else {
          console.error("Request failed with status:", response.status);
          document.getElementById("output").textContent =
            "Request failed with status: " + response.status;
        }
      } catch (error) {
        console.error("Error occurred:", error);
        document.getElementById("output").textContent =
          "Error occurred: " + error.message;
      }
    }

    // Add event listener to the button
    document.getElementById("sendRequest").addEventListener("click", sendPostRequest);
    
  //////////////////////////////////    
    </script>
  `);
});

 




// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
