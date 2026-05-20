const Ticket = require('../models/Ticket');
const { enviarEmailRespuestaContacto } = require('../services/emailService');

// Crear nuevo ticket (público)
exports.crearTicket = async (req, res) => {
  try {
    const { nombre, telefono, email, zona_wifi, asunto, mensaje } = req.body;

    console.log('🎫 Datos recibidos del formulario de ticket:', { 
      nombre, telefono, email, zona_wifi, asunto 
    });

    if (!nombre || !telefono || !email || !zona_wifi || !asunto || !mensaje) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son obligatorios'
      });
    }

    const nuevoTicket = await Ticket.create({
      cliente_nombre: nombre,
      cliente_email: email,
      telefono,
      zona_wifi,
      asunto,
      mensaje,
      estado: 'abierto'
    });

    console.log('✅ Ticket guardado en BD con ID:', nuevoTicket.id);

    // Enviar emails de confirmación en segundo plano
    // Para simplificar, reutilizaremos el servicio de email enviando una confirmación
    // Más adelante personalizaremos la plantilla si es necesario
    try {
      enviarEmailRespuestaContacto({
        cliente_nombre: nombre,
        cliente_email: email,
        asunto_original: `Reporte de Soporte: ${asunto} (Ticket #${nuevoTicket.id})`,
        respuesta: 'Hemos recibido tu reporte técnico. Nuestro equipo de soporte está revisando tu caso y nos pondremos en contacto contigo a la brevedad posible.',
        administrador: 'Soporte Técnico de Latina WiFi'
      }).then(resEmail => {
        console.log('📧 Confirmación de ticket enviada a cliente:', resEmail.success ? '✅' : '❌');
      });
    } catch (err) {
      console.error('❌ Error enviando email de confirmación:', err);
    }

    res.status(201).json({
      success: true,
      message: 'Tu reporte de soporte ha sido recibido correctamente. Tu número de ticket es #' + nuevoTicket.id + '. Verificaremos tu caso y te contactaremos por correo.',
      ticketId: nuevoTicket.id
    });

  } catch (error) {
    console.error('❌ Error al crear ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al procesar el reporte'
    });
  }
};

// Obtener todos los tickets (admin)
exports.obtenerTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('❌ Error al obtener tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los tickets de soporte'
    });
  }
};

// Actualizar ticket (admin)
exports.actualizarTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones, respuesta_cliente, notificar_cliente } = req.body;

    console.log('📝 Actualizando ticket:', {
      id, estado, observaciones, respuesta_cliente, notificar_cliente
    });

    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket no encontrado'
      });
    }

    const datosActualizacion = {
      estado: estado || ticket.estado,
      observaciones: observaciones || ticket.observaciones
    };

    if (notificar_cliente === true && respuesta_cliente) {
      datosActualizacion.respuesta_cliente = respuesta_cliente;
      datosActualizacion.fecha_respuesta = new Date();
    }

    await ticket.update(datosActualizacion);

    if (notificar_cliente === true && respuesta_cliente && ticket.cliente_email) {
      try {
        console.log('📧 Enviando respuesta del ticket al cliente:', ticket.cliente_email);
        
        await enviarEmailRespuestaContacto({
          cliente_nombre: ticket.cliente_nombre,
          cliente_email: ticket.cliente_email,
          asunto_original: `${ticket.asunto} (Ticket #${ticket.id})`,
          respuesta: respuesta_cliente,
          administrador: 'Soporte Técnico de Latina WiFi'
        });
        
        console.log('📧 Respuesta enviada correctamente al correo');
      } catch (emailError) {
        console.error('❌ Error enviando email de respuesta:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Ticket actualizado correctamente' + (notificar_cliente ? ' y cliente respondido por correo.' : ''),
      data: ticket
    });

  } catch (error) {
    console.error('❌ Error al actualizar ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el ticket: ' + error.message
    });
  }
};

// Obtener estadísticas de tickets (admin)
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const total = await Ticket.count();
    const abierto = await Ticket.count({ where: { estado: 'abierto' } });
    const en_proceso = await Ticket.count({ where: { estado: 'en_proceso' } });
    const resuelto = await Ticket.count({ where: { estado: 'resuelto' } });

    res.json({
      success: true,
      data: {
        total,
        abierto,
        en_proceso,
        resuelto
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas de soporte'
    });
  }
};
