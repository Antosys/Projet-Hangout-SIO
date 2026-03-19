import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { Heart, MapPin, Calendar, Users, ArrowLeft } from 'lucide-react-native';
import api, { isNetworkError, isUnauthorizedError } from '../api/axios';
import { buildUploadUrl } from '../config';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const favoriteIds = JSON.parse(storedFavorites);
        if (favoriteIds.length > 0) {
          // Récupérer tous les événements
          const response = await api.get('/events');
          const allEvents = response.data.events || response.data;

          // Filtrer les événements favoris
          const favoriteEvents = allEvents
            .filter(event => favoriteIds.includes(event.id))
            .map(event => ({
              ...event,
              imageUrl: buildUploadUrl(event.photo),
            }));

          setFavorites(favoriteEvents);
        }
      }
    } catch (error) {
      if (isUnauthorizedError(error)) {
        return;
      }

      if (isNetworkError(error)) {
        Alert.alert('Connexion impossible', 'Vérifie que le serveur est lancé et que le téléphone est sur le même réseau Wi-Fi.');
        return;
      }

      console.error('Erreur lors du chargement des favoris:', error);
      Alert.alert('Erreur', 'Impossible de charger les favoris.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (eventId) => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        let favoriteIds = JSON.parse(storedFavorites);
        favoriteIds = favoriteIds.filter(id => id !== eventId);
        await AsyncStorage.setItem('favorites', JSON.stringify(favoriteIds));
        setFavorites(favorites.filter(event => event.id !== eventId));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
    }
  };

  const handleEventPress = (eventId) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderFavoriteEvent = ({ item, index }) => (
    <Animatable.View animation="fadeInUp" delay={index * 100} duration={600}>
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item.id)}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x400' }}
          style={styles.eventImage}
        >
          <View style={styles.eventGradient}>
            <View style={styles.eventHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>FAVORI</Text>
              </View>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(item.id)}
              >
                <Heart size={24} color="#ff4444" fill="#ff4444" />
              </TouchableOpacity>
            </View>

            <View style={styles.eventContent}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {item.title}
              </Text>

              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <Calendar size={16} color="#fff" />
                  <Text style={styles.detailText}>
                    {formatDate(item.date)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MapPin size={16} color="#fff" />
                  <Text style={styles.detailText}>
                    {item.location_name || 'Lieu à définir'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Users size={16} color="#fff" />
                  <Text style={styles.detailText}>
                    {item.max_people ? `${item.current_participants || 0}/${item.max_people} participants` : 'Nombre illimité'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animatable.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement de vos favoris...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Favoris</Text>
        <View style={styles.placeholder} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={64} color="#666" />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptyText}>
            Les événements que vous marquerez comme favoris apparaîtront ici.
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('EventList')}
          >
            <Text style={styles.exploreButtonText}>Explorer les événements</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteEvent}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 30,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  eventCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  eventImage: {
    height: 200,
    justifyContent: 'space-between',
  },
  eventGradient: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  favoriteButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  eventContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    lineHeight: 24,
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
});