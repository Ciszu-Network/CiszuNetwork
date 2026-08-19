import type { Config } from "@puckeditor/core";
import {
  HeroBlock,
  StatsBlock,
  FeaturesBlock,
  CtaBlock,
  SectionTitle,
  Wrapper,
} from "@/puck/blocks";

export type PuckComponents = {
  Hero: {
    title: string;
    tagline: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  SectionTitle: { eyebrow: string; title: string };
  Stats: {
    title: string;
    stats: { value: string; label: string }[];
  };
  Features: {
    title: string;
    features: { title: string; description: string }[];
  };
  Cta: {
    title: string;
    description: string;
    buttonLabel: string;
    buttonHref: string;
  };
  Wrapper: { children?: React.ReactNode; label?: string };
};

export const puckConfig: Config<PuckComponents> = {
  components: {
    Hero: {
      fields: {
        title: { type: "text", label: "Título" },
        tagline: { type: "text", label: "Tagline" },
        description: { type: "textarea", label: "Descripción" },
        ctaLabel: { type: "text", label: "CTA principal" },
        ctaHref: { type: "text", label: "Enlace CTA" },
        secondaryLabel: { type: "text", label: "CTA secundario" },
        secondaryHref: { type: "text", label: "Enlace CTA 2" },
      },
      defaultProps: {
        title: "CiszuBot",
        tagline: "El bot multipropósito de Ciszu Network",
        description:
          "Moderación, música, juegos y comandos para tu servidor de Discord. Simple, rápido y seguro.",
        ctaLabel: "Añadir a Discord",
        ctaHref: "https://discord.com/oauth2/authorize",
        secondaryLabel: "Comandos",
        secondaryHref: "/comandos",
      },
      render: (props) => <HeroBlock {...props} />,
    },
    SectionTitle: {
      fields: {
        title: { type: "text", label: "Título" },
        eyebrow: { type: "text", label: "Eyebrow" },
      },
      defaultProps: { title: "Sección", eyebrow: "Subtítulo" },
      render: (props) => <SectionTitle {...props} />,
    },
    Stats: {
      fields: {
        title: { type: "text", label: "Título" },
        stats: {
          type: "array",
          label: "Estadísticas",
          getItemSummary: (item) => item.value || "Nueva estadística",
          arrayFields: {
            value: { type: "text", label: "Valor" },
            label: { type: "text", label: "Etiqueta" },
          },
          defaultItemProps: { value: "0", label: "Etiqueta" },
        },
      },
      defaultProps: {
        title: "Cifras",
        stats: [
          { value: "50+", label: "Comandos" },
          { value: "99%", label: "Uptime" },
          { value: "24/7", label: "Disponible" },
          { value: "1", label: "Servidor" },
        ],
      },
      render: (props) => <StatsBlock {...props} />,
    },
    Features: {
      fields: {
        title: { type: "text", label: "Título" },
        features: {
          type: "array",
          label: "Características",
          getItemSummary: (item) => item.title || "Nueva característica",
          arrayFields: {
            title: { type: "text", label: "Título" },
            description: { type: "textarea", label: "Descripción" },
          },
          defaultItemProps: { title: "Característica", description: "Descripción" },
        },
      },
      defaultProps: {
        title: "Características",
        features: [
          { title: "Moderación", description: "Mantén tu servidor limpio con herramientas de mod." },
          { title: "Música", description: "Reproduce audio de calidad en tus canales de voz." },
          { title: "Juegos", description: "Entretenimiento para toda la comunidad." },
        ],
      },
      render: (props) => <FeaturesBlock {...props} />,
    },
    Cta: {
      fields: {
        title: { type: "text", label: "Título" },
        description: { type: "textarea", label: "Descripción" },
        buttonLabel: { type: "text", label: "Botón" },
        buttonHref: { type: "text", label: "Enlace" },
      },
      defaultProps: {
        title: "Invita a CiszuBot",
        description: "Da poder a tu servidor hoy mismo.",
        buttonLabel: "Añadir a Discord",
        buttonHref: "https://discord.com/oauth2/authorize",
      },
      render: (props) => <CtaBlock {...props} />,
    },
    Wrapper: {
      fields: {
        label: { type: "text", label: "Etiqueta" },
        children: { type: "slot" },
      },
      defaultProps: { label: "Sección" },
      render: ({ children }) => <Wrapper>{children}</Wrapper>,
    },
  },
};