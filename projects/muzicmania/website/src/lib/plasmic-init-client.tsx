"use client";

import { PlasmicRootProvider } from "@plasmicapp/loader-nextjs";
import { PLASMIC } from "./plasmic-init";

// Code components de @ciszu/ui registrados para el Studio de Plasmic (local).
import { Button } from "@ciszu/ui";
import { RichText } from "@ciszu/ui";
import { SmartImage } from "@ciszu/ui";

if (PLASMIC) {
  PLASMIC.registerComponent(Button, {
    name: "Button",
    importPath: "@ciszu/ui",
    props: {
      children: { type: "slot", defaultValue: "Botón" },
      variant: {
        type: "choice",
        options: ["primary", "secondary", "outline", "neon"],
        defaultValue: "primary",
      },
      size: { type: "choice", options: ["sm", "md", "lg"], defaultValue: "md" },
      fullWidth: { type: "boolean", defaultValue: false },
      isLoading: { type: "boolean", defaultValue: false },
      onClick: { type: "eventHandler", argTypes: [] },
    },
  });

  PLASMIC.registerComponent(RichText, {
    name: "RichText",
    importPath: "@ciszu/ui",
    props: {
      parts: {
        type: "array",
        itemType: {
          type: "object",
          fields: {
            text: { type: "string" },
            link: { type: "string" },
            href: { type: "string" },
          },
        },
        defaultValue: [{ text: "Texto de ejemplo" }],
      },
      className: { type: "string" },
      linkClassName: { type: "string" },
    },
  });

  PLASMIC.registerComponent(SmartImage, {
    name: "SmartImage",
    importPath: "@ciszu/ui",
    props: {
      src: { type: "string" },
      alt: { type: "string", defaultValue: "" },
      width: { type: "number" },
      height: { type: "number" },
      className: { type: "string" },
    },
  });
}

/**
 * ClientPlasmicRootProvider — provee el loader al árbol de Plasmic.
 * Solo renderiza si PLASMIC está activo (dev local con envs).
 */
export function ClientPlasmicRootProvider(props: Omit<React.ComponentProps<typeof PlasmicRootProvider>, "loader">) {
  if (!PLASMIC) return null;
  return <PlasmicRootProvider loader={PLASMIC} {...props} />;
}

// Permite el side-effect import desde /plasmic-host (registro de componentes).
export {};