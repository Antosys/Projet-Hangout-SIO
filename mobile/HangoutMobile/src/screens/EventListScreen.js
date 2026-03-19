import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Heart, MapPin, Users } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import api, { isNetworkError, isUnauthorizedError } from '../api/axios';
import { buildUploadUrl } from '../config';

export default function EventListScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await api.get('/events?limit=20');
      const eventsData = response.data.events || response.data;
      // Construire l'URL complète pour les images
      const eventsWithImages = eventsData.map(event => ({
        ...event,
        imageUrl: buildUploadUrl(event.photo),
        category: 'Événement', // Ajouter une catégorie par défaut
      }));
      setEvents(eventsWithImages);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        return;
      }

      if (isNetworkError(err)) {
        Alert.alert('Connexion impossible', 'Vérifie que le serveur est lancé et que le téléphone est sur le même réseau Wi-Fi.');
        return;
      }

      console.error('Erreur lors de la récupération des événements:', err);
      Alert.alert('Erreur', 'Impossible de charger les événements.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    }
  };

  const toggleFavorite = async (eventId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(eventId)) {
      newFavorites.delete(eventId);
    } else {
      newFavorites.add(eventId);
    }
    setFavorites(newFavorites);
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify([...newFavorites]));
    } catch (error) {
      console.error('Erreur sauvegarde favoris:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    loadFavorites();
  }, [fetchEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  const handleEventPress = (eventId) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const renderEvent = ({ item, index }) => (
    <Animatable.View animation="fadeInUp" delay={index * 100} duration={600}>
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item.id)}
        activeOpacity={0.9}
      >
        <ImageBackground source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x400' }} style={styles.eventImage}>
          <View style={[styles.eventGradient, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <View style={styles.eventHeader}>
              <View
                style={[styles.categoryBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
              >
                <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
              </View>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
              >
                <View
                  style={[styles.favoriteBlur, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                >
                  <Heart
                    size={20}
                    color={favorites.has(item.id) ? '#ff4444' : '#fff'}
                    fill={favorites.has(item.id) ? '#ff4444' : 'transparent'}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.eventContent}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {item.title}
              </Text>

              <View style={styles.eventInfo}>
                <View style={styles.infoRow}>
                  <MapPin size={14} color="#fff" />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {item.location}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Users size={14} color="#fff" />
                  <Text style={styles.infoText}>
                    {item.participants}/{item.maxParticipants}
                  </Text>
                </View>
              </View>

              <View style={[styles.eventFooter, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                <View style={styles.organizerInfo}>
                  <ImageBackground
                    source={{ uri: 'https://via.placeholder.com/32x32' }}
                    style={styles.organizerAvatar}
                  />
                  <Text style={styles.organizerName}>Organisateur</Text>
                </View>
                <Text style={styles.price}>{item.price}€</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animatable.View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des événements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
        <Animatable.Text animation="fadeInDown" duration={800} style={styles.headerTitle}>
          HANGOUT
        </Animatable.Text>
        <Animatable.Text animation="fadeInDown" delay={200} duration={800} style={styles.headerSubtitle}>
          Découvrez des expériences uniques.
        </Animatable.Text>
      </View>

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun événement disponible.</Text>
          </View>
        }
      />
    </SafeAreaView>
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
  loadingText: {
    fontSize: 16,
    color: '#cbd5e1',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 48,
    color: '#fff',
    letterSpacing: 4,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 20,
  },
  eventCard: {
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  eventImage: {
    flex: 1,
  },
  eventGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  favoriteBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContent: {
    gap: 12,
  },
  eventTitle: {
    fontSize: 32,
    color: '#fff',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  eventInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#fff',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  organizerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  organizerName: {
    fontSize: 13,
    color: '#fff',
  },
  price: {
    fontSize: 24,
    color: '#fff',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
