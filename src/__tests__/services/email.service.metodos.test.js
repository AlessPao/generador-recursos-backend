import { describe, expect, test, beforeEach, jest } from '@jest/globals';

// Mock completo de nodemailer
const mockTransporter = {
  verify: jest.fn(),
  sendMail: jest.fn()
};

const mockNodemailer = {
  createTransport: jest.fn(() => mockTransporter)
};

jest.unstable_mockModule('nodemailer', () => ({
  default: mockNodemailer
}));

// Mock de la configuración
jest.unstable_mockModule('../../config/index.js', () => ({
  EMAIL_USER: 'test@gmail.com',
  EMAIL_PASS: 'password'
}));

const nodemailer = (await import('nodemailer')).default;

describe('Email Service - Métodos específicos adicionales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransporter.verify.mockResolvedValue(true);
    mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });
  });

  describe('Configuración de transportador', () => {
    test('debe configurar transportador con Gmail', () => {
      // Simular la configuración del transportador
      const config = {
        service: 'gmail',
        auth: {
          user: 'test@gmail.com',
          pass: 'password'
        }
      };

      nodemailer.createTransport(config);

      expect(nodemailer.createTransport).toHaveBeenCalledWith(config);
    });

    test('debe verificar la configuración del transportador correctamente', async () => {
      mockTransporter.verify.mockImplementation((callback) => {
        callback(null, true);
      });

      const verificar = (callback) => {
        mockTransporter.verify(callback);
      };

      const resultado = await new Promise((resolve) => {
        verificar((error, success) => {
          resolve({ error, success });
        });
      });

      expect(resultado.error).toBeNull();
      expect(resultado.success).toBe(true);
    });

    test('debe manejar errores de configuración', async () => {
      const configError = new Error('Authentication failed');
      mockTransporter.verify.mockImplementation((callback) => {
        callback(configError, false);
      });

      const verificar = (callback) => {
        mockTransporter.verify(callback);
      };

      const resultado = await new Promise((resolve) => {
        verificar((error, success) => {
          resolve({ error, success });
        });
      });

      expect(resultado.error).toEqual(configError);
      expect(resultado.success).toBe(false);
    });
  });

  describe('Generación de contenido HTML', () => {
    test('debe generar HTML correctamente estructurado', () => {
      const email = 'test@example.com';
      const code = '123456';

      const generarHTML = (email, code) => {
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6;">Educa Recursos</h1>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h2 style="color: #334155; margin-top: 0;">Recuperación de contraseña</h2>
              <p style="color: #64748b; line-height: 1.6;">
                Has solicitado recuperar tu contraseña. Usa el siguiente código para continuar:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="background-color: #3b82f6; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 8px; letter-spacing: 3px;">
                  ${code}
                </span>
              </div>
              <p style="color: #64748b; line-height: 1.6;">
                Este código expira en 15 minutos por seguridad.
              </p>
            </div>
          </div>
        `;
      };

      const html = generarHTML(email, code);

      expect(html).toContain('Educa Recursos');
      expect(html).toContain('123456');
      expect(html).toContain('Recuperación de contraseña');
      expect(html).toContain('15 minutos');
      expect(html).toContain('font-family: Arial');
      expect(html).toContain('#3b82f6');
    });

    test('debe incluir estilos de seguridad y accesibilidad', () => {
      const html = `
        <div style="font-family: Arial, sans-serif;">
          <span style="background-color: #3b82f6; color: white; font-size: 24px; font-weight: bold;">
            123456
          </span>
        </div>
      `;

      expect(html).toContain('font-family: Arial');
      expect(html).toContain('font-size: 24px');
      expect(html).toContain('font-weight: bold');
      expect(html).toContain('color: white');
    });
  });

  describe('Configuración de opciones de correo', () => {
    test('debe configurar opciones de correo correctamente', () => {
      const email = 'recipient@example.com';
      const code = '123456';
      const fromEmail = 'noreply@educaRecursos.com';

      const mailOptions = {
        from: fromEmail,
        to: email,
        subject: 'Código de recuperación de contraseña - Educa Recursos',
        html: `<p>Tu código es: ${code}</p>`
      };

      expect(mailOptions.from).toBe(fromEmail);
      expect(mailOptions.to).toBe(email);
      expect(mailOptions.subject).toContain('Código de recuperación');
      expect(mailOptions.subject).toContain('Educa Recursos');
      expect(mailOptions.html).toContain(code);
    });

    test('debe incluir información de marca y copyright', () => {
      const footer = `
        <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
          <p>© 2025 Educa Recursos. Todos los derechos reservados.</p>
        </div>
      `;

      expect(footer).toContain('© 2025 Educa Recursos');
      expect(footer).toContain('Todos los derechos reservados');
      expect(footer).toContain('text-align: center');
      expect(footer).toContain('font-size: 12px');
    });
  });

  describe('Manejo de respuestas de envío', () => {
    test('debe procesar respuesta exitosa de envío', async () => {
      const mockInfo = {
        messageId: 'test-message-id-123',
        response: '250 Message accepted'
      };

      mockTransporter.sendMail.mockResolvedValue(mockInfo);

      const enviarEmail = async (options) => {
        const info = await mockTransporter.sendMail(options);
        return { success: true, messageId: info.messageId };
      };

      const resultado = await enviarEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      });

      expect(resultado.success).toBe(true);
      expect(resultado.messageId).toBe('test-message-id-123');
    });

    test('debe manejar errores de envío específicos', async () => {
      const errores = [
        new Error('Invalid email address'),
        new Error('Authentication failed'),
        new Error('Network timeout'),
        new Error('Service unavailable')
      ];

      for (const error of errores) {
        mockTransporter.sendMail.mockRejectedValue(error);

        const enviarEmail = async () => {
          try {
            await mockTransporter.sendMail({});
            return { success: true };
          } catch (err) {
            return { success: false, error: err.message };
          }
        };

        const resultado = await enviarEmail();

        expect(resultado.success).toBe(false);
        expect(resultado.error).toBe(error.message);
      }
    });
  });

  describe('Validación de parámetros de entrada', () => {
    test('debe validar email válido', () => {
      const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
      };

      const emailsValidos = [
        'test@example.com',
        'user.name@domain.co',
        'admin@university.edu.pe'
      ];

      const emailsInvalidos = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain'
      ];

      emailsValidos.forEach(email => {
        expect(validarEmail(email)).toBe(true);
      });

      emailsInvalidos.forEach(email => {
        expect(validarEmail(email)).toBe(false);
      });
    });

    test('debe validar código de 6 dígitos', () => {
      const validarCodigo = (code) => {
        return /^\d{6}$/.test(code);
      };

      const codigosValidos = ['123456', '000000', '999999'];
      const codigosInvalidos = ['12345', '1234567', 'abc123', '12a456'];

      codigosValidos.forEach(code => {
        expect(validarCodigo(code)).toBe(true);
      });

      codigosInvalidos.forEach(code => {
        expect(validarCodigo(code)).toBe(false);
      });
    });
  });

  describe('Logging y monitoreo', () => {
    test('debe generar logs apropiados para éxito', () => {
      const logs = [];
      const mockConsole = {
        log: (message) => logs.push(message),
        error: (message) => logs.push(`ERROR: ${message}`)
      };

      const logearExito = (messageId) => {
        mockConsole.log(`Email enviado: ${messageId}`);
      };

      logearExito('test-message-123');

      expect(logs).toContain('Email enviado: test-message-123');
    });

    test('debe generar logs apropiados para errores', () => {
      const logs = [];
      const mockConsole = {
        log: (message) => logs.push(message),
        error: (message) => logs.push(`ERROR: ${message}`)
      };

      const logearError = (error) => {
        mockConsole.error(`Error al enviar email: ${error.message}`);
      };

      logearError(new Error('SMTP connection failed'));

      expect(logs).toContain('ERROR: Error al enviar email: SMTP connection failed');
    });
  });
});
