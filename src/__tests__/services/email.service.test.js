import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock de nodemailer antes de importar el servicio
const mockTransporter = {
  verify: jest.fn(),
  sendMail: jest.fn()
};

jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn(() => mockTransporter)
  }
}));

// Mock de la configuración
jest.unstable_mockModule('../../config/index.js', () => ({
  EMAIL_USER: 'test@example.com',
  EMAIL_PASS: 'test_password'
}));

const { sendRecoveryCode } = await import('../../services/email.service.js');

describe('Servicio de Email', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería enviar código de recuperación exitosamente', async () => {
    mockTransporter.sendMail.mockResolvedValue({
      messageId: 'test-message-id'
    });

    const email = 'usuario@example.com';
    const code = '123456';

    const result = await sendRecoveryCode(email, code);

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'test@example.com',
        to: email,
        subject: 'Código de recuperación de contraseña - Educa Recursos',
        html: expect.stringContaining(code)
      })
    );    expect(result).toEqual({
      messageId: 'test-message-id',
      success: true
    });
  });

  test('debería incluir el código en el HTML del email', async () => {
    mockTransporter.sendMail.mockResolvedValue({
      messageId: 'test-message-id'
    });

    const email = 'usuario@example.com';
    const code = '789012';

    await sendRecoveryCode(email, code);

    const mailOptions = mockTransporter.sendMail.mock.calls[0][0];
    expect(mailOptions.html).toContain(code);
    expect(mailOptions.html).toContain('Educa Recursos');
    expect(mailOptions.html).toContain('Recuperación de contraseña');
  });

  test('debería manejar errores de envío', async () => {
    const error = new Error('Error de conexión SMTP');
    mockTransporter.sendMail.mockRejectedValue(error);

    const email = 'usuario@example.com';
    const code = '123456';

    await expect(sendRecoveryCode(email, code)).rejects.toThrow('Error al enviar el código de recuperación');
  });  test('debería usar la configuración correcta del transportador', async () => {
    mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id', success: true });
    
    const result = await sendRecoveryCode('test@example.com', '123456');
    
    // Verificar que el transportador fue usado
    expect(mockTransporter.sendMail).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
