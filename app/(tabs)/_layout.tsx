import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import colors from '../../src/theme/colors'

export default function TabLayout() {
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
    </Tabs>
  )
}