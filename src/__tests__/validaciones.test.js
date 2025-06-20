import { describe, test, expect } from '@jest/globals';

// Tests para validaciones de campos de entrada
describe('Validaciones de Entrada', () => {
  
  test('debería validar contraseñas seguras', () => {
    const validatePassword = (password) => {
      const minLength = password.length >= 8;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      return {
        isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
        checks: {
          minLength,
          hasUppercase,
          hasLowercase,
          hasNumber,
          hasSpecialChar
        }
      };
    };

    const strongPassword = 'MiPassword123!';
    const weakPassword = 'password';
    const shortPassword = '123';

    const strong = validatePassword(strongPassword);
    const weak = validatePassword(weakPassword);
    const short = validatePassword(shortPassword);

    expect(strong.isValid).toBe(true);
    expect(strong.checks.minLength).toBe(true);
    expect(strong.checks.hasUppercase).toBe(true);
    expect(strong.checks.hasLowercase).toBe(true);
    expect(strong.checks.hasNumber).toBe(true);
    expect(strong.checks.hasSpecialChar).toBe(true);

    expect(weak.isValid).toBe(false);
    expect(weak.checks.hasUppercase).toBe(false);
    expect(weak.checks.hasNumber).toBe(false);

    expect(short.isValid).toBe(false);
    expect(short.checks.minLength).toBe(false);
  });

  test('debería validar códigos de recuperación', () => {
    const validateRecoveryCode = (code) => {
      if (!code) return false;
      const isString = typeof code === 'string';
      const hasCorrectLength = code.length === 6;
      const isNumeric = /^\d{6}$/.test(code);
      
      return isString && hasCorrectLength && isNumeric;
    };

    expect(validateRecoveryCode('123456')).toBe(true);
    expect(validateRecoveryCode('000000')).toBe(true);
    expect(validateRecoveryCode('999999')).toBe(true);

    expect(validateRecoveryCode('12345')).toBe(false); // Muy corto
    expect(validateRecoveryCode('1234567')).toBe(false); // Muy largo
    expect(validateRecoveryCode('12345a')).toBe(false); // Contiene letra
    expect(validateRecoveryCode('')).toBe(false); // Vacío
    expect(validateRecoveryCode(null)).toBe(false); // Null
    expect(validateRecoveryCode(undefined)).toBe(false); // Undefined
    expect(validateRecoveryCode(123456)).toBe(false); // Número, no string
  });

  test('debería validar nombres de usuario', () => {
    const validateName = (name) => {
      if (!name || typeof name !== 'string') return false;
      const trimmed = name.trim();
      const hasMinLength = trimmed.length >= 2;
      const hasMaxLength = trimmed.length <= 50;
      const hasValidChars = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmed);
      
      return hasMinLength && hasMaxLength && hasValidChars;
    };

    expect(validateName('Juan Pérez')).toBe(true);
    expect(validateName('María José García')).toBe(true);
    expect(validateName('José')).toBe(true);
    expect(validateName('Ana')).toBe(true);

    expect(validateName('J')).toBe(false); // Muy corto
    expect(validateName('')).toBe(false); // Vacío
    expect(validateName('   ')).toBe(false); // Solo espacios
    expect(validateName('Juan123')).toBe(false); // Números
    expect(validateName('Juan@email')).toBe(false); // Caracteres especiales
    expect(validateName(null)).toBe(false); // Null
    expect(validateName(undefined)).toBe(false); // Undefined
  });

  test('debería validar títulos de recursos', () => {
    const validateTitle = (title) => {
      if (!title || typeof title !== 'string') return false;
      const trimmed = title.trim();
      return trimmed.length >= 3 && trimmed.length <= 100;
    };

    expect(validateTitle('Mi Recurso de Comprensión')).toBe(true);
    expect(validateTitle('Test')).toBe(true);
    expect(validateTitle('Recurso de Matemáticas para 2º Grado')).toBe(true);

    expect(validateTitle('No')).toBe(false); // Muy corto
    expect(validateTitle('')).toBe(false); // Vacío
    expect(validateTitle('a'.repeat(101))).toBe(false); // Muy largo
    expect(validateTitle(null)).toBe(false); // Null
    expect(validateTitle(undefined)).toBe(false); // Undefined
  });
});
