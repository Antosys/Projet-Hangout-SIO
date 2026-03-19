

import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Smartphone, Users, Heart, Zap } from "lucide-react";

const RealConnectionSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      
      {/* Animated background elements */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1]
        }}
        className="absolute top-20 left-10 w-24 h-24 bg-blue-200/30 rounded-full blur-xl"
      />
      <motion.div
        animate={{
          y: [-10, 10, -10],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1],
          delay: 1
        }}
        className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center"
        >
          <motion.div
            variants={itemVariants}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Arrêtez d'être coupé du{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                vrai monde
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Les réseaux sociaux vous promettent la connexion, mais vous laissent plus seul que jamais. 
              Il est temps de retrouver de vraies relations humaines.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-16 mb-16">
            {/* Problème */}
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <div className="bg-red-50/80 backdrop-blur-sm rounded-3xl p-8 border border-red-100/50">
                <motion.div
                  variants={iconVariants}
                  className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                >
                  <Smartphone className="w-8 h-8 text-red-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Le problème</h3>
                <ul className="text-gray-600 space-y-3 text-left">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                    Scrolling infini sans but
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                    Comparaisons constantes
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                    Relations superficielles
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                    Isolation sociale croissante
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Solution */}
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <div className="bg-green-50/80 backdrop-blur-sm rounded-3xl p-8 border border-green-100/50">
                <motion.div
                  variants={iconVariants}
                  className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                >
                  <Users className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Notre solution</h3>
                <ul className="text-gray-600 space-y-3 text-left">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Rencontres authentiques en personne
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Partage de vraies passions
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Communauté bienveillante
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Connexions durables
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-blue-100/50"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                variants={iconVariants}
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4"
              >
                <Heart className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                variants={iconVariants}
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Prêt à retrouver de vraies connexions ?
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Rejoignez des milliers de personnes qui ont choisi l'authenticité plutôt que l'artifice
            </p>
            
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg transition-all duration-300"
              >
                Rejoindre notre communauté
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default RealConnectionSection;

