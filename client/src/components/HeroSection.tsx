

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  eventImgDemo,
  customUploadedImg,
  bgHero,
  avatarUrls,
  avatarUrls2,
  imagesToPreload,
} from "./heroConfig";
import MiniEventCard from "./MiniEventCard";
import { useImagePreloader } from "../hooks/useImagePreloader";

const miniCardsAppearVariants = {
  hidden: { opacity: 0, y: 24, pointerEvents: 'none' },
  visible: {
    opacity: 1,
    y: 0,
    pointerEvents: 'auto',
    transition: { duration: 0.45, type: "spring" as const, delay: 0.08 }
  }
};

const HeroSection = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  const { imagesLoaded } = useImagePreloader(imagesToPreload);

  
  const [delayedShowMiniCards, setDelayedShowMiniCards] = React.useState(false);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    if (imagesLoaded) {
      timeout = setTimeout(() => setDelayedShowMiniCards(true), 1300); 
    } else {
      setDelayedShowMiniCards(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [imagesLoaded]);

  
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  
  const getMiniCardVariant = (side: "right" | "left") => {
    if (delayedShowMiniCards && !isMobile) {
      return side === "right" ? "animateRight" : "animateLeft";
    }
    
    return undefined;
  };

  
  const showMiniCards = delayedShowMiniCards && !isMobile && imagesLoaded;

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen w-full select-none z-10 overflow-hidden">
      <div className="absolute inset-0 -z-40 w-full h-full bg-black" />

      {/* Background image avec animation d'apparition seulement quand chargée */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: imagesLoaded ? 1 : 0 }}
        transition={{ duration: 1.1 }}
        className="absolute inset-0 -z-30 w-full h-full"
        style={{
          backgroundImage: `url('${bgHero}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "none"
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 65%, rgba(20,24,38,0.72) 110%)"
          }}
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/40 pointer-events-none -z-20" />

      <div className="w-full flex flex-col items-center justify-center min-h-[90vh] max-w-2xl mx-auto px-3 transition-all relative">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7, type: "spring" }}
          className="flex flex-col justify-center items-center text-center relative"
        >
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-xl font-pretendard mb-2"
          >
            Des événements qui vous ressemblent.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.08, duration: 0.6 }}
            className="text-base sm:text-lg lg:text-xl font-medium text-white/80 px-6 sm:px-20"
          >
            Rencontrez les bonnes personnes, partagez vos passions et vivez de nouveaux moments tout proche de chez vous.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.16, duration: 0.48 }}
            className="flex flex-row gap-2 mt-2 mb-3 flex-wrap justify-center w-full"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-2xl shadow-lg text-sm transition-all duration-200 w-auto"
              >
                <span className="block sm:hidden">S'inscrire</span>
                <span className="hidden sm:block">S'inscrire gratuitement</span>
              </motion.button>
            </Link>
            <Link to="/events">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/90 text-blue-700 font-semibold py-2 px-6 rounded-2xl border border-white/90 hover:bg-blue-50 transition-all text-sm duration-200 w-auto"
              >
                <span className="block sm:hidden">Événements</span>
                <span className="hidden sm:block">Découvrir les événements</span>
              </motion.button>
            </Link>
          </motion.div>
          {/* Mini cards – transition douce avec AnimatePresence */}
          <AnimatePresence>
            {showMiniCards && (
              <motion.div
                key="minicards"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={miniCardsAppearVariants}
                className="w-full absolute left-0 top-0"
                style={{ pointerEvents: "none" }}
              >
                <MiniEventCard
                  imgSrc={eventImgDemo}
                  avatarUrls={avatarUrls}
                  participants="+10 participent"
                  title="Apéro Networking"
                  info="Jeu. 6 juin, 19h · Nice"
                  cta="Participer"
                  variant={getMiniCardVariant("right")}
                  style={{
                    right: "-46px",
                    top: "45%",
                    pointerEvents: "none",
                    zIndex: 3,
                    transform: "translateY(-50%)"
                  }}
                />
                <MiniEventCard
                  imgSrc={customUploadedImg}
                  avatarUrls={avatarUrls2}
                  participants="2 participent"
                  title="Atelier Yoga"
                  info="Sam. 8 mars, 10h · Marseille"
                  cta="Découvrir"
                  variant={getMiniCardVariant("left")}
                  style={{
                    left: "-95px",
                    top: "45%",
                    pointerEvents: "none",
                    zIndex: 2,
                    transform: "translateY(calc(-50% + 32px))"
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

