import type { Metadata } from 'next';
import { LegalDocument, type LegalArticle, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

export const metadata: Metadata = {
  title: 'Ciszuko Antony | LICENSE',
  description:
    'Licencia de uso, propiedad intelectual del portfolio y los certificados, y términos de redistribución del software de Ciszuko Antony.',
};

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const ARTICLES: LegalArticle[] = [
  {
    id: 1,
    title: 'PROPIEDAD INTELECTUAL Y AUTORÍA',
    content:
      'El código del portfolio, su identidad visual, sus contenidos, su música y sus piezas gráficas son obra intelectual cuya propiedad y derechos de autor pertenecen íntegramente a Ciszuko Antony (Francisco Garcia). Todos los derechos no concedidos explícitamente en este documento quedan reservados.',
  },
  {
    id: 2,
    title: 'CONCESIÓN DE LICENCIA DE USO',
    content:
      'Se concede permiso, de forma gratuita, para usar, copiar, modificar, distribuir, sublicenciar y/o vender copias del software bajo la Licencia MIT, conservando el aviso de copyright. El texto completo está en el Artículo 4.',
  },
  {
    id: 3,
    title: 'CERTIFICADOS Y DOCUMENTOS ACREDITATIVOS',
    content:
      'Los certificados, diplomas y reconocimientos mostrados en el portfolio son documentos personales de Ciszuko Antony. Se publican como referencia de formación y no se ceden, venden ni autoriza su reproducción total o parcial, ni su uso para acreditar a terceros.',
  },
  {
    id: 4,
    title: 'TEXTO ÍNTEGRO DE LA LICENCIA MIT',
    content:
      'MIT License\n\nCopyright (c) 2026 Ciszuko Antony — Francisco Garcia\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
    isCode: true,
  },
  {
    id: 5,
    title: 'SOFTWARE DE TERCEROS Y DEPENDENCIAS',
    content:
      'El portfolio utiliza frameworks y librerías de terceros, incluyendo pero no limitado a Next.js, React, Tailwind CSS, Supabase, Framer Motion y Zustand. Cada una de estas herramientas opera bajo sus propias licencias de software libre (MIT/Apache) y mantiene a sus titulares originales.',
  },
  {
    id: 6,
    title: 'LICENCIAS DE CONTENIDO MULTIMEDIA',
    content:
      'Los recursos gráficos propios (logos, iconografía, ilustraciones, fotografía y música) son de uso exclusivo de Ciszuko Antony. Los assets de terceros incorporados cuentan con licencia compatible (Creative Commons, MIT u otras) y su atribución se refleja en la página de Créditos.',
  },
  {
    id: 7,
    title: 'ATRIBUCIÓN Y AVISO DE COPYRIGHT',
    content:
      'Las copias o partes sustanciales del Software deben conservar el aviso de copyright y el texto de la Licencia MIT.',
  },
  {
    id: 8,
    title: 'MARCAS Y CONTENIDO DE TERCEROS',
    content:
      'La Licencia MIT cubre el código. La música y las piezas gráficas propias conservan sus derechos y licencias; las marcas y contenidos de terceros pertenecen a sus titulares.',
  },
  {
    id: 9,
    title: 'LIMITACIÓN JURÍDICA DE RESPONSABILIDAD',
    content:
      'En ningún caso el autor o los titulares del copyright serán responsables de ninguna reclamación, daños u otras responsabilidades, ya sea en una acción de contrato, agravio o de otro modo, que surja de o en conexión con el software o su uso.',
  },
  {
    id: 10,
    title: 'VIGENCIA Y DERECHOS IRRENUNCIABLES',
    content:
      'La Licencia MIT se aplica a las copias del Software que se distribuyan con ella y no puede revocarse retroactivamente para esas copias.',
  },
];

export default function LicensePage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <LegalDocument
          icon="certificates"
          title="LICENCIA"
          subtitle="Open source, autoría y transparencia"
          docLabel="Documento de Licencia de Ciszuko Antony"
          articles={ARTICLES}
          signOff={{ title: 'Declaración de Autoría', subtitle: 'Ciszuko Antony — 2026' }}
          theme={THEME}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
