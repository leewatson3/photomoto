import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native'
import { supabase } from '../../src/lib/supabase'
import colors from '../../src/theme/colors'

const SCREEN_WIDTH = Dimensions.get('window').width

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

const HIGHLIGHTS = [
  { id: '1', label: 'Top shotis', color: '#D85A30', emoji: '🏆' },
  { id: '2', label: 'Opening', color: '#1D9E75', emoji: '🎵' },
  { id: '3', label: 'Crowd', color: '#534AB7', emoji: '🙌' },
  { id: '4', label: 'Sunset', color: '#BA7517', emoji: '🌅' },
  { id: '5', label: 'Food', color: '#993C1D', emoji: '🍗' },
  { id: '6', label: 'VIP', color: '#0F6E56', emoji: '⭐' },
]

export default function FeedScreen() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    fetchPhotos()
  }, [])

  async function fetchPhotos() {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setPhotos(data)
    setLoading(false)
  }

  function toggleLike(id: string) {
    setLiked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {/* Stories / Highlights row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesRow}
            >
              {HIGHLIGHTS.map((h, i) => (
                <TouchableOpacity
                  key={h.id}
                  style={styles.storyItem}
                  onPress={() => router.push('/(tabs)/highlights')}
                >
                  <View style={[styles.storyRing, { borderColor: h.color }]}>
                    <View style={[styles.storyCircle, { backgroundColor: h.color }]}>
                      <Text style={styles.storyEmoji}>{h.emoji}</Text>
                    </View>
                  </View>
                  <Text style={styles.storyLabel} numberOfLines={1}>{h.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionDivider} />
          </View>
        )}
        renderItem={({ item, index }: { item: Photo; index: number }) => {
          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length]
          const isLiked = liked.has(item.id)

          return (
            <View style={styles.post}>

              {/* Post header */}
              <View style={styles.postHeader}>
                <View style={[styles.postAvatar, { backgroundColor: avatarColor }]}>
                  <Text style={styles.postAvatarText}>{item.initials}</Text>
                </View>
                <View style={styles.postHeaderInfo}>
                  <Text style={styles.postUserName}>{item.user_name}</Text>
                  <Text style={styles.postMeta}>{item.event_name} · {timeAgo(item.created_at)}</Text>
                </View>
                <TouchableOpacity style={styles.postMoreBtn}>
                  <Ionicons name="ellipsis-horizontal" size={18} color={colors.stone} />
                </TouchableOpacity>
              </View>

              {/* Photo */}
              <View style={[styles.postImage, { backgroundColor: avatarColor }]}>
                <Text style={styles.postImageEmoji}>📸</Text>
              </View>

              {/* Action row */}
              <View style={styles.postActions}>
                <View style={styles.postActionsLeft}>
                  <TouchableOpacity
                    style={styles.postActionBtn}
                    onPress={() => toggleLike(item.id)}
                  >
                    <Ionicons
                      name={isLiked ? 'heart' : 'heart-outline'}
                      size={26}
                      color={isLiked ? '#FF3B30' : colors.white}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postActionBtn}>
                    <Ionicons name="chatbubble-outline" size={24} color={colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postActionBtn}>
                    <Ionicons name="paper-plane-outline" size={24} color={colors.white} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity>
                  <Ionicons name="bookmark-outline" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>

              {/* Likes */}
              <View style={styles.postLikes}>
                <Text style={styles.postLikesText}>
                  {isLiked ? '1 like' : 'Be the first to like'}
                </Text>
              </View>

              {/* Caption */}
              {item.caption ? (
                <View style={styles.postCaption}>
                  <Text style={styles.postCaptionUser}>{item.user_name} </Text>
                  <Text style={styles.postCaptionText}>{item.caption}</Text>
                </View>
              ) : null}

              {/* Time */}
              <Text style={styles.postTime}>{timeAgo(item.created_at)}</Text>

            </View>
          )
        }}
        ListEmptyComponent={() => (
          !loading ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="camera-outline" size={56} color={colors.nightLight} />
              <Text style={styles.emptyTitle}>No shotis yet</Text>
              <Text style={styles.emptySub}>Be the first to shoot at this event!</Text>
            </View>
          ) : null
        )}
        ListFooterComponent={() => (
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.orange} />
            </View>
          ) : null
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
  },
  storiesRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 14,
  },
  storyItem: {
    alignItems: 'center',
    gap: 5,
    width: 68,
  },
  storyRing: {
    width: 66,
    height: 66,
    borderRadius: 99,
    borderWidth: 2.5,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyCircle: {
    width: 54,
    height: 54,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyEmoji: {
    fontSize: 22,
  },
  storyLabel: {
    fontSize: 11,
    color: colors.white,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionDivider: {
    height: 0.5,
    backgroundColor: colors.nightLight,
  },
  post: {
    marginBottom: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  postMeta: {
    fontSize: 11,
    color: colors.stone,
    marginTop: 1,
  },
  postMoreBtn: {
    padding: 4,
  },
  postImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postImageEmoji: {
    fontSize: 80,
    opacity: 0.5,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  postActionsLeft: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  postActionBtn: {
    padding: 2,
  },
  postLikes: {
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  postLikesText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  postCaption: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  postCaptionUser: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  postCaptionText: {
    fontSize: 13,
    color: colors.dust,
    flex: 1,
  },
  postTime: {
    fontSize: 11,
    color: colors.stone,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  emptySub: {
    fontSize: 14,
    color: colors.stone,
  },
})