
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const CancelPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e4f1ff] via-white to-[#d8eafd]">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 max-w-md w-full text-center"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement Annulé</h1>
          <p className="text-gray-600 mb-4">
            Votre paiement a été annulé. Vous n'êtes pas inscrit à l'événement.
          </p>
          <p className="text-gray-600 mb-6">
            Vous serez redirigé vers la page d'accueil dans quelques secondes...
          </p>
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg"
            >
              Retour à l'accueil maintenant
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default CancelPage;

