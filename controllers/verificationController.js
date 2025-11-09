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
