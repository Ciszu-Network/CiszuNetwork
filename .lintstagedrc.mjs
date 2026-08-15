export default {
  "projects/ciszu/website/**/*.{ts,tsx}": "pnpm --filter ciszunetwork-website exec eslint --fix",
  "projects/ciszukoantony/website/**/*.{ts,tsx}": "pnpm --filter ciszukoantony-website exec eslint --fix",
  "projects/muzicmania/website/**/*.{ts,tsx}": "pnpm --filter muzicmania-website exec eslint --fix"
};