/**
 * Framer Motion Variants para MuzicMania.
 * Concentrar animaciones complejas aquí para reuso atómico.
 */

export const neonGlowVariant = {
  hidden: { opacity: 0, textShadow: "0px 0px 0px rgba(0,212,255,0)" },
  visible: { 
    opacity: 1, 
    textShadow: "0px 0px 10px rgba(0,212,255,0.8)",
    transition: { duration: 0.5 }
  }
};

export const pageFadeVariant = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.3 } }
};
