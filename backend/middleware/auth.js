const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        if (err) {
            const message = err.name === 'TokenExpiredError' 
                ? 'Token expired' 
                : 'Invalid token';
            return res.status(403).json({ error: message });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };