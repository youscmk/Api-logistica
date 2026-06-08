const jwt = require('jsonwebtoken');

const login = (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'username y password son requeridos' });
    }

    const AUTH_USER = process.env.AUTH_USER || 'profesor';
    const AUTH_PASS = process.env.AUTH_PASS || 'secret';
    const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

    if (username !== AUTH_USER || password !== AUTH_PASS) {
        return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });

    return res.json({ success: true, token });
};

module.exports = { login };
