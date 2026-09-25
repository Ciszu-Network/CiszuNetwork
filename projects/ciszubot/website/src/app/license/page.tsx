import type { Metadata } from 'next';
import { LegalDocument, type LegalArticle, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';

export const metadata: Metadata = {
  title: 'CiszuBot | LICENSE',
  description:
    'Licencia de uso, propiedad intelectual y términos de redistribución del software de CiszuBot.',
};

const THEME: InfoTheme = {
  accent: 'text-neon-cyan',
  accentBg: 'bg-neon-cyan/10',
  accentBorder: 'border-neon-cyan/40',
  card: 'bg-card',
  border: 'border-border',
  gradient: 'from-neon-cyan via-neon-blue to-neon-cyan',
};

const ARTICLES: LegalArticle[] = [
  {
    id: 1,
    title: 'PROPIEDAD INTELECTUAL Y AUTORÍA',
    content:
      'El software, la identidad visual, los comandos y los contenidos de CiszuBot son obra intelectual cuya propiedad y derechos de autor pertenecen íntegramente a Ciszu Network y a Ciszuko Antony (Francisco Garcia). Todos los derechos no concedidos explícitamente en este documento quedan reservados.',
  },
  {
    id: 2,
    title: 'CONCESIÓN DE LICENCIA DE USO',
    content:
      'Se otorga permiso para el uso personal, educativo y no comercial de este software, así como para su modificación bajo los términos de la Licencia MIT detallados en el Artículo 4, siempre que se mantenga el aviso de copyright y la atribución a Ciszu Network.',
  },
  {
    id: 3,
    title: 'SOFTWARE DE TERCEROS Y DEPENDENCIAS',
    content:
      'CiszuBot utiliza frameworks y librerías de terceros, incluyendo Discord.js, Node.js, TypeScript, Next.js, React, Tailwind CSS, Supabase y Zustand. Cada una de estas herramientas opera bajo sus propias licencias de software libre (MIT/Apache) y mantiene a sus titulares originales.',
  },
  {
    id: 4,
    title: 'TEXTO ÍNTEGRO DE LA LICENCIA MIT',
    content:
      'MIT License\n\nCopyright (c) 2026 Ciszu Network — CiszuBot (Ciszuko Antony)\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
    isCode: true,
  },
  {
    id: 5,
    title: 'LICENCIAS DE CONTENIDO MULTIMEDIA',
    content:
      'Los recursos gráficos propios (logotipos, isotipo, iconografía e ilustraciones) son de uso exclusivo del ecosistema. Los assets de terceros incorporados cuentan con licencia compatible (Creative Commons, MIT o equivalente) y su atribución se refleja en la página de Créditos.',
  },
  {
    id: 6,
    title: 'ATRIBUCIÓN OBLIGATORIA',
    content:
      'Toda redistribución o uso derivado del código fuente de CiszuBot debe incluir de forma visible la atribución a Ciszu Network — Ciszuko Antony y un enlace a los repositorios oficiales de la organización en GitHub.',
  },
  {
    id: 7,
    title: 'RESTRICCIONES DE COMERCIALIZACIÓN',
    content:
      'Queda estrictamente prohibida la venta, el sub-licenciamiento comercial, la reventa de acceso al bot o su inclusión en paquetes de pago sin un acuerdo de licencia comercial previo y por escrito con el autor.',
  },
  {
    id: 8,
    title: 'LIMITACIÓN JURÍDICA DE RESPONSABILIDAD',
    content:
      'En ningún caso el autor o los titulares del copyright serán responsables de ninguna reclamación, daños u otras responsabilidades, ya sea en una acción de contrato, agravio o de otro modo, que surja de o en conexión con el software, el bot o su uso.',
  },
  {
    id: 9,
    title: 'JURISDICCIÓN Y MODIFICACIONES',
    content:
      'Ciszu Network se reserva el derecho de modificar los términos de esta licencia en cualquier momento. El uso continuado de CiszuBot tras dichos cambios implica la aceptación de los nuevos términos de licenciamiento.',
  },
];

export default function LicensePage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <LegalDocument
            icon="certificates"
            title="LICENCIA"
            subtitle="Open Source & Transparencia"
            docLabel="Licencia Oficial de CiszuBot"
            articles={ARTICLES}
            signOff={{ title: 'Declaración de Libertad de Software', subtitle: 'CiszuBot — Ciszu Network 2026' }}
            theme={THEME}
          />
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
