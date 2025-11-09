const { pool } = require('../config/db');

exports.getMe = async (req, res) => {
    try {
        const userId = req.user.id;

        const query = 'SELECT u.user_id, u.email, u.full_name, u.status, u.created_at, r.role_name, sp.store_name, sp.store_location, sp.phone_number AS seller_phone, sp.profile_description, cp.shipping_address, cp.phone_number AS customer_phone FROM users u JOIN roles r ON u.role_id = r.role_id LEFT JOIN seller_profiles sp ON u.user_id = sp.user_id LEFT JOIN customer_profiles cp ON u.user_id = cp.user_id WHERE u.user_id = $1';

        const profileResult = await pool.query(query, [userId]);

        if (profileResult.rows.length === 0) {
            return res.status(404).json({ msg: 'Profil tidak ditemukan' });
        }

        res.json(profileResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

exports.updateMe = async (req, res) => {
  const userId = req.user.id;

  const {
    full_name,
    store_name,
    store_location,
    profile_description,
    shipping_address,
    phone_number
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userUpdateQuery = `
      UPDATE users
      SET full_name = COALESCE($1, full_name)
      WHERE user_id = $2
      RETURNING role_id
    `;
    const userResult = await client.query(userUpdateQuery, [full_name, userId]);

    const roleId = userResult.rows[0].role_id;

    const roleResult = await client.query('SELECT role_name FROM roles WHERE role_id = $1', [roleId]);
    const roleName = roleResult.rows[0].role_name;

    if (roleName === 'seller') {
      const sellerUpsertQuery = `
        INSERT INTO seller_profiles
          (user_id, store_name, store_location, profile_description, phone_number)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE SET
          store_name = COALESCE($2, seller_profiles.store_name),
          store_location = COALESCE($3, seller_profiles.store_location),
          profile_description = COALESCE($4, seller_profiles.profile_description),
          phone_number = COALESCE($5, seller_profiles.phone_number)
      `;
      await client.query(sellerUpsertQuery, [userId, store_name, store_location, profile_description, phone_number]);

    } else if (roleName === 'customer') {
      const customerUpsertQuery = `
        INSERT INTO customer_profiles
          (user_id, shipping_address, phone_number)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET
          shipping_address = COALESCE($2, customer_profiles.shipping_address),
          phone_number = COALESCE($3, customer_profiles.phone_number)
      `;
      await client.query(customerUpsertQuery, [userId, shipping_address, phone_number]);
    }

    await client.query('COMMIT');

    res.json({ msg: 'Profil berhasil diperbarui' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
};
