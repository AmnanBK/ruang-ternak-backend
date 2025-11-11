require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { testConnection } = require('./config/db');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const livestockRoutes = require('./routes/livestock');
const transactionRoutes = require('./routes/transaction');
const notificationRoutes = require('./routes/notification');
const verificationRoutes = require('./routes/verification');
const reviewRoutes = require('./routes/review');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

const app = express();
// const PORT = process.env.PORT || 3000;
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Ruang Ternak');
});

app.use('/api/auth', authRoutes);

app.use('/api/profile', profileRoutes);

app.use('/api/livestock', livestockRoutes);

app.use('/api/transactions', transactionRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/verification', verificationRoutes);

app.use('/api/reviews', reviewRoutes);

app.use('/api/chat', chatRoutes);

app.use('/api/admin', adminRoutes);

// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//     testConnection();
// });

module.exports = app;

