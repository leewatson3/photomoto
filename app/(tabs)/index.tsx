import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../../src/lib/supabase'
import colors from '../../src/theme/colors'

type Photo = {
  id: string
  user_name: string
  initials: string
  caption: string
  event_name: string
  image_url: string
  created_at: string
}

const AVATAR_COLORS = ['#D85A30', '#1D9E75', '#534AB7', '#BA7517', '#993C1D']

export default function FeedScreen() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPhotos()
  }, [])

  async function fetchPhotos() {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Error:', error.message)
    } else {
      setPhotos(data)
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PhotoMoto</Text>
          <Text style={styles.headerSub}>Blankets & Wine · Live now</Text>
        </View>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.orange} />
          <Text style={styles.loadingText}>Loading shotis...</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }: { item: Photo; index: number }) => (
            <View style={styles.card}>
              <View style={[styles.photoPlaceholder, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                <Text style={styles.photoPlaceholderText}>📸</Text>
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.userRow}>
                  <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                    <Text style={styles.avatarText}>{item.initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{item.user_name}</Text>
                    <Text style={styles.userTime}>
                      {new Date(item.created_at).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.caption}>{item.caption}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionText}>🔥 Moto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionText}>💾 Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionText}>↗ Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
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
    color: colors.orange,
  },
  headerSub: {
    fontSize: 12,
    color: colors.stone,
    marginTop: 2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.nightLight,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: '#7CFF6B',
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.stone,
    marginTop: 12,
    fontSize: 14,
  },
  feedList: {
    padding: 14,
    gap: 16,
  },
  card: {
    backgroundColor: colors.nightMid,
    borderRadius: 16,
    overflow: 'hidden',
  },
  photoPlaceholder: {
    width: '100%',
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 48,
  },
  cardBottom: {
    padding: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.white,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  userTime: {
    fontSize: 11,
    color: colors.stone,
  },
  caption: {
    fontSize: 14,
    color: colors.dust,
    marginBottom: 12,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    backgroundColor: colors.nightLight,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  actionText: {
    fontSize: 12,
    color: colors.white,
  },
})