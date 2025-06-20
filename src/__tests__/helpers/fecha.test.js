import { describe, test, expect } from '@jest/globals';

// Tests para utilidades de fecha y tiempo
describe('Utilidades de Fecha y Tiempo', () => {
    test('debería formatear fechas correctamente', () => {
    const formatDate = (date, locale = 'es-ES') => {
      if (!date) return null;
      if (!(date instanceof Date)) date = new Date(date);
      
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const testDate = new Date('2025-06-19');
    const formatted = formatDate(testDate);
    
    expect(formatted).toContain('2025');
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
    
    expect(formatDate(null)).toBe(null);
    expect(formatDate(undefined)).toBe(null);
  });

  test('debería calcular diferencias de tiempo', () => {
    const calculateTimeDifference = (startTime, endTime) => {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      const diffMs = end.getTime() - start.getTime();
      const diffSeconds = diffMs / 1000;
      const diffMinutes = diffSeconds / 60;
      const diffHours = diffMinutes / 60;
      
      return {
        milliseconds: diffMs,
        seconds: diffSeconds,
        minutes: diffMinutes,
        hours: diffHours
      };
    };

    const start = new Date('2025-06-19T10:00:00');
    const end = new Date('2025-06-19T10:02:30');
    
    const diff = calculateTimeDifference(start, end);
    
    expect(diff.seconds).toBe(150); // 2.5 minutos = 150 segundos
    expect(diff.minutes).toBe(2.5);
    expect(diff.hours).toBe(2.5 / 60);
    expect(diff.milliseconds).toBe(150000);
  });

  test('debería validar si una fecha es válida', () => {
    const isValidDate = (date) => {
      if (!date) return false;
      const d = new Date(date);
      return d instanceof Date && !isNaN(d.getTime());
    };

    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate('2025-06-19')).toBe(true);
    expect(isValidDate('2025-06-19T10:00:00')).toBe(true);
    expect(isValidDate(1719648000000)).toBe(true); // Timestamp válido

    expect(isValidDate('fecha inválida')).toBe(false);
    expect(isValidDate('')).toBe(false);
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
    expect(isValidDate('2025-13-40')).toBe(false); // Mes y día inválidos
  });

  test('debería generar timestamps', () => {
    const generateTimestamp = () => {
      return {
        iso: new Date().toISOString(),
        unix: Math.floor(Date.now() / 1000),
        readable: new Date().toLocaleString('es-ES')
      };
    };

    const timestamp = generateTimestamp();
    
    expect(timestamp).toHaveProperty('iso');
    expect(timestamp).toHaveProperty('unix');
    expect(timestamp).toHaveProperty('readable');
    
    expect(typeof timestamp.iso).toBe('string');
    expect(typeof timestamp.unix).toBe('number');
    expect(typeof timestamp.readable).toBe('string');
    
    expect(timestamp.iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(timestamp.unix).toBeGreaterThan(0);
  });
  test('debería verificar si una fecha está en el pasado o futuro', () => {
    const isValidDate = (date) => {
      if (!date) return false;
      const d = new Date(date);
      return d instanceof Date && !isNaN(d.getTime());
    };

    const compareDateWithNow = (date) => {
      const now = new Date();
      const compareDate = new Date(date);
      
      if (!isValidDate(compareDate)) return null;
      
      const diffMs = compareDate.getTime() - now.getTime();
      
      return {
        isPast: diffMs < 0,
        isFuture: diffMs > 0,
        isNow: Math.abs(diffMs) < 1000, // Dentro de 1 segundo
        diffMs: diffMs
      };
    };

    const pastDate = new Date(Date.now() - 86400000); // Ayer
    const futureDate = new Date(Date.now() + 86400000); // Mañana
    const nowDate = new Date();

    const pastResult = compareDateWithNow(pastDate);
    const futureResult = compareDateWithNow(futureDate);
    const nowResult = compareDateWithNow(nowDate);

    expect(pastResult.isPast).toBe(true);
    expect(pastResult.isFuture).toBe(false);
    
    expect(futureResult.isPast).toBe(false);
    expect(futureResult.isFuture).toBe(true);
    
    expect(nowResult.isNow).toBe(true);
  });

  test('debería formatear duración en texto legible', () => {
    const formatDuration = (seconds) => {
      if (typeof seconds !== 'number' || seconds < 0) return 'Duración inválida';
      
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      
      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
      
      return parts.join(' ');
    };

    expect(formatDuration(65)).toBe('1m 5s');
    expect(formatDuration(3665)).toBe('1h 1m 5s');
    expect(formatDuration(30)).toBe('30s');
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(3600)).toBe('1h');

    expect(formatDuration(-5)).toBe('Duración inválida');
    expect(formatDuration('string')).toBe('Duración inválida');
    expect(formatDuration(null)).toBe('Duración inválida');
  });
});
