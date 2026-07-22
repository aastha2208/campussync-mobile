require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const paymentRoutes = require('./routes/payment');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api', paymentRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`[Server] Listening on port ${PORT}`));
}

// Only auto-start when run directly (not when required by tests).
if (require.main === module) {
  start();
}

module.exports = app;
