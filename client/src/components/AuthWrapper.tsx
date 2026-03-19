
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await authService.verifyToken();

        if (!res.ok) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
         
          const data = await res.json();
          console.log('Utilisateur vérifié:', data.user);
          setLoading(false);
        }
      } catch (err) {
        console.error("Erreur réseau ou serveur :", err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    verifyToken();
  }, [navigate]);

  if (loading) {
    return <div className="text-center py-8">Vérification en cours...</div>;
  }

  return <>{children}</>;
};

export default AuthWrapper;

