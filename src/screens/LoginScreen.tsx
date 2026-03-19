import { useState } from 'react'
import {
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { supabase } from '../lib/supabase'
import colors from '../theme/colors'

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Hold on', 'Please enter your email and password.')
      return
    }
    if (isSignUp && !name) {
      Alert.alert('Hold on', 'Please enter your name.')
      return
    }

    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      })
      if (error) {
        Alert.alert('Error', error.message)
      } else {
        Alert.alert('Almost there! 🔥', 'Check your email to confirm your account, then log in.')
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        Alert.alert('Error', error.message)
      } else {
        onLogin()
      }
    }

    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <View style={styles.logoDot} />
          </View>
          <Text style={styles.logoText}>PhotoMoto</Text>
          <Text style={styles.logoSub}>Picha mob, moto sana.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={colors.stone}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={colors.stone}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.stone}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.authBtn}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.authBtnText}>
                {isSignUp ? 'Create account 🔥' : 'Log in'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchText}>
              {isSignUp
                ? 'Already have an account? Log in'
                : "No account? Sign up — it's free"}
            </Text>
          </TouchableOpacity>

        </View>

      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 40,
  },
  logoWrap: {
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 99,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDot: {
    width: 28,
    height: 28,
    borderRadius: 99,
    borderWidth: 3,
    borderColor: colors.white,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  logoSub: {
    fontSize: 14,
    color: colors.stone,
    fontStyle: 'italic',
  },
  form: {
    gap: 14,
  },
  input: {
    backgroundColor: colors.nightMid,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.white,
    borderWidth: 0.5,
    borderColor: colors.nightLight,
  },
  authBtn: {
    backgroundColor: colors.orange,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  authBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  switchBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchText: {
    fontSize: 13,
    color: colors.stone,
  },
})