import { describe, test, expect } from '@jest/globals';

// Tests para utilidades de texto y formato
describe('Utilidades de Texto y Formato', () => {
    test('debería limpiar y normalizar texto', () => {
    const cleanText = (text) => {
      if (!text || typeof text !== 'string') return '';
      
      return text
        .trim()
        .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
        .replace(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, ' ') // Reemplazar símbolos con espacios
        .replace(/\s+/g, ' ') // Limpiar espacios múltiples nuevamente
        .toLowerCase();
    };

    expect(cleanText('  Hola    mundo  ')).toBe('hola mundo');
    expect(cleanText('Texto con ñ y acentós')).toBe('texto con ñ y acentós');
    expect(cleanText('Texto!!! con @#$ símbolos')).toBe('texto con símbolos');
    expect(cleanText('')).toBe('');
    expect(cleanText(null)).toBe('');
    expect(cleanText(undefined)).toBe('');
  });

  test('debería truncar texto a longitud específica', () => {
    const truncateText = (text, maxLength, suffix = '...') => {
      if (!text || typeof text !== 'string') return '';
      if (text.length <= maxLength) return text;
      
      return text.substring(0, maxLength - suffix.length) + suffix;
    };

    expect(truncateText('Este es un texto largo', 10)).toBe('Este es...');
    expect(truncateText('Corto', 10)).toBe('Corto');
    expect(truncateText('Exactamente 10', 14)).toBe('Exactamente 10');
    expect(truncateText('Texto', 10, '...')).toBe('Texto');
    expect(truncateText('', 10)).toBe('');
  });

  test('debería capitalizar palabras', () => {
    const capitalizeWords = (text) => {
      if (!text || typeof text !== 'string') return '';
      
      return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    expect(capitalizeWords('hola mundo')).toBe('Hola Mundo');
    expect(capitalizeWords('TEXTO EN MAYÚSCULAS')).toBe('Texto En Mayúsculas');
    expect(capitalizeWords('texto mixto DE PrueBa')).toBe('Texto Mixto De Prueba');
    expect(capitalizeWords('')).toBe('');
    expect(capitalizeWords('a')).toBe('A');
  });

  test('debería generar slugs para URLs', () => {
    const generateSlug = (text) => {
      if (!text || typeof text !== 'string') return '';
      
      return text
        .toLowerCase()
        .trim()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    expect(generateSlug('Mi Recurso de Comprensión')).toBe('mi-recurso-de-comprension');
    expect(generateSlug('Texto con ñ y acentós')).toBe('texto-con-n-y-acentos');
    expect(generateSlug('¡Título con símbolos!')).toBe('titulo-con-simbolos');
    expect(generateSlug('  Espacios   extras  ')).toBe('espacios-extras');
    expect(generateSlug('')).toBe('');
  });

  test('debería extraer palabras clave', () => {
    const extractKeywords = (text, minLength = 3, maxKeywords = 5) => {
      if (!text || typeof text !== 'string') return [];
      
      const stopWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'una', 'del', 'las', 'los'];
      
      const words = text
        .toLowerCase()
        .replace(/[^\w\sáéíóúñ]/g, '')
        .split(/\s+/)
        .filter(word => word.length >= minLength)
        .filter(word => !stopWords.includes(word));
      
      // Contar frecuencia
      const frequency = {};
      words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
      });
      
      // Ordenar por frecuencia y tomar las primeras
      return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxKeywords)
        .map(([word]) => word);
    };

    const text = 'La comprensión lectora es fundamental para el aprendizaje. Los estudiantes deben practicar comprensión de textos para mejorar su comprensión.';
    const keywords = extractKeywords(text);
    
    expect(keywords).toContain('comprensión');
    expect(keywords).toContain('lectora');
    expect(keywords.length).toBeLessThanOrEqual(5);
    expect(keywords).not.toContain('el');
    expect(keywords).not.toContain('la');
  });
  test('debería contar palabras y caracteres', () => {
    const getTextStats = (text) => {
      if (!text || typeof text !== 'string') {
        return { characters: 0, words: 0, sentences: 0, paragraphs: 0 };
      }
      
      const characters = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
      
      return { characters, words, sentences, paragraphs };
    };

    const text = 'Hola mundo. Este es un texto de prueba.\n\nEste es otro párrafo con más texto.';
    const stats = getTextStats(text);
    
    expect(stats.characters).toBe(text.length);
    expect(stats.words).toBeGreaterThan(10); // Al menos 10 palabras
    expect(stats.sentences).toBe(3);
    expect(stats.paragraphs).toBe(2);
    
    const emptyStats = getTextStats('');
    expect(emptyStats).toEqual({ characters: 0, words: 0, sentences: 0, paragraphs: 0 });
  });

  test('debería formatear texto para diferentes contextos', () => {
    const formatForContext = (text, context) => {
      if (!text || typeof text !== 'string') return '';
      
      switch (context) {
        case 'email':
          return text.trim().replace(/\n/g, '<br>');
        case 'url':
          return encodeURIComponent(text);
        case 'filename':
          return text.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
        case 'html':
          return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        default:
          return text;
      }
    };

    expect(formatForContext('Línea 1\nLínea 2', 'email')).toBe('Línea 1<br>Línea 2');
    expect(formatForContext('texto con espacios', 'url')).toBe('texto%20con%20espacios');
    expect(formatForContext('archivo: con / símbolos', 'filename')).toBe('archivo_ con _ símbolos');
    expect(formatForContext('<script>alert("test")</script>', 'html')).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;');
  });
});
