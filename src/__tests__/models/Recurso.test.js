import { describe, test, expect } from '@jest/globals';

// Tests para el modelo Recurso
describe('Modelo Recurso - Validaciones', () => {
  
  test('debería validar tipos de recurso permitidos', () => {
    const validTypes = ['comprension', 'escritura', 'gramatica', 'oral', 'drag_and_drop', 'ice_breakers'];
    
    const validateResourceType = (type) => {
      return validTypes.includes(type);
    };

    // Tipos válidos
    validTypes.forEach(type => {
      expect(validateResourceType(type)).toBe(true);
    });

    // Tipos inválidos
    const invalidTypes = ['invalid', 'lectura', 'matematicas', '', null, undefined, 123];
    invalidTypes.forEach(type => {
      expect(validateResourceType(type)).toBe(false);
    });
  });

  test('debería validar estructura de contenido JSONB', () => {
    const validateContent = (content) => {
      try {
        // Verificar que sea un objeto válido
        if (typeof content !== 'object' || content === null) return false;
        
        // Verificar que tenga propiedades básicas esperadas
        const hasValidStructure = 
          content.hasOwnProperty('tipo') || 
          content.hasOwnProperty('actividades') || 
          content.hasOwnProperty('instrucciones');
          
        return hasValidStructure;
      } catch (error) {
        return false;
      }
    };

    const validContent1 = {
      tipo: 'comprension',
      instrucciones: 'Lee el texto y responde',
      actividades: [
        { pregunta: '¿Cuál es el tema principal?', tipo: 'multiple_choice' }
      ]
    };

    const validContent2 = {
      tipo: 'escritura',
      tema: 'Descripciones',
      actividades: []
    };

    const invalidContent1 = null;
    const invalidContent2 = "string no válido";
    const invalidContent3 = {};
    const invalidContent4 = { randomProp: 'value' };

    expect(validateContent(validContent1)).toBe(true);
    expect(validateContent(validContent2)).toBe(true);
    
    expect(validateContent(invalidContent1)).toBe(false);
    expect(validateContent(invalidContent2)).toBe(false);
    expect(validateContent(invalidContent3)).toBe(false);
    expect(validateContent(invalidContent4)).toBe(false);
  });

  test('debería validar estructura de meta información', () => {
    const validateMeta = (meta) => {
      if (typeof meta !== 'object' || meta === null) return false;
      
      // Meta puede estar vacío o tener opciones válidas
      if (Object.keys(meta).length === 0) return true;
      
      // Si tiene opciones, validar estructura básica
      if (meta.opciones) {
        return typeof meta.opciones === 'object';
      }
      
      return true;
    };

    const validMeta1 = {};
    const validMeta2 = { 
      opciones: { 
        tema: 'Matemáticas', 
        dificultad: 'básico',
        duracion: '30 minutos'
      }
    };
    const validMeta3 = { 
      generationParams: { model: 'gpt-4' },
      timestamp: new Date().toISOString()
    };

    const invalidMeta1 = null;
    const invalidMeta2 = "string";
    const invalidMeta3 = { opciones: "should be object" };

    expect(validateMeta(validMeta1)).toBe(true);
    expect(validateMeta(validMeta2)).toBe(true);
    expect(validateMeta(validMeta3)).toBe(true);
    
    expect(validateMeta(invalidMeta1)).toBe(false);
    expect(validateMeta(invalidMeta2)).toBe(false);
    expect(validateMeta(invalidMeta3)).toBe(false);
  });

  test('debería validar tiempo de generación', () => {
    const validateGenerationTime = (seconds) => {
      if (seconds === null || seconds === undefined) return true; // Permitir null
      if (typeof seconds !== 'number') return false;
      if (seconds < 0) return false; // No puede ser negativo
      if (seconds > 300) return false; // Máximo 5 minutos (tiempo razonable)
      
      return true;
    };

    expect(validateGenerationTime(null)).toBe(true);
    expect(validateGenerationTime(undefined)).toBe(true);
    expect(validateGenerationTime(0)).toBe(true);
    expect(validateGenerationTime(2.5)).toBe(true);
    expect(validateGenerationTime(30)).toBe(true);
    expect(validateGenerationTime(150.75)).toBe(true);

    expect(validateGenerationTime(-1)).toBe(false);
    expect(validateGenerationTime(500)).toBe(false); // Muy alto
    expect(validateGenerationTime("5")).toBe(false); // String
    expect(validateGenerationTime({})).toBe(false); // Objeto
  });

  test('debería crear estructura básica de recurso', () => {
    const createResourceStructure = (userId, type, title, content, meta = {}, generationTime = null) => {
      return {
        usuarioId: userId,
        tipo: type,
        titulo: title,
        contenido: content,
        meta: meta,
        tiempoGeneracionSegundos: generationTime,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    };

    const resource = createResourceStructure(
      1,
      'comprension',
      'Mi Recurso',
      { tipo: 'comprension', actividades: [] },
      { opciones: { tema: 'Ciencias' } },
      3.5
    );

    expect(resource).toHaveProperty('usuarioId', 1);
    expect(resource).toHaveProperty('tipo', 'comprension');
    expect(resource).toHaveProperty('titulo', 'Mi Recurso');
    expect(resource).toHaveProperty('contenido');
    expect(resource).toHaveProperty('meta');
    expect(resource).toHaveProperty('tiempoGeneracionSegundos', 3.5);
    expect(resource).toHaveProperty('createdAt');
    expect(resource).toHaveProperty('updatedAt');
    
    expect(typeof resource.contenido).toBe('object');
    expect(typeof resource.meta).toBe('object');
    expect(resource.createdAt instanceof Date).toBe(true);
  });
});
