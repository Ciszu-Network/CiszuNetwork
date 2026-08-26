// Entry point SERVER-ONLY de @ciszu/ui.
// Solo importar desde componentes de servidor (layouts, RSC). No importes este
// path desde componentes 'use client' (rompería el límite cliente/servidor).
export { default as GlobalAdvisorConfirm } from './server/GlobalAdvisorConfirm';
export type { AdvisorSite } from './server/GlobalAdvisorConfirm';