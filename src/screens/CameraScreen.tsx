import { useState } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../theme/colors'

export default function CameraScreen() {
  const [caption, setCaption] = useState('')

  return (
    <View style={styles.container}>

      {/* Viewfinder */}
      <View style={styles.viewfinder}>
        <Text style={styles.viewfinderText}>📸</Text>
        <Text style={styles.viewfinderSub}>Camera coming soon</Text>

        {/* Corner brackets */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
      </View>

      {/* Event pill */}
      <View style={styles.eventPill}>
        <View style={styles.liveDot} />
        <Text style={styles.eventPillText}>Blankets & Wine · 347 shooting</Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>

        {/* Mode tabs */}
        <View style={styles.modeTabs}>
          <Text style={styles.modeTabInactive}>Video</Text>
          <Text style={styles.modeTabActive}>Photo</Text>
          <Text style={styles.modeTabInactive}>Burst</Text>
        </View>

        {/* Shutter row */}
        <View style={styles.shutterRow}>

          {/* Thumbnail */}
          <View style={styles.thumbnail}>
            <Text style={styles.thumbnailText}>🖼️</Text>
          </View>

          {/* Shutter button */}
          <TouchableOpacity
            style={styles.shutterBtn}
            onPress={() => Alert.alert('📸 Shoti taken!', 'Camera integration coming next.')}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          {/* Flip button */}
          <TouchableOpacity style={styles.flipBtn}>
            <Text style={styles.flipText}>🔄</Text>
          </TouchableOpacity>

        </View>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  viewfinder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  viewfinderText: {
    fontSize: 64,
    marginBottom: 12,
  },
  viewfinderSub: {
    fontSize: 14,
    color: colors.stone,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.orange,
    borderWidth: 2,
  },
  cornerTL: {
    top: 40,
    left: 40,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: 40,
    right: 40,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: 40,
    left: 40,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBR: {
    bottom: 40,
    right: 40,
    borderLeftWidth: 0,
    borderTopWidth: 0,
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
    marginBottom: 12,
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
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 99,
    backgroundColor: colors.white,
  },
  flipBtn: {
    width: 48,
    height: 48,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    fontSize: 20,
  },
})