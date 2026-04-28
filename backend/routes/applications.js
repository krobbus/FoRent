const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

router.get('/view', authenticateToken, async (req, res) => {
    const { userId, userRole } = req.query;
    try {
        let result;
        if (userRole === 'landlord') {
            result = await req.pool.query(`
                SELECT ra.* FROM rental_applications ra
                JOIN properties p ON ra.property_id = p.id
                JOIN landlords l ON p.landlord_id = l.id
                WHERE l.user_id = $1 ORDER BY ra.created_at DESC
            `, [userId]);
        } else {
            result = await req.pool.query(`
                SELECT ra.* FROM rental_applications ra
                JOIN tenants t ON ra.tenant_id = t.id
                WHERE t.user_id = $1 ORDER BY ra.created_at DESC
            `, [userId]);
        }
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { property_id, tenant_id, tenant_fullname, move_in_date, tenant_contact, tenant_email, lease_term, message, status } = req.body;
    try {
        const tenantResult = await req.pool.query(
            'SELECT id FROM tenants WHERE user_id = $1', [tenant_id]
        );
        if (tenantResult.rows.length === 0)
            return res.status(404).json({ error: "Tenant profile not found" });

        const actualTenantId = tenantResult.rows[0].id;
        const result = await req.pool.query(
            `INSERT INTO rental_applications (property_id, tenant_id, tenant_fullname, move_in_date, tenant_contact, tenant_email, lease_term, message, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [property_id, actualTenantId, tenant_fullname, move_in_date, tenant_contact, tenant_email, lease_term, message, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { move_in_date, tenant_contact, tenant_email, lease_term, message } = req.body;
    try {
        const result = await req.pool.query(
            `UPDATE rental_applications SET move_in_date=$1, tenant_contact=$2, tenant_email=$3, lease_term=$4, message=$5, updated_at=CURRENT_TIMESTAMP
             WHERE id=$6 RETURNING *`,
            [move_in_date, tenant_contact, tenant_email, lease_term, message, id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: "Application not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await req.pool.query(
            'DELETE FROM rental_applications WHERE id = $1 RETURNING *', [id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: "Application not found" });
        res.json({ message: "Application deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;