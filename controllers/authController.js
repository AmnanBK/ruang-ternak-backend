const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const { configDotenv } = require('dotenv');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    try {
        const { email, password, full_name, role_name } = req.body;

        if (!email || !password || !full_name || !role_name) {
            return res.status(400).json({ msg: 'Harap isi semua field' });
        }

        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ msg: 'Email sudah terdaftar' });
        }

        const roleResult = await pool.query('SELECT role_id FROM roles WHERE  role_name = $1', [role_name]);
        if (roleResult.rows.length === 0) {
            return res.status(400).json({ msg: 'Role tidak valid' });
        }
        const role_id = roleResult.rows[0].role_id;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash, full_name, role_id) VALUES ($1, $2, $3, $4) RETURNING user_id, email, full_name, role_id, status, created_at', [email, passwordHash, full_name, role_id]
        )

        res.status(201).json({
            msg: 'Registrasi berhasil, akun Anda menunggu verifikasi',
            user: newUser.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ msg: 'Harap isi email dan password'});
        }

        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ msg: 'Email atau password salah'});
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Email atau password salah'})
        }

        const payload = {
            user: {
                id: user.user_id,
                role_id: user.role_id,
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({
                    msg: 'Login berhasil',
                    token: token
                });
            }
        )
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
