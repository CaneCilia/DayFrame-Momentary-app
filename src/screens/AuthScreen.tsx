import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { signUpWithEmail, signInWithEmail } from '../lib/auth';
import { theme } from '../utils/theme';

export const AuthScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        // Alert.alert('Success', 'Logged in successfully!');
        navigation.goBack();
      } else {
        await signUpWithEmail(email, password);
        Alert.alert('Success', 'Check your email for the confirmation link.');
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Sign in to securely sync your local vault.' : 'Create a secure backup of your timeline.'}
        </Text>
        
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.colors.text.secondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.colors.text.secondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleAuth} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.text.inverse} />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleContainer} activeOpacity={0.7}>
        <Text style={styles.toggleText}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Text style={styles.toggleTextBold}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  title: { 
    fontSize: 34, 
    fontWeight: '800', 
    marginBottom: theme.spacing.xs, 
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xxl,
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  input: { 
    backgroundColor: theme.colors.card,
    borderWidth: 1, 
    borderColor: theme.colors.border, 
    borderRadius: theme.borderRadius.md, 
    padding: theme.spacing.md, 
    marginBottom: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
    ...theme.shadows.sm,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    ...theme.shadows.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: { 
    color: theme.colors.text.inverse, 
    fontSize: 16, 
    fontWeight: '700' 
  },
  toggleContainer: { 
    paddingBottom: theme.spacing.xxl,
    alignItems: 'center',
  },
  toggleText: { 
    color: theme.colors.text.secondary, 
    fontSize: 15,
  },
  toggleTextBold: {
    color: theme.colors.text.primary,
    fontWeight: '700',
  }
});
