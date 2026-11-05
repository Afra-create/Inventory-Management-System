const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "ims_jwt_secret_token_key_2026";

const fetchUser = (req, res, next) => {
    // Check Authorization header or auth-token header
    const authHeader = req.header('Authorization') || req.header('auth-token');
    if (!authHeader) {
        return res.status(401).json({ error: "Access denied. Please log in with a valid token." });
    }

    try {
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
    }
};

module.exports = { fetchUser, JWT_SECRET };

