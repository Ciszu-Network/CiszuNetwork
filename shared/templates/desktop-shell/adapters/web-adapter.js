/*
 * Ciszu Desktop Shell - adapter base for browser installers.
 *
 * Load this file BEFORE the shell scripts. The shell calls the same command names used by
 * the Tauri implementation; this adapter maps them to the product HTTP API.
 */
(function () {
  "use strict";

  const adapter = window.CISZU_SHELL_ADAPTER || {};

  adapter.invoke = adapter.invoke || async function (command, args) {
    const response = await fetch(`/api/desktop-shell/${encodeURIComponent(command)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args || {}),
    });
    if (!response.ok) {
      throw new Error(`${command}: HTTP ${response.status}`);
    }
    return response.json();
  };

  window.CISZU_SHELL_ADAPTER = adapter;
  window.__TAURI_INTERNALS__ = window.__TAURI_INTERNALS__ || {
    invoke: (command, args) => window.CISZU_SHELL_ADAPTER.invoke(command, args),
  };
})();
