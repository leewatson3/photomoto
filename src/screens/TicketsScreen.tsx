import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import colors from '../theme/colors'

const SCREEN_WIDTH = Dimensions.get('window').width

type TicketTier = {
  id: string
  name: string
  price: number
  description: string
  perks: string[]
  available: boolean
  soldOut?: boolean
}

type Screen = 'browse' | 'checkout' | 'stk' | 'success'

const EVENTS = [
  {
    id: '1',
    name: 'Blankets & Wine Nairobi',
    date: 'Sat 29 Mar 2026',
    venue: 'Ngong Racecourse',
    time: 'Doors 2:00 PM',
    status: 'live',
    tiers: [
      {
        id: 't1',
        name: 'Regular entry',
        price: 1500,
        description: 'General access · Food & drink available',
        perks: ['PhotoMoto feed access', 'Swipe & vote'],
        available: true,
      },
      {
        id: 't2',
        name: 'VIP',
        price: 4500,
        description: 'VIP lounge · Priority entry · Meet & greet',
        perks: ['PhotoMoto Pro for the night', 'HD downloads', 'Featured in highlights'],
        available: true,
      },
      {
        id: 't3',
        name: 'VVIP Table',
        price: 18000,
        description: 'Private table · 6 guests · Open bar',
        perks: ['Everything in VIP', 'Private table', 'Open bar'],
        available: false,
        soldOut: true,
      },
    ] as TicketTier[],
  },
  {
    id: '2',
    name: 'Koroga Festival',
    date: 'Sun 30 Mar 2026',
    venue: 'Arboretum Nairobi',
    time: 'Doors 12:00 PM',
    status: 'upcoming',
    tiers: [
      {
        id: 't4',
        name: 'Regular entry',
        price: 800,
        description: 'General access',
        perks: ['PhotoMoto feed access', 'Swipe & vote'],
        available: true,
      },
      {
        id: 't5',
        name: 'VIP',
        price: 2500,
        description: 'VIP lounge · Priority entry',
        perks: ['PhotoMoto Pro for the night', 'HD downloads'],
        available: true,
      },
    ] as TicketTier[],
  },
]

export default function TicketsScreen() {
  const [screen, setScreen] = useState<Screen>('browse')
  const [selectedEvent, setSelectedEvent] = useState(EVENTS[0])
  const [selectedTier, setSelectedTier] = useState<TicketTier>(EVENTS[0].tiers[0])
  const [qty, setQty] = useState(1)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [ticketRef, setTicketRef] = useState('')

  const total = selectedTier.price * qty + 30

  function selectTicket(event: typeof EVENTS[0], tier: TicketTier) {
    if (tier.soldOut) return
    setSelectedEvent(event)
    setSelectedTier(tier)
    setQty(1)
    setScreen('checkout')
  }

  async function confirmPayment() {
    if (!phone || phone.length < 9) {
      Alert.alert('Hold on', 'Please enter a valid Safaricom number.')
      return
    }
    setLoading(true)

    try {
      const response = await fetch(
        'https://lvhpjfgmqlehdqcqvbft.supabase.co/functions/v1/mpesa-stk',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            phone: phone,
            amount: total,
            reference: `PM-${selectedEvent.id}-${selectedTier.id}`,
          }),
        }
      )

      const data = await response.json()
      console.log('M-Pesa response:', JSON.stringify(data))

      if (data.success) {
        const ref = 'PM' + Math.random().toString(36).toUpperCase().slice(2, 8)
        setTicketRef(ref)
        setLoading(false)
        setScreen('success')
        Alert.alert(
          'Check your phone! 📱',
          'Enter your M-Pesa PIN to complete payment.'
        )
      } else {
        Alert.alert('Payment failed', data.error ?? 'Something went wrong. Try again.')
        setLoading(false)
      }

    } catch (e: any) {
      console.log('Payment error:', e.message)
      Alert.alert('Error', 'Could not connect to payment service. Try again.')
      setLoading(false)
    }
  }

  // ── BROWSE ───────────────────────────────────────────────
  if (screen === 'browse') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {EVENTS.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={styles.eventHeaderLeft}>
                {event.status === 'live' && (
                  <View style={styles.livePill}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventMeta}>{event.date} · {event.venue}</Text>
                <Text style={styles.eventMeta}>{event.time}</Text>
              </View>
            </View>
            {event.tiers.map((tier) => (
              <TouchableOpacity
                key={tier.id}
                style={[styles.tierRow, tier.soldOut && styles.tierRowSoldOut]}
                onPress={() => selectTicket(event, tier)}
                disabled={tier.soldOut}
              >
                <View style={styles.tierLeft}>
                  <Text style={[styles.tierName, tier.soldOut && styles.tierNameSoldOut]}>
                    {tier.name}
                  </Text>
                  <Text style={styles.tierDesc}>{tier.description}</Text>
                  <View style={styles.tierPerks}>
                    {tier.perks.slice(0, 2).map((perk, i) => (
                      <View key={i} style={styles.perkPill}>
                        <Text style={styles.perkText}>{perk}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.tierRight}>
                  {tier.soldOut ? (
                    <View style={styles.soldOutBadge}>
                      <Text style={styles.soldOutText}>Sold out</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.tierPrice}>KES {tier.price.toLocaleString()}</Text>
                      <View style={styles.buyBtn}>
                        <Text style={styles.buyBtnText}>Buy</Text>
                      </View>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    )
  }

  // ── CHECKOUT ─────────────────────────────────────────────
  if (screen === 'checkout') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backRow} onPress={() => setScreen('browse')}>
          <Ionicons name="chevron-back" size={20} color={colors.orange} />
          <Text style={styles.backText}>Back to events</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Select ticket</Text>

        {selectedEvent.tiers.filter(t => !t.soldOut).map((tier) => (
          <TouchableOpacity
            key={tier.id}
            style={[
              styles.selectTierCard,
              selectedTier.id === tier.id && styles.selectTierCardActive,
            ]}
            onPress={() => setSelectedTier(tier)}
          >
            <View style={styles.selectTierLeft}>
              <View style={[
                styles.radioOuter,
                selectedTier.id === tier.id && styles.radioOuterActive,
              ]}>
                {selectedTier.id === tier.id && <View style={styles.radioInner} />}
              </View>
              <View style={styles.selectTierInfo}>
                <Text style={styles.selectTierName}>{tier.name}</Text>
                <Text style={styles.selectTierDesc}>{tier.description}</Text>
                <View style={styles.tierPerks}>
                  {tier.perks.map((perk, i) => (
                    <View key={i} style={[
                      styles.perkPill,
                      selectedTier.id === tier.id && styles.perkPillActive,
                    ]}>
                      <Text style={[
                        styles.perkText,
                        selectedTier.id === tier.id && styles.perkTextActive,
                      ]}>{perk}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <Text style={[
              styles.selectTierPrice,
              selectedTier.id === tier.id && styles.selectTierPriceActive,
            ]}>
              KES {tier.price.toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>Quantity</Text>
          <View style={styles.qtyCtrl}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNum}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.min(10, q + 1))}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Total to pay</Text>
            <Text style={styles.totalFee}>Incl. KES 30 platform fee</Text>
          </View>
          <Text style={styles.totalAmount}>KES {total.toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.mpesaBtn} onPress={() => setScreen('stk')}>
          <View style={styles.mpesaLogo}>
            <Text style={styles.mpesaLogoText}>M</Text>
          </View>
          <Text style={styles.mpesaBtnText}>Pay with M-Pesa</Text>
        </TouchableOpacity>

        <Text style={styles.secureNote}>🔒 Secured by Safaricom Daraja API</Text>
      </ScrollView>
    )
  }

  // ── STK PUSH ─────────────────────────────────────────────
  if (screen === 'stk') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.backRow} onPress={() => setScreen('checkout')}>
            <Ionicons name="chevron-back" size={20} color={colors.orange} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.stkTop}>
            <View style={styles.stkIcon}>
              <Ionicons name="phone-portrait-outline" size={32} color={colors.green} />
            </View>
            <Text style={styles.stkTitle}>M-Pesa checkout</Text>
            <Text style={styles.stkSub}>Enter your Safaricom number</Text>
          </View>

          <View style={styles.phoneInputWrap}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixFlag}>🇰🇪</Text>
              <Text style={styles.phonePrefixCode}>+254</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="7XX XXX XXX"
              placeholderTextColor={colors.stone}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Event</Text>
              <Text style={styles.summaryVal}>{selectedEvent.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ticket</Text>
              <Text style={styles.summaryVal}>{selectedTier.name} × {qty}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryVal}>{selectedEvent.date}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalVal}>KES {total.toLocaleString()}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.stkBtn, loading && styles.stkBtnDisabled]}
            onPress={confirmPayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.stkBtnText}>Send M-Pesa request</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.stkNote}>
            You'll receive a pop-up on your phone.{'\n'}
            Enter your M-Pesa PIN to complete payment.
          </Text>
        </ScrollView>
      </View>
    )
  }

  // ── SUCCESS ───────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.successHeader}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={32} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Ticket confirmed! 🔥</Text>
          <Text style={styles.successSub}>
            KES {total.toLocaleString()} paid via M-Pesa · Ref: {ticketRef}
          </Text>
        </View>

        <View style={styles.ticketCard}>
          <View style={styles.ticketCardTop}>
            <Text style={styles.ticketEventName}>{selectedEvent.name}</Text>
            <Text style={styles.ticketTierName}>{selectedTier.name} · {qty} ticket{qty > 1 ? 's' : ''}</Text>
          </View>

          <View style={styles.ticketDetails}>
            <View style={styles.ticketDetailItem}>
              <Text style={styles.ticketDetailLabel}>Date</Text>
              <Text style={styles.ticketDetailVal}>{selectedEvent.date}</Text>
            </View>
            <View style={styles.ticketDetailItem}>
              <Text style={styles.ticketDetailLabel}>Doors</Text>
              <Text style={styles.ticketDetailVal}>{selectedEvent.time}</Text>
            </View>
            <View style={styles.ticketDetailItem}>
              <Text style={styles.ticketDetailLabel}>Venue</Text>
              <Text style={styles.ticketDetailVal}>{selectedEvent.venue}</Text>
            </View>
            <View style={styles.ticketDetailItem}>
              <Text style={styles.ticketDetailLabel}>Ref</Text>
              <Text style={styles.ticketDetailVal}>#{ticketRef}</Text>
            </View>
          </View>

          <View style={styles.perforation}>
            <View style={styles.perforationCircleLeft} />
            <View style={styles.perforationLine} />
            <View style={styles.perforationCircleRight} />
          </View>

          <View style={styles.qrArea}>
            <QRCode
              value={`PHOTOMOTO:${ticketRef}:${selectedEvent.id}:${selectedTier.id}`}
              size={140}
              color={colors.nightMid}
              backgroundColor={colors.dust}
            />
            <Text style={styles.qrLabel}>Scan at the gate · also joins you to the photo feed</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.openAppBtn}
          onPress={() => setScreen('browse')}
        >
          <Text style={styles.openAppBtnText}>View more events</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  backText: {
    fontSize: 14,
    color: colors.orange,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 14,
  },
  eventCard: {
    backgroundColor: colors.nightMid,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  eventHeader: {
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.nightLight,
  },
  eventHeaderLeft: {
    gap: 4,
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
    width: 5,
    height: 5,
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
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.nightLight,
    gap: 10,
  },
  tierRowSoldOut: {
    opacity: 0.4,
  },
  tierLeft: {
    flex: 1,
    gap: 4,
  },
  tierName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  tierNameSoldOut: {
    color: colors.stone,
  },
  tierDesc: {
    fontSize: 12,
    color: colors.stone,
  },
  tierPerks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 4,
  },
  perkPill: {
    backgroundColor: colors.nightLight,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  perkPillActive: {
    backgroundColor: 'rgba(216,90,48,0.2)',
  },
  perkText: {
    fontSize: 10,
    color: colors.stone,
  },
  perkTextActive: {
    color: colors.orange,
  },
  tierRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  tierPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.orange,
  },
  buyBtn: {
    backgroundColor: colors.orange,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  buyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  soldOutBadge: {
    backgroundColor: colors.nightLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  soldOutText: {
    fontSize: 11,
    color: colors.stone,
  },
  selectTierCard: {
    backgroundColor: colors.nightMid,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: colors.nightLight,
    gap: 10,
  },
  selectTierCardActive: {
    borderColor: colors.orange,
    backgroundColor: 'rgba(216,90,48,0.08)',
  },
  selectTierLeft: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  radioOuterActive: {
    borderColor: colors.orange,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: colors.orange,
  },
  selectTierInfo: {
    flex: 1,
    gap: 3,
  },
  selectTierName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  selectTierDesc: {
    fontSize: 12,
    color: colors.stone,
  },
  selectTierPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.stone,
    flexShrink: 0,
  },
  selectTierPriceActive: {
    color: colors.orange,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.nightLight,
    marginVertical: 4,
  },
  qtyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  qtyCtrl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.nightLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    color: colors.orange,
    fontWeight: '500',
  },
  qtyNum: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    minWidth: 24,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 13,
    color: colors.stone,
  },
  totalFee: {
    fontSize: 11,
    color: colors.nightLight,
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  mpesaBtn: {
    backgroundColor: colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  mpesaLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mpesaLogoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.green,
  },
  mpesaBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  secureNote: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.stone,
  },
  stkTop: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  stkIcon: {
    width: 64,
    height: 64,
    borderRadius: 99,
    backgroundColor: 'rgba(0,166,81,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stkTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  stkSub: {
    fontSize: 13,
    color: colors.stone,
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.nightMid,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.nightLight,
    marginBottom: 14,
    overflow: 'hidden',
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 0.5,
    borderRightColor: colors.nightLight,
  },
  phonePrefixFlag: {
    fontSize: 16,
  },
  phonePrefixCode: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.white,
  },
  summaryCard: {
    backgroundColor: colors.nightMid,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.stone,
  },
  summaryVal: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  summaryTotal: {
    borderTopWidth: 0.5,
    borderTopColor: colors.nightLight,
    paddingTop: 8,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  summaryTotalVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.orange,
  },
  stkBtn: {
    backgroundColor: colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  stkBtnDisabled: {
    opacity: 0.6,
  },
  stkBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  stkNote: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.stone,
    lineHeight: 20,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 99,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
  },
  successSub: {
    fontSize: 12,
    color: colors.stone,
    textAlign: 'center',
  },
  ticketCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  ticketCardTop: {
    backgroundColor: colors.orange,
    padding: 18,
    gap: 4,
  },
  ticketEventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  ticketTierName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  ticketDetails: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ticketDetailItem: {
    width: '45%',
    gap: 2,
  },
  ticketDetailLabel: {
    fontSize: 10,
    color: colors.stone,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ticketDetailVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.nightMid,
  },
  perforation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -1,
  },
  perforationCircleLeft: {
    width: 20,
    height: 20,
    borderRadius: 99,
    backgroundColor: colors.night,
    marginLeft: -10,
  },
  perforationLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.dustMid,
  },
  perforationCircleRight: {
    width: 20,
    height: 20,
    borderRadius: 99,
    backgroundColor: colors.night,
    marginRight: -10,
  },
  qrArea: {
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  qrLabel: {
    fontSize: 11,
    color: colors.stone,
    textAlign: 'center',
  },
  openAppBtn: {
    backgroundColor: colors.orange,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  openAppBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
})