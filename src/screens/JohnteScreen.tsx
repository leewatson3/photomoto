import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator, Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import colors from '../theme/colors'

const SCREEN_WIDTH = Dimensions.get('window').width

type Message = {
  id: string
  role: 'johnte' | 'user'
  text: string
  time: string
}

const QUICK_REPLIES = [
  '🎵 Events this weekend?',
  '🎟️ My tickets',
  '📸 How to upload shotis',
  '🔥 What is Moto?',
  '🗺️ Navigate the app',
]

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const WELCOME: Message = {
  id: '0',
  role: 'johnte',
  text: "Sema! 👋 Mimi ni Johnte, your PhotoMoto guide.\n\nNikusaidie na nini leo? Ask me about events, tickets, shotis — chochote!",
  time: now(),
}

function getJohnteReply(msg: string): string {
  if (msg.includes('event') || msg.includes('weekend') || msg.includes('gani')) {
    return "Poa! This weekend tuna:\n\n🎵 Blankets & Wine — Sat 29 Mar, Ngong Racecourse, KES 1,500\n\n🎶 Koroga Festival — Sun 30 Mar, Arboretum, KES 800\n\nUnataka ticket ya which one? 🎟️"
  }
  if (msg.includes('ticket') || msg.includes('buy') || msg.includes('nunua')) {
    return "Fiti! Tickets ziko kwa Events tab 🎟️\n\nTap Events → chagua event → select tier yako → Pay na M-Pesa. Rahisi sana! 💚"
  }
  if (msg.includes('upload') || msg.includes('shoti') || msg.includes('photo') || msg.includes('picha')) {
    return "Maze ni easy! 📸\n\n1. Tap Shoot tab chini\n2. Point camera yako\n3. Tap shutter button\n4. Add caption yako\n5. Tap 'Post to event' 🔥\n\nShoti yako itaonekana kwa feed mara moja!"
  }
  if (msg.includes('moto') || msg.includes('swipe') || msg.includes('review')) {
    return "Moto ni 🔥 — means you love the shoti!\n\nKwa Review tab, swipe RIGHT kwa shotis unazopenda (Moto!), swipe LEFT kwa unapenda skip.\n\nTop shotis zinaenda kwa Highlights reel — mob votes decide! 🏆"
  }
  if (msg.includes('navigate') || msg.includes('help') || msg.includes('app') || msg.includes('how')) {
    return "PhotoMoto ina tabs 4 chini:\n\n🏠 Feed — see all shotis from events\n📸 Shoot — take your own shotis\n🎟️ Events — buy tickets\n❤️ Review — swipe to vote\n\nProfile yako iko top right — tap circle yako! 👆"
  }
  if (msg.includes('highlight') || msg.includes('reel') || msg.includes('top')) {
    return "Highlights reel inashow top shotis from events — ranked by mob votes! 🏆\n\nTap circles za stories kwa Feed screen ku-access highlights. Auto-plays kama Instagram stories!"
  }
  if (msg.includes('mpesa') || msg.includes('pay') || msg.includes('lipa')) {
    return "M-Pesa payment ni rahisi sana! 💚\n\n1. Chagua ticket yako\n2. Enter Safaricom number yako\n3. Pata STK push kwa simu\n4. Enter PIN yako\n5. Ticket confirmed! QR code itakuja mara moja 🎟️"
  }
  if (msg.includes('hujambo') || msg.includes('sema') || msg.includes('niaje') || msg.includes('hello') || msg.includes('hi')) {
    return "Sema sema! 👋 Niko fiti, wewe je?\n\nNikusaidie na nini leo? Events, tickets, shotis — just ask! 🔥"
  }
  if (msg.includes('asante') || msg.includes('thanks') || msg.includes('thank')) {
    return "Poa sana! 🙌 Ukihitaji msaada wowote, niko hapa. PhotoMoto moto daima! 🔥"
  }
  if (msg.includes('profile') || msg.includes('account') || msg.includes('akaunti')) {
    return "Profile yako iko top right — tap orange circle yenye initials zako! 👆\n\nUnaona shotis zako, moto votes, na events uliohudhuria. Unaweza pia logout kutoka hapo."
  }
  if (msg.includes('camera') || msg.includes('video') || msg.includes('record')) {
    return "Camera ina modes tatu! 🎬\n\n📸 Photo — one tap, instant shoti\n🎥 Video — 3 second boomerang\n💥 Burst — multiple shots\n\nPinch kwa zoom, tap 🔄 ku-flip camera!"
  }
  if (msg.includes('feed') || msg.includes('scroll') || msg.includes('see')) {
    return "Feed inashow shotis zote kutoka event ya sasa! 🏠\n\nScroll chini kuona zaidi. Tap ❤️ ku-like, 💾 ku-save, ↗️ ku-share.\n\nStories circles kwa top zinaenda kwa highlights!"
  }

  const defaults = [
    "Maze, swali zuri! 🤔 Lakini bado najifunza. Jaribu kuniuliza kuhusu events, tickets, au shotis — hapo niko fiti! 💪",
    "Poa! Siwezi kujibu hiyo sasa hivi, lakini nikisaidiwa na events, tickets na shotis — niko 100%! 🔥",
    "Eeh maze! Hiyo ni ngumu kidogo. Try kuniuliza jinsi ya upload shoti au buy ticket — hapo naweza kusaidia! 😄",
    "Sawa sawa! Kwa sasa ninajua kuhusu PhotoMoto tu — events, tickets, shotis na navigation. Niulize kitu kuhusu hivyo! 🎵",
  ]
  return defaults[Math.floor(Math.random() * defaults.length)]
}

export default function JohnteScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  }, [messages])

  async function sendMessage(text?: string) {
    const msg = text ?? input.trim()
    if (!msg) return
    setInput('')

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: msg,
      time: now(),
    }

    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    await new Promise(resolve => setTimeout(resolve, 800))

    const reply = getJohnteReply(msg.toLowerCase())

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'johnte',
      text: reply,
      time: now(),
    }])

    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >

      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>J</Text>
            </View>
          </View>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        <Text style={styles.heroName}>Johnte</Text>
        <Text style={styles.heroSub}>Your PhotoMoto AI guide · Speaks Sheng 🇰🇪</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, index) => {
          const isJohnte = msg.role === 'johnte'
          const prevMsg = messages[index - 1]
          const showAvatar = isJohnte && (!prevMsg || prevMsg.role !== 'johnte')

          return (
            <View key={msg.id} style={styles.messageGroup}>
              <View style={[
                styles.messageRow,
                !isJohnte && styles.messageRowUser,
              ]}>
                {isJohnte && (
                  <View style={[styles.msgAvatar, !showAvatar && styles.msgAvatarHidden]}>
                    {showAvatar && <Text style={styles.msgAvatarText}>J</Text>}
                  </View>
                )}
                <View style={[
                  styles.bubble,
                  isJohnte ? styles.bubbleJohnte : styles.bubbleUser,
                ]}>
                  <Text style={[
                    styles.bubbleText,
                    !isJohnte && styles.bubbleTextUser,
                  ]}>
                    {msg.text}
                  </Text>
                </View>
              </View>
              <Text style={[
                styles.msgTime,
                !isJohnte && styles.msgTimeUser,
              ]}>
                {msg.time}
              </Text>
            </View>
          )
        })}

        {loading && (
          <View style={styles.messageGroup}>
            <View style={styles.messageRow}>
              <View style={styles.msgAvatar}>
                <Text style={styles.msgAvatarText}>J</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleJohnte, styles.bubbleTyping]}>
                <View style={styles.typingWrap}>
                  <ActivityIndicator size="small" color={colors.stone} />
                  <Text style={styles.typingText}>Johnte anaandika...</Text>
                </View>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickReplies}
        style={styles.quickRepliesWrap}
      >
        {QUICK_REPLIES.map((q, i) => (
          <TouchableOpacity
            key={i}
            style={styles.quickReply}
            onPress={() => sendMessage(q)}
          >
            <Text style={styles.quickReplyText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Uliza Johnte chochote..."
            placeholderTextColor={colors.stone}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: colors.nightMid,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.nightLight,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 99,
    backgroundColor: colors.orange,
    opacity: 0.06,
    top: -60,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: colors.orange,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 99,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(124,255,107,0.15)',
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: '#7CFF6B',
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7CFF6B',
  },
  heroName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 3,
  },
  heroSub: {
    fontSize: 12,
    color: colors.stone,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
    gap: 4,
  },
  messageGroup: {
    marginBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 99,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  msgAvatarHidden: {
    backgroundColor: 'transparent',
  },
  msgAvatarText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.white,
  },
  bubble: {
    maxWidth: SCREEN_WIDTH * 0.72,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleJohnte: {
    backgroundColor: colors.nightMid,
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.nightLight,
  },
  bubbleUser: {
    backgroundColor: colors.orange,
    borderBottomRightRadius: 4,
  },
  bubbleTyping: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bubbleText: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: colors.white,
  },
  msgTime: {
    fontSize: 10,
    color: colors.nightLight,
    marginTop: 4,
    marginLeft: 36,
  },
  msgTimeUser: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: 4,
  },
  typingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: colors.stone,
  },
  quickRepliesWrap: {
    backgroundColor: colors.night,
    borderTopWidth: 0.5,
    borderTopColor: colors.nightLight,
    maxHeight: 52,
  },
  quickReplies: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  quickReply: {
    backgroundColor: colors.nightMid,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 0.5,
    borderColor: colors.nightLight,
  },
  quickReplyText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingBottom: 16,
    gap: 10,
    backgroundColor: colors.nightMid,
    borderTopWidth: 0.5,
    borderTopColor: colors.nightLight,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.night,
    borderRadius: 22,
    borderWidth: 0.5,
    borderColor: colors.nightLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    color: colors.white,
    maxHeight: 100,
    padding: 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 99,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.nightLight,
  },
})