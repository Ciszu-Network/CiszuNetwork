import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createIast, resetIastDedupe } from '../src/iast';

describe('createIast (sensor IAST runtime)', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resetIastDedupe();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('no emite findings en requests normales', () => {
    const iast = createIast('test', { enabled: false });
    expect(iast.observe('GET', '/', { q: 'hola mundo' })).toBeNull();
    expect(iast.stats().total).toBe(0);
  });

  it('detecta SQL injection en query param', () => {
    const iast = createIast('test', { enabled: false });
    const obs = iast.observe('GET', '/buscar', { q: "1' OR 1=1 --" });
    expect(obs).not.toBeNull();
    expect(obs!.findings.some((f) => f.type === 'sql-injection')).toBe(true);
    expect(obs!.findings[0].severity).toBe('critical');
  });

  it('detecta XSS en query param', () => {
    const iast = createIast('test', { enabled: false });
    const obs = iast.observe('GET', '/', { q: '<script>alert(1)</script>' });
    expect(obs).not.toBeNull();
    expect(obs!.findings.some((f) => f.type === 'xss')).toBe(true);
  });

  it('detecta path traversal en el path', () => {
    const iast = createIast('test', { enabled: false });
    const obs = iast.observe('GET', '/../../etc/passwd');
    expect(obs).not.toBeNull();
    expect(obs!.findings.some((f) => f.type === 'path-traversal')).toBe(true);
    expect(obs!.findings.some((f) => f.source === 'path')).toBe(true);
  });

  it('detecta command injection', () => {
    const iast = createIast('test', { enabled: false });
    const obs = iast.observe('GET', '/', { cmd: 'id; whoami' });
    expect(obs).not.toBeNull();
    expect(obs!.findings.some((f) => f.type === 'command-injection')).toBe(true);
  });

  it('detecta secrets en parámetros (DACP runtime) y los redacta', () => {
    const iast = createIast('test', { enabled: false });
    // Fixture no-hex (26 minúsculas): cumple la regla IAST [a-z0-9_\-]{16,}
    // sin disparar gitleaks generic-api-key (que apunta a cadenas hex/entrópicas).
    const key = 'abcdefghijklmnopqrstuvwxyz';
    const obs = iast.observe('GET', '/', { api_key: key });
    expect(obs).not.toBeNull();
    expect(obs!.findings.some((f) => f.type === 'secret-in-request')).toBe(true);
    const ev = obs!.findings.find((f) => f.type === 'secret-in-request')!.evidence;
    expect(ev).not.toContain(key);
    expect(ev).toContain('REDACTED');
  });

  it('detecta escáneres (scanner-probe) en paths conocidos', () => {
    const iast = createIast('test', { enabled: false });
    const obs = iast.observe('GET', '/.env');
    expect(obs).not.toBeNull();
    expect(obs!.findings.some((f) => f.type === 'scanner-probe')).toBe(true);
  });

  it('sin findings no loguea nada', () => {
    const iast = createIast('test', { enabled: true });
    iast.observe('GET', '/', { normal: 'valor' });
    expect(warn).not.toHaveBeenCalled();
  });

  it('loguea [IAST] estructurado con app, method y path', () => {
    const iast = createIast('test-app', { enabled: true });
    iast.observe('GET', '/buscar', { q: "1' OR 1=1 --" });
    expect(warn).toHaveBeenCalledTimes(1);
    const json = warn.mock.calls[0][0];
    expect(json.startsWith('[IAST] ')).toBe(true);
    const obs = JSON.parse(json.slice('[IAST] '.length));
    expect(obs.app).toBe('test-app');
    expect(obs.method).toBe('GET');
    expect(obs.path).toBe('/buscar');
    expect(obs.findings[0].type).toBe('sql-injection');
  });

  it('dedupe: el mismo ataque repetido no re-emite dentro del TTL', () => {
    const iast = createIast('test', { enabled: true });
    iast.observe('GET', '/x', { q: "1' OR 1=1 --" });
    iast.observe('GET', '/x', { q: "1' OR 1=1 --" });
    iast.observe('GET', '/x', { q: "1' OR 1=1 --" });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(iast.stats().total).toBeGreaterThanOrEqual(1);
  });

  it('dedupe es por fingerprint: mismo payload en otra ruta sí emite', () => {
    const iast = createIast('test', { enabled: true });
    iast.observe('GET', '/a', { q: "1' OR 1=1 --" });
    iast.observe('GET', '/b', { q: "1' OR 1=1 --" });
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
