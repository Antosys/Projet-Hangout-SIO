import React, { useContext } from 'react';
import { ActivityIndicator, View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Animatable from 'react-native-animatable';
import { Svg, Path } from 'react-native-svg';
import { AuthContext } from '../context/AuthContext';

// Écrans (à garder tels quels)
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import EventListScreen from '../screens/EventListScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';

// Icônes SVG (identiques)
const CalendarIcon = ({ color, focused }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2v2M16 2v2M3.5 9.09h17M8 22h8a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5Z"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {focused && (
      <>
        <Path d="M16 7v1M8 7v1M12 3v2" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M4 12h16" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </>
    )}
  </Svg>
);

const PlusIcon = ({ color, focused }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 8v8M8 12h8"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {focused && (
      <Path
        d="M12 8v8M8 12h8"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.3}
      />
    )}
  </Svg>
);

const UserIcon = ({ color, focused }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChatIcon = ({ color, focused }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 9h10M7 13h6m-8 8 2.5-3H18a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 2 2.83V21Z"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Navigateurs (inchangés)
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
export const navigationRef = createNavigationContainerRef();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function EventsNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#000000' },
        headerTitleStyle: { fontWeight: '700', color: '#ffffff' },
        headerTintColor: '#ffffff',
      }}
    >
      <AppStack.Screen name="EventList" component={EventListScreen} options={{ title: 'Événements' }} />
      <AppStack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Détail' }} />
      <AppStack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoris' }} />
    </AppStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#000000' },
        headerTitleStyle: { fontWeight: '700', color: '#ffffff' },
        headerTintColor: '#ffffff',
      }}
    >
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profil' }} />
      <ProfileStack.Screen name="AdminPanel" component={AdminPanelScreen} options={{ title: 'Panel Admin' }} />
    </ProfileStack.Navigator>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <Animatable.View
      style={styles.tabBarContainer}
      animation="fadeInUp"
      duration={500}
      useNativeDriver={true}
    >
      {/* Fond dégradé anthracite avec effet "faux flou" */}
      <View style={[styles.tabBar, styles.fauxBlurBackground]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tabColor = isFocused
            ? index === 0 ? '#007AFF' : index === 1 ? '#32d74b' : index === 2 ? '#5ce1e6' : '#ff9500'
            : '#ffffff80';

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.9}
            >
              <Animatable.View
                animation={isFocused ? { 0: { scale: 0.9 }, 1: { scale: 1.1 } } : undefined}
                duration={300}
                easing="ease-in-out"
                useNativeDriver={true}
                style={[
                  styles.tabButton,
                  isFocused && styles.activeTabButton,
                  isFocused && index === 0 && styles.blueAccent,
                  isFocused && index === 1 && styles.greenAccent,
                  isFocused && index === 2 && styles.cyanAccent,
                  isFocused && index === 3 && styles.orangeAccent,
                ]}
              >
                {route.name === 'EventsTab' && <CalendarIcon color={tabColor} focused={isFocused} />}
                {route.name === 'Create' && <PlusIcon color={tabColor} focused={isFocused} />}
                {route.name === 'GroupChats' && <ChatIcon color={tabColor} focused={isFocused} />}
                {route.name === 'Profile' && <UserIcon color={tabColor} focused={isFocused} />}
              </Animatable.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animatable.View>
  );
}

function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="EventsTab" component={EventsNavigator} options={{ title: 'Événements' }} />
      <Tab.Screen name="Create" component={CreateEventScreen} options={{ title: 'Créer' }} />
      <Tab.Screen name="GroupChats" component={GroupChatScreen} options={{ title: 'Chats' }} />
      <Tab.Screen name="Profile" component={ProfileNavigator} options={{ title: 'Profil', headerShown: false }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { state } = useContext(AuthContext);

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {state.userToken == null ? <AuthNavigator /> : <AppNavigator />}
    </NavigationContainer>
  );
}

export default RootNavigator;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tabBar: {
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  // Fond "faux flou" avec dégradé anthracite
  fauxBlurBackground: {
    backgroundColor: 'rgba(28, 28, 30, 0.9)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // Effet de "flou" simulé avec des couches de transparence
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  tabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTabButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  blueAccent: {
    shadowColor: '#007AFF',
  },
  greenAccent: {
    shadowColor: '#32d74b',
  },
  cyanAccent: {
    shadowColor: '#5ce1e6',
  },
  orangeAccent: {
    shadowColor: '#ff9500',
  },
});
