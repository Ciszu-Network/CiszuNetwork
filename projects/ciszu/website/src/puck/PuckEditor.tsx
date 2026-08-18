"use client";

import { useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import { puckConfig } from "@/puck.config";

const aiPlugin = createAiPlugin();

export function PuckEditor({ initialData, path }: { initialData: Data; path: string }) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");

  return (
    <Puck
      config={puckConfig}
      data={initialData}
      plugins={[aiPlugin]}
      headerTitle={path}
      headerPath={path}
      onPublish={async (data) => {
        setSaving(true);
        setStatus("Guardando...");
        try {
          const res = await fetch("/api/puck/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path, data }),
          });
          if (res.ok) {
            setStatus("Guardado ✓");
          } else {
            const body = (await res.json().catch(() => ({}))) as { error?: string };
            setStatus(`Error: ${body.error ?? res.status}`);
          }
        } catch {
          setStatus("Error de red");
        } finally {
          setSaving(false);
        }
      }}
    />
  );
}

export default PuckEditor;
