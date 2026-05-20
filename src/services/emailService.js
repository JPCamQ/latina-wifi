const nodemailer = require('nodemailer');

// Configurar el transporter de Nodemailer
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    secure: true,
    tls: {
        rejectUnauthorized: false
    },
    debug: true
});

// Función para verificar configuración de email
const verifyEmailConfig = async () => {
    try {
        console.log('🔧 Verificando configuración de email...');
        console.log('📧 Email user:', process.env.EMAIL_USER ? '✅ Configurado' : '❌ No configurado');
        console.log('🔑 Email pass:', process.env.EMAIL_PASS ? '✅ Configurado' : '❌ No configurado');
        
        if (!process.env.EMAIL_USER) {
            console.log('❌ EMAIL_USER no está configurado en el archivo .env');
            return { success: false, error: 'EMAIL_USER no configurado' };
        }
        
        if (!process.env.EMAIL_PASS) {
            console.log('❌ EMAIL_PASS no está configurado en el archivo .env');
            return { success: false, error: 'EMAIL_PASS no configurado' };
        }

        console.log('✅ Verificando conexión con servidor de email...');
        await transporter.verify();
        console.log('✅ Servidor de email configurado correctamente');
        return { success: true, message: 'Email configurado correctamente' };
        
    } catch (error) {
        console.error('❌ Error configurando email:', error.message);
        return { success: false, error: error.message };
    }
};

// Plantilla para confirmación de ticket abierto (cliente)
const getTicketAbiertoTemplate = (nombre, idTicket, asunto) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
                .ticket-badge { display: inline-block; padding: 5px 10px; background: #e74c3c; color: white; border-radius: 3px; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Latina WiFi Camaguán</h1>
                    <p>Reporte de Soporte Técnico Recibido</p>
                </div>
                <div class="content">
                    <h2>Hola ${nombre},</h2>
                    <p>Hemos recibido correctamente tu reporte técnico sobre <strong>"${asunto}"</strong>. Se ha generado un ticket de soporte para tu caso:</p>
                    
                    <p style="text-align: center;">
                        <span class="ticket-badge">Ticket #${idTicket}</span>
                    </p>
                    
                    <p>Nuestro equipo de soporte técnico se encuentra trabajando en tu solicitud. Te enviaremos una respuesta a este correo tan pronto como sea posible (tiempo estimado menor a 2 horas).</p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    
                    <h3>Detalles de contacto de soporte:</h3>
                    <ul>
                        <li>📞 Teléfono de soporte: 0424-359-4340</li>
                        <li>📍 Oficina: Casco Central, Camaguán</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>&copy; 2026 Latina TV Dos CA. Todos los derechos reservados.</p>
                    <p>Servicio de Latina WiFi en Camaguán y La Paraita</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Plantilla para respuesta de ticket al cliente
const getRespuestaTicketTemplate = (nombre, idTicket, asuntoOriginal, respuesta, administrador) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; border: 1px solid #ddd; }
                .response-box { background: white; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0; border-radius: 0 4px 4px 0; }
                .original-msg { background: #f1f1f1; padding: 10px; font-size: 13px; color: #555; border-radius: 4px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📺 Latina WiFi Camaguán</h1>
                    <p>Respuesta a tu Ticket de Soporte #${idTicket}</p>
                </div>
                <div class="content">
                    <h2>¡Hola ${nombre}!</h2>
                    <p>El equipo de soporte ha respondido a tu ticket de soporte:</p>
                    
                    <div class="original-msg">
                        <strong>Tu consulta original (${asuntoOriginal}):</strong>
                    </div>

                    <div class="response-box">
                        <strong>Respuesta del equipo técnico:</strong><br>
                        <p style="white-space: pre-line; margin-top: 5px;">${respuesta}</p>
                        <br>
                        <small>Atentamente,<br><strong>${administrador}</strong></small>
                    </div>

                    <p>Si el problema persiste, puedes volver a contactarnos respondiendo a este correo o abriendo un nuevo reporte.</p>
                </div>
                <div class="footer">
                    <p>Este es un mensaje automatizado de Latina WiFi Camaguán.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Plantilla para PIN WiFi (comprobante verificado)
const getPinWifiTemplate = (datos) => {
    const { cliente_nombre, plan_solicitado, monto, referencia, pin_entregado, mensaje_personalizado } = datos;
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f37021 0%, #0072bc 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #fdfdfd; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #eee; }
                .pin-box { background: #f37021; color: white; padding: 15px; text-align: center; font-size: 26px; font-weight: bold; letter-spacing: 3px; border-radius: 8px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .details { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0; font-size: 14px; }
                .badge { background: #28a745; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
                .instruction { font-size: 13px; color: #666; background: #e8f4fd; padding: 10px; border-left: 4px solid #0072bc; border-radius: 0 4px 4px 0; }
                .footer { text-align: center; margin-top: 20px; color: #999; font-size: 11px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📺 Latina WiFi Camaguán</h1>
                    <p>¡Tu Pago ha sido Aprobado!</p>
                </div>
                <div class="content">
                    <h2>¡Hola ${cliente_nombre}!</h2>
                    <p>Nos complace informarte que hemos verificado tu pago correctamente. Tu plan de WiFi ha sido activado.</p>
                    
                    <p style="margin-bottom: 5px;">Tu PIN de acceso de navegación es:</p>
                    <div class="pin-box">
                        ${pin_entregado}
                    </div>

                    <div class="instruction">
                        <strong>¿Cómo conectarse?</strong><br>
                        1. Conéctate a la red WiFi <strong>"LATINA_WIFI_CAMAGUAN"</strong>.<br>
                        2. Cuando aparezca el portal de inicio de sesión, introduce el PIN anterior.<br>
                        3. ¡Listo! Ya estás navegando con alta velocidad.
                    </div>

                    <div class="details">
                        <strong>Detalles de la Transacción:</strong><br>
                        • Plan contratado: <strong>${plan_solicitado}</strong><br>
                        • Monto validado: <strong>$${monto}</strong><br>
                        • Referencia: <strong>${referencia}</strong><br>
                        • Estado: <span class="badge">APROBADO</span>
                    </div>

                    ${mensaje_personalizado ? `
                    <div style="background: #fff8f2; padding: 15px; border-left: 4px solid #f37021; margin: 15px 0; border-radius: 0 4px 4px 0;">
                        <strong>Mensaje del administrador:</strong><br>
                        <em>"${mensaje_personalizado}"</em>
                    </div>
                    ` : ''}

                    <p>¡Gracias por elegir Latina WiFi! Que disfrutes de tu navegación.</p>
                </div>
                <div class="footer">
                    <p>Latina TV Dos CA - Servicio de Conectividad Prepago en Camaguán</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Enviar email de confirmación y PIN al cliente
const enviarEmailComprobanteVerificado = async (datos) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: datos.cliente_email,
            subject: '✅ Tu PIN de WiFi está listo - Latina WiFi Camaguán',
            html: getPinWifiTemplate(datos)
        };

        const result = await transporter.sendMail(mailOptions);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error enviando email de verificación y PIN:', error);
        return { success: false, error: error.message };
    }
};

// Enviar email de respuesta a ticket
const enviarEmailRespuestaContacto = async (datos) => {
    try {
        const { cliente_nombre, cliente_email, asunto_original, respuesta, administrador, idTicket } = datos;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cliente_email,
            subject: `📧 Ticket de Soporte #${idTicket || 'S/N'} - Respuesta de Latina WiFi`,
            html: getRespuestaTicketTemplate(cliente_nombre, idTicket || 'S/N', asunto_original, respuesta, administrador)
        };

        const result = await transporter.sendMail(mailOptions);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error enviando email de respuesta a ticket:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    verifyEmailConfig,
    enviarEmailComprobanteVerificado,
    enviarEmailRespuestaContacto
};