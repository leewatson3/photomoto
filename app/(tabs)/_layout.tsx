import { Ionicons } from '@expo/vector-icons'
import { Tabs, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../../src/lib/supabase'
import LoginScreen from '../../src/screens/LoginScreen'
import colors from '../../src/theme/colors'

export default function TabLayout() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [initials, setInitials] = useState('?')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const name = session.user.user_metadata?.full_name ?? 'U'
        const ini = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        setInitials(ini)
      }
      setLoading(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        const name = session.user.user_metadata?.full_name ?? 'U'
        const ini = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        setInitials(ini)
      }
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
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.nightMid,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.nightLight,
        } as any,
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: colors.orange,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            style={{
              width: 34,
              height: 34,
              borderRadius: 99,
              backgroundColor: colors.orange,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.white }}>
              {initials}
            </Text>
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: colors.nightMid,
          borderTopColor: colors.nightLight,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.stone,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'PhotoMoto',
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="images-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Shoot',
          tabBarLabel: 'Shoot',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Events',
          tabBarLabel: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ticket-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          title: 'Review',
          tabBarLabel: 'Review',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="johnte"
        options={{
        title: 'Johnte AI',
         href: null,
        tabBarIcon: ({ color, size }) => (
      <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
       ),
     }}
      />
      <Tabs.Screen
        name="highlights"
        options={{
          title: 'Highlights',
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}