const express = require("express")
const http = require("http")

const app = express();
const server = http.createServer(app)

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
