import React, { useContext, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  ImageBackground,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Calendar, Users, Trophy, LogOut } from 'lucide-react-native';
import api, { isUnauthorizedError } from '../api/axios';
import { AuthContext } from '../context/AuthContext';

function GlassCard({ style, children }) {
  return (
    <Animatable.View
      animation="fadeIn"
      duration={600}
      style={[styles.glassCard, style]}
    >
      <View style={styles.glassInner}>{children}</View>
    </Animatable.View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { state, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ eventsCreated: 0, eventsAttended: 0, totalEvents: 0 });
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
      fetchStats();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/profile');
      setProfile(response.data);
      setEditedProfile(response.data);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        return;
      }
      console.error("Erreur lors du chargement du profil:", error);
      Alert.alert('Erreur', 'Impossible de charger le profil.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/user/stats');
      setStats(response.data);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        return;
      }
      console.error("Erreur lors du chargement des stats:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/user/profile');
      Alert.alert('Succès', 'Compte supprimé avec succès.');
      logout();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        return;
      }
      console.error("Erreur lors de la suppression du compte:", error);
      Alert.alert('Erreur', 'Impossible de supprimer le compte.');
    }
  };

  const openEditModal = () => {
    setEditedProfile({
      prenom: profile?.prenom || '',
      nom: profile?.nom || '',
      username: profile?.username || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
    });
    setIsModalVisible(true);
  };

  const closeEditModal = () => {
    setIsModalVisible(false);
    setEditedProfile({});
  };

  const saveProfileFromModal = async () => {
    try {
      const payload = {};
      Object.keys(editedProfile).forEach(key => {
        if (editedProfile[key] !== profile[key]) {
          payload[key] = editedProfile[key];
        }
      });

      if (Object.keys(payload).length === 0) {
        closeEditModal();
        return;
      }

      const response = await api.put('/user/profile', payload);
      setProfile(response.data);
      closeEditModal();
      Alert.alert('Succès', 'Profil mis à jour avec succès.');
    } catch (error) {
      if (isUnauthorizedError(error)) {
        return;
      }
      console.error("Erreur lors de la sauvegarde:", error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Tu vas être déconnecté.',
      [
        {
          text: 'Annuler',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          onPress: () => logout(),
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#cbd5e1" />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur lors du chargement du profil.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeEditModal} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            <TouchableOpacity onPress={saveProfileFromModal} style={styles.modalSaveButton}>
              <Text style={styles.modalSaveText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Prénom</Text>
              <TextInput
                style={styles.textInput}
                value={editedProfile.prenom || ''}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, prenom: text })}
                placeholder="Votre prénom"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom</Text>
              <TextInput
                style={styles.textInput}
                value={editedProfile.nom || ''}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, nom: text })}
                placeholder="Votre nom"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
              <TextInput
                style={styles.textInput}
                value={editedProfile.username || ''}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, username: text })}
                placeholder="Votre nom d'utilisateur"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={editedProfile.email || ''}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, email: text })}
                placeholder="Votre email"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

         
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' }}
        style={styles.background}
        blurRadius={30}
      >
        <View style={[styles.gradient, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animatable.View animation="fadeIn" duration={600} style={styles.header}>
              <ImageBackground source={{ uri: 'https://via.placeholder.com/120x120' }} style={styles.avatar}>
                <View style={[styles.avatarGradient, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
              </ImageBackground>

              <Text style={styles.name}>{profile.prenom} {profile.nom}</Text>
              <Text style={styles.email}>{profile.email}</Text>
              <Text style={styles.bio}>{profile.bio || 'Pas de bio.'}</Text>
            </Animatable.View>

            <View style={styles.statsContainer}>
              <Animatable.View animation="fadeInUp" delay={200} duration={600}>
                <View style={[styles.statCard, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <View style={styles.statIcon}>
                    <Calendar size={24} color="#fff" />
                  </View>
                  <Text style={styles.statValue}>{stats.eventsCreated}</Text>
                  <Text style={styles.statLabel}>CRÉÉS</Text>
                </View>
              </Animatable.View>

              <Animatable.View animation="fadeInUp" delay={300} duration={600}>
                <View style={[styles.statCard, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <View style={styles.statIcon}>
                    <Users size={24} color="#fff" />
                  </View>
                  <Text style={styles.statValue}>{stats.eventsAttended}</Text>
                  <Text style={styles.statLabel}>PARTICIPÉS</Text>
                </View>
              </Animatable.View>

              <Animatable.View animation="fadeInUp" delay={400} duration={600}>
                <View style={[styles.statCard, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <View style={styles.statIcon}>
                    <Trophy size={24} color="#fff" />
                  </View>
                  <Text style={styles.statValue}>{stats.totalEvents}</Text>
                  <Text style={styles.statLabel}>TOTAL</Text>
                </View>
              </Animatable.View>
            </View>

            <Animatable.View animation="fadeInUp" delay={500} duration={600} style={styles.section}>
              <Text style={styles.sectionTitle}>COMPTE</Text>

              <View style={[styles.menuItemBlur, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <TouchableOpacity style={styles.menuItem} onPress={openEditModal}>
                  <Text style={styles.menuItemText}>Modifier le profil</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.menuItemBlur, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EventsTab', { screen: 'Favorites' })}>
                  <Text style={styles.menuItemText}>Favoris</Text>
                </TouchableOpacity>
              </View>

              {profile.role === 'admin' && (
                <View style={[styles.menuItemBlur, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                  <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AdminPanel')}>
                    <Text style={styles.menuItemText}>Panel admin sécurisé</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={600} duration={600}>
              <View style={[styles.logoutButtonBlur, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <LogOut size={20} color="#fff" />
                  <Text style={styles.logoutButtonText}>SE DÉCONNECTER</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#cbd5e1',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 280,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  statCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  menuItemBlur: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  menuItem: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  menuItemText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  logoutButtonBlur: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  modalSaveButton: {
    padding: 8,
  },
  modalSaveText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});
