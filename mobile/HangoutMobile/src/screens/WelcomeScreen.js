import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80' }}
      style={styles.background}>
      <View style={styles.gradient}>
        <View style={styles.container}>
          <Animatable.View animation="fadeIn" duration={1000} style={styles.header}>
            <Text style={styles.logo}>HANGOUT</Text>
          </Animatable.View>

          <View style={styles.content}>
            <Animatable.Text animation="fadeInDown" delay={300} duration={1000} style={styles.title}>
              L'AVENTURE{'\n'}COMMENCE ICI.
            </Animatable.Text>

            <Animatable.Text animation="fadeInDown" delay={500} duration={1000} style={styles.subtitle}>
              Découvrez des expériences uniques et connectez-vous avec des passionnés
            </Animatable.Text>
          </View>

          <Animatable.View animation="fadeInDown" delay={700} duration={1000} style={styles.footer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Register')}>
              <Text style={styles.primaryButtonText}>S'INSCRIRE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.secondaryButtonText}>SE CONNECTER</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 50,
  },
  header: {
    alignItems: 'flex-start',
  },
  logo: {
    fontSize: 32,
    color: '#fff',
    marginTop: 20,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  title: {
    fontSize: 48,
    color: '#fff',
    letterSpacing: 0,
    lineHeight: 45,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#ddd',
    lineHeight: 28,
    maxWidth: '85%',
  },
  footer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 20,
    color: '#000',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontSize: 20,
    color: '#fff',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
});