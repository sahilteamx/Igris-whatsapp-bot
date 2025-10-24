const { 
  default: makeWASocket, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion, 
  DisconnectReason, 
  usePairingCode 
} = require('@whiskeysockets/baileys')
const { join } = require("path")

async function startIgris() {
  const { state, saveCreds } = await useMultiFileAuthState(join(__dirname, "auth_info"))
  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({
    version,
    auth: state,
    browser: ["IgrisBot","Chrome","4.0"],    // identity (QR nahi chahiye)
  })

  // ===== PAIRING CODE BLOCK: (yahan apna number likho) =====
  if (!state.creds?.registered) {
    const phoneNumber = '918601600591'   // <-- Apna WhatsApp number likho (jaise 9199099... without +)
    const code = await usePairingCode(sock, phoneNumber)
    console.log('Pairing Code:', code)
  }
  // ========================================================

  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const msg = m.message.conversation || m.message.extendedTextMessage?.text || ""
    const owner = "sahilteamx"
    const botName = "Igris"
    if (msg.toLocaleLowerCase().includes("hello"))
      await sock.sendMessage(m.key.remoteJid, { text: `👋 Haan, main ${botName} bot hoon! Aapko kaise madad chahiye?` })
    if (msg.toLocaleLowerCase() === "help")
      await sock.sendMessage(m.key.remoteJid, { text: `*${botName} Bot Commands:*
1. hello
2. menu
3. owner
4. emojis` })
    if (msg.toLocaleLowerCase() === "menu")
      await sock.sendMessage(m.key.remoteJid, { text: `Menu List:
- hello
- help
- owner
- emojis` })
    if (msg.toLocaleLowerCase() === "owner")
      await sock.sendMessage(m.key.remoteJid, { text: `Bot Owner: ${owner}` })
    if (msg.toLocaleLowerCase() === "emojis")
      await sock.sendMessage(m.key.remoteJid, { text: `🤖😎👍🔥😜` })
  })

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update
    if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
      startIgris()
    } else if (connection === "open") {
      console.log("Igris WhatsApp Bot connected!")
    }
  })
}
startIgris()
