
import { MessageCircle, User, Search, Plus } from "lucide-react";
import EventSearchBar from "./EventSearchBar";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";

const logo = "/uploads/0e54e0da-a11b-44ad-b2d5-0da73a96a0d6.webp";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.verifyToken();

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUserRole(data.user.role);
        } else {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return null; 
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -25, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.38, 1.25, 0.42, 1.01] }}
      className={cn("fixed z-40 top-3 w-full flex justify-center pointer-events-none")}
      style={{ left: 0, right: 0 }}
    >
      <div
        className={cn(
          "backdrop-blur-2xl bg-white/90 shadow-xl border border-white/70 rounded-[2.1rem]",
          "flex items-center px-2 py-1 sm:py-1.5 gap-0 select-none pointer-events-auto",
          "w-full max-w-[900px] mx-auto transition-all",
          "min-h-[52px] sm:min-h-[60px] lg:min-h-[70px]"
        )}
        style={{
          boxShadow: "0 3px 32px 0 rgba(120,170,215,0.09)",
          background: "rgba(255,255,255,0.94)"
        }}
      >
        <Link to="/" className="flex items-center justify-center min-w-[44px] min-h-[44px] ml-2 lg:ml-3.5">
          <div className="rounded-2xl overflow-hidden bg-white shadow-none border border-white/90 flex items-center justify-center w-11 h-11">
            <img
              src={logo}
              alt="Hangout logo"
              className="w-8 h-8 select-none pointer-events-none"
              draggable={false}
            />
          </div>
        </Link>

        {location.pathname !== "/events" && (
          <div className="flex-grow flex justify-start sm:justify-center px-2 sm:px-0 ml-2 min-w-0 max-w-[600px] lg:max-w-[750px]">
            <div className="hidden sm:block w-full max-w-full">
              <EventSearchBar />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-2 ml-auto pr-2">
          {isAuthenticated ? (
            <div className="flex gap-2">
              {(userRole === 'organisateur' || userRole === 'admin') && (
                <Link to="/creer-un-evenement">
                  <button className="bg-white/80 border border-white/90 rounded-2xl p-2 transition-all shadow-none hover:bg-blue-50 text-blue-700">
                    <Plus size={21} />
                  </button>
                </Link>
              )}
              <Link to="/messages">
                <button className="bg-white/80 border border-white/90 rounded-2xl p-2 transition-all shadow-none hover:bg-blue-50 text-blue-700">
                  <MessageCircle size={21} />
                </button>
              </Link>
              <Link to="/profile">
                <button className="bg-white/80 border border-white/90 rounded-2xl p-2 transition-all shadow-none hover:bg-blue-50 text-blue-700">
                  <User size={21} />
                </button>
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-2xl transition-colors text-[.97rem] shadow-none"
                  style={{ minWidth: 95 }}
                >
                  Se connecter
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/95 text-blue-700 font-semibold px-4 py-2 rounded-2xl border border-white/90 hover:bg-blue-50 transition-colors text-[.97rem] shadow-none"
                  style={{ minWidth: 90 }}
                >
                  S'inscrire
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

