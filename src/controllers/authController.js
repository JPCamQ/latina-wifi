const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    if (!user.validPassword(password)) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nombre_completo: user.nombre_completo
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = { login };