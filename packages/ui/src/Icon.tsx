import React from 'react';
import { resolveIcon, type IconName, ICON_NAMES } from '@ciszu/cdn';

export interface IconProps extends React.HTMLAttributes<HTMLElement> {
  /** Nombre del icono */
  name: IconName | string;
  
  /** Estilo del icono */
  style?: 'outline' | 'filled' | 'flag';
  
  /** Formato del icono */
  format?: 'svg' | 'png';
  
  /** Tamaño del icono en píxeles */
  size?: number | string;
  
  /** Color del icono */
  color?: string;
  
  /** Clases CSS adicionales */
  className?: string;
  
  /** Forzar uso de CDN incluso en desarrollo */
  forceCdn?: boolean;
  
  /** Forzar uso local incluso en producción */
  forceLocal?: boolean;
  
  /** Cache busting */
  cacheBust?: boolean;
  
  /** Mostrar como elemento inline (span) en lugar de img */
  inline?: boolean;
}

/**
 * Componente Icon para Ciszu Network
 * 
 * Renderiza iconos del sistema unificado de Ciszu Network.
 * Soporta múltiples estilos (outline, filled, flag) y formatos (svg, png).
 * 
 * @example
 * <Icon name="home" size={24} color="#333" />
 * <Icon name={ICON_NAMES.SEARCH} style="filled" />
 */
export const Icon: React.FC<IconProps> = ({
  name,
  style = 'outline',
  format = 'svg',
  size = 24,
  color,
  className = '',
  forceCdn = false,
  forceLocal = false,
  cacheBust = false,
  inline = false,
  ...props
}) => {
  // Resolver la URL del icono
  const iconUrl = resolveIcon(
    name,
    style,
    format,
    { forceCdn, forceLocal, cacheBust }
  );

  // Estilos en línea
  const inlineStyles: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    color,
    display: inline ? 'inline-block' : 'block',
    ...props.style,
  };

  // Clases CSS
  const iconClassName = `ciszu-icon ciszu-icon-${name} ${className}`.trim();

  if (format === 'svg' && !inline) {
    // Para SVG, usamos img si no es inline
    return (
      <img
        src={iconUrl}
        alt={`${name} icon`}
        className={iconClassName}
        style={inlineStyles}
        loading="lazy"
        {...props}
      />
    );
  }

  if (inline) {
    // Elemento inline (span) para iconos SVG inline o cuando se necesita más control
    return (
      <span
        className={iconClassName}
        style={inlineStyles}
        aria-label={`${name} icon`}
        role="img"
        {...props}
      >
        {/* En un sistema real, aquí cargaríamos el SVG inline */}
        {name}
      </span>
    );
  }

  // Para PNG o formato no SVG
  return (
    <img
      src={iconUrl}
      alt={`${name} icon`}
      className={iconClassName}
      style={inlineStyles}
      loading="lazy"
      {...props}
    />
  );
};

// Componente IconButton que combina Icon con Button
export interface IconButtonProps extends IconProps {
  /** Texto del botón */
  label?: string;
  
  /** Posición del icono respecto al texto */
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
  
  /** Click handler */
  onClick?: () => void;
  
  /** Deshabilitado */
  disabled?: boolean;
  
  /** Tipo de botón */
  type?: 'button' | 'submit' | 'reset';
}

export const IconButton: React.FC<IconButtonProps> = ({
  label,
  iconPosition = 'left',
  onClick,
  disabled = false,
  type = 'button',
  ...iconProps
}) => {
  const icon = <Icon {...iconProps} />;
  
  const renderContent = () => {
    if (!label) return icon;
    
    switch (iconPosition) {
      case 'left':
        return (
          <>
            {icon}
            <span>{label}</span>
          </>
        );
      case 'right':
        return (
          <>
            <span>{label}</span>
            {icon}
          </>
        );
      case 'top':
        return (
          <div className="flex flex-col items-center">
            {icon}
            <span>{label}</span>
          </div>
        );
      case 'bottom':
        return (
          <div className="flex flex-col items-center">
            <span>{label}</span>
            {icon}
          </div>
        );
      default:
        return (
          <>
            {icon}
            <span>{label}</span>
          </>
        );
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`ciszu-icon-button ${
        disabled ? 'ciszu-icon-button--disabled' : ''
      } ${iconProps.className || ''}`}
      style={iconProps.style}
    >
      {renderContent()}
    </button>
  );
};

// Componente IconList para mostrar múltiples iconos
export interface IconListProps {
  /** Iconos a mostrar */
  icons: Array<IconName | string>;
  
  /** Estilo de los iconos */
  style?: 'outline' | 'filled' | 'flag';
  
  /** Tamaño de los iconos */
  size?: number | string;
  
  /** Espacio entre iconos */
  spacing?: number | string;
  
  /** Alineación */
  align?: 'left' | 'center' | 'right' | 'justify';
}

export const IconList: React.FC<IconListProps> = ({
  icons,
  style = 'outline',
  size = 24,
  spacing = 8,
  align = 'left',
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: typeof spacing === 'number' ? `${spacing}px` : spacing,
    justifyContent: align === 'center' ? 'center' : 
                   align === 'right' ? 'flex-end' : 
                   align === 'justify' ? 'space-between' : 'flex-start',
    alignItems: 'center',
  };

  return (
    <div className="ciszu-icon-list" style={containerStyle}>
      {icons.map((iconName, index) => (
        <Icon
          key={`${iconName}-${index}`}
          name={iconName}
          style={style}
          size={size}
        />
      ))}
    </div>
  );
};

// Helper para obtener información de iconos disponibles
export const iconUtils = {
  /** Obtener todos los nombres de iconos disponibles */
  getAvailableIcons: () => Object.values(ICON_NAMES),
  
  /** Verificar si un icono existe */
  iconExists: (name: string): name is IconName => {
    return Object.values(ICON_NAMES).includes(name as IconName);
  },
  
  /** Obtener URL de un icono específico */
  getIconUrl: resolveIcon,
  
  /** Prefijos de clases CSS para iconos */
  classNames: {
    icon: 'ciszu-icon',
    button: 'ciszu-icon-button',
    list: 'ciszu-icon-list',
  },
};

export default Icon;