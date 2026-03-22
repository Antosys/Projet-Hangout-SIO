import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api, { isNetworkError, isUnauthorizedError } from '../api/axios';

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function AdminPanelScreen() {
  const [loading, setLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [usersSearch, setUsersSearch] = useState('');
  const [eventsSearch, setEventsSearch] = useState('');
  const [inscriptionsSearch, setInscriptionsSearch] = useState('');

  const buildQueryString = (params) => {
    return Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && String(value).length > 0)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
  };

  const loadOverview = async () => {
    const response = await api.get('/admin/overview');
    setOverview(response.data);
  };

  const loadUsers = async () => {
    const query = buildQueryString({ page: 1, limit: 40, search: usersSearch.trim() || undefined });
    const response = await api.get(`/admin/users?${query}`);
    setUsers(response.data.users || []);
  };

  const loadEvents = async () => {
    const query = buildQueryString({ page: 1, limit: 40, search: eventsSearch.trim() || undefined });
    const response = await api.get(`/admin/events?${query}`);
    setEvents(response.data.events || []);
  };

  const loadInscriptions = async () => {
    const query = buildQueryString({ page: 1, limit: 40, search: inscriptionsSearch.trim() || undefined });
    const response = await api.get(`/admin/inscriptions?${query}`);
    setInscriptions(response.data.inscriptions || []);
  };

  const bootstrap = useCallback(async () => {
    try {
      setLoading(true);
      const profileResponse = await api.get('/user/profile');
      if (profileResponse.data?.role !== 'admin') {
        setIsForbidden(true);
        Alert.alert('Accès refusé', 'Ce menu est réservé aux admins.');
        setLoading(false);
        return;
      }

      setIsForbidden(false);

      await loadOverview();
      await loadUsers();
      await loadEvents();
      await loadInscriptions();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        return;
      }
      if (isNetworkError(error)) {
        Alert.alert('Connexion impossible', 'Le serveur est injoignable.');
      } else {
        Alert.alert('Erreur', 'Impossible de charger le panel admin.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const confirmDelete = (label, onConfirm) => {
    Alert.alert('Confirmation', `Supprimer ${label} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: onConfirm },
    ]);
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      await Promise.all([loadUsers(), loadOverview()]);
    } catch (error) {
      if (isUnauthorizedError(error)) return;
      Alert.alert('Erreur', error.response?.data?.message || 'Suppression utilisateur impossible.');
    }
  };

  const handleUpdateRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      await loadUsers();
    } catch (error) {
      if (isUnauthorizedError(error)) return;
      Alert.alert('Erreur', error.response?.data?.message || 'Mise à jour du rôle impossible.');
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await api.delete(`/admin/events/${id}`);
      await Promise.all([loadEvents(), loadOverview()]);
    } catch (error) {
      if (isUnauthorizedError(error)) return;
      Alert.alert('Erreur', 'Suppression événement impossible.');
    }
  };

  const handleDeleteInscription = async (id) => {
    try {
      await api.delete(`/admin/inscriptions/${id}`);
      await Promise.all([loadInscriptions(), loadOverview()]);
    } catch (error) {
      if (isUnauthorizedError(error)) return;
      Alert.alert('Erreur', 'Suppression inscription impossible.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Chargement du panel admin...</Text>
      </SafeAreaView>
    );
  }

  if (isForbidden) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <Text style={styles.forbiddenTitle}>Accès admin refusé</Text>
        <Text style={styles.forbiddenText}>Ce compte ne dispose pas des droits admin.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Centre d'administration</Text>
        <Text style={styles.subtitle}>Gestion utilisateurs, événements, inscriptions et statistiques</Text>

        <View style={styles.tabRow}>
          {['overview', 'users', 'events', 'inscriptions'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.tabButton, tab === item && styles.tabButtonActive]}
              onPress={() => setTab(item)}
            >
              <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>
                {item === 'overview' ? 'Statistiques' : item === 'users' ? 'Utilisateurs' : item === 'events' ? 'Événements' : 'Inscriptions'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'overview' && overview && (
          <View style={styles.section}>
            <View style={styles.statsGrid}>
              <StatCard label="Utilisateurs" value={overview.users.total} />
              <StatCard label="Événements" value={overview.events.total} />
              <StatCard label="Inscriptions" value={overview.inscriptions.total} />
              <StatCard label="Admins" value={overview.users.admins} />
              <StatCard label="Payés" value={overview.payments.paidCount} />
              <StatCard label="Revenus" value={`${Number(overview.payments.totalRevenue || 0).toFixed(2)} EUR`} />
            </View>
          </View>
        )}

        {tab === 'users' && (
          <View style={styles.section}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={usersSearch}
                onChangeText={setUsersSearch}
                placeholder="Rechercher un utilisateur"
                placeholderTextColor="#6b7280"
              />
              <TouchableOpacity style={styles.searchButton} onPress={loadUsers}>
                <Text style={styles.searchButtonText}>Rechercher</Text>
              </TouchableOpacity>
            </View>

            {users.map((user) => (
              <View key={user.id} style={styles.card}>
                <Text style={styles.cardTitle}>{user.prenom} {user.nom} ({user.username})</Text>
                <Text style={styles.cardSub}>{user.email}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.roleButton} onPress={() => handleUpdateRole(user.id, 'participant')}>
                    <Text style={styles.roleText}>participant</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.roleButton} onPress={() => handleUpdateRole(user.id, 'organizer')}>
                    <Text style={styles.roleText}>organisateur</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.roleButton} onPress={() => handleUpdateRole(user.id, 'admin')}>
                    <Text style={styles.roleText}>admin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDelete(`l'utilisateur ${user.username}`, () => handleDeleteUser(user.id))}
                  >
                    <Text style={styles.deleteText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {tab === 'events' && (
          <View style={styles.section}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={eventsSearch}
                onChangeText={setEventsSearch}
                placeholder="Rechercher un événement"
                placeholderTextColor="#6b7280"
              />
              <TouchableOpacity style={styles.searchButton} onPress={loadEvents}>
                <Text style={styles.searchButtonText}>Rechercher</Text>
              </TouchableOpacity>
            </View>

            {events.map((event) => (
              <View key={event.id} style={styles.card}>
                <Text style={styles.cardTitle}>{event.title}</Text>
                <Text style={styles.cardSub}>{new Date(event.date).toLocaleString('fr-FR')}</Text>
                <Text style={styles.cardSub}>{event.participantsCount}/{event.maxPeople} participants</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDelete(`l'événement ${event.title}`, () => handleDeleteEvent(event.id))}
                >
                  <Text style={styles.deleteText}>Supprimer l'événement</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {tab === 'inscriptions' && (
          <View style={styles.section}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={inscriptionsSearch}
                onChangeText={setInscriptionsSearch}
                placeholder="Rechercher une inscription"
                placeholderTextColor="#6b7280"
              />
              <TouchableOpacity style={styles.searchButton} onPress={loadInscriptions}>
                <Text style={styles.searchButtonText}>Rechercher</Text>
              </TouchableOpacity>
            </View>

            {inscriptions.map((inscription) => (
              <View key={inscription.id} style={styles.card}>
                <Text style={styles.cardTitle}>{inscription.user?.username || 'Utilisateur'} {'->'} {inscription.event?.title || 'Événement'}</Text>
                <Text style={styles.cardSub}>Statut : {inscription.status}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDelete('cette inscription', () => handleDeleteInscription(inscription.id))}
                >
                  <Text style={styles.deleteText}>Supprimer l'inscription</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4f1ff',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: '#e4f1ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#475569',
  },
  forbiddenTitle: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '800',
  },
  forbiddenText: {
    marginTop: 8,
    color: '#475569',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 8,
    color: '#475569',
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabButton: {
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  tabButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa',
  },
  tabText: {
    color: '#334155',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  section: {
    marginTop: 16,
    gap: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    marginTop: 6,
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '800',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    color: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 8,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
  cardSub: {
    color: '#64748b',
    fontSize: 13,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  roleText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});