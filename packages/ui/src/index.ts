/**
 * Paquete de UI compartido para Ciszu Network
 * 
 * Este paquete contiene componentes de UI reutilizables
 * que siguen el sistema de diseño de Ciszu Network.
 */

// Componentes de Iconos
export { Icon, IconButton, IconList, iconUtils } from './Icon';
export type { IconProps, IconButtonProps, IconListProps } from './Icon';

// Re-exportar desde @ciszu/cdn para conveniencia
export { ICON_NAMES, type IconName, resolveIcon, assetResolver } from '@ciszu/cdn';

// Componentes básicos (se implementarán después)
export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';
export { Modal } from './Modal';
export { Alert } from './Alert';
export { Badge } from './Badge';

// Hooks
export { useTheme } from './hooks/useTheme';
export { useBreakpoint } from './hooks/useBreakpoint';
export { useLocalStorage } from './hooks/useLocalStorage';

// Utilidades
export { cn } from './utils/cn';
export { createContext } from './utils/createContext';

// Tipos
export type { Theme } from './types/theme';
export type { Breakpoint } from './types/breakpoint';

/**
 * Inicializar el sistema de UI
 * 
 * @param config Configuración opcional
 */
export function initializeUI(config?: {
  theme?: 'light' | 'dark' | 'auto';
  iconStrategy?: 'cdn' | 'local' | 'auto';
}) {
  console.log('Ciszu UI inicializado', config);
  
  // Aquí se puede configurar tema, iconos, etc.
  return {
    version: '1.0.0',
    config,
  };
}