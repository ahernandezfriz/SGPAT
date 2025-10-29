// backend/src/servicios/email.servicio.js
const nodemailer = require('nodemailer');

// 1. Configurar el "transporter" (el que envía)
// Leemos la configuración de las variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'localhost',
  port: process.env.EMAIL_PORT || 1025,
  secure: false, // false para MailHog y la mayoría de SMTP sin SSL
});

console.log(`Servicio de email configurado para ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);

/**
 * Envía un correo electrónico.
 * @param {object} opciones
 * @param {string} opciones.to - El destinatario (ej: 'juan.perez@area.cl')
 * @param {string} opciones.subject - Asunto del correo
 * @param {string} opciones.text - Cuerpo del correo en texto plano
 * @param {string} opciones.html - Cuerpo del correo en HTML
 */
const enviarEmail = async ({ to, subject, text, html }) => {
  const from = process.env.EMAIL_FROM || 'no-responder@sistema.cl';

  try {
    const info = await transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });

    console.log(`Correo enviado exitosamente a ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error al enviar correo a ${to}:`, error);
    // No lanzamos un error fatal, solo lo registramos
  }
};

module.exports = {
  enviarEmail,
};