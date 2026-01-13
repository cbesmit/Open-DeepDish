const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Formato esperado: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: true, 
      message: 'Token no proporcionado', 
      code: 'AUTH_REQUIRED' 
    });
  }

  const secret = process.env.JWT_SECRET || process.env.APP_PASSWORD;

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: true, 
        message: 'Token inválido o expirado', 
        code: 'AUTH_INVALID' 
      });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
