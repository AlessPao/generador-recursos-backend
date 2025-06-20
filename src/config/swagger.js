import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Recursos Educativos API',
      version: '1.0.0',
      description: 'API para el sistema de gestión de recursos educativos con funcionalidades de autenticación, gestión de recursos y exámenes.',
      contact: {
        name: 'API Support',
        email: 'support@sistemaeducativo.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'Servidor de desarrollo'
      },
      {
        url: process.env.RENDER_EXTERNAL_URL || 'https://api.sistemaeducativo.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operación exitosa'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error en la operación'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre completo del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico único'
            },
            rol: {
              type: 'string',
              enum: ['admin', 'teacher', 'student'],
              description: 'Rol del usuario en el sistema'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        Recurso: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del recurso'
            },
            titulo: {
              type: 'string',
              description: 'Título del recurso educativo'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción detallada del recurso'
            },
            tipo: {
              type: 'string',
              enum: ['video', 'documento', 'presentacion', 'ejercicio'],
              description: 'Tipo de recurso educativo'
            },
            nivel: {
              type: 'string',
              enum: ['basico', 'intermedio', 'avanzado'],
              description: 'Nivel de dificultad del recurso'
            },
            materia: {
              type: 'string',
              description: 'Materia o asignatura del recurso'
            },
            contenido: {
              type: 'string',
              description: 'Contenido del recurso'
            },
            usuarioId: {
              type: 'integer',
              description: 'ID del usuario que creó el recurso'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        Examen: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del examen'
            },
            titulo: {
              type: 'string',
              description: 'Título del examen'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del examen'
            },
            preguntas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pregunta: {
                    type: 'string'
                  },
                  opciones: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  respuestaCorrecta: {
                    type: 'integer'
                  }
                }
              }
            },
            materia: {
              type: 'string',
              description: 'Materia del examen'
            },
            nivel: {
              type: 'string',
              enum: ['basico', 'intermedio', 'avanzado'],
              description: 'Nivel de dificultad'
            },
            duracion: {
              type: 'integer',
              description: 'Duración del examen en minutos'
            },
            usuarioId: {
              type: 'integer',
              description: 'ID del usuario que creó el examen'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js'),
    path.join(__dirname, '../models/*.js')
  ]
};

const swaggerSpecs = swaggerJSDoc(options);

export default swaggerSpecs;
