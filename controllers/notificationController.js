const { pool } = require('../config/db');

exports.getMyNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(notifications.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const updateResult = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE notification_id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Notifikasi tidak ditemukan atau bukan milik Anda' });
    }

    res.json({
      msg: 'Notifikasi ditandai sebagai dibaca',
      notification: updateResult.rows[0]
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
