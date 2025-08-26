require("dotenv").config();
const express = require("express")
const http = require("http")
const pool = require("./db");
const cors = require("cors");
const { Server } = require("socket.io");
const socketAuthMiddleware = require("./middleware/socketAuth");

const authRoutes = require("./routes/auth");
const contactsRoutes = require("./routes/contacts");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/contacts", contactsRoutes);

const server = http.createServer(app)

app.get("/health", async (_req, res) => {
  try {
    const [_rows] = await pool.query("SELECT 1");
    res.json({
      status: "ok",
      uptime: process.uptime(),
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      uptime: process.uptime(),
      db: "not connected",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

const PORT = process.env.PORT || 3000;

const io = new Server(server, {
  cors: { origin: "*" },
});

const chatNamespace = io.of("/chat");

chatNamespace.use(socketAuthMiddleware);

chatNamespace.on("connection", async (socket) => {
  const user = socket.user;

  socket.join(`user_${user.id}`);

  socket.on("messages", async ({ toUserId }) => {
    if (!toUserId) return;

    const [messages] = await pool.query("select * from messages where (sender_id = ? and receiver_id = ?) or (sender_id = ? and receiver_id = ?) order by created_at", [user.id, toUserId, toUserId, user.id]);
    messages.forEach((msg) => { socket.emit("receive_message", { id: msg.id, text: msg.content, sender: msg.sender_id === user.id ? 'me' : 'other', time: msg.created_at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), delivered: msg.delivered }); });

    const ids = messages.filter(m => m.sender_id === toUserId).map((m) => m.id);
    if (ids.length > 0) {
      await pool.query("UPDATE messages SET delivered = 1 WHERE id IN (?)", [ids]);
    }

  })

  socket.on('seen', async ({ toUserId }) => {
    const [last_seen] = await pool.query("select last_seen, last_seen > date_sub(now(), interval 5 minute) as online from users where id = ?", [toUserId]);
    socket.emit("last_seen", { last_seen: new Date(last_seen[0].last_seen).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), online: last_seen[0].online })
  })

  socket.on("send_message", async ({ toUserId, content }) => {
    if (!toUserId || !content) return;

    try {
      const [result] = await pool.query(
        "INSERT INTO messages (sender_id, receiver_id, content, delivered) VALUES (?, ?, ?, 0)",
        [user.id, toUserId, content]
      );

      const msg = {
        id: result.insertId,
        sender_id: user.id,
        receiver_id: toUserId,
        content,
        created_at: new Date(),
      };

      const sockets = await chatNamespace.in(`user_${toUserId}`).fetchSockets();
      let delivered = 0
      if (sockets.length > 0) {
        chatNamespace.to(`user_${toUserId}`).emit("receive_message", { id: msg.id, text: msg.content, sender: 'other', time: msg.created_at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), delivered: 1 });

        delivered = 1
      }

      socket.emit("receive_message", { id: msg.id, text: msg.content, sender: msg.sender_id === user.id ? 'me' : 'other', time: msg.created_at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), delivered: delivered });

      if (delivered) {
        await pool.query("UPDATE messages SET delivered = 1 WHERE id = ?", [msg.id]);
      }
    } catch (err) {
      console.error(err);
      socket.emit("error", "Message could not be sent");
    }
  });

  socket.on("disconnect", async () => {
    await pool.query("UPDATE users SET last_seen = NOW() WHERE id = ?", [user.id]);
  });

  await pool.query("UPDATE users SET last_seen = NOW() WHERE id = ?", [user.id]);
});

server.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
