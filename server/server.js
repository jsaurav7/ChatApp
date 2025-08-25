require("dotenv").config();
const express = require("express")
const http = require("http")
const pool = require("./db");

const authRoutes = require("./routes/auth");
const contactsRoutes = require("./routes/contacts");

const app = express();
app.use(express.json());

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

server.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
