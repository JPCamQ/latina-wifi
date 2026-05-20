// 📂 src/controllers/noticiasController.js - VERSIÓN CORREGIDA
const path = require('path');
const fs = require('fs');

// Cargar modelo de forma segura
let Noticia;
try {
  Noticia = require('../models/Noticia');
} catch (error) {
  console.error('❌ Error cargando modelo Noticia:', error);
}

// Clientes conectados para recibir notificaciones SSE (Server-Sent Events) en tiempo real
let sseClients = [];

function notificarClientes(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(c => {
    try {
      c.res.write(message);
    } catch (err) {
      console.error('Error enviando mensaje a cliente SSE:', err);
    }
  });
}

const NoticiasController = {
  
  // Crear nueva noticia
  async crearNoticia(req, res) {
    try {
      if (!Noticia) throw new Error('Modelo Noticia no disponible');
      
      const { titulo, contenido, autor, estado, tipo } = req.body;
      let imagen_url = null;

      if (req.file) {
        imagen_url = `/uploads/noticias/${req.file.filename}`;
      }

      const noticia = await Noticia.create({
        titulo,
        contenido,
        autor: autor || 'Administrador',
        imagen_url,
        estado: estado || 'publicada', // ✅ CORREGIDO: 'publicada' en lugar de 'activa'
        tipo: tipo || 'noticia',
        fecha_publicacion: new Date()
      });

      // Disparar notificación en tiempo real si está publicada
      if (noticia.estado === 'publicada') {
        notificarClientes({
          titulo: noticia.tipo === 'alerta' ? `⚠️ Alerta de Red: ${noticia.titulo}` : `📢 Novedad: ${noticia.titulo}`,
          contenido: noticia.contenido.substring(0, 100) + (noticia.contenido.length > 100 ? '...' : ''),
          tipo: noticia.tipo,
          url: `/noticias/${noticia.id}`
        });
      }

      res.json({
        success: true,
        message: 'Noticia creada exitosamente',
        data: noticia
      });
    } catch (error) {
      console.error('Error creando noticia:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor: ' + error.message
      });
    }
  },

  // Obtener todas las noticias (público)
  async obtenerNoticias(req, res) {
    try {
      if (!Noticia) throw new Error('Modelo Noticia no disponible');
      
      const noticias = await Noticia.findAll({
        where: { estado: 'publicada' }, // ✅ CORREGIDO: 'publicada' en lugar de 'activa'
        order: [['fecha_publicacion', 'DESC']]
      });

      res.json({
        success: true,
        data: noticias
      });
    } catch (error) {
      console.error('Error obteniendo noticias:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  // Obtener todas las noticias (admin - incluye inactivas)
  async obtenerTodasNoticias(req, res) {
    try {
      if (!Noticia) throw new Error('Modelo Noticia no disponible');
      
      const noticias = await Noticia.findAll({
        order: [['fecha_publicacion', 'DESC']]
      });

      res.json({
        success: true,
        data: noticias
      });
    } catch (error) {
      console.error('Error obteniendo noticias:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  // Obtener noticia por ID
  async obtenerNoticia(req, res) {
    try {
      if (!Noticia) throw new Error('Modelo Noticia no disponible');
      
      const { id } = req.params;
      const noticia = await Noticia.findByPk(id);

      if (!noticia) {
        return res.status(404).json({
          success: false,
          error: 'Noticia no encontrada'
        });
      }

      res.json({
        success: true,
        data: noticia
      });
    } catch (error) {
      console.error('Error obteniendo noticia:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  // Actualizar noticia
  async actualizarNoticia(req, res) {
    try {
      if (!Noticia) throw new Error('Modelo Noticia no disponible');
      
      const { id } = req.params;
      const { titulo, contenido, autor, estado, tipo } = req.body;
      
      const noticia = await Noticia.findByPk(id);
      
      if (!noticia) {
        return res.status(404).json({
          success: false,
          error: 'Noticia no encontrada'
        });
      }

      let imagen_url = noticia.imagen_url;
      if (req.file) {
        // Eliminar imagen anterior si existe
        if (noticia.imagen_url) {
          const oldImagePath = path.join(__dirname, '../../public', noticia.imagen_url);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        imagen_url = `/uploads/noticias/${req.file.filename}`;
      }

      await noticia.update({
        titulo: titulo || noticia.titulo,
        contenido: contenido || noticia.contenido,
        autor: autor || noticia.autor,
        estado: estado || noticia.estado,
        tipo: tipo || noticia.tipo,
        imagen_url
      });

      res.json({
        success: true,
        message: 'Noticia actualizada exitosamente',
        data: noticia
      });
    } catch (error) {
      console.error('Error actualizando noticia:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  // Eliminar noticia
  async eliminarNoticia(req, res) {
    try {
      if (!Noticia) throw new Error('Modelo Noticia no disponible');
      
      const { id } = req.params;
      
      const noticia = await Noticia.findByPk(id);
      
      if (!noticia) {
        return res.status(404).json({
          success: false,
          error: 'Noticia no encontrada'
        });
      }

      // Eliminar imagen si existe
      if (noticia.imagen_url) {
        const imagePath = path.join(__dirname, '../../public', noticia.imagen_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await noticia.destroy();

      res.json({
        success: true,
        message: 'Noticia eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando noticia:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  // Suscribir al cliente a Server-Sent Events (SSE) para notificaciones en tiempo real
  suscribirNotificaciones(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    sseClients.push(newClient);

    console.log(`🔔 Cliente suscrito a notificaciones SSE (${clientId}). Total: ${sseClients.length}`);

    // Enviar comentario para mantener activa la conexión
    const keepAlive = setInterval(() => {
      res.write(': keep-alive\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients = sseClients.filter(c => c.id !== clientId);
      console.log(`❌ Cliente desconectado de notificaciones SSE (${clientId}). Total: ${sseClients.length}`);
    });
  }
};

module.exports = NoticiasController;