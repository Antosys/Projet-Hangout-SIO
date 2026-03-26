const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

const app = express();
require('dotenv').config();

app.use('/api/events/webhook', require('./routes/stripeWebhook'));

app.use(cors({
  origin: [
    'https://hangout-projet-antoinegiblin.netlify.app',
    'https://antoinegiblin-projet-bts.com',
    'https://www.antoinegiblin-projet-bts.com'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
        role: 'organisateur',
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
app.listen(PORT, async () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
  await seedDefaultUsers();
});

async function seedDefaultUsers() {
  try {
    const bcrypt = require('bcrypt');
    const { User } = require('./models');

    const defaultUsers = [
      {
        nom: 'Admin',
        prenom: 'Hangout',
        username: 'admin_hangout',
        email: 'admin@hangout.fr',
        password: 'admin2026!',
        role: 'admin',
      },
      {
        nom: 'Organisateur',
        prenom: 'Hangout',
        username: 'orga_hangout',
        email: 'organisateur@hangout.fr',
        password: 'orga2026!',
        role: 'organisateur',
      },
      {
        nom: 'Utilisateur',
        prenom: 'Hangout',
        username: 'user_hangout',
        email: 'user@hangout.fr',
        password: 'user2026!',
        role: 'participant',
      },
    ];

    for (const u of defaultUsers) {
      const existing = await User.findOne({ where: { email: u.email } });
      if (!existing) {
        const password_hash = await bcrypt.hash(u.password, 10);
        await User.create({
          nom: u.nom,
          prenom: u.prenom,
          username: u.username,
          email: u.email,
          password_hash,
          role: u.role,
        });
        console.log(`[Seed] Utilisateur créé : ${u.email} (${u.role})`);
      }
    }
  } catch (err) {
    console.error('[Seed] Erreur lors de la création des utilisateurs par défaut :', err.message);
  }
}
