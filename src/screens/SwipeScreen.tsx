import { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from 'react-native'
import { supabase } from '../lib/supabase'
import colors from '../theme/colors'

const SCREEN_WIDTH = Dimensions.get('window').width
const SWIPE_THRESHOLD = 120

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

export default function SwipeScreen() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fireCount, setFireCount] = useState(0)
  const [skipCount, setSkipCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const position = useRef(new Animated.ValueXY()).current
  const swipeStamp = useRef(new Animated.Value(0)).current

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

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy })
      swipeStamp.setValue(gesture.dx)
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        swipeRight()
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        swipeLeft()
      } else {
        resetPosition()
      }
    },
  })

  function resetPosition() {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start()
    swipeStamp.setValue(0)
  }

  function swipeRight() {
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => nextCard('fire'))
  }

  function swipeLeft() {
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => nextCard('skip'))
  }

  function nextCard(action: 'fire' | 'skip') {
    if (action === 'fire') setFireCount(c => c + 1)
    else setSkipCount(c => c + 1)

    position.setValue({ x: 0, y: 0 })
    swipeStamp.setValue(0)

    const next = index + 1
    if (next >= photos.length) {
      setFinished(true)
    } else {
      setIndex(next)
    }
  }

  function restart() {
    setIndex(0)
    setFireCount(0)
    setSkipCount(0)
    setFinished(false)
    position.setValue({ x: 0, y: 0 })
  }

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  })

  const fireOpacity = swipeStamp.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })

  const nopeOpacity = swipeStamp.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  })

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
    ],
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.orange} />
        <Text style={styles.loadingText}>Loading shotis...</Text>
      </View>
    )
  }

  if (finished) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Swipe review</Text>
          <Text style={styles.headerSub}>Blankets & Wine</Text>
        </View>

        <View style={styles.finishedWrap}>
          <Text style={styles.finishedEmoji}>🔥</Text>
          <Text style={styles.finishedTitle}>Reviewed!</Text>
          <Text style={styles.finishedSub}>You went through all the shotis</Text>

          <View style={styles.resultsRow}>
            <View style={styles.resultBox}>
              <Text style={styles.resultVal}>{fireCount}</Text>
              <Text style={styles.resultLbl}>Moto!</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultBox}>
              <Text style={styles.resultVal}>{skipCount}</Text>
              <Text style={styles.resultLbl}>Skipped</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultBox}>
              <Text style={styles.resultVal}>{photos.length}</Text>
              <Text style={styles.resultLbl}>Total</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.restartBtn} onPress={restart}>
            <Text style={styles.restartBtnText}>Review again</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const current = photos[index]
  const next = photos[index + 1]
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const progress = Math.round((index / photos.length) * 100)

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Swipe review</Text>
        <Text style={styles.headerSub}>Blankets & Wine</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{index} of {photos.length}</Text>
      </View>

      {/* Card stack */}
      <View style={styles.cardStack}>

        {/* Next card behind */}
        {next && (
          <View style={[styles.card, styles.cardBehind]}>
            <View style={[styles.cardPhoto, { backgroundColor: AVATAR_COLORS[(index + 1) % AVATAR_COLORS.length] }]}>
              <Text style={styles.cardPhotoEmoji}>📸</Text>
            </View>
          </View>
        )}

        {/* Current card */}
        <Animated.View
          style={[styles.card, cardStyle]}
          {...panResponder.panHandlers}
        >
          {/* MOTO stamp */}
          <Animated.View style={[styles.stamp, styles.stampFire, { opacity: fireOpacity }]}>
            <Text style={styles.stampText}>MOTO!</Text>
          </Animated.View>

          {/* NOPE stamp */}
          <Animated.View style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]}>
            <Text style={[styles.stampText, styles.stampTextNope]}>NOPE</Text>
          </Animated.View>

          {/* Photo */}
          <View style={[styles.cardPhoto, { backgroundColor: avatarColor }]}>
            <Text style={styles.cardPhotoEmoji}>📸</Text>
          </View>

          {/* Card info */}
          <View style={styles.cardInfo}>
            <View style={styles.cardUserRow}>
              <View style={[styles.cardAvatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.cardAvatarText}>{current.initials}</Text>
              </View>
              <View>
                <Text style={styles.cardUserName}>{current.user_name}</Text>
                <Text style={styles.cardTime}>
                  {new Date(current.created_at).toLocaleTimeString()}
                </Text>
              </View>
            </View>
            {current.caption && (
              <Text style={styles.cardCaption}>{current.caption}</Text>
            )}
          </View>

        </Animated.View>
      </View>

      {/* Hint */}
      <Text style={styles.hint}>← Skip · Swipe · Moto! →</Text>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.skipBtn} onPress={swipeLeft}>
          <Text style={styles.skipBtnText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fireBtn} onPress={swipeRight}>
          <Text style={styles.fireBtnText}>🔥</Text>
        </TouchableOpacity>
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
  header: {
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
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: colors.nightLight,
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
    borderRadius: 99,
  },
  progressText: {
    fontSize: 11,
    color: colors.stone,
    minWidth: 50,
    textAlign: 'right',
  },
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    backgroundColor: colors.nightMid,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardBehind: {
    transform: [{ scale: 0.94 }, { translateY: 10 }],
    opacity: 0.7,
  },
  cardPhoto: {
    width: '100%',
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPhotoEmoji: {
    fontSize: 64,
  },
  stamp: {
    position: 'absolute',
    top: 40,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
  },
  stampFire: {
    left: 20,
    borderColor: colors.orange,
    transform: [{ rotate: '-15deg' }],
  },
  stampNope: {
    right: 20,
    borderColor: colors.stone,
    transform: [{ rotate: '15deg' }],
  },
  stampText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.orange,
    letterSpacing: 2,
  },
  stampTextNope: {
    color: colors.stone,
  },
  cardInfo: {
    padding: 14,
    gap: 8,
  },
  cardUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAvatarText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.white,
  },
  cardUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  cardTime: {
    fontSize: 11,
    color: colors.stone,
  },
  cardCaption: {
    fontSize: 14,
    color: colors.dust,
    lineHeight: 20,
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.stone,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingBottom: 32,
  },
  skipBtn: {
    width: 60,
    height: 60,
    borderRadius: 99,
    backgroundColor: colors.nightMid,
    borderWidth: 1,
    borderColor: colors.nightLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    fontSize: 22,
    color: colors.stone,
  },
  fireBtn: {
    width: 60,
    height: 60,
    borderRadius: 99,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireBtnText: {
    fontSize: 24,
  },
  finishedWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  finishedEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  finishedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  finishedSub: {
    fontSize: 14,
    color: colors.stone,
    marginBottom: 16,
  },
  resultsRow: {
    flexDirection: 'row',
    backgroundColor: colors.nightMid,
    borderRadius: 16,
    paddingVertical: 20,
    width: '100%',
    marginBottom: 24,
  },
  resultBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  resultVal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.orange,
  },
  resultLbl: {
    fontSize: 12,
    color: colors.stone,
  },
  resultDivider: {
    width: 0.5,
    backgroundColor: colors.nightLight,
  },
  restartBtn: {
    backgroundColor: colors.nightMid,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderWidth: 0.5,
    borderColor: colors.nightLight,
  },
  restartBtnText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
})