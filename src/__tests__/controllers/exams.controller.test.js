import { describe, expect, test, beforeEach, jest } from '@jest/globals';

// Mock de los servicios y modelos antes de importar
const mockGenerarRecurso = jest.fn();
const mockExam = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn()
};

jest.unstable_mockModule('../../services/llm.service.js', () => ({
  generarRecurso: mockGenerarRecurso
}));

jest.unstable_mockModule('../../models/Exam.js', () => ({
  default: mockExam
}));

jest.unstable_mockModule('uuid', () => ({
  default: {
    v4: () => '12345678-1234-1234-1234-123456789012'
  },
  v4: () => '12345678-1234-1234-1234-123456789012'
}));

// Importar después de configurar los mocks
const { createExam, listExams, getExam } = await import('../../controllers/exams.controller.js');

describe('Exams Controller - Métodos específicos', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { userId: 1 },
      params: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('createExam', () => {
    beforeEach(() => {
      req.body = {
        titulo: 'Examen de Comprensión',
        tipoTexto: 'narrativo',
        tema: 'animales',
        longitud: 'corto',
        numLiteral: 3
      };
    });

    test('debe crear un examen correctamente', async () => {
      const mockLLMResult = {
        titulo: 'Examen de Comprensión - Animales',
        texto: 'Los animales son seres vivos...',
        preguntas: [
          { pregunta: '¿Qué son los animales?', opciones: ['A', 'B', 'C'], respuesta: 'A' }
        ]
      };      const mockExamRecord = {
        id: 1,
        usuarioId: 1,
        slug: '12345678',
        titulo: mockLLMResult.titulo,
        texto: mockLLMResult.texto,
        preguntas: mockLLMResult.preguntas
      };

      mockGenerarRecurso.mockResolvedValue(mockLLMResult);
      mockExam.create.mockResolvedValue(mockExamRecord);

      await createExam(req, res, next);

      expect(mockGenerarRecurso).toHaveBeenCalledWith({
        tipo: 'evaluacion',
        opciones: {
          titulo: 'Examen de Comprensión',
          tipoTexto: 'narrativo',
          tema: 'animales',
          longitud: 'corto',
          numLiteral: 3
        }
      });

      expect(mockExam.create).toHaveBeenCalledWith({
        usuarioId: 1,
        slug: '12345678',
        titulo: mockLLMResult.titulo,
        texto: mockLLMResult.texto,
        preguntas: mockLLMResult.preguntas
      });      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockExamRecord
      });
    });    test('debe manejar errores del servicio LLM', async () => {
      const error = new Error('LLM service error');
      mockGenerarRecurso.mockRejectedValue(error);

      await createExam(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    test('debe manejar errores de base de datos', async () => {
      const mockLLMResult = {
        titulo: 'Test',
        texto: 'Test text',
        preguntas: []
      };      const dbError = new Error('Database error');
      mockGenerarRecurso.mockResolvedValue(mockLLMResult);
      mockExam.create.mockRejectedValue(dbError);

      await createExam(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
    });
  });

  describe('listExams', () => {
    test('debe listar exámenes del usuario correctamente', async () => {
      const mockExams = [
        {
          id: 1,
          slug: 'exam-1',
          titulo: 'Examen 1',
          usuarioId: 1,
          createdAt: new Date()
        },
        {
          id: 2,
          slug: 'exam-2',
          titulo: 'Examen 2',
          usuarioId: 1,
          createdAt: new Date()
        }
      ];

      mockExam.findAll.mockResolvedValue(mockExams);

      await listExams(req, res, next);      expect(mockExam.findAll).toHaveBeenCalledWith({
        where: { usuarioId: 1 },
        order: [['createdAt', 'DESC']]
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockExams
      });
    });

    test('debe devolver lista vacía si no hay exámenes', async () => {
      mockExam.findAll.mockResolvedValue([]);

      await listExams(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });

    test('debe manejar errores de base de datos', async () => {
      const error = new Error('Database error');
      mockExam.findAll.mockRejectedValue(error);

      await listExams(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getExam', () => {
    beforeEach(() => {
      req.params = { slug: 'test-exam-slug' };
    });    test('debe obtener un examen por slug correctamente', async () => {
      const mockExamRecord = {
        id: 1,
        slug: 'test-exam-slug',
        titulo: 'Examen de Prueba',
        texto: 'Texto del examen',
        preguntas: [
          { pregunta: 'Pregunta 1', opciones: ['A', 'B', 'C'], respuesta: 'A' }
        ]
      };

      mockExam.findOne.mockResolvedValue(mockExamRecord);

      await getExam(req, res, next);

      expect(mockExam.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-exam-slug' }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockExamRecord
      });
    });

    test('debe devolver 404 si el examen no existe', async () => {
      mockExam.findOne.mockResolvedValue(null);

      await getExam(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Exam not found'
      });
    });

    test('debe manejar errores de base de datos', async () => {
      const error = new Error('Database error');
      mockExam.findOne.mockRejectedValue(error);

      await getExam(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
