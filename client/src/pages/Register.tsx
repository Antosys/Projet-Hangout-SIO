

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from "@/services/auth.service";

const logo = "/uploads/0e54e0da-a11b-44ad-b2d5-0da73a96a0d6.webp";

const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    username: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.register(formData);

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès!",
        });
        navigate('/login');
      } else {
        const error = await response.json();
        toast({
          title: "Erreur d'inscription",
          description: error.message || "Une erreur est survenue lors de l'inscription",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se connecter au serveur",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e4f1ff] via-white to-[#d8eafd] flex items-center justify-center p-4">
      {/* Background animated elements */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-24 h-24 bg-blue-200/30 rounded-full blur-xl"
      />
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        {/* Back button */}
        <motion.div variants={itemVariants} className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="p-2 rounded-full hover:bg-white/50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Main card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20"
        >
          {/* Logo and title */}
          <div className="text-center mb-8">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4"
            >
              <img src={logo} alt="Hangout logo" className="w-10 h-10" />
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              S'inscrire
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-gray-600"
            >
              Rejoignez notre communauté
            </motion.p>
          </div>

          {/* Form */}
          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prenom" className="text-gray-700 font-medium mb-2 block">
                  Prénom
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="prenom"
                    name="prenom"
                    type="text"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Prénom"
                    className="pl-9 bg-white/50 border-white/20 focus:border-blue-300"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="nom" className="text-gray-700 font-medium mb-2 block">
                  Nom
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="nom"
                    name="nom"
                    type="text"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Nom"
                    className="pl-9 bg-white/50 border-white/20 focus:border-blue-300"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="username" className="text-gray-700 font-medium mb-2 block">
                Nom d'utilisateur
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="@username"
                  className="pl-10 bg-white/50 border-white/20 focus:border-blue-300"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium mb-2 block">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  className="pl-10 bg-white/50 border-white/20 focus:border-blue-300"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium mb-2 block">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-white/50 border-white/20 focus:border-blue-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="pt-2"
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Inscription..." : "S'inscrire"}
              </Button>
            </motion.div>
          </motion.form>

          {/* Switch to login */}
          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-gray-600">
              Déjà un compte ?{' '}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;


