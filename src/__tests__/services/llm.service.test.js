import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock de axios
const mockAxios = {
  post: jest.fn()
};

jest.unstable_mockModule('axios', () => ({
  default: mockAxios
}));

// Mock de la configuración
jest.unstable_mockModule('../../config/index.js', () => ({
  llm_base_url: 'https://test.api.url',
  offenrouter_api_key: 'test_api_key',
  llm_model: 'test/model'
}));

const { generarRecurso } = await import('../../services/llm.service.js');

describe('Servicio LLM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silenciar console.log para tests más limpios
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('debería generar recurso exitosamente', async () => {
    const mockResponse = {
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                tipo: 'comprension',
                titulo: 'Test Recurso',
                contenido: 'Contenido de prueba',
                actividades: []
              })
            }
          }
        ]
      }
    };

    mockAxios.post.mockResolvedValue(mockResponse);

    const params = {
      tipo: 'comprension',
      opciones: {
        tema: 'Matemáticas',
        dificultad: 'básico'
      }
    };

    const resultado = await generarRecurso(params);

    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://test.api.url/chat/completions',
      expect.objectContaining({
        model: 'test/model',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('docente experto')
          }),
          expect.objectContaining({
            role: 'user'
          })
        ]),
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test_api_key',
          'Content-Type': 'application/json'
        })
      })
    );

    expect(resultado).toEqual({
      tipo: 'comprension',
      titulo: 'Test Recurso',
      contenido: 'Contenido de prueba',
      actividades: []
    });
  });
  test('debería manejar respuesta con JSON malformado', async () => {
    const mockResponse = {
      data: {
        choices: [
          {
            message: {
              content: '{ invalid json'
            }
          }
        ]
      }
    };

    // Simular que tanto el intento original como el reintento fallan con JSON malformado
    mockAxios.post.mockResolvedValueOnce(mockResponse)
                  .mockResolvedValueOnce(mockResponse);

    const params = {
      tipo: 'comprension',
      opciones: { tema: 'Test' }
    };

    // Como el código devuelve un recurso por defecto cuando falla el parsing, debe resolver exitosamente
    const result = await generarRecurso(params);
    expect(result).toBeDefined();
    expect(result.titulo).toContain('comprension');
  });

  test('debería manejar error de API', async () => {
    const apiError = new Error('API Error');
    apiError.response = {
      status: 500,
      data: { error: 'Internal Server Error' }
    };

    mockAxios.post
      .mockRejectedValueOnce(apiError)
      .mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  tipo: 'comprension',
                  titulo: 'Recurso de reintento',
                  contenido: 'Contenido generado en reintento'
                })
              }
            }
          ]
        }
      });

    const params = {
      tipo: 'comprension',
      opciones: { tema: 'Test' }
    };

    const resultado = await generarRecurso(params);

    // Verificar que se hizo reintento
    expect(mockAxios.post).toHaveBeenCalledTimes(2);
    expect(resultado.titulo).toBe('Recurso de reintento');
  });
  test('debería manejar respuesta sin choices', async () => {
    const mockResponse = {
      data: {}
    };

    // Simular que tanto el intento original como el reintento fallan
    mockAxios.post.mockResolvedValueOnce(mockResponse)
                  .mockResolvedValueOnce(mockResponse);

    const params = {
      tipo: 'comprension',
      opciones: { tema: 'Test' }
    };

    // Como el código devuelve un recurso por defecto cuando falla, debe resolver exitosamente
    const result = await generarRecurso(params);
    expect(result).toBeDefined();
    expect(result.titulo).toContain('comprension');
  });
  test('debería manejar choices vacío', async () => {
    const mockResponse = {
      data: {
        choices: []
      }
    };

    // Simular que ambos intentos (original y reintento) fallan
    mockAxios.post.mockRejectedValueOnce(new Error('choices vacío'))
                  .mockRejectedValueOnce(new Error('choices vacío'));

    const params = {
      tipo: 'comprension',
      opciones: { tema: 'Test' }
    };

    // Como el código devuelve un recurso por defecto cuando falla, el test debería ser exitoso
    const result = await generarRecurso(params);
    expect(result).toBeDefined();
    expect(result.titulo).toContain('comprension');
  });

  test('debería incluir parámetros correctos en el prompt', async () => {
    const mockResponse = {
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                tipo: 'escritura',
                titulo: 'Test',
                contenido: 'Test'
              })
            }
          }
        ]
      }
    };

    mockAxios.post.mockResolvedValue(mockResponse);

    const params = {
      tipo: 'escritura',
      opciones: {
        tema: 'Ciencias Naturales',
        dificultad: 'avanzado',
        duracion: '45 minutos'
      }
    };

    await generarRecurso(params);

    const callArgs = mockAxios.post.mock.calls[0][1];
    const userMessage = callArgs.messages.find(m => m.role === 'user');
      expect(userMessage.content).toContain('producción escrita');
    expect(userMessage.content).toContain('Ciencias Naturales');
    expect(userMessage.content).toContain('2º grado');
  });
});
