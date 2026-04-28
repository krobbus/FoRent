const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userResult = await req.pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0)
            return res.status(401).json({ message: 'Invalid Credentials' });

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid Credentials' });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/register', async (req, res) => {
    const { username, password, pin, role, firstName, middleName, lastName, extension, email, contactNumber } = req.body;
    const client = await req.pool.connect();
    try {
        await client.query('BEGIN');
        const hashedPassword = await bcrypt.hash(password, 10);
        const userResult = await client.query(
            'INSERT INTO users (username, password_hash, pin, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [username, hashedPassword, pin, role]
        );
        const userId = userResult.rows[0].id;

        if (role === 'landlord') {
            await client.query(
                `INSERT INTO landlords (user_id, first_name, middle_name, last_name, ext_name, email, contact_num) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [userId, firstName, middleName, lastName, extension, email, contactNumber]
            );
        } else if (role === 'tenant') {
            await client.query(
                `INSERT INTO tenants (user_id, first_name, middle_name, last_name, ext_name, email, contact_num) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [userId, firstName, middleName, lastName, extension, email, contactNumber]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ id: userId, username, role });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Registration Error:", err.stack);
        res.status(500).json({ error: "Failed to register user" });
    } finally {
        client.release();
    }
});

module.exports = router;