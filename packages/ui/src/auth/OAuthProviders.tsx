'use client';

// Proveedores OAuth unificados (LOGIN_REGISTER_PROTOCOLS §2): "CONTINUAR CON:"
// con iconos oficiales por colores (Google/MS de ciszunetwork). Discord solo en
// ciszubot. Google/Microsoft = placeholder beta (toast); Discord = flujo real.
export const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

export const MicrosoftIcon = () => (
  <svg viewBox="0 0 23 23" className="w-5 h-5 shrink-0" aria-hidden="true">
    <path fill="#F35325" d="M1 1h10v10H1z" />
    <path fill="#81BC06" d="M12 1h10v10H12z" />
    <path fill="#05A6F0" d="M1 12h10v10H1z" />
    <path fill="#FFBA08" d="M12 12h10v10H12z" />
  </svg>
);

export const DiscordIcon = ({ className = 'w-5 h-5 shrink-0' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="#5865F2" aria-hidden="true">
    <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
  </svg>
);

export interface OAuthProviderButtonProps {
  name: string;
  icon: React.ReactNode;
  description?: string;
  onSelect: (provider: string) => void;
  href?: string;
  accentHover?: string;
  prominent?: boolean;
}

export function OAuthProviderButton({
  name,
  icon,
  description,
  onSelect,
  href,
  accentHover = 'hover:border-white/40 hover:text-white',
  prominent = false,
}: OAuthProviderButtonProps) {
  const className = `flex flex-1 items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-black/60 border ${
    prominent ? 'border-white/25' : 'border-white/10'
  } font-header font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 hover:shadow-[0_0_18px_rgba(255,255,255,0.08)] ${accentHover}`;
  if (href) {
    return (
      <a href={href} className={className}>
        {icon}
        <span className="flex flex-col items-start leading-tight">
          {name}
          {description && <span className="text-[8px] font-bold normal-case opacity-60">{description}</span>}
        </span>
      </a>
    );
  }
  return (
    <button type="button" onClick={() => onSelect(name)} className={className}>
      {icon}
      <span className="flex flex-col items-start leading-tight">
        {name}
        {description && <span className="text-[8px] font-bold normal-case opacity-60">{description}</span>}
      </span>
    </button>
  );
}

export interface OAuthProvidersProps {
  onSelect?: (provider: string) => void;
  renderGoogle?: () => React.ReactNode;
  renderMicrosoft?: () => React.ReactNode;
  renderDiscord?: () => React.ReactNode;
  showDiscord?: boolean;
  heading?: string;
  containerClassName?: string;
}

// CONTIGUO bloque OAuth ("CONTINUAR CON:") usado por las 4 webs.
export function OAuthProviders({
  onSelect,
  renderGoogle,
  renderMicrosoft,
  renderDiscord,
  showDiscord = false,
  heading = 'CONTINUAR CON:',
  containerClassName = '',
}: OAuthProvidersProps) {
  return (
    <div className={`pt-6 border-t border-white/10 ${containerClassName}`}>
      <p className="text-center text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4">
        {heading}
      </p>
      <div className="flex gap-3 flex-wrap">
        {showDiscord && (renderDiscord ? (
          renderDiscord()
        ) : (
          <OAuthProviderButton
            name="Discord"
            icon={<DiscordIcon />}
            description="Obligatorio en CiszuBot"
            onSelect={onSelect || (() => {})}
            accentHover="hover:border-[#5865F2]/60 hover:bg-[#5865F2]/10 hover:text-[#7289da]"
            prominent
          />
        ))}
        {renderGoogle ? (
          renderGoogle()
        ) : (
          <OAuthProviderButton
            name="Google"
            icon={<GoogleIcon />}
            onSelect={onSelect || (() => {})}
            accentHover="hover:border-[#4285F4]/60 hover:bg-[#4285F4]/10 hover:text-[#4285F4]"
          />
        )}
        {renderMicrosoft ? (
          renderMicrosoft()
        ) : (
          <OAuthProviderButton
            name="Microsoft"
            icon={<MicrosoftIcon />}
            onSelect={onSelect || (() => {})}
            accentHover="hover:border-[#05A6F0]/60 hover:bg-[#05A6F0]/10 hover:text-[#05A6F0]"
          />
        )}
      </div>
    </div>
  );
}

export default OAuthProviders;