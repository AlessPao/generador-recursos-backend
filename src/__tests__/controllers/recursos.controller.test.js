import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock de los modelos y servicios
jest.unstable_mockModule('../../models/Recurso.js', () => ({
  default: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

jest.unstable_mockModule('../../services/llm.service.js', () => ({
  generarRecurso: jest.fn()
}));

jest.unstable_mockModule('express-validator', () => ({
  validationResult: jest.fn()
}));

const { default: Recurso } = await import('../../models/Recurso.js');
const { generarRecurso } = await import('../../services/llm.service.js');
const { validationResult } = await import('express-validator');
const { getRecursos, getRecursoById, createRecurso } = await import('../../controllers/recursos.controller.js');

describe('Controlador de Recursos', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { userId: 1 },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe('getRecursos', () => {
    test('debería obtener todos los recursos del usuario', async () => {
      const mockRecursos = [
        {
          id: 1,
          tipo: 'comprension',
          titulo: 'Recurso 1',
          usuarioId: 1
        },
        {
          id: 2,
          tipo: 'escritura',
          titulo: 'Recurso 2',
          usuarioId: 1
        }
      ];

      Recurso.findAll.mockResolvedValue(mockRecursos);

      await getRecursos(req, res, next);

      expect(Recurso.findAll).toHaveBeenCalledWith({
        where: { usuarioId: 1 },
        order: [['createdAt', 'DESC']]
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        recursos: mockRecursos
      });
    });

    test('debería manejar errores', async () => {
      const error = new Error('Database error');
      Recurso.findAll.mockRejectedValue(error);

      await getRecursos(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getRecursoById', () => {
    test('debería obtener un recurso específico del usuario', async () => {
      const mockRecurso = {
        id: 1,
        tipo: 'comprension',
        titulo: 'Recurso Test',
        usuarioId: 1
      };

      Recurso.findOne.mockResolvedValue(mockRecurso);
      req.params.id = '1';

      await getRecursoById(req, res, next);

      expect(Recurso.findOne).toHaveBeenCalledWith({
        where: {
          id: '1',
          usuarioId: 1
        }
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        recurso: mockRecurso
      });
    });

    test('debería retornar 404 si el recurso no existe', async () => {
      Recurso.findOne.mockResolvedValue(null);
      req.params.id = '999';

      await getRecursoById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Recurso no encontrado'
      });
    });
  });

  describe('createRecurso', () => {
    test('debería crear un nuevo recurso exitosamente', async () => {
      validationResult.mockReturnValue({
        isEmpty: () => true
      });

      const mockGeneratedContent = {
        tipo: 'comprension',
        contenido: 'Contenido generado por LLM',
        actividades: []
      };

      const mockCreatedRecurso = {
        id: 1,
        usuarioId: 1,
        tipo: 'comprension',
        titulo: 'Nuevo Recurso',
        contenido: mockGeneratedContent,
        meta: { opciones: { tema: 'Matemáticas' } },
        tiempoGeneracionSegundos: 2.5
      };

      generarRecurso.mockResolvedValue(mockGeneratedContent);
      Recurso.create.mockResolvedValue(mockCreatedRecurso);

      req.body = {
        tipo: 'comprension',
        titulo: 'Nuevo Recurso',
        opciones: { tema: 'Matemáticas' }
      };

      // Mock Date.now para tiempo consistente
      const originalNow = Date.now;
      Date.now = jest.fn()
        .mockReturnValueOnce(1000) // start
        .mockReturnValueOnce(3500); // end

      await createRecurso(req, res, next);

      expect(generarRecurso).toHaveBeenCalledWith({
        tipo: 'comprension',
        opciones: { tema: 'Matemáticas' }
      });

      expect(Recurso.create).toHaveBeenCalledWith({
        usuarioId: 1,
        tipo: 'comprension',
        titulo: 'Nuevo Recurso',
        contenido: mockGeneratedContent,
        meta: { opciones: { tema: 'Matemáticas' } },
        tiempoGeneracionSegundos: 2.5
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Recurso generado y guardado correctamente',
        recurso: mockCreatedRecurso
      });

      // Restaurar Date.now
      Date.now = originalNow;
    });

    test('debería fallar con errores de validación', async () => {
      const errors = [
        { msg: 'Tipo es requerido' },
        { msg: 'Título es requerido' }
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => errors
      });

      await createRecurso(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors
      });

      expect(generarRecurso).not.toHaveBeenCalled();
      expect(Recurso.create).not.toHaveBeenCalled();
    });

    test('debería manejar errores del servicio LLM', async () => {
      validationResult.mockReturnValue({
        isEmpty: () => true
      });

      const llmError = new Error('Error del servicio LLM');
      generarRecurso.mockRejectedValue(llmError);

      req.body = {
        tipo: 'comprension',
        titulo: 'Test Recurso',
        opciones: {}
      };

      await createRecurso(req, res, next);

      expect(next).toHaveBeenCalledWith(llmError);
      expect(Recurso.create).not.toHaveBeenCalled();
    });

    test('debería calcular el tiempo de generación correctamente', async () => {
      validationResult.mockReturnValue({
        isEmpty: () => true
      });

      generarRecurso.mockResolvedValue({ contenido: 'test' });
      Recurso.create.mockResolvedValue({ id: 1 });

      req.body = {
        tipo: 'comprension',
        titulo: 'Test',
        opciones: {}
      };

      const startTime = 1000;
      const endTime = 5000;
      const expectedTime = (endTime - startTime) / 1000; // 4 segundos

      Date.now = jest.fn()
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(endTime);

      await createRecurso(req, res, next);

      expect(Recurso.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tiempoGeneracionSegundos: expectedTime
        })
      );
    });
  });
});
