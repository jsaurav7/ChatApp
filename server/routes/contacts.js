const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/add", authMiddleware, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const [contactUser] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);

    if (contactUser.length === 0) {
      return res.status(404).json({ error: "User not on app" });
    }

    const contactUserId = contactUser[0].id;

    if (contactUserId === req.user.id) {
      return res.status(400).json({ error: "You cannot add yourself as a contact" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM contacts WHERE user_id = ? AND contact_user_id = ?",
      [req.user.id, contactUserId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Contact already added" });
    }

    await pool.query(
      "INSERT INTO contacts (user_id, contact_user_id) VALUES (?, ?)",
      [req.user.id, contactUserId]
    );

    res.status(201).json({ message: "Contact added successfully" });
  } catch (err) {
    console.error("Add contact error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/list", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         u.id, u.name, u.email, u.last_seen,
         (
           SELECT m.content 
           FROM messages m
           WHERE 
             (m.sender_id = u.id AND m.receiver_id = ?) OR 
             (m.sender_id = ? AND m.receiver_id = u.id)
           ORDER BY m.created_at DESC
           LIMIT 1
         ) AS last_message,
         (
           SELECT m.created_at 
           FROM messages m
           WHERE 
             (m.sender_id = u.id AND m.receiver_id = ?) OR 
             (m.sender_id = ? AND m.receiver_id = u.id)
           ORDER BY m.created_at DESC
           LIMIT 1
         ) AS last_message_time
       FROM contacts c
       JOIN users u ON c.contact_user_id = u.id
       WHERE c.user_id = ?`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Fetch contacts error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
