import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { checkoutService } from '@/services/checkout.service';
import { Event } from '@/types';

interface SessionDetails {
  valid: boolean;
  event: Event | null;
  error: string | null;
}

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionDetails, setSessionDetails] = useState<SessionDetails>({ valid: false, event: null, error: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionIdParam = queryParams.get('session_id');

    let intervalId: ReturnType<typeof setInterval>; 
    let attempts = 0;
    const maxAttempts = 6; 
    const intervalTime = 2500; 

    const fetchSessionDetails = async () => {
      try {
        const response = await checkoutService.verifySession(sessionIdParam!);
        const data = await response.json();

        if (data.success) {
          setSessionDetails({ valid: true, event: data.event, error: null });
          setLoading(false);
          clearInterval(intervalId); 
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            setSessionDetails({ valid: false, event: null, error: data.error || "Échec de la vérification après plusieurs tentatives." });
            setLoading(false);
            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de la session:", error);
        attempts++;
        if (attempts >= maxAttempts) {
          setSessionDetails({ valid: false, event: null, error: "Erreur lors de la vérification de la session." });
          setLoading(false);
          clearInterval(intervalId);
        }
      }
    };

    if (sessionIdParam) {
      intervalId = setInterval(fetchSessionDetails, intervalTime);
    } else {
      setSessionDetails({ valid: false, event: null, error: "ID de session de paiement manquant." });
      setLoading(false);
    }

    const timer = setTimeout(() => {
      navigate('/');
    }, 15000);

    return () => {
      clearTimeout(timer);
      if (intervalId) {
        clearInterval(intervalId); 
      }
    };
  }, [location.search, navigate]);

  if (loading) {
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
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 mt-4">Vérification en cours...</h1>
            <p className="text-gray-600 mb-4">Nous vérifions votre session de paiement.</p>
          </motion.div>
        </div>
      </div>
    );
  }

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
          {sessionDetails.valid && sessionDetails.event ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Merci pour votre paiement !</h1>
              <p className="text-gray-600 mb-4">
                Vous êtes maintenant inscrit à l'événement <strong>{sessionDetails.event.title}</strong>.
              </p>
              <div className="bg-white rounded-lg p-4 my-4 border border-gray-200">
                <h2 className="text-xl font-bold mb-2">{sessionDetails.event.title}</h2>
                <p className="text-gray-700">{sessionDetails.event.description}</p>
                <p className="text-gray-500 mt-2">{new Date(sessionDetails.event.date).toLocaleDateString()}</p>
                <p className="text-gray-500">{sessionDetails.event.location}</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
              <p className="text-gray-600 mb-4">
                {sessionDetails.error || "Une erreur est survenue lors de la vérification de votre session de paiement."}
              </p>
              <p className="text-gray-600 mb-4">
                Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur.
              </p>
            </>
          )}
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

export default SuccessPage;
