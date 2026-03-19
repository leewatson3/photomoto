import { Tabs } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { supabase } from '../../src/lib/supabase'
import LoginScreen from '../../src/screens/LoginScreen'
import colors from '../../src/theme/colors'

export default function TabLayout() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.night, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    )
  }

  if (!session) {
    return <LoginScreen onLogin={() => {}} />
  }

  return (
    
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.nightMid,
          borderTopColor: colors.nightLight,
        },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.stone,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Shoot',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>📸</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>🎟️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
  options={{
    title: 'Profile',
    tabBarIcon: ({ color }) => (
      <Text style={{ fontSize: 18, color }}>👤</Text>
    ),
  }}
  />
    </Tabs>
  )
}