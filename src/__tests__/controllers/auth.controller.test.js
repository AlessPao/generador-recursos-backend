import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock de los modelos
const mockUsuario = {
  findOne: jest.fn(),
  create: jest.fn()
};

const mockValidationResult = jest.fn();

jest.unstable_mockModule('../../models/Usuario.js', () => ({
  default: mockUsuario
}));

jest.unstable_mockModule('express-validator', () => ({
  validationResult: mockValidationResult
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn().mockReturnValue('fake-jwt-token')
  }
}));

// Importar después de configurar los mocks
const { register, login } = await import('../../controllers/auth.controller.js');
const jwt = (await import('jsonwebtoken')).default;

describe('Controlador de Autenticación', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('debería registrar usuario con datos válidos', async () => {
      // Mock validation success
      mockValidationResult.mockReturnValue({
        isEmpty: () => true
      });

      // Mock no existing user
      mockUsuario.findOne.mockResolvedValue(null);

      // Mock user creation
      const newUser = {
        id: 1,
        nombre: 'Test User',
        email: 'test@example.com'
      };
      mockUsuario.create.mockResolvedValue(newUser);

      req.body = {
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      await register(req, res, next);

      expect(mockUsuario.findOne).toHaveBeenCalledWith({ 
        where: { email: 'test@example.com' } 
      });
      expect(mockUsuario.create).toHaveBeenCalledWith({
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario registrado correctamente',
        usuario: {
          id: 1,
          nombre: 'Test User',
          email: 'test@example.com'
        }
      });
    });

    test('debería fallar con email duplicado', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => true
      });

      mockUsuario.findOne.mockResolvedValue({ id: 1 }); // Usuario existente

      req.body = {
        nombre: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    });    test('debería fallar con errores de validación', async () => {
      req.body = {}; // Datos faltantes
      
      const errors = [
        { field: 'email', msg: 'Email inválido' },
        { field: 'password', msg: 'Contraseña requerida' }
      ];
      
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => errors
      });

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors
      });
    });
  });

  describe('login', () => {
    test('debería hacer login con credenciales válidas', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => true
      });

      const mockUser = {
        id: 1,
        nombre: 'Test User',
        email: 'test@example.com',
        validarPassword: jest.fn().mockResolvedValue(true)
      };

      mockUsuario.findOne.mockResolvedValue(mockUser);

      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      await login(req, res, next);

      expect(mockUsuario.findOne).toHaveBeenCalledWith({ 
        where: { email: 'test@example.com' } 
      });
      expect(mockUser.validarPassword).toHaveBeenCalledWith('password123');
      expect(res.status).toHaveBeenCalledWith(200);
      
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.success).toBe(true);
      expect(responseCall.message).toBe('Inicio de sesión exitoso');
      expect(responseCall.token).toBeDefined();
      expect(responseCall.usuario).toEqual({
        id: 1,
        nombre: 'Test User',        email: 'test@example.com'
      });      // Verificar que el token fue retornado correctamente
      expect(responseCall.token).toBe('fake-jwt-token');
    });

    test('debería fallar con usuario inexistente', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => true
      });

      mockUsuario.findOne.mockResolvedValue(null);

      req.body = {
        email: 'noexiste@example.com',
        password: 'password123'
      };

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Credenciales inválidas'
      });
    });

    test('debería fallar con contraseña incorrecta', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => true
      });

      const mockUser = {
        id: 1,
        validarPassword: jest.fn().mockResolvedValue(false)
      };

      mockUsuario.findOne.mockResolvedValue(mockUser);

      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Credenciales inválidas'
      });
    });
  });
});
