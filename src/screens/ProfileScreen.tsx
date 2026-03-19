import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from 'react-native'
import { supabase } from '../lib/supabase'
import colors from '../theme/colors'

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [photoCount, setPhotoCount] = useState(0)

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { count } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setPhotoCount(count ?? 0)
    }

    setLoading(false)
  }

  async function handleLogout() {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut()
          }
        }
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    )
  }

  const name = user?.user_metadata?.full_name ?? 'Photographer'
  const email = user?.email ?? ''
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.userEmail}>{email}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{photoCount}</Text>
          <Text style={styles.statLbl}>Shotis</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>0</Text>
          <Text style={styles.statLbl}>Moto votes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>0</Text>
          <Text style={styles.statLbl}>Events</Text>
        </View>
      </View>

      {/* Menu items */}
      <View style={styles.menu}>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🎟️</Text>
          <Text style={styles.menuLabel}>My tickets</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📸</Text>
          <Text style={styles.menuLabel}>My shotis</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⭐</Text>
          <Text style={styles.menuLabel}>Upgrade to Pro</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>KES 500/mo</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🤖</Text>
          <Text style={styles.menuLabel}>Chat with Johnte</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuLabel}>Settings</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

      </View>

      {/* Version */}
      <Text style={styles.version}>PhotoMoto v1.0.0 · Made in Nairobi 🇰🇪</Text>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
  },
  content: {
    paddingBottom: 40,
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: colors.night,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: colors.nightMid,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.nightLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.nightLight,
  },
  logoutText: {
    fontSize: 13,
    color: colors.stone,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 99,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
  },
  userEmail: {
    fontSize: 13,
    color: colors.stone,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 18,
    backgroundColor: colors.nightMid,
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statVal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.orange,
  },
  statLbl: {
    fontSize: 12,
    color: colors.stone,
  },
  statDivider: {
    width: 0.5,
    backgroundColor: colors.nightLight,
  },
  menu: {
    marginHorizontal: 18,
    backgroundColor: colors.nightMid,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.nightLight,
    gap: 12,
  },
  menuIcon: {
    fontSize: 18,
    width: 28,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.white,
  },
  menuArrow: {
    fontSize: 18,
    color: colors.stone,
  },
  proBadge: {
    backgroundColor: colors.orange,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  version: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.nightLight,
  },
})