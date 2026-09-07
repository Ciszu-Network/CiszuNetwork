# Changelog

## [1.1.0](https://github.com/Ciszu-Network/CiszuNetwork/compare/db-v1.0.0...db-v1.1.0) (2026-09-07)


### Features

* migra acceso a BD a Drizzle en webs y bot (F1) y statsServer a NestJS+Fastify (F2), eliminando supabase-js y express de ciszubot ([f44415f](https://github.com/Ciszu-Network/CiszuNetwork/commit/f44415f90d8960bec31dfc8e7e3576fd24b76a09))


### Bug Fixes

* sube drizzle-orm a 0.45.2 (SQLi por identifiers mal escapados) y libera el puerto 6006 antes de arrancar Storybook ([45f9025](https://github.com/Ciszu-Network/CiszuNetwork/commit/45f9025895ebaf433582eb32bce5d4575193e32f))
