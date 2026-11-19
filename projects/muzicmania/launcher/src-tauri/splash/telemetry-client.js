(function () {
  const ENDPOINT = 'https://muzicmania.vercel.app/api/telemetry/ingest';
  const DEVICE_KEY = 'ciszu-telemetry-device';
  const SESSION_KEY = 'ciszu-telemetry-session';
  const QUEUE_KEY = 'ciszu-telemetry-queue';
  const cfg = { app: 'muzicmania', source: 'launcher', version: '', channel: 'beta', enabled: () => true, userId: () => null, activity: 'launcher' };
  let started = false;
  let timer = null;

  function randomId() {
    try { if (crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }
  function get(store, key) { try { return store.getItem(key); } catch (e) { return null; } }
  function set(store, key, value) { try { if (value === null) store.removeItem(key); else store.setItem(key, value); } catch (e) {} }
  function deviceId() {
    let id = get(localStorage, DEVICE_KEY);
    if (!id) { id = randomId(); set(localStorage, DEVICE_KEY, id); }
    return id;
  }
  function sessionId() {
    let id = get(sessionStorage, SESSION_KEY);
    if (!id) { id = randomId(); set(sessionStorage, SESSION_KEY, id); }
    return id;
  }
  function payload(eventType, properties) {
    return {
      event_id: randomId(),
      occurred_at: new Date().toISOString(),
      source: cfg.source,
      app: cfg.app,
      event_type: eventType,
      user_id: cfg.userId() || null,
      device_id: deviceId(),
      session_id: sessionId(),
      os: navigator.platform || '',
      arch: /arm|aarch/i.test(navigator.userAgent || '') ? 'arm64' : 'x64',
      device_type: /Mobi|Android|iPhone/i.test(navigator.userAgent || '') ? 'mobile' : 'desktop',
      app_version: cfg.version || '',
      channel: cfg.channel || '',
      language: navigator.language || '',
      timezone: (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ''; } })(),
      is_official: true,
      consent: true,
      properties: Object.assign({ activity: cfg.activity, app: cfg.app }, properties || {}),
    };
  }
  function enqueue(events) {
    try {
      const current = JSON.parse(get(localStorage, QUEUE_KEY) || '[]');
      if (!Array.isArray(current)) return;
      current.push.apply(current, events);
      set(localStorage, QUEUE_KEY, JSON.stringify(current.slice(-100)));
    } catch (e) {}
  }
  async function send(events) {
    if (!events.length || !cfg.enabled()) return false;
    try {
      if (navigator.onLine === false) { enqueue(events); return false; }
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: events }),
        keepalive: true,
      });
      if (!response.ok) enqueue(events);
      return response.ok;
    } catch (e) { enqueue(events); return false; }
  }
  function flush() {
    try {
      const events = JSON.parse(get(localStorage, QUEUE_KEY) || '[]');
      if (!Array.isArray(events) || !events.length) return;
      set(localStorage, QUEUE_KEY, null);
      send(events).then(function (ok) { if (!ok) enqueue(events); });
    } catch (e) {}
  }
  function track(eventType, properties) {
    if (!cfg.enabled()) return Promise.resolve(false);
    flush();
    return send([payload(eventType, properties)]);
  }
  function start(options) {
    if (started) return;
    started = true;
    if (options) {
      if (typeof options.activity === 'string') cfg.activity = options.activity;
      if (typeof options.enabled === 'function') cfg.enabled = options.enabled;
      if (typeof options.userId === 'function') cfg.userId = options.userId;
      if (options.version) cfg.version = options.version;
      if (options.channel) cfg.channel = options.channel;
    }
    flush();
    track('session_start');
    timer = setInterval(function () { if (cfg.enabled()) track('heartbeat'); }, 60000);
    window.addEventListener('online', function () { flush(); track('connectivity', { online: true }); });
    window.addEventListener('offline', function () { track('connectivity', { online: false }); });
    window.addEventListener('pagehide', function () { track('session_end'); });
  }
  function setActivity(activity) { cfg.activity = String(activity || 'launcher'); }
  window.CiszuTelemetry = { track: track, start: start, setActivity: setActivity, flush: flush, configure: function (options) { Object.assign(cfg, options || {}); } };
})();

