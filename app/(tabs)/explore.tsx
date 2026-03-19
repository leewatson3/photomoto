import { StatusBar } from 'expo-status-bar'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../src/theme/colors'

const EVENTS = [
  { id: '1', name: 'Blankets & Wine Nairobi', date: 'Sat 29 Mar', venue: 'Ngong Racecourse', price: 'KES 1,500', shooters: 347, status: 'live' },
  { id: '2', name: 'Koroga Festival', date: 'Sun 30 Mar', venue: 'Arboretum', price: 'KES 800', shooters: 124, status: 'upcoming' },
  { id: '3', name: 'Afro Nation Nairobi', date: 'Sat 5 Apr', venue: 'KICC Grounds', price: 'KES 3,000', shooters: 0, status: 'upcoming' },
  { id: '4', name: 'Jazz in the Park', date: 'Sun 6 Apr', venue: 'Uhuru Gardens', price: 'Free', shooters: 0, status: 'upcoming' },
]

export default function EventsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Events</Text>
        <Text style={styles.headerSub}>Nairobi · This week</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {EVENTS.map((event) => (
          <TouchableOpacity key={event.id} style={styles.card}>

            <View style={styles.cardTop}>
              <View style={styles.cardLeft}>
                {event.status === 'live' && (
                  <View style={styles.livePill}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventMeta}>{event.date} · {event.venue}</Text>
              </View>
            </View>

            <View style={styles.cardBottom}>
              <View style={styles.statRow}>
                <Text style={styles.statText}>
                  {event.status === 'live'
                    ? `📸 ${event.shooters} shooting now`
                    : '🎟️ Tickets available'}
                </Text>
                <Text style={styles.priceText}>{event.price}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.joinBtn,
                  event.status === 'live' ? styles.joinBtnLive : styles.joinBtnUpcoming
                ]}
              >
                <Text style={styles.joinBtnText}>
                  {event.status === 'live' ? '🔥 Join & shoot' : '🎟️ Get tickets'}
                </Text>
              </TouchableOpacity>
            </View>

          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 16,
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
  list: {
    padding: 14,
    gap: 14,
  },
  card: {
    backgroundColor: colors.nightMid,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.nightLight,
  },
  cardTop: {
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.nightLight,
  },
  cardLeft: {
    gap: 6,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(216,90,48,0.2)',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 5,
    marginBottom: 4,
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
    color: colors.orange,
    letterSpacing: 1,
  },
  eventName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  eventMeta: {
    fontSize: 12,
    color: colors.stone,
  },
  cardBottom: {
    padding: 14,
    gap: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: colors.stone,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.orange,
  },
  joinBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinBtnLive: {
    backgroundColor: colors.orange,
  },
  joinBtnUpcoming: {
    backgroundColor: colors.green,
  },
  joinBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
})