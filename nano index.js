const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys')
const { join } = require("path")

async function startIgris() {
  const { state, saveCreds } = await useMultiFileAuthState(join(__dirname, "auth_info"))
  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
  })

  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const msg = m.message.conversation || m.message.extendedTextMessage?.text || ""
    if (msg.toLocaleLowerCase().includes("hello")) {
      await sock.sendMessage(m.key.remoteJid, { text: "👋 Haan, main Igris bot hoon! Kaise madad karu?" })
    }
    if (msg == 'menu') {
      await sock.sendMessage(m.key.remoteJid, { text: "1. Info 🙏
2. Emojis 😊
3. Help 📚
Reply ka number bhejein." })
    }
    if (msg == '2') {
      await sock.sendMessage(m.key.remoteJid, { text: "Igris ke fav emojis: 🤖😎👍🔥" })
    }
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
