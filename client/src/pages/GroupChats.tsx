import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Trash2, Calendar, MapPin } from "lucide-react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { chatService } from "@/services/chat.service";
import { authService } from "@/services/auth.service";
import { Message, GroupChatWithMessages } from "@/types";

const GroupChats = () => {
  const [groupChats, setGroupChats] = useState<GroupChatWithMessages[]>([]);
  const [selectedGroupChat, setSelectedGroupChat] = useState<GroupChatWithMessages | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchCurrentUser = async () => {
    try {
      const response = await authService.verifyToken();
      if (!response.ok) return;
      const data = await response.json();
      if (data?.user?.id) {
        setCurrentUserId(data.user.id);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération de l'utilisateur courant:", err);
    }
  };

  
  const fetchGroupChats = async () => {
    try {
      const response = await chatService.getGroupChats();
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du chargement des groupchats');
      }
      const data = await response.json();
      setGroupChats(data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des groupchats:", error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      setLoading(false);
    }
  };

  
  const fetchMessages = async (groupchatId: number) => {
    try {
      const response = await chatService.getMessages(groupchatId);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du chargement des messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      setMessages([]);
    }
  };

  
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedGroupChat) return;
    try {
      const response = await chatService.sendMessage({ content: newMessage, groupchat_id: selectedGroupChat.id });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi du message');
      }
      await response.json();
      setNewMessage("");
      await fetchMessages(selectedGroupChat.id);
      await fetchGroupChats();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  
  const deleteMessage = async (messageId: number) => {
    try {
      const response = await chatService.deleteMessage(messageId);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression du message');
      }
      if (selectedGroupChat) {
        await fetchMessages(selectedGroupChat.id);
      }
      await fetchGroupChats();
    } catch (error) {
      console.error("Erreur lors de la suppression du message:", error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  
  useEffect(() => {
    fetchCurrentUser();
    fetchGroupChats();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchGroupChats();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  
  useEffect(() => {
    if (selectedGroupChat) {
      fetchMessages(selectedGroupChat.id);

      const intervalId = setInterval(() => {
        fetchMessages(selectedGroupChat.id);
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [selectedGroupChat]);

  const formatDate = (dateString: string | Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e4f1ff] via-white to-[#d8eafd] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des groupes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e4f1ff] via-white to-[#d8eafd]">
      <Header />
      <div className="pt-24 px-4 max-w-6xl mx-auto pb-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/70 overflow-hidden"
        >
          <div className="flex h-[calc(100vh-200px)]">
            <div className="w-1/4 bg-gray-50 p-4 overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vos groupes</h2>
              <ul className="space-y-2">
                {groupChats.map((groupChat) => (
                  <li
                    key={`groupchat-${groupChat.id}`}
                    onClick={() => setSelectedGroupChat(groupChat)}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors ${
                      selectedGroupChat?.id === groupChat.id ? 'bg-blue-200' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <h3 className="font-medium text-gray-900">
                        {groupChat.event?.title || `Groupe ${groupChat.id}`}
                      </h3>
                      {groupChat.event?.localisation?.city && (
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {groupChat.event.localisation.city}
                        </p>
                      )}
                      {groupChat.event?.date && (
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(groupChat.event.date)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {selectedGroupChat ? (
              <div className="w-3/4 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedGroupChat.event?.title || `Groupe ${selectedGroupChat.id}`}
                    </h2>
                    {selectedGroupChat.event && (
                      <button
                        onClick={() => navigate(`/events/${selectedGroupChat.event!.id}`)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Voir l'événement
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    {selectedGroupChat.event?.localisation?.city && (
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {selectedGroupChat.event.localisation.city}
                      </p>
                    )}
                    {selectedGroupChat.event?.date && (
                      <p className="text-sm text-gray-500 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(selectedGroupChat.event.date)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  {messages.length > 0 ? (
                    <ul className="space-y-4">
                      {messages.map((message) => (
                        (() => {
                          const isOwnMessage = currentUserId !== null && message.user_id === currentUserId;
                          const displayName = message.user
                            ? `${message.user.prenom || ''} ${message.user.nom || ''}`.trim() || message.user.username || `Utilisateur ${message.user_id}`
                            : `Utilisateur ${message.user_id}`;

                          return (
                        <li
                          key={`message-${message.id}`}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
                              isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  {displayName}
                                </p>
                                <p className="text-sm">
                                  {formatDate((message as any).createdAt || (message as any).created_at)}
                                </p>
                              </div>
                              {isOwnMessage && (
                                <button
                                  onClick={() => deleteMessage(message.id)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Supprimer le message"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                            <p className="mt-1">{message.content}</p>
                          </div>
                        </li>
                          );
                        })()
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Aucun message dans ce groupchat
                    </p>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Écrivez un message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-blue-600 transition-colors"
                    >
                      <Send size={16} />
                      <span>Envoyer</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-3/4 flex items-center justify-center p-4">
                <p className="text-gray-500">Sélectionnez un groupchat pour voir les messages</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GroupChats;
