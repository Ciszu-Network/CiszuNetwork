import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { CURRICULUM, mergeCurriculum, type CurriculumData } from '@/data/curriculum';

/**
 * Carga del curriculum completo desde `shared/`.
 *
 * El CV definitivo vivirá en `shared/docs/curriculum/curriculum.json`. Cuando
 * el archivo exista en el checkout, se lee en build (server) y se fusiona con
 * los datos locales; si no existe —o el JSON es inválido— se devuelve
 * `CURRICULUM` tal cual. Candidatos ordenados desde la raíz del monorepo hasta
 * la carpeta de la web para cubrir tanto `next dev` local como el build.
 */
const CANDIDATES = [
  'shared/docs/curriculum/curriculum.json',
  '../shared/docs/curriculum/curriculum.json',
  '../../shared/docs/curriculum/curriculum.json',
  '../../../shared/docs/curriculum/curriculum.json',
];

export function loadCurriculum(): CurriculumData {
  for (const relative of CANDIDATES) {
    try {
      const file = path.join(process.cwd(), relative);
      if (!fs.existsSync(file)) continue;
      const raw = fs.readFileSync(file, 'utf8');
      return mergeCurriculum(JSON.parse(raw) as Partial<CurriculumData>);
    } catch {
      // Archivo ausente o JSON inválido: se prueba el siguiente candidato.
    }
  }
  return CURRICULUM;
}
