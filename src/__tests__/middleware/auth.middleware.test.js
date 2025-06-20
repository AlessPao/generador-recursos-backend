import { describe, test, expect, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { isAuthenticated } from '../../middleware/auth.middleware.js';

// Mock simple para las funciones de respuesta
const createMockResponse = () => ({
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.responseData = data;
    return this;
  }
});

describe('Middleware de Autenticación', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = createMockResponse();
    next = () => { next.called = true; };
    next.called = false;
  });

  test('debería permitir acceso con token válido', () => {
    const payload = { userId: 1, email: 'test@example.com' };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    
    req.headers.authorization = `Bearer ${token}`;

    isAuthenticated(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(1);
    expect(req.user.email).toBe('test@example.com');
    expect(next.called).toBe(true);
  });

  test('debería rechazar acceso sin token', () => {
    isAuthenticated(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.responseData.success).toBe(false);
    expect(res.responseData.message).toContain('autorización ausente');
    expect(next.called).toBe(false);
  });

  test('debería rechazar acceso con token inválido', () => {
    req.headers.authorization = 'Bearer token_invalido';

    isAuthenticated(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.responseData.success).toBe(false);
    expect(res.responseData.message).toContain('Token inválido');
    expect(next.called).toBe(false);
  });

  test('debería rechazar header malformado', () => {
    req.headers.authorization = 'InvalidFormat token123';

    isAuthenticated(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.responseData.success).toBe(false);
    expect(next.called).toBe(false);
  });
});
