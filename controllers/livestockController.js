const { pool } = require('../config/db');

exports.createLivestock = async (req, res) => {
  try {
    const { name, description, price, age_months, category, image_url } = req.body;

    const sellerId = req.user.id;

    if (!name || !price || !category) {
      return res.status(400).json({ msg: 'Harap isi nama, harga, dan kategori' });
    }

    const newLivestock = await pool.query(
      `INSERT INTO livestock
         (seller_id, name, description, price, age_months, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [sellerId, name, description, price, age_months, category, image_url]
    );

    res.status(201).json({
      msg: 'Data ternak berhasil ditambahkan',
      livestock: newLivestock.rows[0]
    });

  } catch (err) {
    console.error(err.message);
    if (err.code === '22P02' || err.message.includes('livestock_category')) {
      return res.status(400).json({ msg: 'Kategori ternak tidak valid. Gunakan: sapi, kambing, ayam, atau kuda.' });
    }
    res.status(500).send('Server Error');
  }
};

exports.getAllLivestock = async (req, res) => {
  try {
    const query = `
      SELECT
        l.livestock_id, l.name, l.price, l.category, l.image_url, l.status,
        sp.store_name, sp.store_location
      FROM livestock l
      LEFT JOIN seller_profiles sp ON l.seller_id = sp.user_id
      WHERE l.status = 'available'
      ORDER BY l.created_at DESC
    `;

    const allLivestock = await pool.query(query);

    res.json(allLivestock.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getLivestockById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        l.*,
        sp.store_name, sp.store_location, sp.phone_number, sp.profile_description
      FROM livestock l
      LEFT JOIN seller_profiles sp ON l.seller_id = sp.user_id
      WHERE l.livestock_id = $1
    `;

    const livestock = await pool.query(query, [id]);

    if (livestock.rows.length === 0) {
      return res.status(404).json({ msg: 'Data ternak tidak ditemukan' });
    }

    res.json(livestock.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateLivestock = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const livestockCheck = await pool.query(
      'SELECT seller_id FROM livestock WHERE livestock_id = $1',
      [id]
    );

    if (livestockCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Data ternak tidak ditemukan' });
    }

    if (livestockCheck.rows[0].seller_id !== sellerId) {
      return res.status(403).json({ msg: 'Akses terlarang: Anda bukan pemilik data ini' });
    }

    const { name, description, price, age_months, category, status, image_url } = req.body;

    const updateQuery = `
      UPDATE livestock SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        age_months = COALESCE($4, age_months),
        category = COALESCE($5, category),
        status = COALESCE($6, status),
        image_url = COALESCE($7, image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE livestock_id = $8
      RETURNING *
    `;

    const updatedLivestock = await pool.query(updateQuery, [
      name, description, price, age_months, category, status, image_url, id
    ]);

    res.json({
      msg: 'Data ternak berhasil diperbarui',
      livestock: updatedLivestock.rows[0]
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteLivestock = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const livestockCheck = await pool.query(
      'SELECT seller_id FROM livestock WHERE livestock_id = $1',
      [id]
    );

    if (livestockCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Data ternak tidak ditemukan' });
    }

    if (livestockCheck.rows[0].seller_id !== sellerId) {
      return res.status(403).json({ msg: 'Akses terlarang: Anda bukan pemilik data ini' });
    }

    await pool.query('DELETE FROM livestock WHERE livestock_id = $1', [id]);

    res.json({ msg: 'Data ternak berhasil dihapus' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
