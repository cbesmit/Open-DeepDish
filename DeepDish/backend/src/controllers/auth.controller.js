const jwt = require('jsonwebtoken');
const { z } = require('zod');

// Schema para validación de entrada
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const login = async (req, res) => {
  try {
    // Validar body
    const { username, password } = loginSchema.parse(req.body);

    // Credenciales esperadas desde ENV
    const expectedUser = process.env.APP_USER;
    const expectedPass = process.env.APP_PASSWORD;

    if (!expectedUser || !expectedPass) {
      console.error('CRITICAL: APP_USER or APP_PASSWORD not set in environment.');
      return res.status(500).json({ 
        error: true, 
        message: 'Server misconfiguration', 
        code: 'SYS_ERROR' 
      });
    }

    // Comparación estricta
    if (username !== expectedUser || password !== expectedPass) {
      return res.status(401).json({ 
        error: true, 
        message: 'Credenciales inválidas', 
        code: 'AUTH_FAILED' 
      });
    }

    // Generar JWT
    // Usamos APP_PASSWORD como secret por simplicidad según requerimientos, 
    // idealmente sería JWT_SECRET separado.
    const secret = process.env.JWT_SECRET || process.env.APP_PASSWORD;
    const expiresIn = 86400; // 24 horas

    const token = jwt.sign(
      { username: expectedUser, role: 'admin' },
      secret,
      { expiresIn }
    );

    return res.status(200).json({
      token,
      expiresIn
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: true, 
        message: 'Datos de entrada inválidos', 
        code: 'VAL_ERROR',
        details: error.errors 
      });
    }
    console.error(error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error interno del servidor', 
      code: 'INT_ERROR' 
    });
  }
};

module.exports = {
  login
};
