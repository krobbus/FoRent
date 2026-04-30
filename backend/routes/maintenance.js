const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

router.get('/view', authenticateToken, async (req, res) => {
    const { userId, userRole } = req.query;

    try {
        let result;
        if (userRole === 'landlord'){
            result = await req.pool.query(`
                SELECT mr.* FROM maintennance_requests mr
                JOIN properties p ON mr.property_id = p.id
                JOIN landlords l ON mr.landlord_id = l.id
                WHERE l.user_id = $1 ORDER BY mr.request_date DESC
            `, [userId]);
        } else{
            result = await req.pool.query(`
                SELECT mr.* FROM maintennance_requests mr
                JOIN tenants t ON mr.tenant_id = t.id
                WHERE t.user_id = $1 ORDER BY mr.request_date DESC
            `, [userId]);
        }
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;