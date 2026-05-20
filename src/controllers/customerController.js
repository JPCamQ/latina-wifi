const Customer = require('../models/Customer');
const Comprobante = require('../models/Comprobante');
const jwt = require('jsonwebtoken');

// Registro de Cliente
const registerCustomer = async (req, res) => {
  try {
    const { nombre, cedula, email, telefono, password } = req.body;

    if (!nombre || !cedula || !email || !telefono || !password) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son obligatorios'
      });
    }

    // Verificar si ya existe el correo o la cédula
    const existingEmail = await Customer.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: 'El correo electrónico ya está registrado'
      });
    }

    const existingCedula = await Customer.findOne({ where: { cedula } });
    if (existingCedula) {
      return res.status(400).json({
        success: false,
        error: 'La cédula de identidad ya está registrada'
      });
    }

    // Crear cliente
    const nuevoCliente = await Customer.create({
      nombre,
      cedula: cedula.toUpperCase(),
      email,
      telefono,
      password_hash: password
    });

    // Generar Token JWT
    const token = jwt.sign(
      { id: nuevoCliente.id, email: nuevoCliente.email, role: 'customer' },
      process.env.JWT_SECRET || 'latina_wifi_secret_key_123',
      { expiresIn: '30d' } // Expira en 30 días para comodidad del usuario
    );

    res.status(201).json({
      success: true,
      token,
      customer: {
        id: nuevoCliente.id,
        nombre: nuevoCliente.nombre,
        cedula: nuevoCliente.cedula,
        email: nuevoCliente.email,
        telefono: nuevoCliente.telefono
      }
    });

  } catch (error) {
    console.error('❌ Error al registrar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al procesar el registro'
    });
  }
};

// Login de Cliente
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'El correo electrónico y la contraseña son requeridos'
      });
    }

    const cliente = await Customer.findOne({ where: { email } });
    if (!cliente || !cliente.validPassword(password)) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar Token JWT
    const token = jwt.sign(
      { id: cliente.id, email: cliente.email, role: 'customer' },
      process.env.JWT_SECRET || 'latina_wifi_secret_key_123',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      customer: {
        id: cliente.id,
        nombre: cliente.nombre,
        cedula: cliente.cedula,
        email: cliente.email,
        telefono: cliente.telefono,
        banco_emisor_defecto: cliente.banco_emisor_defecto,
        telefono_pago_movil_defecto: cliente.telefono_pago_movil_defecto,
        cedula_pago_movil_defecto: cliente.cedula_pago_movil_defecto
      }
    });

  } catch (error) {
    console.error('❌ Error en login de cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al iniciar sesión'
    });
  }
};

// Obtener Perfil del Cliente
const getCustomerProfile = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Acceso denegado' });
    }

    const cliente = await Customer.findByPk(req.user.id);
    if (!cliente) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    }

    res.json({
      success: true,
      customer: {
        id: cliente.id,
        nombre: cliente.nombre,
        cedula: cliente.cedula,
        email: cliente.email,
        telefono: cliente.telefono,
        banco_emisor_defecto: cliente.banco_emisor_defecto,
        telefono_pago_movil_defecto: cliente.telefono_pago_movil_defecto,
        cedula_pago_movil_defecto: cliente.cedula_pago_movil_defecto
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ success: false, error: 'Error al obtener perfil' });
  }
};

// Actualizar Perfil y Métodos de Pago Guardados
const updateCustomerProfile = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Acceso denegado' });
    }

    const cliente = await Customer.findByPk(req.user.id);
    if (!cliente) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    }

    const { nombre, telefono, banco_emisor_defecto, telefono_pago_movil_defecto, cedula_pago_movil_defecto } = req.body;

    await cliente.update({
      nombre: nombre || cliente.nombre,
      telefono: telefono || cliente.telefono,
      banco_emisor_defecto: banco_emisor_defecto !== undefined ? banco_emisor_defecto : cliente.banco_emisor_defecto,
      telefono_pago_movil_defecto: telefono_pago_movil_defecto !== undefined ? telefono_pago_movil_defecto : cliente.telefono_pago_movil_defecto,
      cedula_pago_movil_defecto: cedula_pago_movil_defecto !== undefined ? cedula_pago_movil_defecto : cliente.cedula_pago_movil_defecto
    });

    res.json({
      success: true,
      message: 'Perfil y métodos de pago actualizados correctamente',
      customer: {
        id: cliente.id,
        nombre: cliente.nombre,
        cedula: cliente.cedula,
        email: cliente.email,
        telefono: cliente.telefono,
        banco_emisor_defecto: cliente.banco_emisor_defecto,
        telefono_pago_movil_defecto: cliente.telefono_pago_movil_defecto,
        cedula_pago_movil_defecto: cliente.cedula_pago_movil_defecto
      }
    });
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar perfil' });
  }
};

// Obtener Historial de Comprobantes del Cliente
const getCustomerComprobantes = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Acceso denegado' });
    }

    const comprobantes = await Comprobante.findAll({
      where: { customerId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: comprobantes
    });
  } catch (error) {
    console.error('❌ Error al obtener comprobantes del cliente:', error);
    res.status(500).json({ success: false, error: 'Error al obtener historial' });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerComprobantes
};
