const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

const app = express();
require('dotenv').config();

app.use('/api/events/webhook', require('./routes/stripeWebhook'));

const defaultAllowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://hangout-projet-antoinegiblin.netlify.app',
  'https://antoinegiblin-projet-bts.com',
  'https://projet-hangout-sio.onrender.com'
];

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsAllowedOrigins = allowedOrigins.length > 0 ? allowedOrigins : defaultAllowedOrigins;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (corsAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Hangout API Docs'
}));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const localisationRoutes = require('./routes/localisationRoutes');
const imageRoutes = require('./routes/imageRoutes');
const groupChatRoutes = require('./routes/groupChatRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/events', eventRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/localisations', localisationRoutes);
app.use('/api/images', imageRoutes); 
app.use('/api/checkout', checkoutRoutes);
app.use('/api/groupchats', groupChatRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/admin', adminRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
