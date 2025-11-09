const { pool } = require('../config/db');

exports.getTransactionReport = async (req, res) => {
  try {
    const query = `
      SELECT
        t.transaction_id,
        t.status,
        t.total_amount,
        t.created_at,
        u.full_name AS customer_name,
        u.email AS customer_email,
        (SELECT COUNT(*) FROM transaction_items ti WHERE ti.transaction_id = t.transaction_id) AS total_items
      FROM transactions t
      JOIN users u ON t.customer_id = u.user_id
      ORDER BY t.created_at DESC
    `;

    const report = await pool.query(query);

    res.json(report.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getSecurityLogs = async (req, res) => {
  try {
    const query = `
      SELECT
        sl.log_id,
        sl.action,
        sl.ip_address,
        sl.details,
        sl.created_at,
        u.email AS user_email
      FROM security_logs sl
      LEFT JOIN users u ON sl.user_id = u.user_id
      ORDER BY sl.created_at DESC
      LIMIT 100 -- Batasi 100 log terbaru
    `;

    const logs = await pool.query(query);

    res.json(logs.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
