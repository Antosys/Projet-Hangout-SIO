import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit3, Save, X, Mail, Settings, User, LogOut } from "lucide-react";
import Header from "../components/Header";
import { userService } from "@/services/user.service";
import { useNavigate } from 'react-router-dom';
import { UserProfile } from "@/types";

interface DialogProps {
  isOpen: boolean;
  onClose: ()=> void;
  onConfirm: (value?: string) => void;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const navigate = useNavigate();

  useEffect(()=> {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      const data = await response.json();
      setProfile(data);
      setEditedProfile(data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const payload = {
        nom: editedProfile.nom,
        prenom: editedProfile.prenom,
        username: editedProfile.username,
        email: editedProfile.email,
      };
      console.log("Payload envoyé :", payload); // Vérifie les valeurs envoyées
      const response = await userService.updateProfile(payload);
      const data = await response.json();
      setProfile(data); // Met à jour le profil avec les données retournées
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await userService.deleteAccount();
      const data = await response.json();
      console.log(data.message);
      setShowDeleteAccount(false);
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile }); // Copie profonde de profile
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e4f1ff] via-white to-[#d8eafd] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e4f1ff] via-white to-[#d8eafd] flex items-center justify-center">
        <p className="text-gray-600">Erreur lors du chargement du profil</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e4f1ff] via-white to-[#d8eafd]">
      <Header />

      <div className="pt-24 px-4 max-w-4xl mx-auto pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/70 overflow-hidden"
        >
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div className="flex items-end space-x-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center bg-white">
                    <User size={48} className="text-gray-500" />
                  </div>
                </div>
                <div className="text-white mb-2">
                  <h1 className="text-2xl font-bold">
                    {profile.prenom} {profile.nom}
                  </h1>
                  <p className="text-blue-100">@{profile.username}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={saveProfile}
                      className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-green-600 transition-colors"
                    >
                      <Save size={16} />
                      <span>Sauvegarder</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsEditing(false);
                        setEditedProfile(profile);
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-gray-600 transition-colors"
                    >
                      <X size={16} />
                      <span>Annuler</span>
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEditClick}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-white/30 transition-colors"
                  >
                    <Edit3 size={16} />
                    <span>Modifier</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.prenom || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, prenom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.prenom}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.nom || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, nom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.nom}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.username || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">@{profile.username}</p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Mail size={16} className="mr-2" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedProfile.email || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.email}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations du compte</h2>
                  <div className="flex items-center text-gray-600">
                    <span>Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Se déconnecter</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteAccount(true)}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Settings size={16} />
                    <span>Supprimer le compte</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {showDeleteAccount && (
        <DeleteAccountDialog
          isOpen={showDeleteAccount}
          onClose={() => setShowDeleteAccount(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  );
};

const DeleteAccountDialog = ({ isOpen, onClose, onConfirm }: DialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-semibold mb-4">Supprimer le compte</h2>
        <p className="mb-4">Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
