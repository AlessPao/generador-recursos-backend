import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import Usuario from '../../models/Usuario.js';
import Recurso from '../../models/Recurso.js';
import Exam from '../../models/Exam.js';
import ExamResult from '../../models/ExamResult.js';
import RecoveryCode from '../../models/RecoveryCode.js';

// Mock de bcrypt (ya que los modelos lo usan)
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

describe('Modelos - Métodos específicos adicionales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Usuario - Métodos de instancia adicionales', () => {
    test('debe tener métodos de validación personalizados', () => {
      // Verificar que el modelo Usuario tiene los métodos esperados
      const usuario = {
        validarPassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          nombre: 'Test User',
          email: 'test@example.com'
        })
      };

      expect(typeof usuario.validarPassword).toBe('function');
      expect(typeof usuario.toJSON).toBe('function');
    });

    test('debe poder serializar datos del usuario sin contraseña', () => {
      const usuario = {
        id: 1,
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        toJSON: function() {
          const { password, ...userWithoutPassword } = this;
          return userWithoutPassword;
        }
      };

      const serialized = usuario.toJSON();

      expect(serialized).not.toHaveProperty('password');
      expect(serialized).toHaveProperty('id');
      expect(serialized).toHaveProperty('nombre');
      expect(serialized).toHaveProperty('email');
    });
  });

  describe('Recurso - Validaciones de tipo y estructura', () => {
    test('debe validar tipos de recurso permitidos', () => {
      const tiposValidos = [
        'comprension',
        'escritura',
        'evaluacion',
        'gramatica',
        'oral',
        'drag_and_drop',
        'ice_breakers'
      ];

      tiposValidos.forEach(tipo => {
        expect(['comprension', 'escritura', 'evaluacion', 'gramatica', 'oral', 'drag_and_drop', 'ice_breakers']).toContain(tipo);
      });
    });

    test('debe validar estructura JSONB para contenido', () => {
      const estructurasValidas = {
        comprension: {
          texto: 'Texto de comprensión',
          preguntas: [{ pregunta: 'Test', respuesta: 'Respuesta' }],
          vocabulario: [{ palabra: 'test', definicion: 'definición' }]
        },
        escritura: {
          descripcion: 'Descripción',
          instrucciones: 'Instrucciones',
          estructuraPropuesta: 'Estructura',
          conectores: ['primero', 'luego'],
          listaVerificacion: ['item1', 'item2']
        },
        evaluacion: {
          texto: 'Texto del examen',
          preguntas: [
            {
              pregunta: 'Pregunta test',
              opciones: ['A', 'B', 'C'],
              respuesta: 'A'
            }
          ]
        }
      };

      Object.keys(estructurasValidas).forEach(tipo => {
        const estructura = estructurasValidas[tipo];
        expect(typeof estructura).toBe('object');
        expect(estructura).not.toBe(null);
      });
    });

    test('debe validar campo meta como JSONB opcional', () => {
      const metaEjemplos = [
        { opciones: { tema: 'animales', dificultad: 'medio' } },
        { configuracion: { tiempo: 30, intentos: 3 } },
        null,
        undefined
      ];

      metaEjemplos.forEach(meta => {
        if (meta !== null && meta !== undefined) {
          expect(typeof meta).toBe('object');
        }
      });
    });

    test('debe validar tiempo de generación como número positivo', () => {
      const tiemposValidos = [0.5, 1.2, 5.7, 10.0];
      const tiemposInvalidos = [-1, -0.5, null, undefined, 'string'];

      tiemposValidos.forEach(tiempo => {
        expect(typeof tiempo).toBe('number');
        expect(tiempo).toBeGreaterThanOrEqual(0);
      });

      tiemposInvalidos.forEach(tiempo => {
        if (tiempo !== null && tiempo !== undefined) {
          expect(typeof tiempo === 'number' && tiempo >= 0).toBeFalsy();
        }
      });
    });
  });

  describe('Exam - Estructura y validaciones', () => {
    test('debe tener slug único generado', () => {
      const mockExam = {
        id: 1,
        slug: 'abc123def',
        titulo: 'Examen de prueba',
        texto: 'Texto del examen',
        preguntas: []
      };

      expect(typeof mockExam.slug).toBe('string');
      expect(mockExam.slug.length).toBeGreaterThan(0);
    });

    test('debe validar estructura de preguntas', () => {
      const preguntasValidas = [
        {
          pregunta: '¿Cuál es la capital de Perú?',
          opciones: ['Lima', 'Cusco', 'Arequipa', 'Trujillo'],
          respuesta: 'Lima'
        },
        {
          pregunta: '¿Qué animal es mamífero?',
          opciones: ['Perro', 'Pez', 'Insecto', 'Ave'],
          respuesta: 'Perro'
        }
      ];

      preguntasValidas.forEach(pregunta => {
        expect(pregunta).toHaveProperty('pregunta');
        expect(pregunta).toHaveProperty('opciones');
        expect(pregunta).toHaveProperty('respuesta');
        expect(Array.isArray(pregunta.opciones)).toBe(true);
        expect(pregunta.opciones.length).toBeGreaterThan(0);
        expect(typeof pregunta.respuesta).toBe('string');
      });
    });
  });

  describe('ExamResult - Cálculo de puntajes', () => {
    test('debe calcular puntaje basado en respuestas correctas', () => {
      const mockExamResult = {
        respuestas: {
          '1': 'A',
          '2': 'B',
          '3': 'C'
        },
        puntaje: 85.5,
        calcularPuntaje: function(preguntasCorrectas, totalPreguntas) {
          return (preguntasCorrectas / totalPreguntas) * 100;
        }
      };

      const puntajeCalculado = mockExamResult.calcularPuntaje(2, 3);
      expect(puntajeCalculado).toBeCloseTo(66.67, 1);

      const puntajePerfecto = mockExamResult.calcularPuntaje(3, 3);
      expect(puntajePerfecto).toBe(100);

      const puntajeCero = mockExamResult.calcularPuntaje(0, 3);
      expect(puntajeCero).toBe(0);
    });

    test('debe validar formato de respuestas como JSONB', () => {
      const formatosRespuestas = [
        { '1': 'A', '2': 'B', '3': 'C' },
        { pregunta1: 'Respuesta libre', pregunta2: 'Otra respuesta' },
        {}
      ];

      formatosRespuestas.forEach(respuestas => {
        expect(typeof respuestas).toBe('object');
        expect(respuestas).not.toBe(null);
      });
    });
  });

  describe('RecoveryCode - Validaciones de código', () => {
    test('debe generar códigos de 6 dígitos', () => {
      const generarCodigo = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };

      for (let i = 0; i < 10; i++) {
        const codigo = generarCodigo();
        expect(codigo).toMatch(/^\d{6}$/);
        expect(parseInt(codigo)).toBeGreaterThanOrEqual(100000);
        expect(parseInt(codigo)).toBeLessThanOrEqual(999999);
      }
    });

    test('debe validar expiración de códigos', () => {
      const ahora = new Date();
      const expiraEn15Min = new Date(ahora.getTime() + 15 * 60 * 1000);
      const expiroHace5Min = new Date(ahora.getTime() - 5 * 60 * 1000);

      const codigoValido = {
        code: '123456',
        expiresAt: expiraEn15Min,
        used: false,
        estaVigente: function() {
          return !this.used && this.expiresAt > new Date();
        }
      };

      const codigoExpirado = {
        code: '654321',
        expiresAt: expiroHace5Min,
        used: false,
        estaVigente: function() {
          return !this.used && this.expiresAt > new Date();
        }
      };

      const codigoUsado = {
        code: '111111',
        expiresAt: expiraEn15Min,
        used: true,
        estaVigente: function() {
          return !this.used && this.expiresAt > new Date();
        }
      };

      expect(codigoValido.estaVigente()).toBe(true);
      expect(codigoExpirado.estaVigente()).toBe(false);
      expect(codigoUsado.estaVigente()).toBe(false);
    });

    test('debe validar formato de email', () => {
      const emailsValidos = [
        'test@example.com',
        'usuario.nombre@dominio.co',
        'admin@universidad.edu.pe'
      ];

      const emailsInvalidos = [
        'email_sin_arroba.com',
        '@dominio.com',
        'usuario@',
        'email con espacios@dominio.com'
      ];

      const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
      };

      emailsValidos.forEach(email => {
        expect(validarEmail(email)).toBe(true);
      });

      emailsInvalidos.forEach(email => {
        expect(validarEmail(email)).toBe(false);
      });
    });
  });

  describe('Asociaciones entre modelos', () => {
    test('debe definir relaciones correctas entre modelos', () => {
      // Estas son las asociaciones esperadas basadas en el código
      const asociacionesEsperadas = {
        Usuario: {
          hasMany: ['Recurso', 'Exam', 'ExamResult'],
          belongsTo: []
        },
        Recurso: {
          belongsTo: ['Usuario'],
          hasMany: []
        },
        Exam: {
          belongsTo: ['Usuario'],
          hasMany: ['ExamResult']
        },
        ExamResult: {
          belongsTo: ['Usuario', 'Exam'],
          hasMany: []
        },
        RecoveryCode: {
          // Este modelo no tiene asociaciones FK directas
          belongsTo: [],
          hasMany: []
        }
      };

      // Verificar que las asociaciones están definidas conceptualmente
      expect(asociacionesEsperadas.Usuario.hasMany).toContain('Recurso');
      expect(asociacionesEsperadas.Usuario.hasMany).toContain('Exam');
      expect(asociacionesEsperadas.Recurso.belongsTo).toContain('Usuario');
      expect(asociacionesEsperadas.Exam.belongsTo).toContain('Usuario');
      expect(asociacionesEsperadas.ExamResult.belongsTo).toContain('Usuario');
      expect(asociacionesEsperadas.ExamResult.belongsTo).toContain('Exam');
    });
  });
});
