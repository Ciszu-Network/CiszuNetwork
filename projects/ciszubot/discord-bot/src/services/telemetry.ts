const ENDPOINT = process.env.TELEMETRY_ENDPOINT || 'https://muzicmania.vercel.app/api/telemetry/ingest';

export async function trackBotEvent(eventType: string, properties: Record<string, unknown> = {}): Promise<boolean> {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [{
          event_id: crypto.randomUUID(),
          occurred_at: new Date().toISOString(),
          source: 'bot',
          app: 'ciszubot',
          event_type: eventType,
          device_id: 'discord-bot',
          session_id: 'discord-bot',
          os: 'linux',
          arch: 'x64',
          device_type: 'server',
          app_version: process.env.npm_package_version || '',
          is_official: true,
          consent: true,
          properties: { bot: true, ...properties },
        }],
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

