# Sistema de Gestión de Permisos (SGP)

Este es un sistema web completo para la gestión de solicitudes de permisos y teletrabajo, construido con Node.js, React y Docker.

## 🚀 Características Principales

* **Autenticación:** Sistema de Login basado en JWT (JSON Web Tokens).
* **Gestión de Roles:**
    * **Trabajador:** Puede crear solicitudes (Teletrabajo o Administrativo) y ver su historial.
    * **Coordinador:** Puede ver todas las solicitudes del personal de su área.
    * **Administrador:** Control total. Puede ver todas las solicitudes, aprobarlas, rechazarlas, y gestionar usuarios.
* **Gestión de Usuarios (CRUD):** El Administrador puede crear, editar y eliminar usuarios, asignándoles roles y áreas.
* **Notificaciones por Correo:** Envío automático de email al Coordinador del área cuando un Administrador aprueba una solicitud (utiliza **MailHog** para desarrollo).
* **Exportación a PDF:** El Administrador puede descargar un comprobante en PDF de cualquier solicitud aprobada, el cual incluye los detalles de la autorización ("firma digital").
* **Entorno Dockerizado:** Todo el sistema (Frontend, Backend, Base de Datos, pgAdmin y Servidor de Email) se levanta con un solo comando.

## 🛠️ Stack Tecnológico

* **Frontend:** React (con Vite), React Query, Tailwind CSS.
* **Backend:** Node.js, Express, Prisma (ORM).
* **Base de Datos:** PostgreSQL.
* **DevOps (Entorno de Desarrollo):**
    * Docker & Docker Compose
    * MailHog (Servidor SMTP de prueba)
    * pgAdmin (Gestor de Base de Datos)

---

## ⚙️ Cómo Levantar el Proyecto (Guía de Instalación)

Sigue estos pasos para ejecutar el proyecto en tu máquina local.

### 1. Prerrequisitos

* [Docker](https://www.docker.com/products/docker-desktop/) instalado y corriendo.
* [Git](https://git-scm.com/) instalado.

### 2. Clonar el Repositorio

### 3. Crea el archivo de entorno .env

# Variables de la Base de Datos
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=sgp_permisos
DB_PORT=5433

# URL de conexión (usada por el backend y Prisma)
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}?schema=public"

# Secreto para JWT
JWT_SECRET="ESTO-ES-UN-SECRETO-MUY-SEGURO"

# Configuración de pgAdmin
PGADMIN_EMAIL=admin@permisos.cl
PGADMIN_PASSWORD=admin


### 4. Levantar todo el entorno

docker-compose up --build

### 5. Crear y Poblar la Base de Datos (Primera Vez)

# A. Aplicar Migraciones (Crear las tablas):
docker-compose exec backend npx prisma migrate dev

# B. Poblar la Base de Datos (Ejecutar el Seed)
docker-compose exec backend npx prisma db seed

# Regenerar el cliente de Prisma (si haces cambios en schema.prisma)
docker-compose exec backend npx prisma generate

# Usuarios creados de pruebas
Email	                        Contraseña	Rol	         Área
admin@permisos.cl	            admin123	 ADMIN	       Administración
coordinador.info@permisos.cl	coord123	 COORDINADOR	 Informática
trabajador.info@permisos.cl	  trab123	   TRABAJADOR	   Informática
coordinador.audio@permisos.cl	coord123	 COORDINADOR	 Audiovisual
trabajador.audio@permisos.cl	trab123	   TRABAJADOR	   Audiovisual

### 6. Acceder a los Servicios!

Una vez completados los pasos anteriores, todo está listo:
Aplicación Web (Frontend): ➡️ http://localhost:5173
Bandeja de Correo Falsa (MailHog): ➡️ http://localhost:8025
Gestor de Base de Datos (pgAdmin): ➡️ http://localhost:5050 (Usa admin@permisos.cl / admin para entrar).

