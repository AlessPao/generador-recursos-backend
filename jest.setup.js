// Configuración global para Jest
import dotenv from 'dotenv';

// Cargar variables de entorno para testing
dotenv.config({ path: '.env.test' });

// Mock de console para tests más limpios (opcional)
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: () => {}, // Silenciar logs en tests
    warn: () => {},
    error: () => {},
  };
}