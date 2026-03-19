import { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from 'react-native'
import { supabase } from '../lib/supabase'
import colors from '../theme/colors'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height

type Photo = {
  id: string
  user_name: string
  initials: string
  caption: string
  event_name: string
  image_url: string
  created_at: string
}

const AVATAR_COLORS = ['#D85A30', '#1D9E75', '#534AB7', '#BA7517', '#993C1D', '#0F6E56']
const RANK_COLORS = ['#D4AF37', '#A8A9AD', '#CD7F32', '#5F5E5A', '#5F5E5A', '#5F5E5A']
const RANK_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th']

type ViewMode = 'reel' | 'grid'

export default function HighlightsScreen() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('reel')
  const [paused, setPaused] = useState(false)
  const progressAnim = useRef(new Animated.Value(0)).current
  const progressRef = useRef<Animated.CompositeAnimation | null>(null)
  const SLIDE_DURATION = 4000

  useEffect(() => {
    fetchPhotos()
  }, [])

  useEffect(() => {
    if (photos.length > 0 && viewMode === 'reel' && !paused) {
      startProgress()
    }
    return () => {
      if (progressRef.current) progressRef.current.stop()
    }
  }, [currentIndex, photos, viewMode, paused])

  async function fetchPhotos() {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && data) setPhotos(data)
    setLoading(false)
  }

  function startProgress() {
    progressAnim.setValue(0)
    progressRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: SLIDE_DURATION,
      useNativeDriver: false,
    })
    progressRef.current.start(({ finished }) => {
      if (finished) nextSlide()
    })
  }

  function nextSlide() {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
    }
  }

  function togglePause() {
    if (paused) {
      setPaused(false)
    } else {
      if (progressRef.current) progressRef.current.stop()
      setPaused(true)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.orange} />
        <Text style={styles.loadingText}>Loading top shotis...</Text>
      </View>
    )
  }

  if (photos.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyEmoji}>📸</Text>
        <Text style={styles.emptyTitle}>No shotis yet</Text>
        <Text style={styles.emptySub}>Take some photos and swipe to vote first!</Text>
      </View>
    )
  }

  // ── GRID VIEW ─────────────────────────────────────────────
  if (viewMode === 'grid') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Top shotis</Text>
            <Text style={styles.headerSub}>Blankets & Wine · crowd ranked</Text>
          </View>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode('reel')}
          >
            <Text style={styles.viewToggleText}>▶ Reel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.grid}>
          {photos.map((photo, i) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.gridItem}
              onPress={() => {
                setCurrentIndex(i)
                setViewMode('reel')
              }}
            >
              <View style={[styles.gridPhoto, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                <Text style={styles.gridPhotoEmoji}>📸</Text>
              </View>
              <View style={[styles.gridRank, { backgroundColor: RANK_COLORS[i] ?? RANK_COLORS[3] }]}>
                <Text style={styles.gridRankText}>{RANK_LABELS[i] ?? `${i + 1}`}</Text>
              </View>
              <View style={styles.gridVotes}>
                <Text style={styles.gridVotesText}>🔥 {Math.max(10 - i * 1, 1) * 47}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )
  }

  // ── REEL VIEW ─────────────────────────────────────────────
  const current = photos[currentIndex]
  const avatarColor = AVATAR_COLORS[currentIndex % AVATAR_COLORS.length]
  const rankColor = RANK_COLORS[currentIndex] ?? RANK_COLORS[3]
  const rankLabel = RANK_LABELS[currentIndex] ?? `${currentIndex + 1}`
  const votes = Math.max(10 - currentIndex, 1) * 47
  const votePct = Math.round((votes / 470) * 100)

  return (
    <View style={styles.container}>

      {/* Fullscreen background */}
      <View style={[styles.reelBg, { backgroundColor: avatarColor }]}>
        <Text style={styles.reelBgEmoji}>📸</Text>
      </View>

      {/* Dark overlay */}
      <View style={styles.reelOverlay} />

      {/* Top HUD */}
      <View style={styles.reelTop}>

        {/* Progress dots */}
        <View style={styles.progressDots}>
          {photos.map((_, i) => (
            <View key={i} style={styles.progressDotWrap}>
              {i < currentIndex ? (
                <View style={[styles.progressDot, styles.progressDotDone]} />
              ) : i === currentIndex ? (
                <View style={styles.progressDot}>
                  <Animated.View style={[
                    styles.progressDotFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      })
                    }
                  ]} />
                </View>
              ) : (
                <View style={[styles.progressDot, styles.progressDotEmpty]} />
              )}
            </View>
          ))}
        </View>

        {/* Header row */}
        <View style={styles.reelHeader}>
          <View style={styles.reelEventPill}>
            <Text style={styles.reelEventPillText}>★ Top shotis · Blankets & Wine</Text>
          </View>
          <View style={styles.reelActions}>
            <TouchableOpacity style={styles.reelIconBtn} onPress={togglePause}>
              <Text style={styles.reelIconBtnText}>{paused ? '▶' : '⏸'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reelIconBtn} onPress={() => setViewMode('grid')}>
              <Text style={styles.reelIconBtnText}>⊞</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

      {/* Tap zones */}
      <View style={styles.tapZones}>
        <TouchableOpacity style={styles.tapLeft} onPress={prevSlide} />
        <TouchableOpacity style={styles.tapRight} onPress={nextSlide} />
      </View>

      {/* Rank badge */}
      <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
        <Text style={styles.rankBadgeText}>{rankLabel}</Text>
      </View>

      {/* Bottom info */}
      <View style={styles.reelBottom}>

        {/* Vote bar */}
        <View style={styles.voteBarWrap}>
          <View style={styles.voteBarTop}>
            <View style={styles.voteBarLeft}>
              <Text style={styles.voteFireIcon}>🔥</Text>
              <Text style={styles.voteCount}>{votes.toLocaleString()}</Text>
              <Text style={styles.voteLabel}> Moto votes</Text>
            </View>
            <Text style={styles.votePct}>{votePct}%</Text>
          </View>
          <View style={styles.voteTrack}>
            <View style={[styles.voteFill, { width: `${votePct}%` }]} />
          </View>
        </View>

        {/* Shooter */}
        <View style={styles.shooterRow}>
          <View style={[styles.shooterAvatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.shooterAvatarText}>{current.initials}</Text>
          </View>
          <View>
            <Text style={styles.shooterName}>{current.user_name}</Text>
            <Text style={styles.shooterMeta}>
              Shot {currentIndex + 1} of {photos.length} · {new Date(current.created_at).toLocaleTimeString()}
            </Text>
          </View>
        </View>

        {current.caption ? (
          <Text style={styles.reelCaption}>{current.caption}</Text>
        ) : null}

        {/* CTA buttons */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaSave}>
            <Text style={styles.ctaSaveText}>↓ Save photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaShare}>
            <Text style={styles.ctaShareText}>↗ Share</Text>
          </TouchableOpacity>
        </View>

      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: colors.night,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.stone,
  },
  emptyWrap: {
    flex: 1,
    backgroundColor: colors.night,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  emptySub: {
    fontSize: 14,
    color: colors.stone,
    textAlign: 'center',
    lineHeight: 22,
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
  headerSub: {
    fontSize: 12,
    color: colors.stone,
    marginTop: 2,
  },
  viewToggle: {
    backgroundColor: colors.orange,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  viewToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
    gap: 2,
  },
  gridItem: {
    width: (SCREEN_WIDTH - 8) / 3,
    position: 'relative',
  },
  gridPhoto: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridPhotoEmoji: {
    fontSize: 32,
  },
  gridRank: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 28,
    height: 28,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRankText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.white,
  },
  gridVotes: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 99,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gridVotesText: {
    fontSize: 9,
    color: colors.white,
    fontWeight: '600',
  },
  reelBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelBgEmoji: {
    fontSize: 120,
    opacity: 0.3,
  },
  reelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  reelTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 56,
    paddingHorizontal: 14,
    zIndex: 10,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 10,
  },
  progressDotWrap: {
    flex: 1,
  },
  progressDot: {
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressDotDone: {
    backgroundColor: colors.white,
  },
  progressDotEmpty: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressDotFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 99,
  },
  reelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reelEventPill: {
    backgroundColor: 'rgba(216,90,48,0.85)',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  reelEventPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  reelActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reelIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelIconBtnText: {
    fontSize: 14,
    color: colors.white,
  },
  tapZones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 5,
  },
  tapLeft: {
    width: '40%',
    height: '100%',
  },
  tapRight: {
    width: '60%',
    height: '100%',
  },
  rankBadge: {
    position: 'absolute',
    top: 120,
    left: 18,
    width: 44,
    height: 44,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  reelBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
    paddingBottom: 36,
    zIndex: 10,
    gap: 12,
  },
  voteBarWrap: {
    gap: 6,
  },
  voteBarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteFireIcon: {
    fontSize: 14,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  voteLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  votePct: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.orange,
  },
  voteTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  voteFill: {
    height: '100%',
    backgroundColor: colors.orange,
    borderRadius: 99,
  },
  shooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shooterAvatar: {
    width: 36,
    height: 36,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  shooterAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  shooterName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  shooterMeta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  reelCaption: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ctaSave: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaSaveText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.nightMid,
  },
  ctaShare: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ctaShareText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
})