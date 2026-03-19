import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Animated,
  Easing,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { ArrowLeft, Heart, MapPin, Calendar, Clock, Users, Euro } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { isNetworkError, isUnauthorizedError } from '../api/axios';
import { buildUploadUrl } from '../config';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState(null);
  const darkVeilOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchEventDetail();
    checkIfFavorite();
  }, [eventId]);

  useEffect(() => {
    darkVeilOpacity.setValue(0);
    Animated.timing(darkVeilOpacity, {
      toValue: 0.3,
      duration: 3000,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [darkVeilOpacity, eventId]);

  const fetchEventDetail = async () => {
    try {
      setError(null);
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        return;
      }

      if (isNetworkError(err)) {
        setError('Connexion impossible au serveur');
        return;
      }

      console.error('Erreur lors de la récupération du détail:', err);
      setError('Impossible de charger l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const favoriteIds = JSON.parse(storedFavorites);
        setIsFavorite(favoriteIds.includes(parseInt(eventId)));
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      let favoriteIds = storedFavorites ? JSON.parse(storedFavorites) : [];

      if (isFavorite) {
        favoriteIds = favoriteIds.filter(id => id !== parseInt(eventId));
      } else {
        favoriteIds.push(parseInt(eventId));
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(favoriteIds));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
    }
  };

  const handleJoinEvent = async () => {
    if (!event) return;

    Alert.alert(
      'Confirmer l\'inscription',
      `Désire-tu t\'inscrire à "${event.title}" ?`,
      [
        {
          text: 'Annuler',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'S\'inscrire',
          onPress: async () => {
            setJoining(true);
            try {
              const response = await api.post(`/events/${eventId}/join`);
              Alert.alert('Succès', 'Tu es inscrit à l\'événement !');
              await fetchEventDetail();
            } catch (err) {
              if (isUnauthorizedError(err)) {
                return;
              }

              if (isNetworkError(err)) {
                Alert.alert('Connexion impossible', 'Vérifie que le serveur est lancé et que le téléphone est sur le même réseau Wi-Fi.');
                return;
              }

              const errorMessage =
                err.response?.data?.message || 'Erreur lors de l\'inscription';
              Alert.alert('Erreur', errorMessage);
            } finally {
              setJoining(false);
            }
          },
        },
      ]
    );
  };

  const handleLeaveEvent = async () => {
    if (!event) return;

    Alert.alert(
      'Confirmer la désinscription',
      'Désire-tu te désinscrire ?',
      [
        {
          text: 'Annuler',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Me désinscrire',
          onPress: async () => {
            setJoining(true);
            try {
              await api.delete(`/events/${eventId}/leave`);
              Alert.alert('Succès', 'Tu t\'es désinscrit de l\'événement.');
              await fetchEventDetail();
            } catch (err) {
              if (isUnauthorizedError(err)) {
                return;
              }

              if (isNetworkError(err)) {
                Alert.alert('Connexion impossible', 'Vérifie que le serveur est lancé et que le téléphone est sur le même réseau Wi-Fi.');
                return;
              }

              const errorMessage =
                err.response?.data?.message || 'Erreur lors de la désinscription';
              Alert.alert('Erreur', errorMessage);
            } finally {
              setJoining(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Événement introuvable'}</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const imageUrl = event.photos && event.photos.length > 0
    ? buildUploadUrl(event.photos[0])
    : 'https://via.placeholder.com/400x400';

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: imageUrl }} style={styles.background} blurRadius={5}>
        <Animated.View pointerEvents="none" style={[styles.darkVeil, { opacity: darkVeilOpacity }]} />
        <SafeAreaView style={styles.safeArea}>
            <Animatable.View animation="fadeIn" duration={600} style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                <View style={styles.iconBlur}>
                  <ArrowLeft size={24} color="#fff" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={toggleFavorite}>
                <View style={styles.iconBlur}>
                  <Heart
                    size={24}
                    color={isFavorite ? '#ff4444' : '#fff'}
                    fill={isFavorite ? '#ff4444' : 'transparent'}
                  />
                </View>
              </TouchableOpacity>
            </Animatable.View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              <View style={styles.mainInfo}>
                <Animatable.View animation="fadeInDown" delay={200} duration={600}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>ÉVÉNEMENT</Text>
                  </View>
                </Animatable.View>

                <Animatable.Text
                  animation="fadeInDown"
                  delay={300}
                  duration={600}
                  style={styles.title}>
                  {event.title}
                </Animatable.Text>

                <Animatable.View animation="fadeInDown" delay={400} duration={600}>
                  <View style={styles.statsContainer}>
                    <View style={[styles.statsRow, { marginBottom: 8 }]}>
                      <View style={styles.statItem}>
                        <Users size={14} color="#fff" />
                        <Text style={styles.statValue}>
                          {event.participantsCount || 0}/{event.max_people || '∞'}
                        </Text>
                        <Text style={styles.statLabel}>PARTICIPANTS</Text>
                      </View>

                      <View style={styles.statDivider} />

                      <View style={styles.statItem}>
                        <Calendar size={14} color="#fff" />
                        <Text style={styles.statValue}>{formatDate(event.date)}</Text>
                        <Text style={styles.statLabel}>DATE</Text>
                      </View>
                    </View>

                    <View style={[styles.statsRow, { marginBottom: 0 }]}>
                      <View style={styles.statItem}>
                        <Clock size={14} color="#fff" />
                        <Text style={styles.statValue}>{formatTime(event.date)}</Text>
                        <Text style={styles.statLabel}>HEURE</Text>
                      </View>

                      <View style={styles.statDivider} />

                      <View style={styles.statItem}>
                        <Euro size={14} color="#fff" />
                        <Text style={styles.statValue}>
                          {event.price > 0 ? `${event.price}€` : 'GRATUIT'}
                        </Text>
                        <Text style={styles.statLabel}>PRIX</Text>
                      </View>
                    </View>
                  </View>
                </Animatable.View>

                <Animatable.View animation="fadeInDown" delay={500} duration={600}>
                  <View style={styles.locationCard}>
                    <MapPin size={16} color="#fff" />
                    <Text style={styles.locationText}>
                      {event.localisation ? `${event.localisation.city}, ${event.localisation.address || ''}` : 'Lieu à définir'}
                    </Text>
                  </View>
                </Animatable.View>

                <Animatable.View
                  animation="fadeInDown"
                  delay={600}
                  duration={600}
                  style={styles.section}>
                  <Text style={styles.sectionTitle}>À PROPOS</Text>
                  <Text style={styles.description}>{event.description}</Text>
                </Animatable.View>

                <Animatable.View
                  animation="fadeInDown"
                  delay={700}
                  duration={600}
                  style={styles.section}>
                  <Text style={styles.sectionTitle}>ORGANISATEUR</Text>
                  <View style={styles.organizerCard}>
                    <View style={styles.organizerAvatar}>
                      <Text style={styles.organizerInitials}>
                        {event.organizer?.prenom?.[0]}{event.organizer?.nom?.[0]}
                      </Text>
                    </View>
                    <View style={styles.organizerInfo}>
                      <Text style={styles.organizerName}>
                        {event.organizer?.prenom} {event.organizer?.nom}
                      </Text>
                      <Text style={styles.organizerRole}>Organisateur</Text>
                    </View>
                  </View>
                </Animatable.View>

                {event.inscriptions && event.inscriptions.length > 0 && (
                  <Animatable.View
                    animation="fadeInDown"
                    delay={800}
                    duration={600}
                    style={styles.section}>
                    <Text style={styles.sectionTitle}>PARTICIPANTS ({event.inscriptions.length})</Text>
                  </Animatable.View>
                )}

                <Animatable.View animation="fadeInUp" delay={900} duration={600} style={styles.actionSection}>
                  {event.isOrganizer ? (
                    <View style={styles.organizerButton}>
                      <Text style={styles.organizerButtonText}>TU ES L'ORGANISATEUR</Text>
                    </View>
                  ) : event.isParticipant ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.leaveButton]}
                      onPress={handleLeaveEvent}
                      disabled={joining}
                    >
                      <Text style={styles.actionButtonText}>
                        {joining ? '...' : 'SE DÉSINSCRIRE'}
                      </Text>
                    </TouchableOpacity>
                  ) : event.participantsCount >= event.max_people ? (
                    <View style={styles.fullButton}>
                      <Text style={styles.fullButtonText}>ÉVÉNEMENT COMPLET</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.joinButton]}
                      onPress={handleJoinEvent}
                      disabled={joining}
                    >
                      <Text style={styles.actionButtonText}>
                        {joining ? '...' : 'REJOINDRE L\'ÉVÉNEMENT'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {(event.isOrganizer || event.isParticipant) && (
                    <TouchableOpacity
                      style={styles.chatButton}
                      onPress={() => navigation.navigate('GroupChats', { eventId: event.id })}
                    >
                      <Text style={styles.chatButtonText}>OUVRIR LE GROUPCHAT</Text>
                    </TouchableOpacity>
                  )}
                </Animatable.View>
              </View>
            </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  darkVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  iconBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainInfo: {
    paddingHorizontal: 24,
    gap: 20,
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 42,
    color: '#fff',
    letterSpacing: 1.5,
    lineHeight: 46,
    fontWeight: 'bold',
  },
  statsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 9,
    color: '#aaa',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  locationText: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerInitials: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  organizerInfo: {
    flex: 1,
    gap: 3,
  },
  organizerName: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  organizerRole: {
    fontSize: 12,
    color: '#aaa',
  },
  actionSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#fff',
  },
  leaveButton: {
    backgroundColor: '#ff4444',
  },
  organizerButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  fullButton: {
    backgroundColor: 'rgba(255,69,58,0.8)',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#000',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  organizerButtonText: {
    fontSize: 14,
    color: '#fff',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  fullButtonText: {
    fontSize: 14,
    color: '#fff',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  chatButton: {
    marginTop: 12,
    backgroundColor: 'rgba(96,220,255,0.22)',
    borderColor: 'rgba(136,228,255,0.8)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 14,
    color: '#dff5ff',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});
