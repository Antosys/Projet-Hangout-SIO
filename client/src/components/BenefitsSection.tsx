

import { motion } from "framer-motion";

const benefits = [
  {
    emoji: "⭐",
    title: "Tout en un",
    desc: "Tous vos événements et groupes au même endroit, une expérience fluide et intuitive.",
  },
  {
    emoji: "🤝",
    title: "Réseau",
    desc: "Trouvez des personnes avec vos centres d’intérêt, créez votre propre tribu.",
  },
  {
    emoji: "🔒",
    title: "Sécurité & Confiance",
    desc: "Des événements modérés, une communauté active et bienveillante.",
  },
];

const BenefitsSection = () => (
  <section id="benefits" className="w-full py-10 md:py-20 bg-transparent flex flex-col items-center">
    <motion.h2
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.7 }}
      viewport={{ once: true }}
      className="text-3xl md:text-4xl font-bold text-black/80 mb-10 text-center"
    >
      Pourquoi choisir Hangout&nbsp;?
    </motion.h2>
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center">
      {benefits.map((ben, idx) => (
        <motion.div
          key={ben.title}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + idx * 0.09, duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl flex flex-col items-center px-7 py-8 flex-1 min-w-[200px] max-w-sm"
        >
          <div className="text-4xl mb-3">{ben.emoji}</div>
          <h3 className="font-bold text-xl text-[#388ff7] mb-1">{ben.title}</h3>
          <p className="text-black/70 text-center text-base">{ben.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default BenefitsSection;

