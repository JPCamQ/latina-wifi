const Comprobante = require('../models/Comprobante');
const Setting = require('../models/Setting');
const Customer = require('../models/Customer');
const { enviarEmailComprobanteVerificado } = require('../services/emailService');
const jwt = require('jsonwebtoken');

const crearComprobante = async (req, res) => {
  try {
    console.log('📨 Recibiendo comprobante WiFi...', req.body);
    console.log('📁 Archivo recibido:', req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Por favor adjunte la captura del comprobante de pago'
      });
    }

    // Obtener la tasa BCV actual de la base de datos
    const bcvSetting = await Setting.findOne({ where: { key: 'bcv_rate' } });
    const tasaBcvVal = bcvSetting ? parseFloat(bcvSetting.value) : 45.00;

    const { cedula, nombre, email, telefono, zona_wifi, banco_emisor, banco_receptor, referencia, plan_solicitado, monto_usd, fecha_pago, observaciones } = req.body;

    if (!cedula || !nombre || !email || !telefono || !banco_emisor || !banco_receptor || !referencia || !plan_solicitado || !monto_usd || !fecha_pago) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos obligatorios deben ser completados'
      });
    }

    // Detectar si hay un token de cliente autenticado
    let customerId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'latina_wifi_secret_key_123');
        if (decoded && decoded.role === 'customer') {
          // Verificar si el cliente realmente existe en la base de datos para evitar errores de clave foránea
          const clienteExiste = await Customer.findByPk(decoded.id);
          if (clienteExiste) {
            customerId = decoded.id;
          } else {
            console.log(`⚠️ Cliente con ID ${decoded.id} no existe en la base de datos (posible reseteo de BD).`);
          }
        }
      } catch (err) {
        console.log('⚠️ Token opcional de cliente inválido al enviar comprobante:', err.message);
      }
    }

    // Calcular monto en Bs
    const planMontoUsd = parseFloat(monto_usd);
    const planMontoBs = planMontoUsd * tasaBcvVal;

    const nuevoComprobante = await Comprobante.create({
      cliente_cedula: cedula,
      cliente_nombre: nombre,
      cliente_email: email,
      telefono,
      zona_wifi: zona_wifi || 'General',
      banco_emisor,
      banco_receptor,
      referencia,
      plan_solicitado,
      monto_usd: planMontoUsd,
      monto_bs: planMontoBs,
      tasa_bcv: tasaBcvVal,
      fecha_pago,
      observaciones,
      comprobante_img_url: '/uploads/comprobantes/' + req.file.filename,
      estado: 'pendiente',
      customerId: customerId
    });

    console.log('✅ Comprobante WiFi guardado en BD:', nuevoComprobante.id);

    res.status(201).json({
      success: true,
      message: 'Solicitud recibida correctamente. Verificaremos el pago y le enviaremos su PIN de acceso WiFi al correo registrado.',
      comprobanteId: nuevoComprobante.id
    });

  } catch (error) {
    console.error('❌ Error al crear comprobante:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    });
  }
};

const obtenerComprobantes = async (req, res) => {
  try {
    const comprobantes = await Comprobante.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: comprobantes
    });
  } catch (error) {
    console.error('Error al obtener comprobantes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener comprobantes'
    });
  }
};

const actualizarComprobante = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones, mensaje_cliente, notificar_cliente, pin_entregado } = req.body;

    console.log('📝 Datos recibidos para actualizar comprobante:', {
      id, estado, observaciones, mensaje_cliente, notificar_cliente, pin_entregado
    });

    const comprobanteId = parseInt(id, 10);
    const comprobante = await Comprobante.findByPk(comprobanteId);
    
    if (!comprobante) {
      const todos = await Comprobante.findAll();
      const idsExistentes = todos.map(c => c.id);
      console.log(`❌ Comprobante no encontrado. Buscado: ${comprobanteId}. Disponibles: [${idsExistentes.join(', ')}]`);
      return res.status(404).json({
        success: false,
        error: `Comprobante no encontrado (ID buscado: ${comprobanteId}). IDs registrados en el servidor: [${idsExistentes.join(', ')}]`
      });
    }

    // Preparar datos para actualización
    const datosActualizacion = {
      estado: estado || comprobante.estado,
      observaciones: observaciones || comprobante.observaciones
    };

    if (pin_entregado !== undefined) {
      datosActualizacion.pin_entregado = pin_entregado;
    }

    if (notificar_cliente === true) {
      datosActualizacion.notificado_cliente = true;
      datosActualizacion.mensaje_cliente = mensaje_cliente || '';
      datosActualizacion.fecha_notificacion = new Date();
    }

    await comprobante.update(datosActualizacion);
    console.log('✅ Comprobante actualizado:', datosActualizacion);

    // Enviar email de notificación si se aprueba el pago
    if (notificar_cliente === true && comprobante.cliente_email) {
      try {
        console.log('📧 Enviando email de confirmación y PIN al cliente:', comprobante.cliente_email);
        
        const resultadoEmail = await enviarEmailComprobanteVerificado({
          cliente_nombre: comprobante.cliente_nombre,
          cliente_email: comprobante.cliente_email,
          mensaje_personalizado: mensaje_cliente,
          referencia: comprobante.referencia,
          monto: comprobante.monto_usd,
          plan_solicitado: comprobante.plan_solicitado,
          pin_entregado: pin_entregado || comprobante.pin_entregado || 'No generado'
        });

        console.log('📧 Resultado email notificación:', resultadoEmail);
      } catch (emailError) {
        console.error('❌ Error enviando notificación al cliente:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Comprobante actualizado correctamente' + (notificar_cliente ? ' y cliente notificado' : ''),
      data: comprobante
    });

  } catch (error) {
    console.error('❌ Error al actualizar comprobante:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el comprobante: ' + error.message
    });
  }
};

module.exports = {
  crearComprobante,
  obtenerComprobantes,
  actualizarComprobante
};