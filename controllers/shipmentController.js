
const { pool } = require('../config/db');

const checkSellerOwnership = async (sellerId, transactionId) => {
  const query = `
    SELECT 1 FROM transaction_items ti
    JOIN livestock l ON ti.livestock_id = l.livestock_id
    WHERE ti.transaction_id = $1 AND l.seller_id = $2
  `;
  const result = await pool.query(query, [transactionId, sellerId]);
  return result.rows.length > 0;
};

exports.createOrUpdateShipment = async (req, res) => {
  const { id } = req.params;
  const sellerId = req.user.id;
  const { logistics_name, tracking_number, estimated_delivery_date } = req.body;

  if (!logistics_name || !tracking_number) {
    return res.status(400).json({ msg: 'Harap isi nama logistik dan nomor resi' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const tx = await client.query('SELECT * FROM transactions WHERE transaction_id = $1', [id]);
    if (tx.rows.length === 0) {
      throw new Error('Transaksi tidak ditemukan');
    }
    if (tx.rows[0].status !== 'success') {
      throw new Error(`Pengiriman hanya bisa dibuat untuk transaksi 'success'`);
    }

    const isOwner = await checkSellerOwnership(sellerId, id);
    if (!isOwner) {
      throw new Error('Akses terlarang: Anda tidak memiliki item di transaksi ini');
    }

    const upsertQuery = `
      INSERT INTO shipments
        (transaction_id, logistics_name, tracking_number, estimated_delivery_date, status)
      VALUES ($1, $2, $3, $4, 'shipped')
      ON CONFLICT (transaction_id) DO UPDATE SET
        logistics_name = EXCLUDED.logistics_name,
        tracking_number = EXCLUDED.tracking_number,
        estimated_delivery_date = EXCLUDED.estimated_delivery_date,
        status = 'shipped',
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const shipmentResult = await client.query(upsertQuery, [id, logistics_name, tracking_number, estimated_delivery_date]);

    // 4. Buat Notifikasi untuk Customer
    const customerId = tx.rows[0].customer_id;
    const message = `Pesanan Anda (ID: ${id}) telah dikirim dengan ${logistics_name}! No. Resi: ${tracking_number}`;

    await client.query(
      `INSERT INTO notifications (user_id, message, type, related_id)
       VALUES ($1, $2, 'shipping', $3)`,
      [customerId, message, shipmentResult.rows[0].shipment_id]
    );

    await client.query('COMMIT');
    res.json({
      msg: 'Data pengiriman berhasil disimpan dan notifikasi terkirim',
      shipment: shipmentResult.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    if (err.message.includes('Akses') || err.message.includes('Transaksi')) {
      return res.status(403).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
};

exports.getShipment = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  try {
    const tx = await pool.query(
      'SELECT 1 FROM transactions WHERE transaction_id = $1 AND customer_id = $2',
      [id, customerId]
    );
    if (tx.rows.length === 0) {
      return res.status(403).json({ msg: 'Akses terlarang: Ini bukan transaksi Anda' });
    }

    const shipment = await pool.query(
      'SELECT * FROM shipments WHERE transaction_id = $1',
      [id]
    );

    if (shipment.rows.length === 0) {
      return res.status(404).json({ msg: 'Data pengiriman belum tersedia untuk transaksi ini' });
    }

    res.json(shipment.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
