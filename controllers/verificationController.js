const { pool } = require('../config/db');

exports.uploadDocument = async (req, res) => {
  const sellerId = req.user.id;
  const { type, file_url } = req.body;

  if (!type || !file_url) {
    return res.status(400).json({ msg: 'Harap isi Tipe Dokumen dan URL File' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const newDocument = await client.query(
      `INSERT INTO verification_documents (user_id, type, file_url, status)
       VALUES ($1, $2, $3, 'submitted')
       RETURNING *`,
      [sellerId, type, file_url]
    );

    const logAction = 'document_upload_submitted';
    await client.query(
      `INSERT INTO security_logs (user_id, action, details)
       VALUES ($1, $2, $3)`,
      [sellerId, logAction, `Tipe: ${type}, Dokumen ID: ${newDocument.rows[0].document_id}`]
    );

    await client.query(
      "UPDATE users SET status = 'pending' WHERE user_id = $1",
      [sellerId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      msg: 'Dokumen berhasil diunggah, menunggu verifikasi Admin. Status akun Anda kini pending.',
      document: newDocument.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    if (err.message.includes('document_type')) {
      return res.status(400).json({ msg: "Tipe dokumen tidak valid. Gunakan: 'ktp', 'siup', 'photo_kandang', atau 'other'." });
    }
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
};

exports.getPendingVerifications = async (req, res) => {
  try {
    const query = `
      SELECT
        vd.document_id, vd.type, vd.file_url, vd.status, vd.uploaded_at,
        u.user_id, u.full_name, u.email
      FROM verification_documents vd
      JOIN users u ON vd.user_id = u.user_id
      WHERE vd.status = 'submitted'
      ORDER BY vd.uploaded_at ASC
    `;
    const documents = await pool.query(query);

    res.json(documents.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.reviewVerification = async (req, res) => {
  const { doc_id } = req.params;
  const { new_status } = req.body;
  const adminId = req.user.id;

  if (!new_status || (new_status !== 'approved' && new_status !== 'rejected')) {
    return res.status(400).json({ msg: "Status baru harus 'approved' atau 'rejected'" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const docUpdate = await client.query(
      `UPDATE verification_documents
       SET status = $1
       WHERE document_id = $2 AND status = 'submitted'
       RETURNING user_id, type`,
      [new_status, doc_id]
    );

    if (docUpdate.rows.length === 0) {
      throw new Error('Dokumen tidak ditemukan atau sudah di-review');
    }

    const { user_id: sellerId, type } = docUpdate.rows[0];

    if (new_status === 'approved') {
      await client.query(
        "UPDATE users SET status = 'active' WHERE user_id = $1",
        [sellerId]
      );
    }

    const logAction = 'verification_reviewed';
    await client.query(
      `INSERT INTO security_logs (user_id, action, details)
       VALUES ($1, $2, $3)`,
      [adminId, logAction, `Admin ${adminId} me-review DocID ${doc_id} menjadi ${new_status} untuk User ${sellerId}`]
    );

    const message = `Dokumen verifikasi Anda (Tipe: ${type}) telah di-${new_status}.`;
    await client.query(
      `INSERT INTO notifications (user_id, message, type, related_id)
       VALUES ($1, $2, 'system', $3)`,
      [sellerId, message, doc_id]
    );

    await client.query('COMMIT');
    res.json({ msg: `Dokumen ${doc_id} berhasil di-${new_status}` });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    if (err.message.includes('Dokumen')) {
      return res.status(404).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
};
