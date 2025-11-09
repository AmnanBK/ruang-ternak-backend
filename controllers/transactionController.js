const { pool } = require('../config/db');

exports.createTransaction = async (req, res) => {
  const { livestock_ids } = req.body; // Ekspektasi: array of IDs, cth: [1, 2, 5]
  const customerId = req.user.id;

  if (!livestock_ids || !Array.isArray(livestock_ids) || livestock_ids.length === 0) {
    return res.status(400).json({ msg: 'Harap berikan ID ternak dalam bentuk array' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let totalAmount = 0;
    const itemsToPurchase = [];

    for (const id of livestock_ids) {
      const livestock = await client.query(
        "SELECT price, status FROM livestock WHERE livestock_id = $1",
        [id]
      );

      if (livestock.rows.length === 0) {
        throw new Error(`Ternak dengan ID ${id} tidak ditemukan`);
      }

      if (livestock.rows[0].status !== 'available') {
        throw new Error(`Ternak "${livestock.rows[0].name || id}" sudah tidak tersedia`);
      }

      const price = parseFloat(livestock.rows[0].price);
      totalAmount += price;
      itemsToPurchase.push({
        livestock_id: id,
        price_at_purchase: price
      });
    }

    const newTransaction = await client.query(
      `INSERT INTO transactions (customer_id, total_amount, status)
       VALUES ($1, $2, 'pending')
       RETURNING transaction_id, status, created_at`,
      [customerId, totalAmount]
    );

    const transactionId = newTransaction.rows[0].transaction_id;

    for (const item of itemsToPurchase) {
      await client.query(
        `INSERT INTO transaction_items (transaction_id, livestock_id, price_at_purchase)
         VALUES ($1, $2, $3)`,
        [transactionId, item.livestock_id, item.price_at_purchase]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      msg: 'Transaksi berhasil dibuat, menunggu pembayaran',
      transaction: newTransaction.rows[0],
      items: itemsToPurchase,
      total_amount: totalAmount
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    if (err.message.startsWith('Ternak')) {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
};

exports.simulatePayment = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const txCheck = await client.query(
      `SELECT * FROM transactions
       WHERE transaction_id = $1 AND customer_id = $2`,
      [id, customerId]
    );

    if (txCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ msg: 'Transaksi tidak ditemukan atau bukan milik Anda' });
    }

    if (txCheck.rows[0].status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ msg: `Transaksi ini sudah ${txCheck.rows[0].status}, tidak bisa dibayar` });
    }

    await client.query(
      "UPDATE transactions SET status = 'success' WHERE transaction_id = $1",
      [id]
    );

    const items = await client.query(
      "SELECT livestock_id FROM transaction_items WHERE transaction_id = $1",
      [id]
    );

    const livestockIdsToUpdate = items.rows.map(item => item.livestock_id);

    await client.query(
      "UPDATE livestock SET status = 'sold' WHERE livestock_id = ANY($1::int[])",
      [livestockIdsToUpdate]
    );

    await client.query('COMMIT');

    res.json({
      msg: 'Pembayaran berhasil disimulasikan',
      transaction_id: id,
      new_status: 'success'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
};
