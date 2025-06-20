# 🎓 Generador de Recursos Educativos - Backend

Un sistema backend robusto para la generación automática de recursos educativos utilizando IA generativa. Este proyecto permite crear contenido educativo personalizado, evaluaciones y ejercicios de manera automatizada.

## 🚀 Características Principales

### 🤖 **Generación de Contenido con IA**
- Creación automática de textos educativos adaptados al nivel y tema
- Generación de evaluaciones con preguntas de opción múltiple
- Ejercicios interactivos personalizados
- Recursos didácticos estructurados
- **Modelo utilizado**: Microsoft Phi-4-reasoning-plus para razonamiento avanzado y contenido educativo de calidad

### 👤 **Sistema de Usuarios**
- Registro y autenticación segura con JWT
- Gestión de perfiles de usuario
- Sistema de recuperación de contraseñas
- Autorización basada en roles

### 📚 **Gestión de Recursos**
- CRUD completo de recursos educativos
- Categorización por tipo de contenido
- Búsqueda y filtrado avanzado
- Exportación a diferentes formatos

### 📝 **Sistema de Evaluaciones**
- Creación automática de exámenes
- Banco de preguntas dinámico
- Resultados y estadísticas
- Evaluaciones adaptativas

### 📧 **Notificaciones**

- Códigos de recuperación al email

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación y autorización
- **Nodemailer** - Envío de emails
- **Axios** - Cliente HTTP para APIs externas
- **Jest** - Framework de testing
- **Swagger** - Documentación de API
- **Microsoft Phi-4-reasoning-plus** - Modelo LLM para generación de contenido educativo

## 📖 Documentación de la API

La documentación completa de la API está disponible en Swagger:

🔗 **[Ver Documentación de la API](https://edurecursos-generador-backend.onrender.com/api-docs/)**

La documentación incluye:
- Descripción detallada de todos los endpoints
- Esquemas de request/response
- Ejemplos de uso
- Códigos de estado HTTP
- Autenticación requerida

## 🏗️ Arquitectura del Sistema

```
src/
├── controllers/          # Controladores de rutas
│   ├── auth.controller.js
│   ├── recursos.controller.js
│   └── exams.controller.js
├── models/              # Modelos de base de datos
│   ├── Usuario.js
│   ├── Recurso.js
│   └── Exam.js
├── services/            # Servicios de negocio
│   ├── llm.service.js
│   └── email.service.js
├── middleware/          # Middleware de aplicación
│   └── auth.middleware.js
├── routes/              # Definición de rutas
└── config/              # Configuración
```

## 🔌 Endpoints Principales

### 🔐 **Autenticación**
```
POST /api/auth/register    # Registro de usuario
POST /api/auth/login       # Inicio de sesión
POST /api/auth/recover     # Recuperación de contraseña
POST /api/auth/reset       # Reseteo de contraseña
```

### 📚 **Recursos Educativos**
```
GET    /api/recursos       # Listar recursos
POST   /api/recursos       # Crear recurso
GET    /api/recursos/:id   # Obtener recurso específico
PUT    /api/recursos/:id   # Actualizar recurso
DELETE /api/recursos/:id   # Eliminar recurso
```

### 📝 **Evaluaciones**
```
GET  /api/exams           # Listar exámenes
POST /api/exams           # Crear examen
GET  /api/exams/:slug     # Obtener examen específico
```

## ⚙️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

### Variables de Entorno
```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/db_name

# JWT
JWT_SECRET=tu_jwt_secret_aqui

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password

# API Externa (LLM)
LLM_API_URL=https://api.openai.com/v1
LLM_API_KEY=tu_api_key_aqui
```

### Instalación
```bash
# Clonar repositorio
git clone [url-del-repositorio]

# Instalar dependencias
npm install

# Configurar base de datos
npm run db:migrate

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar tests
npm test
```

## 🧪 Testing

El proyecto cuenta con una suite completa de tests unitarios:

- **148 tests pasando** ✅
- **19 suites de test** ✅
- **Cobertura completa** de funcionalidades críticas

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests en modo watch
npm run test:watch
```

## 📊 Funcionalidades del Sistema

### 🎯 **Para Educadores**
- Generación rápida de contenido educativo
- Creación automática de evaluaciones
- Personalización según nivel académico
- Biblioteca de recursos reutilizables

### 🎓 **Para Estudiantes**
- Acceso a recursos educativos de calidad
- Evaluaciones interactivas
- Contenido adaptado al nivel de aprendizaje

## 🚀 Despliegue

El sistema está desplegado y disponible en:
- **Backend API**: https://edurecursos-generador-backend.onrender.com
- **Documentación**: https://edurecursos-generador-backend.onrender.com/api-docs/

