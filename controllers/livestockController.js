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
