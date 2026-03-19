'use strict';

require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

module.exports = {
  
  async register(req, res) {
    try {
      const { nom, prenom, username, email, password } = req.body;

      if (!nom || !prenom || !username || !email || !password) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email déjà utilisé.' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        prenom,
        username,
        nom,
        email,
        password_hash,
      });

      return res.status(201).json({
        message: 'Utilisateur créé.',
        userId: newUser.id,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis.' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(200).json({
        message: 'Connexion réussie.',
        token,
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  
  async verify(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1]; 

      if (!token) {
        return res.status(401).json({ message: 'Token non fourni.' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);

      
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé.' });
      }

      return res.status(200).json({ message: 'Token valide.', user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Token invalide.' });
    }
  }
};
