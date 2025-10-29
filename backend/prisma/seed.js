// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper para hashear contraseñas
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function main() {
  console.log('Iniciando el sembrado (seeding) de la base de datos...');

  // --- 1. Crear las Áreas ---
  // Las guardamos en variables para usarlas al crear usuarios
  const areaInformatica = await prisma.area.upsert({
    where: { nombre: 'Informática' },
    update: {},
    create: { nombre: 'Informática' },
  });

  const areaAudio = await prisma.area.upsert({
    where: { nombre: 'Audiovisual' },
    update: {},
    create: { nombre: 'Audiovisual' },
  });

  const areaDiseno = await prisma.area.upsert({
    where: { nombre: 'Diseño/Comunicación' },
    update: {},
    create: { nombre: 'Diseño/Comunicación' },
  });

  const areaFormacion = await prisma.area.upsert({
    where: { nombre: 'Formación' },
    update: {},
    create: { nombre: 'Formación' },
  });

  console.log('Áreas creadas/actualizadas.');

  // --- 2. Hashear Contraseñas ---
  const passAdmin = await hashPassword('admin123'); // Pwd para el admin
  const passTest = await hashPassword('123456');  // Pwd para todos los demás

  // --- 3. Crear Usuarios de Prueba ---

  // Usuario ADMIN (Informática)
  await prisma.usuario.upsert({
    where: { email: 'admin@permisos.cl' },
    update: {},
    create: {
      email: 'admin@permisos.cl',
      nombreCompleto: 'Administrador del Sistema',
      password: passAdmin,
      rol: 'ADMIN',
      areaId: areaInformatica.id,
    },
  });

  // Usuario COORDINADOR (Informática)
  await prisma.usuario.upsert({
    where: { email: 'coordinador.info@permisos.cl' },
    update: {},
    create: {
      email: 'coordinador.info@permisos.cl',
      nombreCompleto: 'Coordinador Informática',
      password: passTest,
      rol: 'COORDINADOR',
      areaId: areaInformatica.id,
    },
  });

  // Usuario TRABAJADOR (Informática)
  await prisma.usuario.upsert({
    where: { email: 'trabajador.info@permisos.cl' },
    update: {},
    create: {
      email: 'trabajador.info@permisos.cl',
      nombreCompleto: 'Trabajador Informática',
      password: passTest,
      rol: 'TRABAJADOR',
      areaId: areaInformatica.id,
    },
  });

  // Usuario TRABAJADOR (Audiovisual)
  await prisma.usuario.upsert({
    where: { email: 'trabajador.audio@permisos.cl' },
    update: {},
    create: {
      email: 'trabajador.audio@permisos.cl',
      nombreCompleto: 'Trabajador Audiovisual',
      password: passTest,
      rol: 'TRABAJADOR',
      areaId: areaAudio.id,
    },
  });

  // Usuario COORDINADOR (Diseño)
  await prisma.usuario.upsert({
    where: { email: 'coordinador.diseno@permisos.cl' },
    update: {},
    create: {
      email: 'coordinador.diseno@permisos.cl',
      nombreCompleto: 'Coordinador Diseño',
      password: passTest,
      rol: 'COORDINADOR',
      areaId: areaDiseno.id,
    },
  });

  // Usuario TRABAJADOR (Formación)
  await prisma.usuario.upsert({
    where: { email: 'trabajador.formacion@permisos.cl' },
    update: {},
    create: {
      email: 'trabajador.formacion@permisos.cl',
      nombreCompleto: 'Trabajador Formación',
      password: passTest,
      rol: 'TRABAJADOR',
      areaId: areaFormacion.id,
    },
  });

  console.log('¡Usuarios creados/actualizados exitosamente!');
  console.log('Sembrado (seeding) completado.');
}

// Ejecutar el script y desconectar Prisma
main()
  .catch((e) => {
    console.error('Error durante el sembrado:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });