require('dotenv').config();
const express = require('express');

const { testConnection } = require('./config/db');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Ruang Ternak');
});

app.use('/api/auth', authRoutes);

app.use('/api/profile', profileRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    testConnection();
});

