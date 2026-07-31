require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5005;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Initialize Database
initializeDatabase();

// Ensure uploads folder exists (for admin image uploads)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploads folder statically
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong on the server.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
