const { pool } = require('../config/db');

exports.sendMessage = async (req, res) => {
  const senderId = req.user.id;
  const { recipient_id } = req.params;
  const { message_content } = req.body;

  if (!message_content) {
    return res.status(400).json({ msg: 'Isi pesan tidak boleh kosong' });
  }

  try {
    const userCheck = await pool.query('SELECT 1 FROM users WHERE user_id = $1', [recipient_id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Penerima tidak ditemukan' });
    }

    const newMessage = await pool.query(
      `INSERT INTO chat_messages (sender_id, recipient_id, message_content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [senderId, recipient_id, message_content]
    );

    res.status(201).json({
      msg: 'Pesan terkirim',
      message: newMessage.rows[0]
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getConversation = async (req, res) => {
  const userId = req.user.id;
  const { recipient_id } = req.params;

  try {
    const query = `
      SELECT * FROM chat_messages
      WHERE (sender_id = $1 AND recipient_id = $2)
         OR (sender_id = $2 AND recipient_id = $1)
      ORDER BY created_at ASC
    `;
    const messages = await pool.query(query, [userId, recipient_id]);

    await pool.query(
      `UPDATE chat_messages
       SET is_read = true
       WHERE sender_id = $1 AND recipient_id = $2 AND is_read = false`,
      [recipient_id, userId]
    );

    res.json(messages.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getConversationsList = async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      SELECT DISTINCT ON (u.user_id) u.user_id, u.full_name
      FROM users u
      JOIN chat_messages cm ON u.user_id = cm.sender_id OR u.user_id = cm.recipient_id
      WHERE (cm.sender_id = $1 OR cm.recipient_id = $1) AND u.user_id != $1
    `;
    const conversations = await pool.query(query, [userId]);

    res.json(conversations.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
