'use client';

// Footer de acciones secundarias del auth (LOGIN_REGISTER_PROTOCOLS §3.2):
// ¿Has olvidado tu contraseña? RECUPÉRALA / ¿Sin registro? REGÍSTRATE /
// ¿Acceder ahora? ACCEDER / ¿Necesitas ayuda? SOPORTE.
// El registro/logearse actual se excluye según la pantalla (login o register).
export interface AuthSecondaryActionsProps {
  mode: 'login' | 'register';
  onForgotPassword?: () => void;
  registerHref?: string;
  loginHref?: string;
  supportHref?: string;
  forgotLabel?: string;
  registerPrefix?: string;
  registerAction?: string;
  loginPrefix?: string;
  loginAction?: string;
  supportPrefix?: string;
  supportAction?: string;
  linkClass?: string;
  containerClassName?: string;
}

export function AuthSecondaryActions({
  mode,
  onForgotPassword,
  registerHref,
  loginHref,
  supportHref,
  forgotLabel = 'RECUPÉRALA',
  registerPrefix = '¿Sin registro?',
  registerAction = 'REGÍSTRATE',
  loginPrefix = '¿Acceder ahora?',
  loginAction = 'ACCEDER',
  supportPrefix = '¿Necesitas ayuda?',
  supportAction = 'SOPORTE',
  linkClass = 'text-gray-300 hover:text-white transition-colors underline decoration-white/20 underline-offset-8',
  containerClassName = '',
}: AuthSecondaryActionsProps) {
  return (
    <div className={`pt-6 border-t border-white/10 flex flex-col gap-3 ${containerClassName}`}>
      {mode === 'login' && (
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] text-center">
          ¿Has olvidado tu contraseña?{' '}
          <button
            type="button"
            onClick={onForgotPassword}
            className={linkClass}
          >
            {forgotLabel}
          </button>
        </p>
      )}

      {mode === 'login' && registerHref && (
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] text-center">
          {registerPrefix}{' '}
          <a href={registerHref} className={linkClass}>
            {registerAction}
          </a>
        </p>
      )}

      {mode === 'register' && loginHref && (
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] text-center">
          {loginPrefix}{' '}
          <a href={loginHref} className={linkClass}>
            {loginAction}
          </a>
        </p>
      )}

      {supportHref && (
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] text-center">
          {supportPrefix}{' '}
          <a href={supportHref} className={linkClass}>
            {supportAction}
          </a>
        </p>
      )}
    </div>
  );
}

export default AuthSecondaryActions;