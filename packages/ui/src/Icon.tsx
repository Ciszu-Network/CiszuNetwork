'use client';

import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { resolveIcon, type IconStyle, type IconFormat } from '@ciszunetwork/cdn';
import { getIcon, iconRegistry } from './generated/icon-registry';

export interface IconProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style' | 'color' | 'className'> {
  /** Nombre del icono */
  name: string;

  /** Estilo del icono */
  style?: IconStyle;

  /** Formato del icono */
  format?: IconFormat;

  /** Tamaño del icono en píxeles */
  size?: number | string;

  /** Color del icono (inline usa currentColor) */
  color?: string;

  /** Clases CSS adicionales */
  className?: string;

  /** Forzar uso de CDN incluso en desarrollo */
  forceCdn?: boolean;

  /** Forzar uso local incluso en producción */
  forceLocal?: boolean;

  /** Mostrar como elemento inline (no bloque) */
  inline?: boolean;
}

/**
 * Componente Icon para Ciszu Network.
 *
 * Estrategia híbrida:
 * 1. INLINE-FIRST: si el icono está en el registro curado (generado desde
 *    shared/icons/svg), se renderiza como SVG inline — sin red, coloreable.
 * 2. FALLBACK CDN: nombres no registrados se sirven desde el CDN dinámico.
 * 3. RECALL LOCAL: si el CDN falla, se reintenta con la ruta local.
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
  inline = false,
  ...props
}) => {
  const entry = !forceLocal && format === 'svg' ? getIcon(style, name) : undefined;

  const inlineStyles: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    display: inline ? 'inline-block' : 'block',
  };

  const iconClassName = `ciszu-icon ciszu-icon-${name} ${className}`.trim();

  if (entry) {
    return (
      <svg
        viewBox={entry.viewBox}
        width={typeof size === 'number' ? size : size}
        height={typeof size === 'number' ? size : size}
        fill="currentColor"
        role="img"
        aria-label={`${name} icon`}
        className={iconClassName}
        style={{ color, ...inlineStyles }}
        {...(props as React.SVGProps<SVGSVGElement>)}
      >
        <g dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(entry.inner) }} />
      </svg>
    );
  }

  return (
    <RemoteIcon
      name={name}
      iconStyle={style}
      format={format}
      size={size}
      color={color}
      className={iconClassName}
      styleProp={inlineStyles}
      forceCdn={forceCdn}
      forceLocal={forceLocal}
      {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
    />
  );
};

function RemoteIcon({
  name,
  iconStyle,
  format,
  size,
  color,
  className,
  styleProp,
  forceCdn,
  forceLocal,
  ...props
}: {
  name: string;
  iconStyle: IconStyle;
  format: IconFormat;
  size: number | string;
  color?: string;
  className: string;
  styleProp: React.CSSProperties;
  forceCdn: boolean;
  forceLocal: boolean;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [src, setSrc] = useState(() =>
    resolveIcon(name, iconStyle, format, { forceCdn, forceLocal })
  );
  const [hidden, setHidden] = useState(false);

  const handleError = () => {
    if (src.startsWith('http') && !forceLocal) {
      setSrc(resolveIcon(name, iconStyle, format, { forceLocal: true }));
    } else {
      setHidden(true);
    }
  };

  if (hidden) {
    return (
      <span
        className={className}
        style={styleProp}
        role="img"
        aria-label={`${name} icon`}
        {...(props as React.HTMLAttributes<HTMLSpanElement>)}
      />
    );
  }

  return (
    <img
      src={src}
      alt={`${name} icon`}
      className={className}
      style={{ color, ...styleProp }}
      loading="lazy"
      onError={handleError}
      {...props}
    />
  );
}

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
    >
      {renderContent()}
    </button>
  );
};

// Componente IconList para mostrar múltiples iconos
export interface IconListProps {
  /** Iconos a mostrar */
  icons: Array<string>;

  /** Estilo de los iconos */
  style?: IconStyle;

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
    justifyContent:
      align === 'center'
        ? 'center'
        : align === 'right'
          ? 'flex-end'
          : align === 'justify'
            ? 'space-between'
            : 'flex-start',
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
  getAvailableIcons: (style: 'outline' | 'filled' = 'outline') => Object.keys(iconRegistry[style] || {}),

  /** Verificar si un icono existe en el registro inline */
  iconExists: (name: string, style: 'outline' | 'filled' | 'flag' = 'outline'): boolean => {
    return getIcon(style, name) !== undefined;
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
