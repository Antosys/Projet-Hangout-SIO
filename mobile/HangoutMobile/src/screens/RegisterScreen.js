import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import * as Animatable from 'react-native-animatable';

export default function RegisterScreen({ navigation }) {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!prenom || !nom || !username || !email || !password) {
      Alert.alert('Erreur', 'Tous les champs sont requis.');
      return;
    }

    setLoading(true);
    const result = await register(prenom, nom, username, email, password);
    setLoading(false);

    if (result.success) {
      Alert.alert('Succès', 'Compte créé avec succès');
    } else {
      Alert.alert('Erreur', result.error);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80' }}
      style={styles.background}>
      <View style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Animatable.View animation="fadeIn" duration={800} style={styles.header}>
                <Text style={styles.title}>HANGOUT</Text>
                <Text style={styles.subtitle}>Créez votre compte</Text>
              </Animatable.View>

              <View style={styles.form}>
                <Animatable.View animation="fadeInDown" delay={200} duration={800} style={styles.inputContainer}>
                  <Text style={styles.label}>Prénom</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Votre prénom"
                    placeholderTextColor="#666"
                    value={prenom}
                    onChangeText={setPrenom}
                  />
                </Animatable.View>

                <Animatable.View animation="fadeInDown" delay={300} duration={800} style={styles.inputContainer}>
                  <Text style={styles.label}>Nom</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Votre nom"
                    placeholderTextColor="#666"
                    value={nom}
                    onChangeText={setNom}
                  />
                </Animatable.View>

                <Animatable.View animation="fadeInDown" delay={350} duration={800} style={styles.inputContainer}>
                  <Text style={styles.label}>Nom d'utilisateur</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Votre username"
                    placeholderTextColor="#666"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </Animatable.View>

                <Animatable.View animation="fadeInDown" delay={400} duration={800} style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="votre@email.com"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </Animatable.View>

                <Animatable.View animation="fadeInDown" delay={450} duration={800} style={styles.inputContainer}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </Animatable.View>

                <Animatable.View animation="fadeInDown" delay={500} duration={800}>
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}>
                    <Text style={styles.buttonText}>
                      {loading ? 'CRÉATION...' : 'S\'INSCRIRE'}
                    </Text>
                  </TouchableOpacity>
                </Animatable.View>

                <Animatable.View animation="fadeInDown" delay={600} duration={800} style={styles.footer}>
                  <Text style={styles.footerText}>Déjà un compte ? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Se connecter</Text>
                  </TouchableOpacity>
                </Animatable.View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    color: '#fff',
    marginBottom: 10,
    letterSpacing: 4,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: '#aaa',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    color: '#000',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
  },
  link: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});