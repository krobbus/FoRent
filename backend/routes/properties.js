const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const result = await req.pool.query(`
            SELECT p.*,
                t.first_name AS tenant_first_name,
                t.last_name AS tenant_last_name,
                t.ext_name AS tenant_ext_name
            FROM properties p
            LEFT JOIN tenants t ON p.tenant_id = t.user_id
            ORDER BY p.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Properties fetch error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.query('SELECT * FROM properties WHERE id = $1', [id]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: "Property not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { name, address, price, category, landlord_id, description, bedroom_count, kitchen_count, bathroom_count, other_rooms, other_rooms_count, max_occupants, pets_allowed, pet_count, amenities } = req.body;
    const otherRoomsString = Array.isArray(other_rooms) ? other_rooms.join(', ') : other_rooms;
    const amenityList = [];
    if (amenities.wifi) amenityList.push('Wifi');
    if (amenities.aircon) amenityList.push('Aircon');
    if (amenities.parking) amenityList.push('Parking');
    if (amenities.other_amenities) amenityList.push(amenities.other_amenities);

    try {
        const result = await req.pool.query(
            `INSERT INTO properties (property_name, address, price, category, landlord_id, description, bedroom_count, kitchen_count, bathroom_count, other_rooms, other_rooms_count, max_occupants, pets_allowed, pet_count, amenities, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'available') RETURNING *`,
            [name, address, price, category, landlord_id, description, bedroom_count, kitchen_count, bathroom_count, otherRoomsString, other_rooms_count, max_occupants, pets_allowed, pet_count, amenityList]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error occurred" });
    }
});

router.patch('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, address, price, description, category, bedroom_count, kitchen_count, bathroom_count, other_rooms, other_rooms_count, max_occupants, pets_allowed, pet_count, amenities } = req.body;
    const otherRoomsString = Array.isArray(other_rooms) ? other_rooms.join(', ') : other_rooms;
    const amenityList = [];
    if (amenities.wifi) amenityList.push('Wifi');
    if (amenities.aircon) amenityList.push('Aircon');
    if (amenities.parking) amenityList.push('Parking');
    if (amenities.other_amenities) amenityList.push(amenities.other_amenities);

    try {
        const result = await req.pool.query(
            `UPDATE properties SET property_name=$1, address=$2, price=$3, description=$4, category=$5,
             bedroom_count=$6, kitchen_count=$7, bathroom_count=$8, other_rooms=$9, other_rooms_count=$10,
             max_occupants=$11, pets_allowed=$12, pet_count=$13, amenities=$14 WHERE id=$15 RETURNING *`,
            [name, address, price, description, category, bedroom_count, kitchen_count, bathroom_count, otherRoomsString, other_rooms_count, max_occupants, pets_allowed, pet_count, amenityList, id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: "Property not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const checkLease = await req.pool.query(
            'SELECT * FROM leases WHERE property_id = $1 AND is_active = true', [id]
        );
        if (checkLease.rows.length > 0)
            return res.status(400).json({ error: "Cannot delete property with an active lease." });

        await req.pool.query('DELETE FROM properties WHERE id = $1', [id]);
        res.json({ message: "Property deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;