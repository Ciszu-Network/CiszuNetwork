import type { Config } from "@puckeditor/core";
import {
  HeroBlock,
  StatsBlock,
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
        title: "Ciszu Network",
        tagline: "Innovación Digital",
        description: "Desarrollamos soluciones de alto rendimiento que combinan tecnología de punta con una estética inconfundible.",
        ctaLabel: "Contáctanos",
        ctaHref: "/contact",
        secondaryLabel: "Conócenos",
        secondaryHref: "/about",
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
          { value: "7+", label: "Áreas de Proyecto" },
          { value: "100%", label: "Compromiso" },
          { value: "24/7", label: "Soporte Técnico" },
        ],
      },
      render: (props) => <StatsBlock {...props} />,
    },
    Cta: {
      fields: {
        title: { type: "text", label: "Título" },
        description: { type: "textarea", label: "Descripción" },
        buttonLabel: { type: "text", label: "Botón" },
        buttonHref: { type: "text", label: "Enlace" },
      },
      defaultProps: {
        title: "Construyamos el Futuro",
        description: "¿Tienes un proyecto en mente? Hablemos.",
        buttonLabel: "Iniciar Proyecto",
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
