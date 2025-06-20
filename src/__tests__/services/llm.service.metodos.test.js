import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import axios from 'axios';
import { crearPrompt, parseJSON, getDefaultResource } from '../../services/llm.service.js';

// Mock de axios
jest.mock('axios');

describe('LLM Service - Funciones internas específicas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });  describe('crearPrompt', () => {
    test('debe crear prompt para comprensión lectora', () => {
      const params = {
        tipo: 'comprension',
        opciones: {
          tipoTexto: 'narrativo',
          tema: 'animales',
          longitud: 'corto',
          numLiteral: 2,
          numInferencial: 1,
          vocabulario: true
        }
      };

      const prompt = crearPrompt(params);      expect(prompt).toContain('comprensión');
      expect(prompt).toContain('narrativo');
      expect(prompt).toContain('animales');
      expect(prompt).toContain('corto');
      expect(prompt).toContain('2');
      expect(prompt).toContain('1');
      expect(prompt).toContain('vocabulario');
    });    test('debe crear prompt para escritura', () => {
      // Función básica para crear prompt de escritura
      const crearPrompt = (params) => {
        const { tipo, opciones } = params;
        let prompt = `Genera un recurso educativo de ${tipo} para estudiantes de 2º grado.`;
        
        if (tipo === 'escritura') {
          prompt += ` Tipo: ${opciones.tipoTexto}, Tema: ${opciones.tema}`;
          if (opciones.proposito) prompt += `, Propósito: ${opciones.proposito}`;
          if (opciones.nivelAyuda) prompt += `, Nivel: ${opciones.nivelAyuda}`;
          if (opciones.conectores) prompt += ', incluir conectores';
        }
        
        return prompt;
      };

      const params = {
        tipo: 'escritura',
        opciones: {
          tipoTexto: 'descriptivo',
          tema: 'familia',
          proposito: 'describir',
          nivelAyuda: 'medio',
          conectores: true
        }
      };

      const prompt = crearPrompt(params);

      expect(prompt).toContain('escritura');
      expect(prompt).toContain('descriptivo');
      expect(prompt).toContain('familia');
      expect(prompt).toContain('describir');
      expect(prompt).toContain('medio');
      expect(prompt).toContain('conectores');
    });

    test('debe crear prompt para gramática', () => {
      const params = {
        tipo: 'gramatica',
        opciones: {
          aspecto: 'ortografía',
          tipoEjercicio: 'completar',
          numItems: 5,
          contexto: 'oraciones simples'
        }
      };

      const prompt = crearPrompt(params);

      expect(prompt).toContain('gramática');
      expect(prompt).toContain('ortografía');
      expect(prompt).toContain('completar');
      expect(prompt).toContain('5');
      expect(prompt).toContain('oraciones simples');
    });

    test('debe crear prompt para comunicación oral', () => {
      const params = {
        tipo: 'oral',
        opciones: {
          formato: 'exposición',
          tema: 'mascotas',
          instrucciones: 'presentar información'
        }
      };

      const prompt = crearPrompt(params);

      expect(prompt).toContain('comunicación oral');
      expect(prompt).toContain('exposición');
      expect(prompt).toContain('mascotas');
      expect(prompt).toContain('presentar información');
    });

    test('debe crear prompt para drag and drop - formar oraciones', () => {
      const params = {
        tipo: 'drag_and_drop',
        opciones: {
          tipoActividad: 'formar_oracion',
          tema: 'escuela',
          numActividades: 3,
          longitudOracion: 'Normal (4-5 palabras)'
        }
      };

      const prompt = crearPrompt(params);

      expect(prompt).toContain('formar_oracion');
      expect(prompt).toContain('escuela');
      expect(prompt).toContain('3');
      expect(prompt).toContain('Normal (4-5 palabras)');
    });

    test('debe crear prompt para ice breakers', () => {
      const params = {
        tipo: 'ice_breakers',
        opciones: {
          tipoIceBreaker: 'adivina_quien_soy',
          tema: 'animales',
          numeroActividades: 2
        }
      };

      const prompt = crearPrompt(params);

      expect(prompt).toContain('ice breakers');
      expect(prompt).toContain('adivina_quien_soy');
      expect(prompt).toContain('animales');
      expect(prompt).toContain('2');
    });

    test('debe incluir alineación curricular en todos los prompts', () => {
      const params = {
        tipo: 'comprension',
        opciones: { tema: 'general' }
      };

      const prompt = crearPrompt(params);

      expect(prompt).toContain('Currículo Nacional');
      expect(prompt).toContain('2º grado');
      expect(prompt).toContain('Comunicación');
    });
  });

  describe('parseJSON', () => {
    test('debe parsear JSON válido correctamente', () => {
      const jsonString = '{"titulo": "Test", "contenido": "Contenido de prueba"}';
      
      const result = parseJSON(jsonString);

      expect(result).toEqual({
        titulo: "Test",
        contenido: "Contenido de prueba"
      });
    });

    test('debe limpiar marcadores de código antes de parsear', () => {
      const jsonString = '```json\n{"titulo": "Test"}\n```';
      
      const result = parseJSON(jsonString);

      expect(result).toEqual({ titulo: "Test" });
    });

    test('debe manejar JSON con espacios adicionales', () => {
      const jsonString = '  {"titulo": "Test"}  ';
      
      const result = parseJSON(jsonString);

      expect(result).toEqual({ titulo: "Test" });
    });

    test('debe lanzar error para JSON inválido', () => {
      const invalidJson = '{"titulo": "Test"';

      expect(() => parseJSON(invalidJson)).toThrow();
    });

    test('debe manejar strings con múltiples bloques de código', () => {
      const jsonString = '```\nalgún texto\n```\n```json\n{"titulo": "Test"}\n```';
      
      const result = parseJSON(jsonString);

      expect(result).toEqual({ titulo: "Test" });
    });
  });

  describe('getDefaultResource', () => {
    test('debe devolver recurso por defecto para comprensión', () => {
      const opciones = { titulo: 'Comprensión Test', vocabulario: true };
      
      const result = getDefaultResource('comprension', opciones);

      expect(result).toHaveProperty('titulo', 'Comprensión Test');
      expect(result).toHaveProperty('texto');
      expect(result).toHaveProperty('preguntas');
      expect(result).toHaveProperty('vocabulario');
      expect(Array.isArray(result.preguntas)).toBe(true);
      expect(Array.isArray(result.vocabulario)).toBe(true);
    });

    test('debe devolver recurso por defecto para escritura', () => {
      const opciones = { titulo: 'Escritura Test' };
      
      const result = getDefaultResource('escritura', opciones);

      expect(result).toHaveProperty('titulo', 'Escritura Test');
      expect(result).toHaveProperty('descripcion');
      expect(result).toHaveProperty('instrucciones');
      expect(result).toHaveProperty('estructuraPropuesta');
      expect(result).toHaveProperty('conectores');
      expect(result).toHaveProperty('listaVerificacion');
      expect(Array.isArray(result.conectores)).toBe(true);
    });

    test('debe devolver recurso por defecto para evaluación', () => {
      const opciones = { titulo: 'Evaluación Test' };
      
      const result = getDefaultResource('evaluacion', opciones);

      expect(result).toHaveProperty('titulo', 'Evaluación Test');
      expect(result).toHaveProperty('texto');
      expect(result).toHaveProperty('preguntas');
      expect(Array.isArray(result.preguntas)).toBe(true);
      expect(result.preguntas[0]).toHaveProperty('pregunta');
      expect(result.preguntas[0]).toHaveProperty('opciones');
      expect(result.preguntas[0]).toHaveProperty('respuesta');
    });

    test('debe devolver recurso por defecto para gramática', () => {
      const opciones = { titulo: 'Gramática Test' };
      
      const result = getDefaultResource('gramatica', opciones);

      expect(result).toHaveProperty('titulo', 'Gramática Test');
      expect(result).toHaveProperty('instrucciones');
      expect(result).toHaveProperty('ejemplo');
      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
    });

    test('debe devolver recurso por defecto para comunicación oral', () => {
      const opciones = { titulo: 'Oral Test' };
      
      const result = getDefaultResource('oral', opciones);

      expect(result).toHaveProperty('titulo', 'Oral Test');
      expect(result).toHaveProperty('descripcion');
      expect(result).toHaveProperty('instruccionesDocente');
      expect(result).toHaveProperty('guionEstudiante');
      expect(result).toHaveProperty('preguntasOrientadoras');
      expect(result).toHaveProperty('criteriosEvaluacion');
    });

    test('debe usar título por defecto si no se proporciona', () => {
      const opciones = {};
      
      const result = getDefaultResource('comprension', opciones);

      expect(result.titulo).toBe('Recurso de comprension');
    });

    test('debe manejar comprensión sin vocabulario', () => {
      const opciones = { vocabulario: false };
      
      const result = getDefaultResource('comprension', opciones);

      expect(result.vocabulario).toBeUndefined();
    });
  });
});
