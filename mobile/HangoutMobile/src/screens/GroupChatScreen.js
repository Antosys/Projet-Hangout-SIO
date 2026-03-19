import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { Send, MessageCircle, ChevronLeft } from 'lucide-react-native';
import api, { isNetworkError, isUnauthorizedError } from '../api/axios';

function Bubble({ message, isOwn }) {
  return (
    <View style={[
      styles.bubbleWrap,
      isOwn ? styles.bubbleWrapOwn : styles.bubbleWrapOther,
    ]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {!isOwn && !!message.displayName && (
          <Text style={styles.authorText}>{message.displayName}</Text>
        )}
        <Text style={[styles.messageText, isOwn ? styles.messageTextOwn : styles.messageTextOther]}>
          {message.content}
        </Text>
        <Text style={[styles.timeText, isOwn ? styles.timeTextOwn : styles.timeTextOther]}>
          {message.timeLabel}
        </Text>
      </View>
    </View>
  );
}

export default function GroupChatScreen({ route, navigation }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [groupChats, setGroupChats] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const providedEventId = route?.params?.eventId;
  const pulse = useRef(new Animated.Value(0.92)).current;
  const groupsSignatureRef = useRef('');
  const messagesSignatureRef = useRef('');
  const hasLoadedMessagesRef = useRef(false);

  const getGroupsSignature = (groups) => {
    return groups
      .map((g) => `${g?.id}|${g?.event?.id || ''}|${g?.event?.title || ''}|${g?.event?.date || ''}`)
      .join('~');
  };

  const getMessagesSignature = (list) => {
    return list
      .map((m) => `${m?.id}|${m?.user_id}|${m?.createdAt || m?.created_at || ''}|${m?.content || ''}`)
      .join('~');
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 2200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.92,
          duration: 2200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  const formatTime = (dateValue) => {
    if (!dateValue) return '';
    const d = new Date(dateValue);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const mapMessage = useCallback((m) => {
    const displayName = m?.user
      ? `${m.user.prenom || ''} ${m.user.nom || ''}`.trim() || m.user.username || `Utilisateur ${m.user_id}`
      : `Utilisateur ${m.user_id}`;

    return {
      ...m,
      displayName,
      timeLabel: formatTime(m.createdAt || m.created_at),
    };
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/verify');
      if (response?.data?.user?.id) {
        setCurrentUserId(response.data.user.id);
      }
    } catch (err) {
      if (isUnauthorizedError(err)) return;
      console.error('Erreur user courant:', err);
    }
  }, []);

  const fetchGroupChats = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/groupchats');
      const groups = Array.isArray(response.data) ? response.data : [];

      const newSignature = getGroupsSignature(groups);
      if (newSignature !== groupsSignatureRef.current) {
        groupsSignatureRef.current = newSignature;
        setGroupChats(groups);
      }

      if (!groups.length) {
        setSelectedGroup(null);
        return;
      }

      if (providedEventId) {
        const preferred = groups.find((g) => g?.event?.id === Number(providedEventId));
        if (preferred) {
          setSelectedGroup((prev) => (prev?.id === preferred.id ? prev : preferred));
          return;
        }
      }

      setSelectedGroup((prev) => {
        if (prev && groups.some((g) => g.id === prev.id)) return prev;
        return groups[0];
      });
    } catch (err) {
      if (isUnauthorizedError(err)) return;
      if (isNetworkError(err)) {
        setError('Connexion impossible au serveur.');
      } else {
        setError('Erreur lors du chargement des groupchats.');
      }
      console.error('Erreur groupchats:', err);
    } finally {
      setLoadingGroups(false);
    }
  }, [providedEventId]);

  const fetchMessages = useCallback(async (groupId, options = { silent: false }) => {
    if (!groupId) return;
    try {
      if (!options.silent && !hasLoadedMessagesRef.current) {
        setLoadingMessages(true);
      }

      const response = await api.get(`/messages/${groupId}`);
      const list = Array.isArray(response.data) ? response.data.map(mapMessage) : [];

      const newSignature = getMessagesSignature(list);
      if (newSignature !== messagesSignatureRef.current) {
        messagesSignatureRef.current = newSignature;
        setMessages(list);
      }

      hasLoadedMessagesRef.current = true;
    } catch (err) {
      if (isUnauthorizedError(err)) return;
      if (!isNetworkError(err)) {
        console.error('Erreur messages:', err);
      }
    } finally {
      if (!options.silent) {
        setLoadingMessages(false);
      }
    }
  }, [mapMessage]);

  const sendMessage = useCallback(async () => {
    const content = newMessage.trim();
    if (!content || !selectedGroup || sending) return;

    try {
      setSending(true);
      await api.post('/messages', { content, groupchat_id: selectedGroup.id });
      setNewMessage('');
      await fetchMessages(selectedGroup.id, { silent: true });
      await fetchGroupChats();
    } catch (err) {
      if (isUnauthorizedError(err)) return;
      console.error('Erreur envoi:', err);
    } finally {
      setSending(false);
    }
  }, [newMessage, selectedGroup, sending, fetchMessages, fetchGroupChats]);

  useEffect(() => {
    fetchCurrentUser();
    fetchGroupChats();
  }, [fetchCurrentUser, fetchGroupChats]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchGroupChats();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [fetchGroupChats]);

  useEffect(() => {
    if (!selectedGroup?.id) return;

    hasLoadedMessagesRef.current = false;
    setLoadingMessages(true);
    fetchMessages(selectedGroup.id, { silent: false });

    const intervalId = setInterval(() => {
      fetchMessages(selectedGroup.id, { silent: true });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [selectedGroup?.id, fetchMessages]);

  const mappedGroups = useMemo(() => {
    return groupChats.map((g) => ({
      ...g,
      title: g?.event?.title || `Groupe ${g.id}`,
      subtitle: g?.event?.localisation?.city || 'Sans localisation',
    }));
  }, [groupChats]);

  if (loadingGroups) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centered}>
          <ActivityIndicator color="#D9ECFF" size="large" />
          <Text style={styles.loadingLabel}>Chargement des salons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.liquidBackground}>
        <Animated.View style={[styles.blobGlow, styles.blobAGlow, { transform: [{ scale: pulse }] }]} />
        <Animated.View style={[styles.blobGlow, styles.blobBGlow, { transform: [{ scale: pulse }] }]} />
        <Animated.View style={[styles.blob, styles.blobA, { transform: [{ scale: pulse }] }]} />
        <Animated.View style={[styles.blob, styles.blobB, { transform: [{ scale: pulse }] }]} />
      </View>

      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={20} color="#D8E9FF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Groupchats</Text>
            <Text style={styles.headerSub}>Mise à jour automatique</Text>
          </View>
          <View style={styles.badgePill}>
            <MessageCircle size={14} color="#9ad6ff" />
            <Text style={styles.badgeText}>{mappedGroups.length}</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.layout}>
          <View style={styles.leftPane}>
            <FlatList
              data={mappedGroups}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.groupListContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const active = selectedGroup?.id === item.id;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedGroup(item)}
                    style={[styles.groupCard, active && styles.groupCardActive]}
                  >
                    <Text style={styles.groupTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.groupSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <KeyboardAvoidingView
            style={styles.rightPane}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle} numberOfLines={1}>{selectedGroup?.event?.title || 'Aucun salon'}</Text>
            </View>

            {loadingMessages ? (
              <View style={styles.centeredInline}>
                <ActivityIndicator color="#9ad6ff" />
              </View>
            ) : (
              <FlatList
                data={messages}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Bubble
                    message={item}
                    isOwn={currentUserId !== null && item.user_id === currentUserId}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.centeredInline}>
                    <Text style={styles.emptyLabel}>Aucun message pour le moment</Text>
                  </View>
                }
              />
            )}

            <View style={styles.inputRow}>
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Écrire un message..."
                placeholderTextColor="#7c8ea6"
                style={styles.input}
                onSubmitEditing={sendMessage}
                editable={!sending}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!newMessage.trim() || sending}
              >
                <Send size={16} color="#041017" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#03050A',
  },
  liquidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#02040A',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.22,
    shadowOpacity: 0.95,
    shadowRadius: 120,
    shadowOffset: { width: 0, height: 0 },
  },
  blobGlow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.14,
    shadowOpacity: 1,
    shadowRadius: 160,
    shadowOffset: { width: 0, height: 0 },
  },
  blobA: {
    width: 360,
    height: 360,
    backgroundColor: '#0E4BA8',
    top: -140,
    right: -80,
    shadowColor: '#4b8ff9',
  },
  blobB: {
    width: 420,
    height: 420,
    backgroundColor: '#0E7F8B',
    bottom: -180,
    left: -120,
    shadowColor: '#5ce1e6',
  },
  blobAGlow: {
    width: 620,
    height: 620,
    backgroundColor: '#4b8ff9',
    top: -300,
    right: -260,
    shadowColor: '#7aaeff',
  },
  blobBGlow: {
    width: 660,
    height: 660,
    backgroundColor: '#5ce1e6',
    bottom: -340,
    left: -300,
    shadowColor: '#8bfbff',
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 102,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(184,216,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: '#E9F4FF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSub: {
    color: '#9CB6CE',
    fontSize: 12,
    marginTop: 2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(154,214,255,0.35)',
    backgroundColor: 'rgba(14,27,42,0.65)',
  },
  badgeText: {
    color: '#CFE9FF',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#FF9AA3',
    marginBottom: 8,
    fontSize: 13,
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  leftPane: {
    width: '34%',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(171,213,255,0.18)',
    backgroundColor: 'rgba(7,16,27,0.58)',
  },
  rightPane: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(171,213,255,0.18)',
    backgroundColor: 'rgba(5,12,21,0.62)',
  },
  groupListContent: {
    padding: 8,
    gap: 8,
  },
  groupCard: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  groupCardActive: {
    borderColor: 'rgba(144,212,255,0.8)',
    backgroundColor: 'rgba(37,131,196,0.25)',
  },
  groupTitle: {
    color: '#EDF6FF',
    fontSize: 13,
    fontWeight: '700',
  },
  groupSubtitle: {
    color: '#9AB5CD',
    fontSize: 11,
    marginTop: 3,
  },
  chatHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(184,216,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chatTitle: {
    color: '#EDF6FF',
    fontSize: 15,
    fontWeight: '700',
  },
  messagesContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 6,
  },
  bubbleWrap: {
    width: '100%',
    marginBottom: 8,
  },
  bubbleWrapOwn: {
    alignItems: 'flex-end',
  },
  bubbleWrapOther: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  bubbleOwn: {
    backgroundColor: 'rgba(130,220,255,0.95)',
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: 'rgba(23,33,48,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(130,220,255,0.2)',
    borderBottomLeftRadius: 6,
  },
  authorText: {
    color: '#8CCBFF',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  messageTextOwn: {
    color: '#03131B',
    fontWeight: '600',
  },
  messageTextOther: {
    color: '#E8F5FF',
  },
  timeText: {
    marginTop: 5,
    fontSize: 10,
  },
  timeTextOwn: {
    color: 'rgba(2,18,27,0.75)',
    textAlign: 'right',
  },
  timeTextOther: {
    color: '#88A5C4',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    marginBottom: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(184,216,255,0.14)',
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    paddingHorizontal: 12,
    color: '#F0F8FF',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(171,213,255,0.22)',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#87D8FF',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredInline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  loadingLabel: {
    marginTop: 10,
    color: '#BFD8EE',
  },
  emptyLabel: {
    color: '#9AB5CD',
    fontSize: 13,
  },
});
