const express = require('express');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const app = express();
const port = 3000;

// Load service account credentials
const serviceAccount = JSON.parse(fs.readFileSync('./service_account.json', 'utf8'));

// Initialize GoogleAuth with service account credentials
const auth = new GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

const apiKey = 'AIzaSyCDOHB1oP075ZEFKNGs0NSu278TIFsf0u0';
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 0.9,
  topP: 1,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

app.use(cors());
app.use(express.json());

app.post('/generate-response', async (req, res) => {
  const userMessage = req.body.message;

  const parts = [
    { text: "input: " + userMessage },
    { text: "output: " },
  ];

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
    });

    res.json({ response: result.response.text() });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
