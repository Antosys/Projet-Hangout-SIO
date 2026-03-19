import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function EventCard({ event, onPress }) {
  const formattedDate = new Date(event.date).toLocaleDateString('fr-FR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = new Date(event.date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        {event.price > 0 && (
          <Text style={styles.price}>{event.price}€</Text>
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {event.description}
      </Text>

      <View style={styles.footer}>
        <View>
          <Text style={styles.date}>📅 {formattedDate}</Text>
          <Text style={styles.time}>🕐 {formattedTime}</Text>
        </View>
        <View style={styles.participantsBox}>
          <Text style={styles.participants}>
            👥 {event.participants || 0}/{event.maxParticipants || '?'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginLeft: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    color: '#666',
  },
  participantsBox: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  participants: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
});
