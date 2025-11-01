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
