const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { authenticateToken } = require('./middleware/auth');
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.USER,
  host: 'localhost',
  database: process.env.DB,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (userResult.rows.length === 0) return res.status(401).json({ message: 'Invalid Credentials' });

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid Credentials' });

        const token = jwt.sign(
            { id: user.id, role: user.role }, process.env.JWT_KEY, { expiresIn: '1h' }
        );

        res.json({
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/register', async (req, res) => {
    const {username, password, pin, role, firstName, middleName, lastName, extension, email, contactNumber} = req.body;
    const client = await pool.connect();

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
                `INSERT INTO landlords (user_id, first_name, middle_name, last_name, ext_name, email, contact_num) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [userId, firstName, middleName, lastName, extension, email, contactNumber]
            );
        } else if (role === 'tenant') {
            await client.query(
                `INSERT INTO tenants (user_id, first_name, middle_name, last_name, ext_name, email, contact_num) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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

app.get('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('SELECT id, username, role, created_at FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/tenants/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { first_name, email, currentPassword, newPassword } = req.body;

    try {
        const userResult = await pool.query('SELECT password_hash FROM users WHERE id = (SELECT user_id FROM tenants WHERE id = $1)', [id]);
        
        const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
        if (!isMatch) return res.status(401).json({ error: "Incorrect current password" });

        if (newPassword) {
            const newHash = await bcrypt.hash(newPassword, 10);
            await pool.query('UPDATE users SET password_hash = $1 WHERE id = (SELECT user_id FROM tenants WHERE id = $2)', [newHash, id]);
        }

        await pool.query(
            'UPDATE tenants SET first_name = $1, email = $2 WHERE id = $3',
            [first_name, email, id]
        );

        res.json({ message: "Update successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/landlords', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id as user_id, l.id as landlord_id, u.username, l.first_name, l.last_name, l.email 
            FROM users u
            INNER JOIN landlords l ON u.id = l.user_id
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/tenants', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id as user_id, t.id as tenant_id, u.username, t.first_name, t.last_name, t.email 
            FROM users u
            INNER JOIN tenants t ON u.id = t.user_id
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/landlords/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT l.*, u.role FROM landlords l JOIN users u ON l.user_id = u.id WHERE l.user_id = $1', 
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Profile not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/tenants/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT t.*, u.role FROM tenants t JOIN users u ON t.user_id = u.id WHERE t.user_id = $1', 
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Profile not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/landlords/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { first_name, middle_name, last_name, ext_name, email, contact_num } = req.body;
    try {
        const result = await pool.query(
            `UPDATE landlords SET first_name=$1, middle_name=$2, last_name=$3, ext_name=$4, email=$5, contact_num=$6
             WHERE user_id=$7 RETURNING *`,
            [first_name, middle_name, last_name, ext_name, email, contact_num, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Profile not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/tenants/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { first_name, middle_name, last_name, ext_name, email, contact_num } = req.body;
    try {
        const result = await pool.query(
            `UPDATE tenants SET first_name=$1, middle_name=$2, last_name=$3, ext_name=$4, email=$5, contact_num=$6
             WHERE user_id=$7 RETURNING *`,
            [first_name, middle_name, last_name, ext_name, email, contact_num, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Profile not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/properties', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching properties:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

app.get('/api/properties/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Property not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/properties/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, address, price, description, category, bedroom_count, kitchen_count, bathroom_count, other_rooms, other_rooms_count, max_occupants, pets_allowed, pet_count, amenities } = req.body;

    const otherRoomsString = Array.isArray(other_rooms) ? other_rooms.join(', ') : other_rooms;

    const amenityList = [];
    if (amenities.wifi) amenityList.push('Wifi');
    if (amenities.aircon) amenityList.push('Aircon');
    if (amenities.parking) amenityList.push('Parking');
    if (amenities.other_amenities) amenityList.push(amenities.other_amenities);

    try {
        const result = await pool.query(`
            UPDATE properties SET
                property_name = $1, address = $2, price = $3, description = $4, category = $5,
                bedroom_count = $6, kitchen_count = $7, bathroom_count = $8, other_rooms = $9,
                other_rooms_count = $10, max_occupants = $11, pets_allowed = $12, pet_count = $13, amenities = $14
            WHERE id = $15 RETURNING *`,
            [name, address, price, description, category, bedroom_count, kitchen_count, bathroom_count, otherRoomsString, other_rooms_count, max_occupants, pets_allowed, pet_count, amenityList, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Property not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/properties/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const checkLease = await pool.query('SELECT * FROM leases WHERE property_id = $1 AND is_active = true', [id]);
        
        if (checkLease.rows.length > 0) return res.status(400).json({ error: "Cannot delete property with an active lease." });

        await pool.query('DELETE FROM properties WHERE id = $1', [id]);
        res.json({ message: "Property deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/api/addproperties', authenticateToken, async (req, res) => {
    const { 
        name, address, price, category, landlord_id, description,
        bedroom_count, kitchen_count, bathroom_count, other_rooms, other_rooms_count,
        max_occupants, pets_allowed, pet_count, amenities
    } = req.body;

    const otherRoomsString = Array.isArray(other_rooms) ? other_rooms.join(', ') : other_rooms;

    const amenityList = [];
    if (amenities.wifi) amenityList.push('Wifi');
    if (amenities.aircon) amenityList.push('Aircon');
    if (amenities.parking) amenityList.push('Parking');
    if (amenities.other_amenities) amenityList.push(amenities.other_amenities);

    try {
        const query = `
            INSERT INTO properties (
                property_name, address, price, category, landlord_id, description,
                bedroom_count, kitchen_count, bathroom_count, other_rooms, other_rooms_count,
                max_occupants, pets_allowed, pet_count, amenities
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *;
        `;
        
        const values = [
            name, address, price, category, landlord_id, description,
            bedroom_count, kitchen_count, bathroom_count, otherRoomsString, other_rooms_count,
            max_occupants, pets_allowed, pet_count, amenityList
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Query Error:", err.message);
        res.status(500).json({ error: "Database error occurred" });
    }
});

app.post('/api/applications', authenticateToken, async (req, res) => {
    const { property_id, tenant_id, tenant_fullname, move_in_date, tenant_contact, tenant_email, lease_term, message, status } = req.body;
    try {
        const tenantResult = await pool.query(
            'SELECT id FROM tenants WHERE user_id = $1', [tenant_id]
        );

        if (tenantResult.rows.length === 0) return res.status(404).json({ error: "Tenant profile not found" });
        const actualTenantId = tenantResult.rows[0].id;
        
        const result = await pool.query(
            `INSERT INTO rental_applications 
                (property_id, tenant_id, tenant_fullname, move_in_date, tenant_contact, tenant_email, lease_term, message, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING *`,
            [property_id, actualTenantId, tenant_fullname, move_in_date, tenant_contact, tenant_email, lease_term, message, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/applications/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { move_in_date, tenant_contact, tenant_email, lease_term, message } = req.body;
    try {
        const result = await pool.query(
            `UPDATE rental_applications 
             SET move_in_date = $1, tenant_contact = $2, tenant_email = $3, lease_term = $4, message = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 RETURNING *`,
            [move_in_date, tenant_contact, tenant_email, lease_term, message, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Application not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/applications/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM rental_applications WHERE id = $1 RETURNING *', [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Application not found" });
        res.json({ message: "Application deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/viewapplications', authenticateToken, async (req, res) => {
    const { userId, userRole } = req.query;

    try {
        let result;

        if (userRole === 'landlord') {
            result = await pool.query(`
                SELECT ra.* 
                FROM rental_applications ra
                JOIN properties p ON ra.property_id = p.id
                JOIN landlords l ON p.landlord_id = l.id
                WHERE l.user_id = $1
                ORDER BY ra.created_at DESC
            `, [userId]);
        } else {
            result = await pool.query(`
                SELECT ra.*
                FROM rental_applications ra
                JOIN tenants t ON ra.tenant_id = t.id
                WHERE t.user_id = $1
                ORDER BY ra.created_at DESC
            `, [userId]);
        }

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching applications:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

app.listen(process.env.SERVER_PORT, () => console.log('Server running'));