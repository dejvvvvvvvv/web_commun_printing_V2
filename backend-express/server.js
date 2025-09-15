const express = require('express');
const app = express();
const port = 3001; // Port pro backend API

// Povolí CORS pro komunikaci s frontendem
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9002'); // Změňte na port, na kterém běží váš frontend
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Základní API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

app.listen(port, () => {
  console.log(`Express backend running on http://localhost:${port}`);
});
