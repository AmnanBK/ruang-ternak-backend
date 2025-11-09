const { pool } = require('../config/db');

exports.createReview = async (req, res) => {
  const { livestock_id } = req.params;
  const customerId = req.user.id;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ msg: 'Rating harus antara 1 dan 5' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const purchaseCheckQuery = `
      SELECT t.transaction_id FROM transactions t
      JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
      WHERE t.customer_id = $1
        AND ti.livestock_id = $2
        AND t.status = 'success'
      LIMIT 1
    `;
    const purchaseResult = await client.query(purchaseCheckQuery, [customerId, livestock_id]);

    if (purchaseResult.rows.length === 0) {
      throw new Error('Akses terlarang: Anda hanya bisa me-review ternak yang sudah Anda beli');
    }

    const transactionId = purchaseResult.rows[0].transaction_id;

    const newReview = await client.query(
      `INSERT INTO reviews (livestock_id, customer_id, transaction_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [livestock_id, customerId, transactionId, rating, comment]
    );

    await client.query('COMMIT');
    res.status(201).json({
      msg: 'Ulasan berhasil ditambahkan',
      review: newReview.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    if (err.message.includes('Akses terlarang')) {
      return res.status(403).json({ msg: err.message });
    }
    if (err.code === '23505') {
      return res.status(400).json({ msg: 'Anda sudah memberikan ulasan untuk item ini' });
    }
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
};

exports.getReviewsForLivestock = async (req, res) => {
  const { livestock_id } = req.params;
  try {
    const query = `
      SELECT r.review_id, r.rating, r.comment, r.created_at, u.full_name AS customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.user_id
      WHERE r.livestock_id = $1
      ORDER BY r.created_at DESC
    `;
    const reviews = await pool.query(query, [livestock_id]);

    res.json(reviews.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
