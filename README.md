# 🚀 Guía de Despliegue de Latina WiFi en Producción (Render.com)

Este directorio contiene únicamente los archivos necesarios para desplegar la plataforma **Latina WiFi** de forma online y segura, sin archivos temporales, bases de datos locales ni módulos de desarrollo (`node_modules`).

---

## 🛠️ Requisitos Previos

1. Una cuenta gratuita en **[Render.com](https://render.com)**.
2. Un repositorio en GitHub o GitLab con estos archivos subidos (es el método más fácil y recomendado por Render para el despliegue automático).

---

## 📦 Instrucciones para Desplegar en Render.com

Sigue estos sencillos pasos para tener tu aplicación online en minutos:

### Paso 1: Crear un nuevo Servicio Web (Web Service)
1. Inicia sesión en tu panel de Render.
2. Haz clic en el botón **New +** y selecciona **Web Service**.
3. Conecta tu repositorio de GitHub donde subiste los archivos de esta carpeta.

### Paso 2: Configurar los parámetros básicos
* **Name**: `latina-wifi` (o el nombre que prefieras).
* **Environment**: `Node`
* **Region**: Selecciona la más cercana a tu ubicación (ej. `Ohio (us-east-2)` o `Oregon (us-west-2)`).
* **Branch**: `main` (o la rama correspondiente).
* **Build Command**: `npm install`
* **Start Command**: `npm start`
* **Instance Type**: `Free` (Gratuito).

### Paso 3: Configurar las Variables de Entorno (Environment Variables)
En la pestaña **Environment** de Render, añade las siguientes variables que requiere el sistema:

| Nombre de Variable | Valor de Ejemplo / Descripción |
|--------------------|---------------------------------|
| `PORT`             | `10000` (Render lo asigna automáticamente, no es obligatorio ponerlo) |
| `NODE_ENV`         | `production` |
| `JWT_SECRET`       | *Una clave secreta larga e indescifrable* (ej: `LatinaWiFiSecretKey2026_ProdKey`) |
| `ADMIN_PASSWORD`   | *La contraseña que usará el administrador para entrar al panel* |
| `EMAIL_USER`       | Tu correo de Gmail corporativo (ej: `tuempresa@gmail.com`) |
| `EMAIL_PASS`       | Tu contraseña de aplicación de Gmail (16 dígitos sin espacios, generada en tu cuenta de Google) |
| `DB_DIALECT`       | `sqlite` o `mysql` |

---

## ⚠️ NOTA CRÍTICA SOBRE LA BASE DE DATOS (SQLite vs MySQL)

La aplicación está preparada para funcionar con **SQLite** de forma predeterminada, guardando los datos en un archivo llamado `database.sqlite` dentro de la carpeta raíz.

### 🔴 Advertencia sobre SQLite en Render (Nivel Gratuito):
Render utiliza **contenedores efímeros** en su plan gratuito. Esto significa que **cada vez que el servidor se apague, se reinicie o subas una nueva versión del código, el archivo `database.sqlite` se borrará y se perderán todos los clientes, tickets y pagos reportados**.

### 🟢 Soluciones recomendadas para producción:
1. **Opción A (Recomendada y Gratuita): Usar una base de datos MySQL externa.**
   * Puedes crear una base de datos MySQL gratuita en proveedores como **[Aiven.io](https://aiven.io)** o **[Railway.app](https://railway.app)**.
   * Una vez creada, añade las siguientes variables de entorno en Render para que Latina WiFi se conecte a ella automáticamente:
     * `DB_DIALECT` = `mysql`
     * `DB_HOST` = *host del servidor MySQL*
     * `DB_USER` = *usuario de la base de datos*
     * `DB_PASSWORD` = *contraseña de la base de datos*
     * `DB_NAME` = *nombre de la base de datos*
     * `DB_PORT` = `3306`

2. **Opción B (De Pago): Agregar un Disco Persistente (Persistent Disk) en Render.**
   * En la configuración del Web Service de Render, puedes alquilar un disco persistente (aprox. $1/mes) para que el archivo `database.sqlite` no se borre en los reinicios.
   * Debes montar el disco en la ruta `/data` y cambiar la variable de configuración en tu `.env` para guardar la base de datos en `/data/database.sqlite`.

---

## 📱 Experiencia PWA y Móvil

Una vez desplegado en Render, obtendrás una dirección URL pública (ej. `https://latina-wifi.onrender.com`).
* Al abrir esa URL desde Chrome en tu teléfono Android o Safari en iOS, aparecerá automáticamente el **banner de invitación a instalar la app**.
* Al instalarla, se guardará un icono directo de **Latina WiFi** en tu pantalla de inicio y funcionará como una aplicación móvil real.
