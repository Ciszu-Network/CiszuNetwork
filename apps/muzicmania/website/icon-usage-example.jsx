/**
 * Ejemplo de uso de iconos en muzicmania
 */

import { IconComponent, icons, iconPath, cdnIconUrl } from './src/utils/icons';
import { useIcon } from './src/hooks/useIcon';

// Ejemplo 1: Componente de icono simple
function SimpleIconExample() {
  return (
    <div className="icon-example">
      <h2>Iconos en muzicmania</h2>
      
      <div className="icon-grid">
        <IconComponent name="home" style="outline" alt="Inicio" />
        <IconComponent name="search" style="filled" alt="Buscar" />
        <IconComponent name="user" style="outline" alt="Usuario" />
        <IconComponent name="settings" style="filled" alt="Configuración" />
        <IconComponent name="info" style="outline" alt="Información" />
      </div>
      
      <div className="icon-grid png">
        <IconComponent name="home" style="outline" format="png" size={64} />
        <IconComponent name="search" style="filled" format="png" size={64} />
        <IconComponent name="user" style="outline" format="png" size={64} />
      </div>
    </div>
  );
}

// Ejemplo 2: Usando el hook
function IconWithHookExample() {
  const { iconUrl, source } = useIcon({
    name: 'settings',
    style: 'filled',
    format: 'svg'
  });
  
  return (
    <div>
      <img src={iconUrl} alt="Configuración" data-source={source} />
      <p>Fuente: {source}</p>
    </div>
  );
}

// Ejemplo 3: URL directa
function DirectUrlExample() {
  const localIcon = iconPath('outline', 'home', 'svg');
  const cdnIcon = cdnIconUrl('filled', 'search', 'png');
  
  return (
    <div>
      <p>Local: {localIcon}</p>
      <p>CDN: {cdnIcon}</p>
    </div>
  );
}

// Ejemplo 4: Cambiar modo del sistema
function ChangeModeExample() {
  const handleLocalMode = () => {
    icons.setMode('local');
    console.log('Modo cambiado a local');
  };
  
  const handleCdnMode = () => {
    icons.setMode('cdn');
    console.log('Modo cambiado a CDN');
  };
  
  const handleHybridMode = () => {
    icons.setMode('hybrid');
    console.log('Modo cambiado a híbrido');
  };
  
  return (
    <div>
      <button onClick={handleLocalMode}>Modo Local</button>
      <button onClick={handleCdnMode}>Modo CDN</button>
      <button onClick={handleHybridMode}>Modo Híbrido</button>
    </div>
  );
}

export { 
  SimpleIconExample, 
  IconWithHookExample, 
  DirectUrlExample, 
  ChangeModeExample 
};