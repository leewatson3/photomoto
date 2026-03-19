import { CameraType, CameraView, useCameraPermissions } from 'expo-camera'
import { useEffect, useRef, useState } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import colors from '../theme/colors'

type Mode = 'Photo' | 'Video' | 'Burst'

const VIDEO_DURATION = 3

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back')
  const [zoom, setZoom] = useState(0)
  const [mode, setMode] = useState<Mode>('Photo')
  const [isRecording, setIsRecording] = useState(false)
  const [timer, setTimer] = useState(VIDEO_DURATION)
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<CameraView>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const zoomBase = useRef(0)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  if (!permission) return <View style={styles.container} />

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permissionText}>
          PhotoMoto needs camera access to take shotis 📸
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    )
  }

  async function takePhoto() {
    if (!cameraRef.current) return
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 })
      Alert.alert('Shoti taken! 🔥', 'Upload coming next.')
      console.log('Photo:', photo)
    } catch (e) {
      Alert.alert('Error', 'Could not take photo.')
    }
  }

  async function startVideo() {
    if (!cameraRef.current || isRecording) return
    setIsRecording(true)
    setTimer(VIDEO_DURATION)

    let remaining = VIDEO_DURATION
    timerRef.current = setInterval(() => {
      remaining -= 1
      setTimer(remaining)
      if (remaining <= 0) {
        clearInterval(timerRef.current!)
        stopVideo()
      }
    }, 1000)

    try {
      await cameraRef.current.recordAsync({ maxDuration: VIDEO_DURATION })
    } catch (e) {
      console.log('Video error:', e)
    }
  }

  async function stopVideo() {
    if (!cameraRef.current) return
    if (timerRef.current) clearInterval(timerRef.current)
    cameraRef.current.stopRecording()
    setIsRecording(false)
    setTimer(VIDEO_DURATION)
    Alert.alert('Video saved! 🔥', `${VIDEO_DURATION}s boomerang captured.`)
  }

  function handleShutter() {
    if (mode === 'Photo' || mode === 'Burst') {
      takePhoto()
    } else if (mode === 'Video') {
      if (isRecording) {
        stopVideo()
      } else {
        startVideo()
      }
    }
  }

  function flipCamera() {
    setFacing(facing === 'back' ? 'front' : 'back')
  }

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      zoomBase.current = zoom
    })
    .onUpdate((e) => {
      if (isRecording) return
      const newZoom = Math.min(
        Math.max(zoomBase.current + (e.scale - 1) * 0.1, 0),
        0.5
      )
      setZoom(newZoom)
    })

  const progress = ((VIDEO_DURATION - timer) / VIDEO_DURATION) * 100

  return (
    <View style={styles.container}>

      <GestureDetector gesture={pinchGesture}>
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={facing}
            ref={cameraRef}
            zoom={zoom}
            mode={mode === 'Video' ? 'video' : 'picture'}
          />

          <View style={styles.cameraOverlay}>

            <View style={styles.eventPill}>
              <View style={styles.liveDot} />
              <Text style={styles.eventPillText}>Blankets & Wine · 347 shooting</Text>
            </View>

            {isRecording && (
              <View style={styles.recordingBanner}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>REC · {timer}s</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
              </View>
            )}

            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <View style={styles.zoomBar}>
              <TouchableOpacity
                style={[styles.zoomBtn, zoom === 0 && styles.zoomBtnActive]}
                onPress={() => !isRecording && setZoom(0)}
              >
                <Text style={[styles.zoomText, isRecording && styles.zoomTextDisabled]}>1×</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.zoomBtn, zoom === 0.1 && styles.zoomBtnActive]}
                onPress={() => !isRecording && setZoom(0.1)}
              >
                <Text style={[styles.zoomText, isRecording && styles.zoomTextDisabled]}>2×</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.zoomBtn, zoom === 0.2 && styles.zoomBtnActive]}
                onPress={() => !isRecording && setZoom(0.2)}
              >
                <Text style={[styles.zoomText, isRecording && styles.zoomTextDisabled]}>3×</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </GestureDetector>

      <View style={styles.bottomBar}>

        <View style={styles.modeTabs}>
          {(['Video', 'Photo', 'Burst'] as Mode[]).map((m) => (
            <TouchableOpacity key={m} onPress={() => !isRecording && setMode(m)}>
              <Text style={m === mode ? styles.modeTabActive : styles.modeTabInactive}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.shutterRow}>

          <View style={styles.thumbnail}>
            <Text style={styles.thumbnailText}>🖼️</Text>
          </View>

          <TouchableOpacity
            style={[styles.shutterBtn, isRecording && styles.shutterBtnRecording]}
            onPress={handleShutter}
          >
            <View style={[
              styles.shutterInner,
              mode === 'Video' && styles.shutterInnerVideo,
              isRecording && styles.shutterInnerRecording,
            ]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.flipBtn, isRecording && styles.flipBtnDisabled]}
            onPress={() => !isRecording && flipCamera()}
          >
            <Text style={styles.flipText}>🔄</Text>
          </TouchableOpacity>

        </View>

        {mode === 'Video' && !isRecording && (
          <Text style={styles.videoHint}>Tap to record · {VIDEO_DURATION}s boomerang</Text>
        )}

      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  permissionScreen: {
    flex: 1,
    backgroundColor: colors.night,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 20,
  },
  permissionText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionBtn: {
    backgroundColor: colors.orange,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  permissionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  eventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(216,90,48,0.85)',
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    marginTop: 56,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: '#7CFF6B',
  },
  eventPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  recordingBanner: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    minWidth: 160,
    marginTop: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: '#FF3B30',
    alignSelf: 'center',
  },
  recordingText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  progressTrack: {
    width: 120,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
    borderRadius: 99,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.orange,
    borderWidth: 2,
  },
  cornerTL: {
    top: 100,
    left: 40,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: 100,
    right: 40,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: 20,
    left: 40,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBR: {
    bottom: 20,
    right: 40,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  zoomBar: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  zoomBtn: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 99,
  },
  zoomBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  zoomText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  zoomTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  bottomBar: {
    backgroundColor: '#111',
    paddingBottom: 32,
    paddingTop: 12,
  },
  modeTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 20,
  },
  modeTabActive: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    borderBottomWidth: 2,
    borderBottomColor: colors.orange,
    paddingBottom: 2,
  },
  modeTabInactive: {
    fontSize: 14,
    color: colors.stone,
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailText: {
    fontSize: 22,
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 99,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterBtnRecording: {
    borderColor: '#FF3B30',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 99,
    backgroundColor: colors.white,
  },
  shutterInnerVideo: {
    backgroundColor: '#FF3B30',
  },
  shutterInnerRecording: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
  },
  flipBtn: {
    width: 48,
    height: 48,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipBtnDisabled: {
    opacity: 0.3,
  },
  flipText: {
    fontSize: 20,
  },
  videoHint: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.stone,
    marginTop: 10,
  },
})