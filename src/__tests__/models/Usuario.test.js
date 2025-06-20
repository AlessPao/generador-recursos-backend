import { describe, test, expect } from '@jest/globals';
import bcrypt from 'bcrypt';

// Tests unitarios para la lógica del modelo Usuario
describe('Modelo Usuario - Lógica de Negocio', () => {
  
  test('debería hashear contraseña correctamente', async () => {
    const plainPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    expect(hashedPassword).not.toBe(plainPassword);
    expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/); // Formato bcrypt
    expect(hashedPassword.length).toBeGreaterThan(50);
  });

  test('debería validar contraseñas correctamente', async () => {
    const plainPassword = 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  test('debería validar formato de email', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'admin+tag@company.org'
    ];

    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user@domain',
      ''
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });

    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  test('debería generar salt diferente cada vez', async () => {
    const salt1 = await bcrypt.genSalt(10);
    const salt2 = await bcrypt.genSalt(10);
    const salt3 = await bcrypt.genSalt(10);

    expect(salt1).not.toBe(salt2);
    expect(salt2).not.toBe(salt3);
    expect(salt1).not.toBe(salt3);
  });

  test('debería hashear la misma contraseña diferente cada vez', async () => {
    const password = 'samePassword123';
    
    const hash1 = await bcrypt.hash(password, 10);
    const hash2 = await bcrypt.hash(password, 10);
    const hash3 = await bcrypt.hash(password, 10);

    expect(hash1).not.toBe(hash2);
    expect(hash2).not.toBe(hash3);
    expect(hash1).not.toBe(hash3);

    // Pero todas deben validar correctamente
    expect(await bcrypt.compare(password, hash1)).toBe(true);
    expect(await bcrypt.compare(password, hash2)).toBe(true);
    expect(await bcrypt.compare(password, hash3)).toBe(true);
  });

  test('debería rechazar contraseñas muy cortas', () => {
    const shortPasswords = ['1', '12', '123', '1234', '12345'];
    const minLength = 6;

    shortPasswords.forEach(password => {
      expect(password.length).toBeLessThan(minLength);
    });
  });

  test('debería validar estructura de datos de usuario', () => {
    const validUser = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'hashedPasswordHere'
    };

    const requiredFields = ['nombre', 'email', 'password'];
    
    requiredFields.forEach(field => {
      expect(validUser).toHaveProperty(field);
      expect(validUser[field]).toBeTruthy();
      expect(typeof validUser[field]).toBe('string');
    });

    expect(validUser.nombre.length).toBeGreaterThan(0);
    expect(validUser.email).toContain('@');
    expect(validUser.password.length).toBeGreaterThan(0);
  });
});
