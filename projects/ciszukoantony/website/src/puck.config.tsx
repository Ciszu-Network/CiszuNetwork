import type { Config } from "@puckeditor/core";
import {
  HeroBlock,
  StatsBlock,
  ProjectsBlock,
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
  Projects: {
    title: string;
    projects: { name: string; description: string }[];
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
        title: "Ciszuko Antony",
        tagline: "CEO & Founder",
        description: "Innovación · Desarrollo · Tecnología — CEO del ecosistema Ciszu Network.",
        ctaLabel: "Ver proyectos",
        ctaHref: "/projects",
        secondaryLabel: "Contacto",
        secondaryHref: "/contact",
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
          { value: "15+", label: "Proyectos" },
          { value: "1K+", label: "Usuarios" },
          { value: "20+", label: "Repos" },
          { value: "3+", label: "Años" },
        ],
      },
      render: (props) => <StatsBlock {...props} />,
    },
    Projects: {
      fields: {
        title: { type: "text", label: "Título" },
        projects: {
          type: "array",
          label: "Proyectos",
          getItemSummary: (item) => item.name || "Nuevo proyecto",
          arrayFields: {
            name: { type: "text", label: "Nombre" },
            description: { type: "textarea", label: "Descripción" },
          },
          defaultItemProps: { name: "Proyecto", description: "Descripción" },
        },
      },
      defaultProps: {
        title: "Proyectos",
        projects: [
          { name: "MuzicMania", description: "Juego de ritmo con estética futurista neon." },
          { name: "Ciszuko CLI", description: "Herramienta CLI para automatizar desarrollo y deploys." },
          { name: "Open Source", description: "Contribuciones y proyectos para la comunidad." },
        ],
      },
      render: (props) => <ProjectsBlock {...props} />,
    },
    Cta: {
      fields: {
        title: { type: "text", label: "Título" },
        description: { type: "textarea", label: "Descripción" },
        buttonLabel: { type: "text", label: "Botón" },
        buttonHref: { type: "text", label: "Enlace" },
      },
      defaultProps: {
        title: "Construyamos algo juntos",
        description: "¿Tienes un proyecto en mente? Hablemos.",
        buttonLabel: "Contactar",
        buttonHref: "/contact",
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