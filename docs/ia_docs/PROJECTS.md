# Ciszu Network — Projects Overview

## CiszuNetwork Page (apps/website)
Main landing page for Ciszu Network. Next.js 15.
- URL: ciszunetwork.vercel.app
- Filter: `ciszunetwork-page`

## Ciszuko Antony Portfolio (apps/ciszukoantony/website)
Personal portfolio of Francisco Garcia (Ciszuko Antony). Next.js 15.
- URL: ciszukoantony.vercel.app
- Filter: `ciszuko-network`

## MuzicMania (apps/muzicmania)
Rhythm game platform with web + desktop versions. Next.js 15 + Tauri.
- Versions: website, launcher (desktop), mobile (placeholder)
- Content: arrowskins, logos, music (genesis_neon), particleskins
- Filter: `muzicmania-next`
- Icons: 5,194 SVGs in shared/icons/

## CiszuBot (apps/ciszubot)
Discord bot with landing page. Discord.js (vanilla JS).
- Website: Next.js 15
- Bot: Node.js
- Filter: `ciszubot-web` (website), `ciszubot` (bot)

## CiszuGamens (ciszugamens/)
Gaming community/Discord server. Standalone project outside apps/.
- Focus: tournaments, events, community management
- Has its own documentation structure

## Ciszuko Antony (ciszukoantony/)
Personal brand / content creator identity. Standalone outside apps/.
- Twitch, YouTube, Minecraft content creation
- OBS streaming configs
- Channel & video information docs

## @ciszunetwork/cdn (packages/cdn)
Shared asset resolver package.
- `resolveIcon(name, style, format)` for icons
- `assetResolver.resolve(path)` for arbitrary assets