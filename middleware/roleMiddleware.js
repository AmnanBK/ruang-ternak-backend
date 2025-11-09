const { pool } = require('../config/db');

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const roleId = req.user.role_id;

      if (!roleId) {
        return res.status(401).json({ msg: 'Akses ditolak, peran tidak terdefinisi' });
      }

      const roleResult = await pool.query('SELECT role_name FROM roles WHERE role_id = $1', [roleId]);

      if (roleResult.rows.length === 0) {
        return res.status(401).json({ msg: 'Peran tidak valid' });
      }

      const roleName = roleResult.rows[0].role_name;

      if (allowedRoles.includes(roleName)) {
        next();
      } else {
        return res.status(403).json({ msg: 'Akses terlarang (Forbidden)' });
      }

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
};

module.exports = checkRole;
